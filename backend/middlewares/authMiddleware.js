import { adminAuth } from '../config/firebase-admin.js';
import db from '../config/firestore.js';

const protect = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        console.log('[Auth Middleware] Authorization header:', authHeader ? 'Present' : 'Missing');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[Auth Middleware] No valid authorization header');
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        const token = authHeader.split('Bearer ')[1];
        console.log('[Auth Middleware] Token received, length:', token.length);

        // Verify Firebase ID token
        console.log('[Auth Middleware] Verifying Firebase token...');
        const decodedToken = await adminAuth.verifyIdToken(token);
        const firebaseUid = decodedToken.uid;
        console.log('[Auth Middleware] Token verified successfully, UID:', firebaseUid);

        // Find or create user in Firestore
        // First try to find by firebaseUid
        const usersRef = db.collection('users');
        const userSnapshot = await usersRef.where('firebaseUid', '==', firebaseUid).limit(1).get();

        let user;
        if (!userSnapshot.empty) {
            // User found by firebaseUid
            const userDoc = userSnapshot.docs[0];
            user = { id: userDoc.id, ...userDoc.data() };
            console.log('[Auth Middleware] Existing user found:', user.email);
        } else {
            // If not found by firebaseUid, try to find by email (for migration)
            const emailSnapshot = await usersRef.where('email', '==', decodedToken.email).limit(1).get();

            if (emailSnapshot.empty) {
                // User doesn't exist at all - create new user
                console.log('[Auth Middleware] User not found, creating new user...');
                const newUserRef = await usersRef.add({
                    firebaseUid,
                    name: decodedToken.name || decodedToken.email.split('@')[0],
                    email: decodedToken.email,
                    image: decodedToken.picture || '',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                user = {
                    id: newUserRef.id,
                    firebaseUid,
                    name: decodedToken.name || decodedToken.email.split('@')[0],
                    email: decodedToken.email,
                    image: decodedToken.picture || ''
                };
                console.log('[Auth Middleware] New user created:', user.email);
            } else {
                // User exists but doesn't have firebaseUid - update it
                console.log('[Auth Middleware] Migrating existing user to Firebase schema...');
                const userDoc = emailSnapshot.docs[0];
                await userDoc.ref.update({
                    firebaseUid,
                    name: decodedToken.name || userDoc.data().name,
                    image: decodedToken.picture || userDoc.data().image,
                    updatedAt: new Date()
                });
                user = { id: userDoc.id, firebaseUid, ...userDoc.data() };
                console.log('[Auth Middleware] User migrated successfully:', user.email);
            }
        }

        // Attach user to request
        req.user = user;
        req.firebaseUid = firebaseUid;
        next();
    } catch (error) {
        console.error('[Auth Middleware] Error:', error.message);
        console.error('[Auth Middleware] Error code:', error.code);
        console.error('[Auth Middleware] Full error:', error);
        res.status(401).json({ message: 'Not authorized, token failed', error: error.message, code: error.code });
    }
};

export { protect };

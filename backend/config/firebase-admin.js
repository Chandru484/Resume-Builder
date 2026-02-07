import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK with service account
if (!admin.apps.length) {
    try {
        let serviceAccount;

        // Diagnostic logs (Redacted for security)
        console.log('Checking Environment Variables:');
        console.log('- FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'EXISTS' : 'MISSING');
        console.log('- FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'EXISTS' : 'MISSING');
        console.log('- FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'EXISTS' : 'MISSING');

        // 1. Check for Full JSON (Most Reliable)
        if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            console.log('Initializing Firebase Admin from FIREBASE_SERVICE_ACCOUNT_JSON');
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        }
        // 2. Fallback to individual Environment Variables
        else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
            console.log('Initializing Firebase Admin from individual Environment Variables');

            let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();
            privateKey = privateKey.replace(/^["']|["']$/g, ''); // Remove quotes
            privateKey = privateKey.replace(/\\n/g, '\n'); // Handle literal \n

            serviceAccount = {
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key: privateKey,
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
            };
        }
        // 3. Fallback to local file (Development)
        else {
            console.log('Initializing Firebase Admin from local service.json');
            serviceAccount = JSON.parse(
                readFileSync(path.join(__dirname, 'service.json'), 'utf8')
            );
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin initialized successfully');
    } catch (error) {
        console.error('Firebase Admin initialization error:', error.message);
    }
}

export const adminAuth = admin.auth();
export default admin;

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK with service account
if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(
            readFileSync(path.join(__dirname, 'service.json'), 'utf8')
        );

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: 'resumeai-e913e',
        });
        console.log('Firebase Admin initialized with service account');
    } catch (error) {
        console.error('Firebase Admin initialization error:', error.message);
    }
}

export const adminAuth = admin.auth();
export default admin;

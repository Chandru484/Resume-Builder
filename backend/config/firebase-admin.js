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

        // Check for environment variables (Production)
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
            console.log('Initializing Firebase Admin from Environment Variables');

            // Ultra-robust handle for the private key
            let privateKey = process.env.FIREBASE_PRIVATE_KEY;

            // 1. Remove any surrounding quotes (single or double)
            privateKey = privateKey.trim().replace(/^["']|["']$/g, '');

            // 2. Handle both escaped \n and literal newlines
            // This replaces literal '\' 'n' with real newline
            privateKey = privateKey.split('\\n').join('\n');

            // 3. Ensure header and footer are on their own lines
            if (!privateKey.includes('\n')) {
                // If the key is just one long string, try to fix it
                privateKey = privateKey
                    .replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
                    .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
            }

            serviceAccount = {
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key: privateKey,
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                // Add camelCase aliases for extra safety
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: privateKey,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            };
        }
        // Fallback to service.json (Local Development)
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

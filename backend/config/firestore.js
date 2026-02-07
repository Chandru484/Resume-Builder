import { getFirestore } from 'firebase-admin/firestore';
import admin from './firebase-admin.js';

// Initialize Firestore
export const db = getFirestore();

// Enable offline persistence for better performance
db.settings({
    ignoreUndefinedProperties: true
});

console.log('Firestore initialized successfully');

export default db;

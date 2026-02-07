import db from '../config/firestore.js';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Firestore Service - Reusable database operations
 */

// Get a single document by ID
export const getDocument = async (collection, id) => {
    const doc = await db.collection(collection).doc(id).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() };
};

// Get all documents in a collection
export const getAllDocuments = async (collection) => {
    const snapshot = await db.collection(collection).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Query documents with filters
export const queryDocuments = async (collection, filters = []) => {
    let query = db.collection(collection);

    // Apply filters: [{ field, operator, value }]
    filters.forEach(filter => {
        query = query.where(filter.field, filter.operator, filter.value);
    });

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Create a new document
export const createDocument = async (collection, data) => {
    const docRef = await db.collection(collection).add({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    });
    return { id: docRef.id, ...data };
};

// Update a document
export const updateDocument = async (collection, id, data) => {
    await db.collection(collection).doc(id).update({
        ...data,
        updatedAt: FieldValue.serverTimestamp()
    });
    return { id, ...data };
};

// Delete a document
export const deleteDocument = async (collection, id) => {
    await db.collection(collection).doc(id).delete();
    return { id };
};

// Batch operations
export const batchWrite = async (operations) => {
    const batch = db.batch();

    operations.forEach(op => {
        const docRef = db.collection(op.collection).doc(op.id);
        if (op.type === 'create' || op.type === 'set') {
            batch.set(docRef, op.data);
        } else if (op.type === 'update') {
            batch.update(docRef, op.data);
        } else if (op.type === 'delete') {
            batch.delete(docRef);
        }
    });

    await batch.commit();
};

export default {
    getDocument,
    getAllDocuments,
    queryDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    batchWrite
};

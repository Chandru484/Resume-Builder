import React, { createContext, useState, useEffect, useContext } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [firebaseUser, setFirebaseUser] = useState(null);

    useEffect(() => {
        // Listen to Firebase auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('[AuthContext] Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');

            if (firebaseUser) {
                setFirebaseUser(firebaseUser);
                try {
                    // Get Firebase ID token
                    const token = await firebaseUser.getIdToken();
                    console.log('[AuthContext] Got Firebase token, fetching profile...');

                    // Fetch user profile from backend (will auto-create if doesn't exist)
                    const { data } = await api.get('/users/profile', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    console.log('[AuthContext] Profile fetched successfully:', data);
                    setUser(data);
                    localStorage.setItem('userInfo', JSON.stringify(data));
                } catch (error) {
                    console.error('[AuthContext] Error fetching user profile:', error);
                    console.error('[AuthContext] Error details:', error.response?.data);
                    setUser(null);
                } finally {
                    setLoading(false);
                }
            } else {
                setFirebaseUser(null);
                setUser(null);
                localStorage.removeItem('userInfo');
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    };

    const register = async (name, email, password) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update Firebase profile with name
        await updateProfile(userCredential.user, {
            displayName: name
        });

        return userCredential.user;
    };

    const googleLogin = async () => {
        const userCredential = await signInWithPopup(auth, googleProvider);
        return userCredential.user;
    };

    const logout = async () => {
        await firebaseSignOut(auth);
        localStorage.removeItem('userInfo');
        setUser(null);
        setFirebaseUser(null);
    };

    // Helper function to get current Firebase ID token
    const getIdToken = async () => {
        if (firebaseUser) {
            return await firebaseUser.getIdToken();
        }
        return null;
    };

    return (
        <AuthContext.Provider value={{
            user,
            firebaseUser,
            login,
            register,
            googleLogin,
            logout,
            loading,
            getIdToken
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

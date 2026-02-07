import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBvQ27ZxZc9g8N-UKoOX6Rg_EHncpvEQhA",
    authDomain: "resumeai-e913e.firebaseapp.com",
    projectId: "resumeai-e913e",
    storageBucket: "resumeai-e913e.firebasestorage.app",
    messagingSenderId: "764121557450",
    appId: "1:764121557450:web:7802b55aacf65b5b3b0733",
    measurementId: "G-TK6FMELWB0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (optional)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;

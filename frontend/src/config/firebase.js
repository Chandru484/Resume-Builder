// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB_NGpCSqaJSqiw3-qlG5iAbxBFOYRSNsU",
  authDomain: "resume-builder-ai-dcfc5.firebaseapp.com",
  projectId: "resume-builder-ai-dcfc5",
  storageBucket: "resume-builder-ai-dcfc5.firebasestorage.app",
  messagingSenderId: "917495272144",
  appId: "1:917495272144:web:73f8cad9e6a60e30dd44d5",
  measurementId: "G-TZLCJRWVQN"
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
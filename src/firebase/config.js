// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnRMhsnWUa779uvO9XceaLtG5b8A1Tt-4",
  authDomain: "gradeflow-504a4.firebaseapp.com",
  projectId: "gradeflow-504a4",
  storageBucket: "gradeflow-504a4.firebasestorage.app",
  messagingSenderId: "1005959117939",
  appId: "1:1005959117939:web:87d728a45ae73043b7fe06",
  measurementId: "G-5V6BTBQHTK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with persistence
const auth = getAuth(app);
auth.languageCode = 'en';

// Initialize Realtime Database and get a reference to the service
const db = getFirestore(app);

// Export everything in one statement
export { auth, db };
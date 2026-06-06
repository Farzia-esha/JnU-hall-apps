// Firebase config - ONLY for Firestore database
// Authentication is handled via backend API (see AuthContext.jsx)

import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjg486R0-S_fZGAsAu8PD2t64K8HtOz-o",
  authDomain: "nfc-hall.firebaseapp.com",
  projectId: "nfc-hall",
  storageBucket: "nfc-hall.firebasestorage.app",
  messagingSenderId: "71050796943",
  appId: "1:71050796943:web:3812f8992156a594f7f5fa"
};

// Initialize Firebase app ONLY
let app = null;
let db = null;

try {
  const existingApps = getApps();
  
  if (existingApps.length === 0) {
    app = initializeApp(firebaseConfig);
    console.log(" Firebase app initialized");
  } else {
    app = getApp();
    console.log(" Firebase app already initialized");
  }
  
  // Initialize Firestore (optional - for database operations only)
  if (app) {
    try {
      db = getFirestore(app);
      console.log("Firebase Firestore initialized");
    } catch (e) {
      console.warn("Firestore not available:", e.message);
    }
  }
} catch (error) {
  console.error(" Firebase initialization error:", error.message);
}

// NOTE: Authentication is handled via backend API, not Firebase Auth
// See AuthContext.jsx for backend-based authentication
export { app, db };
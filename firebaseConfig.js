// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
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

// Initialize Firebase app
let app;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase app initialized");
  } else {
    app = getApp();
    console.log("✅ Firebase app already initialized");
  }
} catch (error) {
  console.error("❌ Firebase app initialization error:", error);
  throw error;
}

// Initialize Auth - with proper error handling
let auth = null;
try {
  auth = getAuth(app);
  console.log("✅ Firebase Auth initialized");
} catch (error) {
  console.error("❌ Firebase Auth initialization error:", error);
  // Don't throw - return null to allow app to continue
}

// Initialize Firestore Database
let db = null;
try {
  db = getFirestore(app);
  console.log("✅ Firebase Firestore initialized");
} catch (error) {
  console.error("⚠️  Firebase Firestore initialization warning:", error);
  // Firestore is optional
}

// Export with fallback
export { auth, db, app };
import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebaseConfig";

const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
  saveUserData: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Firebase auth state listener
  useEffect(() => {
    console.log("🔄 Setting up auth listener...");
    
    if (!auth) {
      console.error("❌ Auth not available yet");
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log("👤 Auth state changed:", firebaseUser ? firebaseUser.email : "No user");
        
        if (firebaseUser) {
          // Load user data from AsyncStorage
          try {
            const saved = await AsyncStorage.getItem("user");
            if (saved) {
              setUser(JSON.parse(saved));
            } else {
              // If not in AsyncStorage, create minimal user object
              setUser({
                email: firebaseUser.email,
                uid: firebaseUser.uid,
              });
            }
          } catch (err) {
            console.log("Load user error:", err);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("❌ Error setting up auth listener:", error);
      setLoading(false);
    }
  }, []);

  const signup = async (email, password) => {
    setError(null);
    try {
      console.log("📝 Signing up with email:", email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ Signup successful:", result.user.uid);
      return result.user;
    } catch (err) {
      console.error("❌ Signup error:", err);
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      console.log("🔐 Logging in with email:", email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Login successful:", result.user.uid);
      return result.user;
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.message);
      throw err;
    }
  };

  const saveUserData = async (userData) => {
    try {
      setUser(userData);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      console.log("Save user error:", err);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      console.log("👋 Logging out...");
      await signOut(auth);
      setUser(null);
      await AsyncStorage.removeItem("user");
      console.log("✅ Logout successful");
    } catch (err) {
      console.error("❌ Logout error:", err);
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        signup,
        saveUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
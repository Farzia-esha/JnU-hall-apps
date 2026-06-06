import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/api";

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

  // App load হলে saved session restore করো
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const saved = await AsyncStorage.getItem("user");
        if (saved) {
          const userData = JSON.parse(saved);
          setUser(userData);
          console.log("✅ Session restored for:", userData.email);
        } else {
          console.log("ℹ️ No saved session found");
        }
      } catch (err) {
        console.error("❌ Error restoring session:", err);
      } finally {
        setLoading(false); // শুধু session restore এর জন্য
      }
    };

    restoreSession();
  }, []);

  const signup = async (email, password, fullName, phone) => {
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      await saveUserData(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const saveUserData = async (userData) => {
    try {
      setUser(userData);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      console.log("✅ User data saved");
    } catch (err) {
      console.error("❌ Error saving user data:", err);
      setError(err.message);
    }
  };

  const logout = async () => {
    setError(null);
    try {
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
import {
  View,Text,TextInput,TouchableOpacity,Image,StyleSheet,
  Alert,ActivityIndicator,
  KeyboardAvoidingView,Platform,
  TouchableWithoutFeedback,Keyboard,
} from "react-native";

import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../constants/api";

// Redirect scheme - update this with your app's scheme
const redirectUrl = AuthSession.makeRedirectUrl({
  path: "auth/google/callback",
});

// Google OAuth config - Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "YOUR_GOOGLE_CLIENT_SECRET"; // Optional for web

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, saveUserData } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setIsLoading(true);

    try {
      // Backend login directly (no Firebase)
      const data = await login(email, password);

      // data should contain: email, uid, role, etc.
      if (!data.email || !data.uid) {
        throw new Error("Server response missing email & uid");
      }

      const roleRoutes = {
        admin: "/(admin)/dashboard",
        accountant: "/(accountant)/dashboard",
        canteen_manager: "/(canteen)/dashboard",
        canteen: "/(canteen)/dashboard",
        hall_rep: "/(hallrep)/dashboard",
        student: "/(student)/dashboard",
      };

      router.replace(
        roleRoutes[data.role] || roleRoutes.student
      );

    } catch (err) {
      Alert.alert(
        "Login Error",
        err.message || "Login failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

      const discovery = await AuthSession.fetchDiscoveryAsync(
        "https://accounts.google.com"
      );

      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        scopes: ["profile", "email"],
        redirectUrl,
        usePKCE: true,
        extraParams: {
          access_type: "offline",
        },
      });

      const result = await request.promptAsync(discovery, {
        useProxy: true,
      });

      if (result.type === "success") {
        // Get user info from Google
        const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${result.authentication.accessToken}` },
        });

        const googleUser = await response.json();

        // Send to backend for authentication
        const backendResponse = await fetch(`${BASE_URL}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: googleUser.email,
            fullName: googleUser.name,
            googleId: googleUser.id,
            picture: googleUser.picture,
          }),
        });

        let data;
        try {
          data = await backendResponse.json();
        } catch {
          throw new Error("Invalid server response");
        }

        if (!backendResponse.ok) {
          Alert.alert("Google Sign-In Failed", data?.message || "Something went wrong");
          return;
        }

        await login(data);

        const roleRoutes = {
          admin: "/(admin)/dashboard",
          accountant: "/(accountant)/dashboard",
          canteen_manager: "/(canteen)/dashboard",
          canteen: "/(canteen)/dashboard",
          hall_rep: "/(hallrep)/dashboard",
          student: "/(student)/dashboard",
        };

        router.replace(roleRoutes[data.role] || roleRoutes.student);

      } else {
        Alert.alert("Google Sign-In", "Sign-in was cancelled");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>

          {/* Logo */}
          <Image
            source={require("./../assets/images/logo.jpg")}
            style={styles.logo}
          />

          {/* Title */}
          <Text style={styles.title}>NFC Hall Login</Text>
          <Text style={styles.subtitle}>Welcome back</Text>

          {/* Email Input */}
          <TextInput
            placeholder="Enter Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Enter Password"
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.button,
              isLoading && { opacity: 0.7 },
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                LOGIN
              </Text>
            )}
          </TouchableOpacity>

          {/* Forgot Password Link */}
          <TouchableOpacity onPress={() => router.push("/forgot-password")}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Signup Link */}
          <View style={styles.signupRedirect}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    justifyContent: "center",
    padding: 25,
  },

  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignSelf: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2e86de",
    marginBottom: 10,
  },

  subtitle: {
    textAlign: "center",
    color: "gray",
    marginBottom: 30,
    fontSize: 16,
  },

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 15,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
  },

  button: {
    backgroundColor: "#2e86de",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  forgotPassword: {
    textAlign: "center",
    color: "#2e86de",
    fontWeight: "600",
    fontSize: 14,
    marginTop: 15,
  },

  signupRedirect: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  signupText: {
    color: "#666",
    fontSize: 14,
  },

  signupLink: {
    color: "#2e86de",
    fontWeight: "bold",
    fontSize: 14,
  },
});
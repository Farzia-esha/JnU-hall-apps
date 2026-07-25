import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { sendPasswordResetEmail } from "firebase/auth";

import { auth } from "../firebaseConfig";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const router = useRouter();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setEmailSent(true);
      Alert.alert(
        "Success",
        "Password reset link sent to your email. Please check your inbox."
      );
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        Alert.alert("Error", "No account found with this email");
      } else if (err.code === "auth/invalid-email") {
        Alert.alert("Error", "Invalid email address");
      } else {
        Alert.alert("Error", err.message || "Failed to send reset email");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToLogin}
          >
            <Ionicons name="arrow-back-outline" size={24} color="#2e86de" />
          </TouchableOpacity>

          {/* Logo */}
          <Image
            source={require("./../assets/images/logo.png")}
            style={styles.logo}
          />

          {/* Title */}
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password
          </Text>

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#2e86de"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Email Address"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading && !emailSent}
            />
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            style={[
              styles.button,
              isLoading && { opacity: 0.7 },
              emailSent && { backgroundColor: "#10ac84" },
            ]}
            onPress={handleResetPassword}
            disabled={isLoading || emailSent}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : emailSent ? (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.buttonText}>EMAIL SENT</Text>
              </>
            ) : (
              <Text style={styles.buttonText}>SEND RESET LINK</Text>
            )}
          </TouchableOpacity>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#2e86de"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.infoText}>
              Check your spam folder if you don't see the email within 5 minutes
            </Text>
          </View>

          {/* Back to Login Link */}
          {emailSent && (
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text style={styles.backLink}>Back to Login</Text>
            </TouchableOpacity>
          )}

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    paddingHorizontal: 25,
    paddingVertical: 30,
    justifyContent: "center",
  },

  backButton: {
    position: "absolute",
    top: 30,
    left: 20,
    zIndex: 10,
    padding: 10,
  },

  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignSelf: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2e86de",
    marginBottom: 12,
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
    fontSize: 14,
    lineHeight: 20,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#333",
  },

  button: {
    backgroundColor: "#2e86de",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  infoBox: {
    flexDirection: "row",
    backgroundColor: "#e3f2fd",
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
    borderLeftWidth: 4,
    borderLeftColor: "#2e86de",
  },

  infoText: {
    flex: 1,
    color: "#1565c0",
    fontSize: 13,
    lineHeight: 18,
  },

  backLink: {
    textAlign: "center",
    color: "#2e86de",
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 20,
  },
});

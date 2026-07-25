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
  ScrollView,
} from "react-native";

import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../constants/api";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signup, saveUserData } = useAuth();
  const router = useRouter();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validatePhone = (phone) => {
    const regex = /^[0-9+\-\s]{10,}$/;
    return regex.test(phone);
  };

  const handleSignup = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Error", "Please enter a password");
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    setIsLoading(true);

    try {
      const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: password,
          role: "student", // Default role is student
        }),
      });

      let signupData;
      try {
        signupData = await signupResponse.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!signupResponse.ok) {
        Alert.alert(
          "Signup Failed",
          signupData?.message || "Something went wrong"
        );
        return;
      }

      // Save user data
      if (!signupData.email || !signupData.uid) {
        throw new Error("Server did not return email & uid");
      }

      await saveUserData(signupData);

      Alert.alert("Success", "Account created successfully!");

      // Redirect based on role
      const role = signupData.role || "student";
      switch (role) {
        case "admin":
          router.replace("/(admin)/dashboard");
          break;
        case "accountant":
          router.replace("/(accountant)/dashboard");
          break;
        case "canteen_manager":
          router.replace("/(canteen)/dashboard");
          break;
        case "hall_rep":
          router.replace("/(hallrep)/dashboard");
          break;
        default:
          router.replace("/(student)/dashboard");
      }
    } catch (err) {
      Alert.alert(
        "Error",
        err.message || "Signup failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>

            {/* Logo */}
            <Image
              source={require("./../assets/images/logo.jpg")}
              style={styles.logo}
            />

            {/* Title */}
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join NFC Hall Community</Text>

            {/* Full Name Input */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#2e86de"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Full Name"
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                editable={!isLoading}
              />
            </View>

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
                editable={!isLoading}
              />
            </View>

            {/* Phone Input */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="call-outline"
                size={20}
                color="#2e86de"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Phone Number"
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#2e86de"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Password"
                secureTextEntry={!showPassword}
                style={[styles.input, { paddingRight: 40 }]}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#2e86de"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#2e86de"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Confirm Password"
                secureTextEntry={!showConfirmPassword}
                style={[styles.input, { paddingRight: 40 }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#2e86de"
                />
              </TouchableOpacity>
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              style={[
                styles.button,
                isLoading && { opacity: 0.7 },
              ]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  CREATE ACCOUNT
                </Text>
              )}
            </TouchableOpacity>

            {/* Already have account link */}
            <View style={styles.loginRedirect}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLoginRedirect}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
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

  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2e86de",
    marginBottom: 8,
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 25,
    fontSize: 14,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
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

  eyeButton: {
    padding: 8,
  },

  button: {
    backgroundColor: "#2e86de",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  loginRedirect: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  loginText: {
    color: "#666",
    fontSize: 14,
  },

  loginLink: {
    color: "#2e86de",
    fontWeight: "bold",
    fontSize: 14,
  },
});

// // // import {
// // //   View, Text, TextInput, TouchableOpacity,
// // //   Image, StyleSheet, Alert, ActivityIndicator
// // // } from "react-native";
// // // import { useState } from "react";
// // // import { useRouter } from "expo-router";
// // // import { useAuth } from "../context/AuthContext";
// // // import { BASE_URL } from "../constants/api";

// // // export default function Login() {
// // //   const [email, setEmail] = useState("");
// // //   const [password, setPassword] = useState("");
// // //   const [isLoading, setIsLoading] = useState(false);
// // //   const { login } = useAuth();
// // //   const router = useRouter();

// // //   const handleLogin = async () => {
// // //     if (!email || !password) { Alert.alert("Error", "Please fill all fields"); return; }
// // //     setIsLoading(true);
// // //     try {
// // //       const response = await fetch(`${BASE_URL}/api/auth/login`, {
// // //         method: "POST",
// // //         headers: { "Content-Type": "application/json" },
// // //         body: JSON.stringify({ email, password }),
// // //       });
// // //       const data = await response.json();
// // //       if (!response.ok) { Alert.alert("Login Failed", data.message); return; }
// // //       await login(data);
// // //       switch (data.role) {
// // //         case "admin": router.replace("/(admin)/dashboard"); break;
// // //         case "accountant": router.replace("/(accountant)/dashboard"); break;
// // //         case "canteen_manager": router.replace("/(canteen)/dashboard"); break;
// // //         case "hall_rep": router.replace("/(hallrep)/dashboard"); break;
// // //         default: router.replace("/(student)/dashboard");
// // //       }
// // //     } catch (err) {
// // //       Alert.alert("Error", "Server-এ connect করা যাচ্ছে না");
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <View style={styles.container}>
// // //       <Image source={require("./../assets/images/logo.jpg")} style={styles.logo} />
// // //       <Text style={styles.title}>NFC Hall Login</Text>
// // //       <Text style={styles.subtitle}>Welcome back 👋</Text>
// // //       <TextInput placeholder="Enter Email" style={styles.input} value={email}
// // //         onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
// // //       <TextInput placeholder="Enter Password" secureTextEntry style={styles.input}
// // //         value={password} onChangeText={setPassword} />
// // //       <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
// // //         {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>LOGIN</Text>}
// // //       </TouchableOpacity>
// // //     </View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, backgroundColor: "#f5f6fa", justifyContent: "center", padding: 25},
// // //   logo: { width: 110, height: 110, borderRadius: 50, alignSelf: "center",marginBottom: 20 },
// // //   title: { fontSize: 26, fontWeight: "bold", textAlign: "center", color: "#2e86de" },
// // //   subtitle: { textAlign: "center", color: "gray", marginBottom: 30 },
// // //   input: { backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: "#ddd" },
// // //   button: { backgroundColor: "#2e86de", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 10 },
// // //   buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// // // });

// // import {
// //   View, Text, TextInput, TouchableOpacity,
// //   Image, StyleSheet, Alert, ActivityIndicator
// // } from "react-native";
// // import { useState } from "react";
// // import { useRouter } from "expo-router";
// // import { useAuth } from "../context/AuthContext";
// // import { BASE_URL } from "../constants/api";

// // export default function Login() {
// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [isLoading, setIsLoading] = useState(false);

// //   const { login } = useAuth();
// //   const router = useRouter();

// //   const handleLogin = async () => {
// //     if (!email.trim() || !password.trim()) {
// //       Alert.alert("Error", "Please fill all fields");
// //       return;
// //     }

// //     setIsLoading(true);

// //     try {
// //       const response = await fetch(`${BASE_URL}/api/auth/login`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ email, password }),
// //       });

// //       let data;
// //       try {
// //         data = await response.json();
// //       } catch {
// //         throw new Error("Invalid server response");
// //       }

// //       if (!response.ok) {
// //         Alert.alert("Login Failed", data?.message || "Something went wrong");
// //         return;
// //       }

// //       await login(data);

// //       const roleRoutes = {
// //         admin: "/(admin)/dashboard",
// //         accountant: "/(accountant)/dashboard",
// //         canteen_manager: "/(canteen)/dashboard",
// //         hall_rep: "/(hallrep)/dashboard",
// //         student: "/(student)/dashboard",
// //       };

// //       router.replace(roleRoutes[data.role] || roleRoutes.student);

// //     } catch (err) {
// //       Alert.alert("Error", "Server is not responding");
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <Image source={require("./../assets/images/logo.jpg")} style={styles.logo} />

// //       <Text className='' style={styles.title}>NFC Hall Login</Text>
// //       <Text style={styles.subtitle}>Welcome back</Text>

// //       <TextInput
// //         placeholder="Enter Email"
// //         style={styles.input}
// //         value={email}
// //         onChangeText={setEmail}
// //         keyboardType="email-address"
// //         autoCapitalize="none"
// //       />

// //       <TextInput
// //         placeholder="Enter Password"
// //         secureTextEntry
// //         style={styles.input}
// //         value={password}
// //         onChangeText={setPassword}
// //       />

// //       <TouchableOpacity
// //         style={[styles.button, isLoading && { opacity: 0.7 }]}
// //         onPress={handleLogin}
// //         disabled={isLoading}
// //       >
// //         {isLoading ? (
// //           <ActivityIndicator color="#fff" />
// //         ) : (
// //           <Text style={styles.buttonText}>LOGIN</Text>
// //         )}
// //       </TouchableOpacity>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: "#f5f6fa", justifyContent: "top", padding: 25 },
// //   logo: { width: 110, height: 110, borderRadius: 50, alignSelf: "center", marginBottom: 20 },
// //   title: { fontSize: 30, fontWeight: "bold", textAlign: "center", color: "#2e86de", marginBottom: 30 },
// //   subtitle: { textAlign: "center", color: "gray", marginBottom: 30 },
// //   input: {
// //     backgroundColor: "#fff",
// //     padding: 12,
// //     borderRadius: 10,
// //     marginBottom: 15,
// //     borderWidth: 1,
// //     borderColor: "#ddd",
// //   },
// //   button: {
// //     backgroundColor: "#2e86de",
// //     padding: 15,
// //     borderRadius: 10,
// //     alignItems: "center",
// //     marginTop: 10
// //   },
// //   buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// // });



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

import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../constants/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!response.ok) {
        Alert.alert(
          "Login Failed",
          data?.message || "Something went wrong"
        );
        return;
      }

      await login(data);

      const roleRoutes = {
        admin: "/(admin)/dashboard",
        accountant: "/(accountant)/dashboard",
        canteen: "/(canteen)/dashboard",
        hall_rep: "/(hallrep)/dashboard",
        student: "/(student)/dashboard",
      };

      router.replace(
        roleRoutes[data.role] || roleRoutes.student
      );

    } catch (err) {
      Alert.alert(
        "Error",
        "server is not responding"
      );
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
});
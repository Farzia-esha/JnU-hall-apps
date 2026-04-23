// // import { View, Text } from 'react-native'
// // import React from 'react'

// // export default function LoginScreen() {
// //   return (
// //     <View>
        
// //       <Text>LoginScreen</Text>
// //     </View>
// //   )
// // }

// // import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
// // import { useState } from 'react';
// // import { router } from 'expo-router';

// // export default function Login() {
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');

// //   const handleLogin = () => {
// //     if (!email || !password) {
// //       alert('Enter email & password');
// //       return;
// //     }

// //     router.replace('/dashboard');
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <Text style={styles.title}>Hall Management</Text>

// //       <TextInput
// //         placeholder="Email"
// //         style={styles.input}
// //         value={email}
// //         onChangeText={setEmail}
// //       />

// //       <TextInput
// //         placeholder="Password"
// //         secureTextEntry
// //         style={styles.input}
// //         value={password}
// //         onChangeText={setPassword}
// //       />

// //       <TouchableOpacity style={styles.button} onPress={handleLogin}>
// //         <Text style={{color:'#fff'}}>Login</Text>
// //       </TouchableOpacity>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container:{ flex:1, justifyContent:'center', padding:20 },
// //   title:{ fontSize:24, textAlign:'center', marginBottom:20 },
// //   input:{ borderWidth:1, marginBottom:10, padding:10 },
// //   button:{ backgroundColor:'blue', padding:15, alignItems:'center' }
// // });

// import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
// import { useState } from "react";
// import { router } from "expo-router";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleLogin = () => {
//     if (!email || !password) {
//       alert("Enter email & password");
//       return;
//     }

//     router.replace("/dashboard");
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Hall Management</Text>

//       <TextInput
//         placeholder="Email"
//         style={styles.input}
//         value={email}
//         onChangeText={setEmail}
//       />

//       <TextInput
//         placeholder="Password"
//         secureTextEntry
//         style={styles.input}
//         value={password}
//         onChangeText={setPassword}
//       />

//       <TouchableOpacity style={styles.button} onPress={handleLogin}>
//         <Text style={{ color: "#fff" }}>Login</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", padding: 20 },
//   title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
//   input: { borderWidth: 1, marginBottom: 10, padding: 10 },
//   button: { backgroundColor: "blue", padding: 15, alignItems: "center" },
// });

import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    router.replace("/dashboard");
  };

  return (
    <View style={styles.container}>

      {/* Logo */}
      <Image
        source={require("./../../assets/images/logo.jpg")}
        style={styles.logo}
      />

      {/* Title */}
      <Text style={styles.title}>NFC Hall Login</Text>
      <Text style={styles.subtitle}>Welcome back 👋</Text>

      {/* Email */}
      <TextInput
        placeholder="Enter Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      {/* Password */}
      <TextInput
        placeholder="Enter Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      {/*  Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>

    </View>
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
    marginBottom: 15,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2e86de",
  },

  subtitle: {
    textAlign: "center",
    color: "gray",
    marginBottom: 30,
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
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
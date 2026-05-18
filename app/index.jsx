// // import { View, Text, Image, TouchableOpacity } from "react-native";
// // import { Link } from "expo-router";

// // export default function Index() {
// //   return (
// //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>

// //       {/* TITLE */}
// //       <Text
// //         style={{
// //           fontSize: 40,
// //           fontWeight: "bold",
// //           color: "#2e86de",
// //           marginBottom: 20,
// //           textAlign: "center",
// //         }}
// //       >
// //         Welcome to{"\n"}NFC Hall
// //       </Text>

// //       {/* IMAGE */}
// //       <Image
// //         source={require("./../assets/images/logo.jpg")}
// //         style={{
// //           width: 200,
// //           height: 200,
// //           marginBottom: 20,
// //           borderRadius: 100,
// //         }}
// //       />

// //       <Link href="/login" asChild>
// //         <TouchableOpacity
// //           style={{
// //             backgroundColor: "#2e86de",
// //             paddingVertical: 12,
// //             paddingHorizontal: 40,
// //             borderRadius: 10,
// //           }}
// //         >
// //           <Text
// //             style={{
// //               color: "#fff",
// //               fontSize: 20,
// //               fontWeight: "bold",
// //             }}
// //           >
// //             LOGIN
// //           </Text>
// //         </TouchableOpacity>
// //       </Link>

// //     </View>
// //   );
// // }

// import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
// import { Link, useRouter } from "expo-router";
// import { useEffect } from "react";
// import { useAuth } from "../context/AuthContext";

// export default function Index() {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (loading) return;
//     if (!user) return; // login page-এ থাকুক

//     // Already logged in থাকলে সরাসরি dashboard-এ পাঠাও
//     switch (user.role) {
//       case "admin":
//         router.replace("/(admin)/dashboard");
//         break;
//       case "accountant":
//         router.replace("/(accountant)/dashboard");
//         break;
//       case "canteen_manager":
//         router.replace("/(canteen)/dashboard");
//         break;
//       case "hall_rep":
//         router.replace("/(hallrep)/dashboard");
//         break;
//       default:
//         router.replace("/(student)/dashboard");
//     }
//   }, [user, loading]);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#2e86de" />
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//       <Text
//         style={{
//           fontSize: 40,
//           fontWeight: "bold",
//           color: "#2e86de",
//           marginBottom: 20,
//           textAlign: "center",
//         }}
//       >
//         Welcome to{"\n"}NFC Hall
//       </Text>

//       <Image
//         source={require("./../assets/images/logo.jpg")}
//         style={{
//           width: 200,
//           height: 200,
//           marginBottom: 20,
//           borderRadius: 100,
//         }}
//       />

//       <Link href="/login" asChild>
//         <TouchableOpacity
//           style={{
//             backgroundColor: "#2e86de",
//             paddingVertical: 12,
//             paddingHorizontal: 40,
//             borderRadius: 10,
//           }}
//         >
//           <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
//             LOGIN
//           </Text>
//         </TouchableOpacity>
//       </Link>
//     </View>
//   );
// }

import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    switch (user.role) {
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
  }, [user, loading]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#2e86de" />
    </View>
  );
}

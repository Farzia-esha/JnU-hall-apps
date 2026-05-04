// // // // import { useFonts } from "expo-font";
// // // // import { Stack } from "expo-router";

// // // // export default function RootLayout() {
// // // //   useFonts({
// // // //     'outfit':require('./../assets/fonts/Outfit-Regular.ttf'),
// // // //     'outfit-medium':require('./../assets/fonts/Outfit-Medium.ttf'),
// // // //     'outfit-bold':require('./../assets/fonts/Outfit-Bold.ttf'),
// // // //   })

// // // //   return (
// // // //     <Stack>
// // // //     <Stack.Screen name="index"/>
// // // //     <Stack.Screen name="login/index" options={{headerShown:false}}/>
// // // //     <Stack.Screen name="dashboard/index" options={{headerShown:false}}/>
// // // //     </Stack>
  
// // // //   );
// // // // }


// // // import { Stack } from "expo-router";
// // // import { useFonts } from "expo-font";
// // // import { View } from "react-native";

// // // export default function RootLayout() {
// // //   const [loaded] = useFonts({
// // //     outfit: require("../assets/fonts/Outfit-Regular.ttf"),
// // //     "outfit-medium": require("../assets/fonts/Outfit-Medium.ttf"),
// // //     "outfit-bold": require("../assets/fonts/Outfit-Bold.ttf"),
// // //   });

// // //   if (!loaded) {
// // //     return <View />;
// // //   }

// // //   return (
// // //     <Stack>
// // //       <Stack.Screen name="index" options={{ headerShown: false }} />
// // //       <Stack.Screen name="login/index" options={{ headerShown: false }} />
// // //       <Stack.Screen name="dashboard/index" options={{ headerShown: false }} />
// // //     </Stack>
// // //   );
// // // }

// // import { Stack } from "expo-router";
// // import { useFonts } from "expo-font";
// // import { View } from "react-native";
// // import { AuthProvider } from "../context/AuthContext";

// // export default function RootLayout() {
// //   const [loaded] = useFonts({
// //     outfit: require("../assets/fonts/Outfit-Regular.ttf"),
// //     "outfit-medium": require("../assets/fonts/Outfit-Medium.ttf"),
// //     "outfit-bold": require("../assets/fonts/Outfit-Bold.ttf"),
// //   });

// //   if (!loaded) {
// //     return <View />;
// //   }

// //   return (
// //     <AuthProvider>
// //       <Stack>
// //         <Stack.Screen name="index" options={{ headerShown: false }} />
// //         <Stack.Screen name="login/index" options={{ headerShown: false }} />
// //         <Stack.Screen name="(student)" options={{ headerShown: false }} />
// //         <Stack.Screen name="(admin)" options={{ headerShown: false }} />
// //         <Stack.Screen name="(accountant)" options={{ headerShown: false }} />
// //         <Stack.Screen name="(canteen)" options={{ headerShown: false }} />
// //         <Stack.Screen name="(hallrep)" options={{ headerShown: false }} />
// //       </Stack>
// //     </AuthProvider>
// //   );
// // }

// import { Stack } from "expo-router";
// import { useFonts } from "expo-font";
// import { View } from "react-native";
// import { AuthProvider } from "../context/AuthContext";

// export default function RootLayout() {
//   const [loaded] = useFonts({
//     outfit: require("../assets/fonts/Outfit-Regular.ttf"),
//     "outfit-medium": require("../assets/fonts/Outfit-Medium.ttf"),
//     "outfit-bold": require("../assets/fonts/Outfit-Bold.ttf"),
//   });

//   if (!loaded) return <View />;

//   return (
//     <AuthProvider>
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="index" />
//         <Stack.Screen name="login" />
//         <Stack.Screen name="student" />
//         <Stack.Screen name="admin" />
//         {/* <Stack.Screen name="accountant" /> */}
//         {/* <Stack.Screen name="canteen" /> */}
//         {/* <Stack.Screen name="hallrep" /> */}
//       </Stack>
//     </AuthProvider>
//   );
// }

import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { View } from "react-native";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  const [loaded] = useFonts({
    outfit: require("../assets/fonts/Outfit-Regular.ttf"),
    "outfit-medium": require("../assets/fonts/Outfit-Medium.ttf"),
    "outfit-bold": require("../assets/fonts/Outfit-Bold.ttf"),
  });

  if (!loaded) return <View />;

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(student)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(accountant)" />
        <Stack.Screen name="(canteen)" />
        <Stack.Screen name="(hallrep)" />
      </Stack>
    </AuthProvider>
  );
}
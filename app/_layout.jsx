import "../global.css";
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
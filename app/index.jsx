
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

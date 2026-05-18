import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const menus = [
    { title: "👤 My Profile", route: "/(student)/profile", color: "#3498db" },
    { title: "💳 Payment Status", route: "/(student)/payment", color: "#2ecc71" },
    { title: "📢 Notices", route: "/(student)/notices", color: "#e67e22" },
    { title: "🍽️ Canteen Menu", route: "/(student)/canteen", color: "#9b59b6" },
    { title: "📝 Complaints", route: "/(student)/complaints", color: "#e74c3c" },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome 👋</Text>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.role}>Student</Text>
      </View>

      <View style={styles.grid}>
        {menus.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: item.color }]}
            onPress={() => router.push(item.route)}
          >
            <Text style={styles.cardText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "purple", padding: 30, paddingTop: 60 },
  welcome: { color: "#fff", fontSize: 20 },
  name: { color: "#fff", fontSize: 24, fontWeight: "bold", marginTop: 4 },
  role: { color: "#fff", fontSize: 14, marginTop: 4 },
  grid: { padding: 16, gap: 12 },
  card: { padding: 20, borderRadius: 12, marginBottom: 4 },
  cardText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  logoutBtn: { margin: 16, backgroundColor: "#e74c3c", padding: 14, borderRadius: 10, alignItems: "center" },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
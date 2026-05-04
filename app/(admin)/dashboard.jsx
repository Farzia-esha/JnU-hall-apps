import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const menus = [
    { title: "👨‍🎓 Students", route: "/(admin)/students", color: "#3498db" },
    { title: "➕ Add Student", route: "/(admin)/add-student", color: "#2ecc71" },
    { title: "📢 Notices", route: "/(admin)/notices", color: "#e67e22" },
    { title: "📝 Complaints", route: "/(admin)/complaints", color: "#e74c3c" },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Admin Panel 🛠️</Text>
        <Text style={styles.name}>{user?.name}</Text>
      </View>
      <View style={styles.grid}>
        {menus.map((item, index) => (
          <TouchableOpacity key={index} style={[styles.card, { backgroundColor: item.color }]}
            onPress={() => router.push(item.route)}>
            <Text style={styles.cardText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={async () => { await logout(); router.replace("/login"); }}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "#2c3e50", padding: 30, paddingTop: 60, alignItems: "center" },
  welcome: { color: "#fff", fontSize: 16 },
  name: { color: "#fff", fontSize: 24, fontWeight: "bold", marginTop: 4 },
  grid: { padding: 16, gap: 12 },
  card: { padding: 20, borderRadius: 12, marginBottom: 4 },
  cardText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  logoutBtn: { margin: 16, backgroundColor: "#e74c3c", padding: 14, borderRadius: 10, alignItems: "center" },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
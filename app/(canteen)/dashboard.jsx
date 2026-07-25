import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function CanteenDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const menus = [
    { title: "Post Menu",     sub: "Upload today's menu",   icon: "cloud-upload-outline",  color: "#E6F1FB", iconColor: "#185FA5", route: "/(canteen)/menu" },
    { title: "Menu History",  sub: "View past menus",       icon: "time-outline",          color: "#E1F5EE", iconColor: "#0F6E56", route: "/(canteen)/history" },
    { title: "Today's Menu",  sub: "View what's posted",    icon: "today-outline",         color: "#FAEEDA", iconColor: "#854F0B", route: "/(canteen)/canteen" },
    { title: "Feedback",      sub: "Read student reviews",  icon: "chatbubble-outline",    color: "#E6F1FB", iconColor: "#185FA5", route: "/(canteen)/feedback" },
    { title: "Notices",       sub: "Hall notices from admin", icon: "megaphone-outline",  color: "#E1F5EE", iconColor: "#0F6E56", route: "/(canteen)/notices" },

  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.fullName || "Canteen Manager"}</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            Alert.alert("Logout", "Are you sure you want to logout?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                  await logout();
                  router.replace("/login");
                },
              },
            ]);
          }}
        >
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>MANAGE</Text>

      <View style={styles.grid}>
        {menus.map((item, i) => (
          <TouchableOpacity key={i} style={styles.card} onPress={() => router.push(item.route)} activeOpacity={0.75}>
            <View style={styles.cardTop}>
              <View style={[styles.iconWrap, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={22} color={item.iconColor} />
              </View>
              <Ionicons name="arrow-forward" size={18} color="#aaa" />
            </View>
            <Text style={styles.cardLabel}>{item.title}</Text>
            <Text style={styles.cardSub}>{item.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: {
    backgroundColor: "#2c3e50", paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  greeting: { color: "rgba(255,255,255,0.65)", fontSize: 13 },
  name: { color: "#fff", fontSize: 22, fontWeight: "600", marginTop: 2 },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#e74c3c",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  logoutText: { color: "#fff", fontSize: 13 },
  sectionTitle: {
    fontSize: 11, fontWeight: "600", color: "#999",
    letterSpacing: 1, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8,
  },
  grid: { paddingHorizontal: 12, gap: 10, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 0.5, borderColor: "#e0e0e0", padding: 14, marginBottom: 2,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  iconWrap: { width: 42, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cardLabel: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
  cardSub: { fontSize: 12, color: "#888", marginTop: 3 },
});
import { useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../../constants/api";

export default function AccountantDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = () => {
    setLoading(true);
    fetch(`${BASE_URL}/api/payments/summary`)
      .then(res => res.json())
      .then(data => { setSummary(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => { fetchSummary(); }, []));

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: async () => { await logout(); router.replace("/login"); } },
    ]);
  };

  const formatMoney = (n) => `৳${Number(n || 0).toLocaleString()}`;

  const stats = [
    { label: "Total Collected", value: summary?.totalCollected, icon: "cash-outline", color: "#E1F5EE", iconColor: "#0F6E56", money: true },
    // { label: "Total Due", value: summary?.totalDue, icon: "alert-circle-outline", color: "#FCEBEB", iconColor: "#A32D2D", money: true },
    // { label: "This Month", value: summary?.monthlyCollection, icon: "calendar-outline", color: "#E6F1FB", iconColor: "#185FA5", money: true },
    // { label: "Pending Payments", value: summary?.pendingCount, icon: "time-outline", color: "#FAEEDA", iconColor: "#854F0B", money: false },
  ];

  const menus = [
    { title: "All Payments", sub: "View & search records", icon: "list-outline", color: "#E6F1FB", iconColor: "#185FA5", route: "/(accountant)/payments" },
    { title: "Add Payment", sub: "Create new record", icon: "add-circle-outline", color: "#E1F5EE", iconColor: "#0F6E56", route: "/(accountant)/add-payment" },
    { title: "Reports", sub: "Monthly & semester", icon: "bar-chart-outline", color: "#FAEEDA", iconColor: "#854F0B", route: "/(accountant)/reports" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome</Text>
          <Text style={styles.name}>{user?.fullName || "Accountant"}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.color }]}>
                <Ionicons name={s.icon} size={20} color={s.iconColor} />
              </View>
              <Text style={styles.statValue}>{s.money ? `৳${Number(s.value || 0).toLocaleString()}` : (s.value ?? 0)}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>MANAGE</Text>
      <View style={styles.menuList}>
        {menus.map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuCard} onPress={() => router.push(item.route)} activeOpacity={0.75}>
            <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon} size={22} color={item.iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>{item.title}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#aaa" />
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
    flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "red",
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  logoutText: { color: "#fff", fontSize: 13 },

  statsGrid: { flexDirection: "column", flexWrap: "wrap", gap: 10, padding: 16 },
  statCard: { width: "100%", backgroundColor: "#fff", borderRadius: 12, borderWidth: 0.5, borderColor: "#e0e0e0", padding: 14 },
  statIcon: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: "700", color: "#111" },
  statLabel: { fontSize: 12, color: "#888", marginTop: 2 },

  sectionTitle: { fontSize: 11, fontWeight: "600", color: "#999", letterSpacing: 1, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
  menuList: { paddingHorizontal: 16, gap: 10, paddingBottom: 40 },
  menuCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", borderRadius: 14, borderWidth: 0.5, borderColor: "#e0e0e0", padding: 14,
  },
  menuIcon: { width: 42, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
  menuSub: { fontSize: 12, color: "#888", marginTop: 2 },
});
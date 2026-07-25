import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../../constants/api";
import { useFocusEffect } from "expo-router";

export default function HallRepDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [eventCount, setEventCount] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [logoutModal, setLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useFocusEffect(
    useCallback(() => { fetchStats(); }, [])
  );

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/events`);
      const data = await res.json();
      setEventCount(Array.isArray(data) ? data.length : 0);
    } catch {
      setEventCount(0);
    } finally {
      setStatsLoading(false);
    }
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.replace("/login");
    } finally {
      setLoggingOut(false);
      setLogoutModal(false);
    }
  };

  const menus = [
    { title: "Events",  sub: "Manage hall events",      icon: "calendar-outline",  color: "#E1F5EE", iconColor: "#0F6E56", route: "/(hallrep)/events" },
    { title: "Notices", sub: "View hall announcements",  icon: "megaphone-outline", color: "#FAEEDA", iconColor: "#854F0B", route: "/(hallrep)/notices" },
    { title: "Complaints", sub: "View student complaints",  icon: "chatbubbles-outline", color: "#E3F2FD", iconColor: "#1565C0", route: "/(hallrep)/complaints" },
    { title: "Canteen Feedback", sub: "View canteen feedback",  icon: "restaurant-outline", color: "#E1F5EE", iconColor: "#0F6E56", route: "/(hallrep)/canteen-feedback" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome </Text>
          <Text style={styles.name}>{user?.fullName || "Hall Representative"}</Text>
          {user?.subRole && (
            <View style={styles.subRolePill}>
              <Text style={styles.subRoleText}>{user.subRole}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => setLogoutModal(true)}>
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

      <Modal visible={logoutModal} animationType="fade" transparent onRequestClose={() => setLogoutModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconWrap}>
              <Ionicons name="log-out-outline" size={26} color="#C0392B" />
            </View>
            <Text style={styles.confirmTitle}>Log out?</Text>
            <Text style={styles.confirmSub}>Are you sure you want to log out?</Text>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setLogoutModal(false)}
                disabled={loggingOut}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmLogoutBtn, loggingOut && { opacity: 0.7 }]}
                onPress={confirmLogout}
                disabled={loggingOut}
              >
                {loggingOut
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.confirmLogoutText}>Logout</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: {
    backgroundColor: "#2c3e50", paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24,
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
  },
  greeting: { color: "rgba(255,255,255,0.65)", fontSize: 13 },
  name: { color: "#fff", fontSize: 22, fontWeight: "600", marginTop: 2 },
  subRolePill: {
    marginTop: 6, backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, alignSelf: "flex-start",
  },
  subRoleText: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "red",
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

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 24 },
  confirmCard: {
    backgroundColor: "#fff", borderRadius: 18, padding: 24, alignItems: "center",
  },
  confirmIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "#FCEBEB",
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  confirmTitle: { fontSize: 18, fontWeight: "700", color: "#1a1a1a", marginBottom: 6 },
  confirmSub: { fontSize: 13, color: "#888", textAlign: "center", lineHeight: 19, marginBottom: 20 },
  confirmActions: { flexDirection: "row", gap: 10, width: "100%" },
  confirmCancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  confirmCancelText: { color: "#555", fontSize: 14, fontWeight: "600" },
  confirmLogoutBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center",
    backgroundColor: "#E74C3C",
  },
  confirmLogoutText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
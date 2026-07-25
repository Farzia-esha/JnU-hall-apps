import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../../constants/api";
import { useFocusEffect } from "expo-router";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [studentCount, setStudentCount] = useState(null);
  const [applicationCount, setApplicationCount] = useState(null);
  const [vacantSeatCount, setVacantSeatCount] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => { fetchStats(); }, [])
  );

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const [studentsRes, applicationsRes, seatsRes] = await Promise.all([
        fetch(`${BASE_URL}/api/admin/students`),
        fetch(`${BASE_URL}/api/admin/applications`),
        fetch(`${BASE_URL}/api/admin/seats?status=vacant`),
      ]);
      const students = await studentsRes.json();
      const applications = await applicationsRes.json();
      const vacantSeats = await seatsRes.json();

      setStudentCount(Array.isArray(students) ? students.length : 0);
      setApplicationCount(Array.isArray(applications) ? applications.length : 0);
      setVacantSeatCount(Array.isArray(vacantSeats) ? vacantSeats.length : 0);
    } catch {
      setStudentCount(0);
      setApplicationCount(0);
      setVacantSeatCount(0);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/login");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const stats = [
    { label: "Students",   value: studentCount,  icon: "people-outline",           color: "#E6F1FB", iconColor: "#185FA5" },
    { label: "Applications", value: applicationCount, icon: "document-text-outline", color: "#FAEEDA", iconColor: "#854F0B" },
    { label: "Vacant Seats", value: vacantSeatCount,    icon: "bed-outline",    color: "#E1F5EE", iconColor: "#0F6E56" },
  ];

  const menus = [
    { title: "User Management",  sub: "Manage roles",        icon: "shield-outline",          color: "#E1F5EE", iconColor: "#0F6E56", route: "/(admin)/users" },
    { title: "Students",         sub: "View all records",    icon: "people-outline",          color: "#E6F1FB", iconColor: "#185FA5", route: "/(admin)/students" },
    { title: "Add Student",      sub: "Register new",        icon: "person-add-outline",      color: "#E1F5EE", iconColor: "#0F6E56", route: "/(admin)/add-student" },
    { title: "Notices",          sub: "Post & manage",       icon: "megaphone-outline",       color: "#FAEEDA", iconColor: "#854F0B", route: "/(admin)/notices" },
    { title: "Application Time", sub: "Set open/close dates",    icon: "time-outline",           color: "#E6F1FB", iconColor: "#185FA5", route: "/(admin)/application-settings" },
    { title: "Applications",     sub: "Review & allocate seats", icon: "document-text-outline", color: "#FAEEDA", iconColor: "#854F0B", route: "/(admin)/applications" },
    { title: "Seat Inventory",   sub: "Manage rooms & seats",    icon: "bed-outline",            color: "#E1F5EE", iconColor: "#0F6E56", route: "/(admin)/seats" },
    { title: "Complaints",       sub: "Review & resolve",       icon: "chatbox-ellipses-outline",color: "#E6F1FB", iconColor: "#185FA5", route: "/(admin)/complaints" },
    { title: "Payments",         sub: "Dues & payment history",  icon: "wallet-outline",         color: "#FAEEDA", iconColor: "#854F0B", route: "/(admin)/payments" },
    { title: "Events",           sub: "Monitor & override",      icon: "calendar-outline",       color: "#E1F5EE", iconColor: "#0F6E56", route: "/(hallrep)/events" },
    { title: "canteen Menu",     sub: "Manage daily menu",       icon: "restaurant-outline",     color: "#E6F1FB", iconColor: "#185FA5", route: "/(canteen)/canteen" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome</Text>
          <Text style={styles.adminName}>{user?.fullName || "Admin"}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        {stats.map((s, i) => (
          <View key={i} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: s.color }]}>
              <Ionicons name={s.icon} size={20} color={s.iconColor} />
            </View>
            {statsLoading ? (
              <ActivityIndicator size="small" color="#aaa" style={{ marginVertical: 6 }} />
            ) : (
              <Text style={styles.statNum}>{s.value}</Text>
            )}
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>MANAGE</Text>

      <View style={styles.menuGrid}>
        {menus.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.menuCard}
            onPress={() => router.push(item.route)}
            activeOpacity={0.75}
          >
            <View style={styles.menuCardTop}>
              <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={22} color={item.iconColor} />
              </View>
              <Ionicons name="arrow-forward" size={18} color="#aaa" />
            </View>
            <Text style={styles.menuLabel}>{item.title}</Text>
            <Text style={styles.menuSub}>{item.sub}</Text>
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
  adminName: { color: "#fff", fontSize: 22, fontWeight: "600", marginTop: 2 },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "red",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  logoutText: { color: "#fff", fontSize: 13 },
  statsRow: { flexDirection: "row", gap: 10, padding: 16, paddingBottom: 0 },
  statCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 12,
    borderWidth: 0.5, borderColor: "#e0e0e0", padding: 12,
  },
  statIcon: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statNum: { fontSize: 22, fontWeight: "600", color: "#111" },
  statLabel: { fontSize: 12, color: "#888", marginTop: 2 },
  sectionTitle: {
    fontSize: 11, fontWeight: "600", color: "#999",
    letterSpacing: 1, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8,
  },
  menuGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 10, paddingBottom: 40 },
  menuCard: {
    width: "47%", backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 0.5, borderColor: "#e0e0e0", padding: 14, marginBottom: 2,
  },
  menuCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  menuIcon: { width: 42, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
  menuSub: { fontSize: 12, color: "#888", marginTop: 3 },
});
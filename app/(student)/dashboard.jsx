import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../../constants/api";
import { useFocusEffect } from "expo-router";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [noticeCount, setNoticeCount] = useState(null);
  const [complaintCount, setComplaintCount] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const [profileRes, noticesRes, complaintsRes] = await Promise.all([
        fetch(`${BASE_URL}/api/student/profile/${user?.email}`),
        fetch(`${BASE_URL}/api/notices`),
        fetch(`${BASE_URL}/api/complaints/student/${user?.email}`),
      ]);
      const profileData = await profileRes.json();
      const notices = await noticesRes.json();
      const complaints = await complaintsRes.json();

      setProfile(profileData);
      setNoticeCount(Array.isArray(notices) ? notices.length : 0);
      setComplaintCount(Array.isArray(complaints) ? complaints.length : 0);
    } catch {
      setNoticeCount(0);
      setComplaintCount(0);
    } finally {
      setStatsLoading(false);
    }
  };

  const menus = [
    { title: "My Profile",    sub: "View your info",        icon: "person-outline",          color: "#E6F1FB", iconColor: "#185FA5", route: "/(student)/profile" },
    { title: "Notices",       sub: "Hall announcements",    icon: "megaphone-outline",        color: "#FAEEDA", iconColor: "#854F0B", route: "/(student)/notices" },
    { title: "Complaints",    sub: "Submit & track",        icon: "chatbox-ellipses-outline", color: "#E6F1FB", iconColor: "#185FA5", route: "/(student)/complaints" },
    { title: "Canteen Menu",  sub: "Today's food",          icon: "restaurant-outline",       color: "#E1F5EE", iconColor: "#0F6E56", route: "/(student)/canteen" },
    { title: "Payments",      sub: "Your payment status",   icon: "card-outline",             color: "#FAEEDA", iconColor: "#854F0B", route: "/(student)/payment" },
    { title: "Events",        sub: "Hall events & updates", icon: "calendar-outline",         color: "#E1F5EE", iconColor: "#0F6E56", route: "/(student)/events" },
    { title: "Apply for Hall Seat", sub: "Application & payment", icon: "clipboard-outline", color: "#E6F1FB", iconColor: "#185FA5", route: "/(student)/apply" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Welcome</Text>
            <Text style={styles.name}>{user?.fullName || "Student"}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={async () => { await logout(); router.replace("/login"); }}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Room/Seat info */}
        {profile && !profile.message && (
          <View style={styles.infoRow}>
            {profile.roomNumber && (
              <View style={styles.infoPill}>
                <Ionicons name="grid-outline" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.infoPillText}>Room {profile.roomNumber}</Text>
              </View>
            )}
            {profile.seatNumber && (
              <View style={styles.infoPill}>
                <Ionicons name="checkmark-circle-outline" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.infoPillText}>Seat {profile.seatNumber}</Text>
              </View>
            )}
            {profile.department && (
              <View style={styles.infoPill}>
                <Ionicons name="school-outline" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.infoPillText}>{profile.department}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Stats */}
      {/* <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#FAEEDA" }]}>
            <Ionicons name="megaphone-outline" size={20} color="#854F0B" />
          </View>
          {statsLoading
            ? <ActivityIndicator size="small" color="#aaa" style={{ marginVertical: 6 }} />
            : <Text style={styles.statNum}>{noticeCount}</Text>
          }
          <Text style={styles.statLabel}>Notices</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#E6F1FB" }]}>
            <Ionicons name="chatbox-ellipses-outline" size={20} color="#185FA5" />
          </View>
          {statsLoading
            ? <ActivityIndicator size="small" color="#aaa" style={{ marginVertical: 6 }} />
            : <Text style={styles.statNum}>{complaintCount}</Text>
          }
          <Text style={styles.statLabel}>Complaints</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#E1F5EE" }]}>
            <Ionicons name="restaurant-outline" size={20} color="#0F6E56" />
          </View>
          <Text style={styles.statNum}>3</Text>
          <Text style={styles.statLabel}>Meals/day</Text>
        </View>
      </View> */}

      <Text style={styles.sectionTitle}>QUICK ACCESS</Text>

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
  header: { backgroundColor: "purple",paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { color: "white", fontSize: 15 },
  name: { color: "#fff", fontSize: 20, fontWeight: "600", marginTop: 2 },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    // backgroundColor: "rgba(255,255,255,0.12)",
    backgroundColor: "#e74c3c",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  logoutText: { color: "#fff", fontSize: 13 },
  infoRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 14 },
  infoPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  infoPillText: { color: "rgba(255,255,255,0.85)", fontSize: 12 },

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
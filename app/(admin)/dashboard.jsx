
// import { useEffect, useState } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
// import { useRouter } from "expo-router";
// import { useAuth } from "../../context/AuthContext";
// import { Ionicons } from "@expo/vector-icons";
// import { BASE_URL } from "../../constants/api";

// export default function AdminDashboard() {
//   const { user, logout } = useAuth();
//   const router = useRouter();

//   const [studentCount, setStudentCount] = useState(null);
//   const [complaintCount, setComplaintCount] = useState(null);
//   const [noticeCount, setNoticeCount] = useState(null);
//   const [statsLoading, setStatsLoading] = useState(true);

//   useEffect(() => {
//     fetchStats();
//   }, []);

//   const fetchStats = async () => {
//     setStatsLoading(true);
//     try {
//       const [studentsRes, complaintsRes, noticesRes] = await Promise.all([
//         fetch(`${BASE_URL}/api/admin/students`),
//         fetch(`${BASE_URL}/api/complaints`),
//         fetch(`${BASE_URL}/api/notices`),
//       ]);

//       const students = await studentsRes.json();
//       const complaints = await complaintsRes.json();
//       const notices = await noticesRes.json();

//       setStudentCount(Array.isArray(students) ? students.length : 0);
//       setComplaintCount(Array.isArray(complaints) ? complaints.length : 0);
//       setNoticeCount(Array.isArray(notices) ? notices.length : 0);
//     } catch (err) {
//       console.error("Stats fetch error:", err);
//       setStudentCount(0);
//       setComplaintCount(0);
//       setNoticeCount(0);
//     } finally {
//       setStatsLoading(false);
//     }
//   };

//   const stats = [
//     { label: "Students",   value: studentCount,  icon: "people-outline",           color: "#E6F1FB", iconColor: "#185FA5" },
//     { label: "Complaints", value: complaintCount, icon: "chatbox-ellipses-outline", color: "#FAEEDA", iconColor: "#854F0B" },
//     { label: "Notices",    value: noticeCount,    icon: "notifications-outline",    color: "#E1F5EE", iconColor: "#0F6E56" },
//   ];

//   const menus = [
//     { title: "Students",    sub: "View all records",  icon: "people-outline",          color: "#E6F1FB", iconColor: "#185FA5", route: "/(admin)/students"    },
//     { title: "Add Student", sub: "Register new",      icon: "person-add-outline",      color: "#E1F5EE", iconColor: "#0F6E56", route: "/(admin)/add-student" },
//     { title: "Notices",     sub: "Post & manage",     icon: "megaphone-outline",        color: "#FAEEDA", iconColor: "#854F0B", route: "/(admin)/notices"     },
//     { title: "Complaints",  sub: "Review & resolve",  icon: "chatbox-ellipses-outline", color: "#E6F1FB", iconColor: "#185FA5", route: "/(admin)/complaints"  },
//   ];

//   const handleLogout = async () => {
//     await logout();
//     router.replace("/login");
//   };

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

//       {/* Header */}
//       <View style={styles.header}>
//         <View>
//           <Text style={styles.greeting}>Welcome</Text>
//           <Text style={styles.adminName}>{user?.fullName || "Admin"}</Text>
//         </View>
//         <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
//           <Ionicons name="log-out-outline" size={18} color="#fff" />
//           <Text style={styles.logoutText}>Logout</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Stats Row */}
//       <View style={styles.statsRow}>
//         {stats.map((s, i) => (
//           <View key={i} style={styles.statCard}>
//             <View style={[styles.statIcon, { backgroundColor: s.color }]}>
//               <Ionicons name={s.icon} size={20} color={s.iconColor} />
//             </View>
//             {statsLoading ? (
//               <ActivityIndicator size="small" color="#aaa" style={{ marginVertical: 6 }} />
//             ) : (
//               <Text style={styles.statNum}>{s.value}</Text>
//             )}
//             <Text style={styles.statLabel}>{s.label}</Text>
//           </View>
//         ))}
//       </View>

//       {/* Section Label */}
//       <Text style={styles.sectionTitle}>MANAGE</Text>

//       {/* Menu Grid */}
//       <View style={styles.menuGrid}>
//         {menus.map((item, i) => (
//           <TouchableOpacity
//             key={i}
//             style={styles.menuCard}
//             onPress={() => router.push(item.route)}
//             activeOpacity={0.75}
//           >
//             <View style={styles.menuCardTop}>
//               <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
//                 <Ionicons name={item.icon} size={22} color={item.iconColor} />
//               </View>
//               <Ionicons name="arrow-forward" size={18} color="#aaa" />
//             </View>
//             <Text style={styles.menuLabel}>{item.title}</Text>
//             <Text style={styles.menuSub}>{item.sub}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f5f6fa" },

//   header: {
//     backgroundColor: "#2c3e50",
//     paddingHorizontal: 20,
//     paddingTop: 60,
//     paddingBottom: 24,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   greeting: { color: "white", fontSize: 15 },
//   adminName: { color: "#fff", fontSize: 22, fontWeight: "600", marginTop: 2 },
//   logoutBtn: {
//     flexDirection: "row", alignItems: "center", gap: 6,
//     backgroundColor: "red",
//     borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
//     paddingHorizontal: 14, paddingVertical: 8,
//     borderRadius: 10,
//   },
//   logoutText: { color: "#fff", fontSize: 13 },

//   statsRow: { flexDirection: "row", gap: 10, padding: 16, paddingBottom: 0 },
//   statCard: {
//     flex: 1, backgroundColor: "#fff", borderRadius: 12,
//     borderWidth: 0.5, borderColor: "#e0e0e0", padding: 12,
//   },
//   statIcon: {
//     width: 36, height: 36, borderRadius: 8,
//     alignItems: "center", justifyContent: "center", marginBottom: 8,
//   },
//   statNum: { fontSize: 22, fontWeight: "600", color: "#111" },
//   statLabel: { fontSize: 12, color: "#888", marginTop: 2 },

//   sectionTitle: {
//     fontSize: 11, fontWeight: "600", color: "#999",
//     letterSpacing: 1, paddingHorizontal: 16,
//     paddingTop: 20, paddingBottom: 8,
//   },

//   menuGrid: {
//     flexDirection: "row", flexWrap: "wrap",
//     paddingHorizontal: 12, gap: 10,
//   },
//   menuCard: {
//     width: "47%", backgroundColor: "#fff",
//     borderRadius: 14, borderWidth: 0.5,
//     borderColor: "#e0e0e0", padding: 14, marginBottom: 2,
//   },
//   menuCardTop: {
//     flexDirection: "row", justifyContent: "space-between",
//     alignItems: "center", marginBottom: 10,
//   },
//   menuIcon: {
//     width: 42, height: 42, borderRadius: 10,
//     alignItems: "center", justifyContent: "center",
//   },
//   menuLabel: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
//   menuSub: { fontSize: 12, color: "#888", marginTop: 3 },
// });

import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../../constants/api";
import { useFocusEffect } from "expo-router";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [studentCount, setStudentCount] = useState(null);
  const [complaintCount, setComplaintCount] = useState(null);
  const [noticeCount, setNoticeCount] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => { fetchStats(); }, [])
  );

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const [studentsRes, complaintsRes, noticesRes] = await Promise.all([
        fetch(`${BASE_URL}/api/admin/students`),
        fetch(`${BASE_URL}/api/complaints`),
        fetch(`${BASE_URL}/api/notices`),
      ]);
      const students = await studentsRes.json();
      const complaints = await complaintsRes.json();
      const notices = await noticesRes.json();

      setStudentCount(Array.isArray(students) ? students.length : 0);
      setComplaintCount(Array.isArray(complaints) ? complaints.length : 0);
      setNoticeCount(Array.isArray(notices) ? notices.length : 0);
    } catch {
      setStudentCount(0);
      setComplaintCount(0);
      setNoticeCount(0);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = () => {
    logout().then(() => router.replace("/login"));
  };

  const stats = [
    { label: "Students",   value: studentCount,  icon: "people-outline",           color: "#E6F1FB", iconColor: "#185FA5" },
    { label: "Complaints", value: complaintCount, icon: "chatbox-ellipses-outline", color: "#FAEEDA", iconColor: "#854F0B" },
    { label: "Notices",    value: noticeCount,    icon: "notifications-outline",    color: "#E1F5EE", iconColor: "#0F6E56" },
  ];

  const menus = [
    { title: "Students",         sub: "View all records",    icon: "people-outline",          color: "#E6F1FB", iconColor: "#185FA5", route: "/(admin)/students" },
    { title: "Add Student",      sub: "Register new",        icon: "person-add-outline",      color: "#E1F5EE", iconColor: "#0F6E56", route: "/(admin)/add-student" },
    { title: "Notices",          sub: "Post & manage",       icon: "megaphone-outline",       color: "#FAEEDA", iconColor: "#854F0B", route: "/(admin)/notices" },
    { title: "Complaints",       sub: "Review & resolve",    icon: "chatbox-ellipses-outline",color: "#E6F1FB", iconColor: "#185FA5", route: "/(admin)/complaints" },
    { title: "User Management",  sub: "Manage roles",        icon: "shield-outline",          color: "#E1F5EE", iconColor: "#0F6E56", route: "/(admin)/users" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
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
    backgroundColor: "rgba(255,255,255,0.12)",
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
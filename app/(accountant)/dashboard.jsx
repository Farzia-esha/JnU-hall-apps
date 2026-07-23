// import { useEffect, useState, useCallback } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
// import { useRouter } from "expo-router";
// import { useAuth } from "../../context/AuthContext";
// import { Ionicons } from "@expo/vector-icons";
// import { BASE_URL } from "../../constants/api";
// import { useFocusEffect } from "expo-router";

// export default function AccountantDashboard() {
//   const { user, logout } = useAuth();
//   const router = useRouter();
//   const [stats, setStats] = useState({ total: null, paid: null, unpaid: null, totalAmount: null });
//   const [statsLoading, setStatsLoading] = useState(true);

//   useFocusEffect(
//     useCallback(() => { fetchStats(); }, [])
//   );

//   const fetchStats = async () => {
//     setStatsLoading(true);
//     try {
//       const res = await fetch(`${BASE_URL}/api/payments`);
//       const data = await res.json();
//       if (Array.isArray(data)) {
//         const paid = data.filter(p => p.status === "paid");
//         const unpaid = data.filter(p => p.status === "unpaid");
//         const totalAmount = data.reduce((sum, p) => sum + (p.amount || 0), 0);
//         setStats({ total: data.length, paid: paid.length, unpaid: unpaid.length, totalAmount });
//       }
//     } catch {
//       setStats({ total: 0, paid: 0, unpaid: 0, totalAmount: 0 });
//     } finally {
//       setStatsLoading(false);
//     }
//   };

//   const menus = [
//     { title: "All Payments",  sub: "View all records",    icon: "wallet-outline",       color: "#E6F1FB", iconColor: "#185FA5", route: "/(accountant)/payments" },
//     { title: "Due List",      sub: "Unpaid students",     icon: "alert-circle-outline", color: "#FCEBEB", iconColor: "#A32D2D", route: "/(accountant)/due-list" },
//     { title: "Notices",       sub: "Post & manage",       icon: "megaphone-outline",    color: "#FAEEDA", iconColor: "#854F0B", route: "/(accountant)/notices" },
//   ];

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

//       <View style={styles.header}>
//         <View>
//           <Text style={styles.greeting}>Welcome</Text>
//           <Text style={styles.name}>{user?.fullName || "Accountant"}</Text>
//         </View>
//         <TouchableOpacity style={styles.logoutBtn} onPress={async () => { await logout(); router.replace("/login"); }}>
//           <Ionicons name="log-out-outline" size={18} color="#fff" />
//           <Text style={styles.logoutText}>Logout</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Stats */}
//       <View style={styles.statsRow}>
//         <View style={styles.statCard}>
//           <View style={[styles.statIcon, { backgroundColor: "#E6F1FB" }]}>
//             <Ionicons name="receipt-outline" size={20} color="#185FA5" />
//           </View>
//           {statsLoading ? <ActivityIndicator size="small" color="#aaa" style={{ marginVertical: 6 }} /> : <Text style={styles.statNum}>{stats.total}</Text>}
//           <Text style={styles.statLabel}>Total</Text>
//         </View>
//         <View style={styles.statCard}>
//           <View style={[styles.statIcon, { backgroundColor: "#E1F5EE" }]}>
//             <Ionicons name="checkmark-circle-outline" size={20} color="#0F6E56" />
//           </View>
//           {statsLoading ? <ActivityIndicator size="small" color="#aaa" style={{ marginVertical: 6 }} /> : <Text style={styles.statNum}>{stats.paid}</Text>}
//           <Text style={styles.statLabel}>Paid</Text>
//         </View>
//         <View style={styles.statCard}>
//           <View style={[styles.statIcon, { backgroundColor: "#FCEBEB" }]}>
//             <Ionicons name="close-circle-outline" size={20} color="#A32D2D" />
//           </View>
//           {statsLoading ? <ActivityIndicator size="small" color="#aaa" style={{ marginVertical: 6 }} /> : <Text style={styles.statNum}>{stats.unpaid}</Text>}
//           <Text style={styles.statLabel}>Unpaid</Text>
//         </View>
//       </View>

//       {/* Total Amount Card */}
//       {!statsLoading && stats.totalAmount !== null && (
//         <View style={styles.amountCard}>
//           <View style={styles.amountLeft}>
//             <Ionicons name="cash-outline" size={22} color="#0F6E56" />
//             <Text style={styles.amountLabel}>Total Collected</Text>
//           </View>
//           <Text style={styles.amountValue}>৳{stats.totalAmount.toLocaleString()}</Text>
//         </View>
//       )}

//       <Text style={styles.sectionTitle}>MANAGE</Text>

//       <View style={styles.grid}>
//         {menus.map((item, i) => (
//           <TouchableOpacity key={i} style={styles.card} onPress={() => router.push(item.route)} activeOpacity={0.75}>
//             <View style={styles.cardTop}>
//               <View style={[styles.iconWrap, { backgroundColor: item.color }]}>
//                 <Ionicons name={item.icon} size={22} color={item.iconColor} />
//               </View>
//               <Ionicons name="arrow-forward" size={18} color="#aaa" />
//             </View>
//             <Text style={styles.cardLabel}>{item.title}</Text>
//             <Text style={styles.cardSub}>{item.sub}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f5f6fa" },
//   header: {
//     backgroundColor: "#2c3e50", paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24,
//     flexDirection: "row", justifyContent: "space-between", alignItems: "center",
//   },
//   greeting: { color: "rgba(255,255,255,0.65)", fontSize: 13 },
//   name: { color: "#fff", fontSize: 22, fontWeight: "600", marginTop: 2 },
//   logoutBtn: {
//     flexDirection: "row", alignItems: "center", gap: 6,
//     backgroundColor: "rgba(255,255,255,0.12)",
//     borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
//     paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
//   },
//   logoutText: { color: "#fff", fontSize: 13 },

//   statsRow: { flexDirection: "row", gap: 10, padding: 16, paddingBottom: 10 },
//   statCard: {
//     flex: 1, backgroundColor: "#fff", borderRadius: 12,
//     borderWidth: 0.5, borderColor: "#e0e0e0", padding: 12,
//   },
//   statIcon: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 8 },
//   statNum: { fontSize: 22, fontWeight: "600", color: "#111" },
//   statLabel: { fontSize: 12, color: "#888", marginTop: 2 },

//   amountCard: {
//     flexDirection: "row", alignItems: "center", justifyContent: "space-between",
//     backgroundColor: "#fff", borderRadius: 12, borderWidth: 0.5, borderColor: "#e0e0e0",
//     marginHorizontal: 16, padding: 14, marginBottom: 4,
//   },
//   amountLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
//   amountLabel: { fontSize: 14, color: "#555", fontWeight: "500" },
//   amountValue: { fontSize: 20, fontWeight: "600", color: "#0F6E56" },

//   sectionTitle: {
//     fontSize: 11, fontWeight: "600", color: "#999",
//     letterSpacing: 1, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8,
//   },
//   grid: { paddingHorizontal: 12, gap: 10, paddingBottom: 40 },
//   card: {
//     backgroundColor: "#fff", borderRadius: 14,
//     borderWidth: 0.5, borderColor: "#e0e0e0", padding: 14, marginBottom: 2,
//   },
//   cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
//   iconWrap: { width: 42, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
//   cardLabel: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
//   cardSub: { fontSize: 12, color: "#888", marginTop: 3 },
// });


import { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../../constants/api";

export default function AccountantDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [totalAmount, setTotalAmount] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => { fetchStats(); }, [])
  );

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/payments`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const paid = data.filter(p => p.status === "paid");
        const total = paid.reduce((sum, p) => sum + (p.amount || 0), 0);
        setTotalAmount(total);
      }
    } catch {
      setTotalAmount(0);
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

  const menus = [
    { title: "All Payments",  sub: "View all records",    icon: "wallet-outline",       color: "#E6F1FB", iconColor: "#185FA5", route: "/(accountant)/payments" },
    { title: "Due List",      sub: "Unpaid students",     icon: "alert-circle-outline", color: "#FCEBEB", iconColor: "#A32D2D", route: "/(accountant)/due-list" },
    { title: "Notices",       sub: "Post & manage",       icon: "megaphone-outline",    color: "#FAEEDA", iconColor: "#854F0B", route: "/(accountant)/notices" },
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

      {/* Total Collected Card */}
      <View style={styles.amountCard}>
        <View style={styles.amountLeft}>
          <Ionicons name="cash-outline" size={22} color="#0F6E56" />
          <Text style={styles.amountLabel}>Total Collected</Text>
        </View>
        {statsLoading ? (
          <ActivityIndicator size="small" color="#aaa" />
        ) : (
          <Text style={styles.amountValue}>৳{(totalAmount || 0).toLocaleString()}</Text>
        )}
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
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  logoutText: { color: "#fff", fontSize: 13 },

  amountCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", borderRadius: 12, borderWidth: 0.5, borderColor: "#e0e0e0",
    marginHorizontal: 16, marginTop: 16, padding: 14,
  },
  amountLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  amountLabel: { fontSize: 14, color: "#555", fontWeight: "500" },
  amountValue: { fontSize: 20, fontWeight: "600", color: "#0F6E56" },

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
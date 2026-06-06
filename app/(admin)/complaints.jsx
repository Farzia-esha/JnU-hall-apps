// import { useEffect, useState } from "react";
// import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
// import { BASE_URL } from "../../constants/api";
// import { useRouter } from "expo-router";

// export default function AdminComplaints() {
//   const [complaints, setComplaints] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   const fetchComplaints = () => {
//     fetch(`${BASE_URL}/api/complaints`)
//       .then(res => res.json())
//       .then(data => { setComplaints(data); setLoading(false); });
//   };

//   useEffect(() => { fetchComplaints(); }, []);

//   const updateStatus = (id, status) => {
//     Alert.alert("Update", `Update status to "${status}"?`, [
//       { text: "Cancel" },
//       {
//         text: "Yes", onPress: async () => {
//           await fetch(`${BASE_URL}/api/complaints/${id}`, {
//             method: "PUT", headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ status }),
//           });
//           fetchComplaints();
//         }
//       }
//     ]);
//   };

//   const statusColor = (s) => s === "resolved" ? "#2ecc71" : s === "in_progress" ? "#f39c12" : "#e74c3c";

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
//         <Text style={styles.title}>📝 All Complaints</Text>
//       </View>
//       {loading ? <ActivityIndicator size="large" color="#e74c3c" style={{ marginTop: 40 }} /> :
//         <FlatList data={complaints} keyExtractor={item => item._id} contentContainerStyle={{ padding: 16 }}
//           ListEmptyComponent={<Text style={styles.empty}>No complaints available</Text>}
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <View style={styles.row}>
//                 <Text style={styles.cTitle}>{item.title}</Text>
//                 <Text style={[styles.status, { backgroundColor: statusColor(item.status) }]}>{item.status}</Text>
//               </View>
//               <Text style={styles.student}>👤 {item.studentName} ({item.studentEmail})</Text>
//               <Text style={styles.desc}>{item.description}</Text>
//               <View style={styles.actions}>
//                 <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#f39c12" }]} onPress={() => updateStatus(item._id, "in_progress")}>
//                   <Text style={styles.actionText}>In Progress</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#2ecc71" }]} onPress={() => updateStatus(item._id, "resolved")}>
//                   <Text style={styles.actionText}>Resolved ✓</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )} />}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f5f6fa" },
//   header: { backgroundColor: "red", padding: 20, paddingTop: 50 },
//   backText: { color: "#fff", fontSize: 25, marginBottom: 8 },
//   title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
//   card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
//   row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
//   cTitle: { fontSize: 16, fontWeight: "bold", color: "#222", flex: 1 },
//   status: { color: "#fff", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, fontSize: 12 },
//   student: { fontSize: 13, color: "#888", marginBottom: 4 },
//   desc: { fontSize: 14, color: "#555" },
//   actions: { flexDirection: "row", gap: 8, marginTop: 10 },
//   actionBtn: { flex: 1, padding: 8, borderRadius: 8, alignItems: "center" },
//   actionText: { color: "#fff", fontWeight: "600", fontSize: 13 },
//   empty: { textAlign: "center", color: "#999", marginTop: 40 },
// });

import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Alert
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchComplaints = () => {
    fetch(`${BASE_URL}/api/complaints`)
      .then(res => res.json())
      .then(data => { setComplaints(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchComplaints(); }, []);

  const updateStatus = (id, status) => {
    const labels = { in_progress: "In Progress", resolved: "Resolved" };
    Alert.alert("Update Status", `Mark as "${labels[status]}"?`, [
      { text: "Cancel" },
      {
        text: "Yes", onPress: async () => {
          await fetch(`${BASE_URL}/api/complaints/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          });
          fetchComplaints();
        }
      }
    ]);
  };

  const statusConfig = {
    pending:     { label: "Pending",     bg: "#FCEBEB", text: "#A32D2D", icon: "time-outline" },
    in_progress: { label: "In Progress", bg: "#FAEEDA", text: "#633806", icon: "reload-outline" },
    resolved:    { label: "Resolved",    bg: "#E1F5EE", text: "#085041", icon: "checkmark-circle-outline" },
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Complaints</Text>
          {!loading && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{complaints.length} total</Text>
            </View>
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="chatbox-ellipses-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No complaints yet</Text>
            </View>
          }
          renderItem={({ item }) => {
            const sc = statusConfig[item.status] || statusConfig.pending;
            return (
              <View style={styles.card}>

                {/* Card Top */}
                <View style={styles.cardTop}>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Ionicons name={sc.icon} size={12} color={sc.text} />
                    <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
                  </View>
                  <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                </View>

                {/* Title */}
                <Text style={styles.cTitle}>{item.title}</Text>

                {/* Description */}
                <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>

                {/* Student info */}
                <View style={styles.studentRow}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentAvatarText}>
                      {item.studentName?.slice(0, 1)?.toUpperCase() || "?"}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.studentName}>{item.studentName || "Unknown"}</Text>
                    <Text style={styles.studentEmail}>{item.studentEmail}</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                {item.status !== "resolved" && (
                  <View style={styles.actions}>
                    {item.status !== "in_progress" && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: "#FAEEDA", borderColor: "#EF9F27" }]}
                        onPress={() => updateStatus(item._id, "in_progress")}
                      >
                        <Ionicons name="reload-outline" size={14} color="#633806" />
                        <Text style={[styles.actionText, { color: "#633806" }]}>In Progress</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: "#E1F5EE", borderColor: "#5DCAA5" }]}
                      onPress={() => updateStatus(item._id, "resolved")}
                    >
                      <Ionicons name="checkmark-circle-outline" size={14} color="#085041" />
                      <Text style={[styles.actionText, { color: "#085041" }]}>Resolved</Text>
                    </TouchableOpacity>
                  </View>
                )}

              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },

  header: { backgroundColor: "#2c3e50", paddingHorizontal: 20, paddingTop: 55, paddingBottom: 16 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#fff", fontSize: 20, fontWeight: "600" },
  countBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  countText: { color: "#fff", fontSize: 12 },

  card: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    padding: 14, marginBottom: 10,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "500" },
  dateText: { fontSize: 12, color: "#aaa" },

  cTitle: { fontSize: 15, fontWeight: "600", color: "#1a1a1a", marginBottom: 6 },
  desc: { fontSize: 13, color: "#666", lineHeight: 18, marginBottom: 12 },

  studentRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  studentAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#E6F1FB", alignItems: "center", justifyContent: "center",
  },
  studentAvatarText: { fontSize: 13, fontWeight: "600", color: "#0C447C" },
  studentName: { fontSize: 13, fontWeight: "500", color: "#333" },
  studentEmail: { fontSize: 12, color: "#aaa" },

  actions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, padding: 9, borderRadius: 10, borderWidth: 0.5,
  },
  actionText: { fontSize: 13, fontWeight: "500" },

  emptyBox: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: "#bbb" },
});
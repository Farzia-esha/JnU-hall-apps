import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchComplaints = () => {
    fetch(`${BASE_URL}/api/complaints`)
      .then(res => res.json())
      .then(data => { setComplaints(data); setLoading(false); });
  };

  useEffect(() => { fetchComplaints(); }, []);

  const updateStatus = (id, status) => {
    Alert.alert("Update", `Update status to "${status}"?`, [
      { text: "Cancel" },
      {
        text: "Yes", onPress: async () => {
          await fetch(`${BASE_URL}/api/complaints/${id}`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          });
          fetchComplaints();
        }
      }
    ]);
  };

  const statusColor = (s) => s === "resolved" ? "#2ecc71" : s === "in_progress" ? "#f39c12" : "#e74c3c";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>📝 All Complaints</Text>
      </View>
      {loading ? <ActivityIndicator size="large" color="#e74c3c" style={{ marginTop: 40 }} /> :
        <FlatList data={complaints} keyExtractor={item => item._id} contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>No complaints available</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.cTitle}>{item.title}</Text>
                <Text style={[styles.status, { backgroundColor: statusColor(item.status) }]}>{item.status}</Text>
              </View>
              <Text style={styles.student}>👤 {item.studentName} ({item.studentEmail})</Text>
              <Text style={styles.desc}>{item.description}</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#f39c12" }]} onPress={() => updateStatus(item._id, "in_progress")}>
                  <Text style={styles.actionText}>In Progress</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#2ecc71" }]} onPress={() => updateStatus(item._id, "resolved")}>
                  <Text style={styles.actionText}>Resolved ✓</Text>
                </TouchableOpacity>
              </View>
            </View>
          )} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "red", padding: 20, paddingTop: 50 },
  backText: { color: "#fff", fontSize: 25, marginBottom: 8 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cTitle: { fontSize: 16, fontWeight: "bold", color: "#222", flex: 1 },
  status: { color: "#fff", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, fontSize: 12 },
  student: { fontSize: 13, color: "#888", marginBottom: 4 },
  desc: { fontSize: 14, color: "#555" },
  actions: { flexDirection: "row", gap: 8, marginTop: 10 },
  actionBtn: { flex: 1, padding: 8, borderRadius: 8, alignItems: "center" },
  actionText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
});
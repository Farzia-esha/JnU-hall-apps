import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";

export default function Payment() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`${BASE_URL}/api/payments/student/${user?.studentId || user?.email}`)
      .then(res => res.json())
      .then(data => { setPayments(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statusColor = (status) => status === "paid" ? "#2ecc71" : status === "partial" ? "#f39c12" : "#e74c3c";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>💳 Payment Status</Text>
      </View>
      {loading ? <ActivityIndicator size="large" color="#2ecc71" style={{ marginTop: 40 }} /> :
        <FlatList
          data={payments}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>কোনো payment record নেই</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.semester}>{item.semester}</Text>
                <Text style={[styles.status, { backgroundColor: statusColor(item.status) }]}>{item.status}</Text>
              </View>
              <Text style={styles.amount}>Amount: ৳{item.amount}</Text>
              {item.scholarshipAmount > 0 && <Text style={styles.scholarship}>Scholarship: ৳{item.scholarshipAmount}</Text>}
              {item.paidAt && <Text style={styles.date}>Paid: {new Date(item.paidAt).toLocaleDateString()}</Text>}
            </View>
          )}
        />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "#2ecc71", padding: 20, paddingTop: 50 },
  backText: { color: "#fff", fontSize: 16, marginBottom: 8 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  semester: { fontSize: 17, fontWeight: "bold", color: "#222" },
  status: { color: "#fff", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, fontSize: 13, fontWeight: "600" },
  amount: { fontSize: 15, color: "#555" },
  scholarship: { fontSize: 14, color: "#27ae60", marginTop: 4 },
  date: { fontSize: 12, color: "#999", marginTop: 4 },
  empty: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 16 },
});
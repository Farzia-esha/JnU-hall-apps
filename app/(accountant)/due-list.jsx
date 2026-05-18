import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";

export default function DueList() {
  const [dueList, setDueList] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDue = () => {
    fetch(`${BASE_URL}/api/payments/due`)
      .then(res => res.json())
      .then(data => { setDueList(Array.isArray(data) ? data : []); setLoading(false); });
  };

  useEffect(() => { fetchDue(); }, []);

  const markPaid = async (id) => {
    Alert.alert("Confirm", "Mark as paid?", [
      { text: "Cancel" },
      {
        text: "Yes", onPress: async () => {
          await fetch(`${BASE_URL}/api/payments/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "paid", paidAt: new Date() }),
          });
          fetchDue();
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>📋 Due List</Text>
        <Text style={styles.count}>Total Due: {dueList.length} students</Text>
      </View>
      {loading ? <ActivityIndicator size="large" color="#e74c3c" style={{ marginTop: 40 }} /> :
        <FlatList data={dueList} keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>✅ All students have made payments!</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <View>
                  <Text style={styles.sName}>{item.studentName}</Text>
                  <Text style={styles.sId}>{item.studentId}</Text>
                  <Text style={styles.semester}>{item.semester}</Text>
                  <Text style={styles.amount}>Due: ৳{item.amount}</Text>
                </View>
                <TouchableOpacity style={styles.paidBtn} onPress={() => markPaid(item._id)}>
                  <Text style={styles.paidText}>Mark{"\n"}Paid ✓</Text>
                </TouchableOpacity>
              </View>
            </View>
          )} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "#e74c3c", padding: 20, paddingTop: 50 },
  backText: { color: "#fff", fontSize: 16, marginBottom: 8 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  count: { color: "#ffd5d5", fontSize: 14, marginTop: 4 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sName: { fontSize: 16, fontWeight: "bold", color: "#222" },
  sId: { fontSize: 13, color: "#888", marginTop: 2 },
  semester: { fontSize: 13, color: "#555", marginTop: 2 },
  amount: { fontSize: 15, color: "#e74c3c", fontWeight: "600", marginTop: 4 },
  paidBtn: { backgroundColor: "#2ecc71", padding: 10, borderRadius: 10, alignItems: "center" },
  paidText: { color: "#fff", fontWeight: "bold", fontSize: 13, textAlign: "center" },
  empty: { textAlign: "center", color: "#27ae60", marginTop: 60, fontSize: 18 },
});
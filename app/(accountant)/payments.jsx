import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Modal, TextInput, Alert
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    studentId: "", studentName: "", amount: "", semester: "", status: "unpaid", scholarshipAmount: "0"
  });
  const router = useRouter();

  const fetchPayments = () => {
    fetch(`${BASE_URL}/api/payments`)
      .then(res => res.json())
      .then(data => { setPayments(Array.isArray(data) ? data : []); setLoading(false); });
  };

  useEffect(() => { fetchPayments(); }, []);

  const addPayment = async () => {
    if (!form.studentId || !form.amount || !form.semester) {
      Alert.alert("Error", "Student ID, Amount এবং Semester আবশ্যক"); return;
    }
    const res = await fetch(`${BASE_URL}/api/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount),
        scholarshipAmount: Number(form.scholarshipAmount),
        collectedBy: user?.email,
        paidAt: form.status === "paid" ? new Date() : null,
      }),
    });
    if (res.ok) {
      Alert.alert("Success", "Payment record হয়েছে");
      setModal(false);
      setForm({ studentId: "", studentName: "", amount: "", semester: "", status: "unpaid", scholarshipAmount: "0" });
      fetchPayments();
    }
  };

  const markPaid = async (id) => {
    await fetch(`${BASE_URL}/api/payments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid", paidAt: new Date() }),
    });
    fetchPayments();
  };

  const statusColor = (s) => s === "paid" ? "#2ecc71" : s === "partial" ? "#f39c12" : "#e74c3c";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>💰 All Payments</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
            <Text style={styles.addText}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? <ActivityIndicator size="large" color="#27ae60" style={{ marginTop: 40 }} /> :
        <FlatList data={payments} keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>কোনো payment নেই</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <View>
                  <Text style={styles.sName}>{item.studentName}</Text>
                  <Text style={styles.sId}>{item.studentId} • {item.semester}</Text>
                  <Text style={styles.amount}>৳{item.amount}</Text>
                  {item.scholarshipAmount > 0 &&
                    <Text style={styles.scholarship}>Scholarship: ৳{item.scholarshipAmount}</Text>}
                </View>
                <View style={styles.rightCol}>
                  <Text style={[styles.status, { backgroundColor: statusColor(item.status) }]}>
                    {item.status}
                  </Text>
                  {item.status !== "paid" && (
                    <TouchableOpacity style={styles.paidBtn} onPress={() => markPaid(item._id)}>
                      <Text style={styles.paidText}>Mark Paid</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )} />}

      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>নতুন Payment</Text>
            {[
              { key: "studentId", label: "Student ID *" },
              { key: "studentName", label: "Student Name" },
              { key: "amount", label: "Amount (৳) *", keyboard: "numeric" },
              { key: "semester", label: "Semester * (e.g. 2025-Jan)" },
              { key: "scholarshipAmount", label: "Scholarship Amount (৳)", keyboard: "numeric" },
            ].map(f => (
              <TextInput key={f.key} placeholder={f.label} style={styles.input}
                value={form[f.key]} onChangeText={val => setForm({ ...form, [f.key]: val })}
                keyboardType={f.keyboard || "default"} />
            ))}
            <View style={styles.statusRow}>
              {["unpaid", "paid", "partial"].map(s => (
                <TouchableOpacity key={s}
                  style={[styles.statusBtn, form.status === s && { backgroundColor: statusColor(s) }]}
                  onPress={() => setForm({ ...form, status: s })}>
                  <Text style={[styles.statusBtnText, form.status === s && { color: "#fff" }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.submitBtn} onPress={addPayment}>
              <Text style={styles.submitText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "#27ae60", padding: 20, paddingTop: 50 },
  backText: { color: "#fff", fontSize: 16, marginBottom: 8 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  addBtn: { backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  addText: { color: "#27ae60", fontWeight: "bold" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  sName: { fontSize: 16, fontWeight: "bold", color: "#222" },
  sId: { fontSize: 13, color: "#888", marginTop: 2 },
  amount: { fontSize: 15, color: "#27ae60", fontWeight: "600", marginTop: 4 },
  scholarship: { fontSize: 13, color: "#f39c12", marginTop: 2 },
  rightCol: { alignItems: "flex-end", gap: 8 },
  status: { color: "#fff", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, fontSize: 12, fontWeight: "600" },
  paidBtn: { backgroundColor: "#27ae60", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  paidText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
  overlay: { flex: 1, backgroundColor: "#00000066", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 15 },
  statusRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statusBtn: { flex: 1, padding: 8, borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: "#ddd" },
  statusBtnText: { fontSize: 13, color: "#555" },
  submitBtn: { backgroundColor: "#27ae60", padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 10 },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancel: { textAlign: "center", color: "#999", fontSize: 15 },
});
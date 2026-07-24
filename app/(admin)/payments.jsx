import { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, TextInput, Modal, Alert
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const statusConfig = {
  paid:   { label: "Paid",   bg: "#E1F5EE", text: "#085041", icon: "checkmark-circle-outline" },
  unpaid: { label: "Unpaid", bg: "#FCEBEB", text: "#A32D2D", icon: "alert-circle-outline" },
};

export default function AdminPayments() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | unpaid | paid

  // Add manual payment modal
  const [addModal, setAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    studentName: "", email: "", semester: "", amount: "", scholarshipAmount: "0", status: "unpaid",
  });

  // Edit/scholarship modal
  const [editModal, setEditModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editScholarship, setEditScholarship] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchPayments = () => {
    setLoading(true);
    const url = filter === "unpaid"
      ? `${BASE_URL}/api/payments/due`
      : `${BASE_URL}/api/payments`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        let list = Array.isArray(data) ? data : [];
        if (filter === "paid") list = list.filter(p => p.status === "paid");
        setPayments(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => { fetchPayments(); }, [filter]));

  const totals = payments.reduce(
    (acc, p) => {
      const net = (Number(p.amount) || 0) - (Number(p.scholarshipAmount) || 0);
      if (p.status === "paid") acc.collected += net;
      else acc.due += net;
      return acc;
    },
    { collected: 0, due: 0 }
  );

  const addPayment = async () => {
    if (!form.studentName || !form.email || !form.semester || !form.amount) {
      Alert.alert("Error", "Student name, email, semester and amount are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: form.studentName,
          email: form.email,
          semester: form.semester,
          amount: Number(form.amount),
          scholarshipAmount: Number(form.scholarshipAmount) || 0,
          status: form.status,
          source: "manual",
        }),
      });
      if (res.ok) {
        setAddModal(false);
        setForm({ studentName: "", email: "", semester: "", amount: "", scholarshipAmount: "0", status: "unpaid" });
        fetchPayments();
      } else {
        Alert.alert("Error", "Could not add payment record");
      }
    } catch {
      Alert.alert("Error", "Network error");
    } finally { setSaving(false); }
  };

  const openEdit = (payment) => {
    setSelected(payment);
    setEditAmount(String(payment.amount ?? "0"));
    setEditScholarship(String(payment.scholarshipAmount ?? "0"));
    setEditModal(true);
  };

  const markAsPaid = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`${BASE_URL}/api/payments/${selected._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(editAmount),
          scholarshipAmount: Number(editScholarship) || 0,
          status: "paid",
          paidAt: new Date(),
        }),
      });
      if (res.ok) {
        setEditModal(false);
        fetchPayments();
      } else {
        Alert.alert("Error", "Could not update payment");
      }
    } catch {
      Alert.alert("Error", "Network error");
    } finally { setUpdating(false); }
  };

  const saveScholarshipOnly = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`${BASE_URL}/api/payments/${selected._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(editAmount),
          scholarshipAmount: Number(editScholarship) || 0,
        }),
      });
      if (res.ok) {
        setEditModal(false);
        fetchPayments();
      } else {
        Alert.alert("Error", "Could not update payment");
      }
    } catch {
      Alert.alert("Error", "Network error");
    } finally { setUpdating(false); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const formatMoney = (n) => `৳${Number(n || 0).toLocaleString()}`;

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Payments</Text>
          <TouchableOpacity style={styles.newBtn} onPress={() => setAddModal(true)}>
            <Ionicons name="add" size={18} color="#0C447C" />
            <Text style={styles.newBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Collected</Text>
          <Text style={[styles.summaryValue, { color: "#085041" }]}>{formatMoney(totals.collected)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Due</Text>
          <Text style={[styles.summaryValue, { color: "#A32D2D" }]}>{formatMoney(totals.due)}</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {["all", "unpaid", "paid"].map(f => (
          <TouchableOpacity key={f} style={[styles.filterTab, filter === f && styles.filterTabActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>{f[0].toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="wallet-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No payment records</Text>
            </View>
          }
          renderItem={({ item }) => {
            const sc = statusConfig[item.status] || statusConfig.unpaid;
            const net = (Number(item.amount) || 0) - (Number(item.scholarshipAmount) || 0);
            return (
              <TouchableOpacity style={styles.card} onPress={() => openEdit(item)} activeOpacity={0.7}>
                <View style={styles.cardTop}>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Ionicons name={sc.icon} size={12} color={sc.text} />
                    <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
                  </View>
                  <Text style={styles.dateText}>{formatDate(item.paidAt || item.createdAt)}</Text>
                </View>

                <Text style={styles.name}>{item.studentName || "Unknown"}</Text>
                <Text style={styles.meta}>{item.email}</Text>
                <Text style={styles.meta}>{item.semester}</Text>

                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Amount: {formatMoney(item.amount)}</Text>
                  {Number(item.scholarshipAmount) > 0 && (
                    <Text style={styles.scholarshipLabel}>Scholarship: -{formatMoney(item.scholarshipAmount)}</Text>
                  )}
                  <Text style={styles.netLabel}>Net: {formatMoney(net)}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Add manual payment modal */}
      <Modal visible={addModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment Record</Text>
              <TouchableOpacity onPress={() => setAddModal(false)}>
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            {[
              { key: "studentName", label: "Student Name" },
              { key: "email", label: "Email" },
              { key: "semester", label: "Semester / Purpose" },
            ].map(f => (
              <View key={f.key} style={{ marginBottom: 12 }}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  value={form[f.key]}
                  onChangeText={val => setForm(prev => ({ ...prev, [f.key]: val }))}
                  placeholder={f.label}
                  placeholderTextColor="#ccc"
                />
              </View>
            ))}

            <Text style={styles.fieldLabel}>Amount (৳)</Text>
            <TextInput
              style={styles.input}
              value={form.amount}
              onChangeText={val => setForm(prev => ({ ...prev, amount: val }))}
              placeholder="0"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
            />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Scholarship Amount (৳)</Text>
            <TextInput
              style={styles.input}
              value={form.scholarshipAmount}
              onChangeText={val => setForm(prev => ({ ...prev, scholarshipAmount: val }))}
              placeholder="0"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
            />

            <View style={[styles.switchRow, { marginTop: 12 }]}>
              <Text style={styles.fieldLabel}>Mark as already paid</Text>
              <TouchableOpacity
                style={[styles.toggleBtn, form.status === "paid" && styles.toggleBtnActive]}
                onPress={() => setForm(prev => ({ ...prev, status: prev.status === "paid" ? "unpaid" : "paid" }))}
              >
                <Text style={[styles.toggleBtnText, form.status === "paid" && styles.toggleBtnTextActive]}>
                  {form.status === "paid" ? "Paid" : "Unpaid"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={addPayment} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Add Record</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit payment modal */}
      <Modal visible={editModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Payment Detail</Text>
                <Text style={styles.modalSub}>{selected?.studentName} · {selected?.semester}</Text>
              </View>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Amount (৳)</Text>
            <TextInput
              style={styles.input}
              value={editAmount}
              onChangeText={setEditAmount}
              keyboardType="numeric"
            />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Scholarship Amount (৳)</Text>
            <TextInput
              style={styles.input}
              value={editScholarship}
              onChangeText={setEditScholarship}
              keyboardType="numeric"
            />

            {updating ? (
              <ActivityIndicator color="#185FA5" style={{ marginTop: 16 }} />
            ) : (
              <>
                <TouchableOpacity style={styles.saveBtn} onPress={saveScholarshipOnly}>
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </TouchableOpacity>
                {selected?.status !== "paid" && (
                  <TouchableOpacity style={styles.markPaidBtn} onPress={markAsPaid}>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#085041" />
                    <Text style={styles.markPaidText}>Mark as Paid</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

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
  newBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  newBtnText: { color: "#0C447C", fontWeight: "600", fontSize: 13 },

  summaryRow: { flexDirection: "row", gap: 10, padding: 14, paddingBottom: 0 },
  summaryCard: { flex: 1, backgroundColor: "#fff", borderRadius: 12, borderWidth: 0.5, borderColor: "#e0e0e0", padding: 12 },
  summaryLabel: { fontSize: 12, color: "#888" },
  summaryValue: { fontSize: 18, fontWeight: "700", marginTop: 4 },

  filterRow: { flexDirection: "row", gap: 8, padding: 12, marginTop: 4 },
  filterTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: "#e0e0e0", backgroundColor: "#fff" },
  filterTabActive: { backgroundColor: "#E6F1FB", borderColor: "#85B7EB" },
  filterTabText: { fontSize: 13, color: "#888" },
  filterTabTextActive: { color: "#0C447C", fontWeight: "600" },

  card: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 0.5, borderColor: "#e0e0e0", padding: 14, marginBottom: 10 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "500" },
  dateText: { fontSize: 12, color: "#aaa" },
  name: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
  meta: { fontSize: 12, color: "#888", marginTop: 2 },

  amountRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  amountLabel: { fontSize: 12, color: "#333" },
  scholarshipLabel: { fontSize: 12, color: "#854F0B" },
  netLabel: { fontSize: 12, color: "#185FA5", fontWeight: "600" },

  emptyBox: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: "#bbb" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#1a1a1a" },
  modalSub: { fontSize: 13, color: "#888", marginTop: 2 },
  fieldLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  input: { backgroundColor: "#f9f9f9", borderRadius: 10, borderWidth: 0.5, borderColor: "#e0e0e0", padding: 12, fontSize: 14, color: "#333" },

  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: "#FCEBEB", borderWidth: 0.5, borderColor: "#F09595" },
  toggleBtnActive: { backgroundColor: "#E1F5EE", borderColor: "#5DCAA5" },
  toggleBtnText: { fontSize: 12, color: "#A32D2D", fontWeight: "600" },
  toggleBtnTextActive: { color: "#085041" },

  saveBtn: { backgroundColor: "#185FA5", padding: 15, borderRadius: 12, alignItems: "center", marginTop: 16 },
  saveBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  markPaidBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: "#E1F5EE", borderWidth: 0.5, borderColor: "#5DCAA5",
    padding: 14, borderRadius: 12, marginTop: 10,
  },
  markPaidText: { color: "#085041", fontWeight: "600", fontSize: 14 },
});
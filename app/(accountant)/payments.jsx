import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Alert, TextInput, Modal, ScrollView,
  KeyboardAvoidingView, Platform
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Add modal
  const [addModal, setAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    studentId: "", studentName: "", email: "",
    amount: "", semester: "", status: "unpaid", scholarshipAmount: "0"
  });

  // Edit modal
  const [editModal, setEditModal] = useState(false);
  const [editPayment, setEditPayment] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [updating, setUpdating] = useState(false);

  const router = useRouter();

  const fetchPayments = () => {
    fetch(`${BASE_URL}/api/payments`)
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setPayments(arr);
        setFiltered(arr);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(payments); return; }
    const q = search.toLowerCase();
    setFiltered(payments.filter(p =>
      p.studentName?.toLowerCase().includes(q) ||
      p.studentId?.toLowerCase().includes(q) ||
      p.semester?.toLowerCase().includes(q)
    ));
  }, [search, payments]);

  const openEdit = (payment) => {
    setEditPayment(payment);
    setEditForm({
      studentId:        payment.studentId || "",
      studentName:      payment.studentName || "",
      email:            payment.email || "",
      amount:           String(payment.amount || ""),
      semester:         payment.semester || "",
      status:           payment.status || "unpaid",
      scholarshipAmount: String(payment.scholarshipAmount || "0"),
    });
    setEditModal(true);
  };

  const saveEdit = async () => {
    if (!editForm.studentId || !editForm.amount || !editForm.semester) {
      Alert.alert("Error", "Student ID, Amount & Semester are required");
      return;
    }
    setUpdating(true);
    try {
      const res = await fetch(`${BASE_URL}/api/payments/${editPayment._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          amount: Number(editForm.amount),
          scholarshipAmount: Number(editForm.scholarshipAmount) || 0,
          paidAt: editForm.status === "paid"
            ? (editPayment.paidAt || new Date())
            : null,
        }),
      });
      if (res.ok) {
        Alert.alert("Success", "Payment updated");
        setEditModal(false);
        fetchPayments();
      } else {
        Alert.alert("Error", "Update failed");
      }
    } catch { Alert.alert("Error", "Network error"); }
    finally { setUpdating(false); }
  };

  const addPayment = async () => {
    if (!form.studentId || !form.amount || !form.semester) {
      Alert.alert("Error", "Student ID, Amount & Semester are required"); return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          scholarshipAmount: Number(form.scholarshipAmount) || 0,
          collectedBy: user?.email,
          paidAt: form.status === "paid" ? new Date() : null,
        }),
      });
      if (res.ok) {
        Alert.alert("Success", "Payment record added");
        setAddModal(false);
        setForm({ studentId: "", studentName: "", email: "", amount: "", semester: "", status: "unpaid", scholarshipAmount: "0" });
        fetchPayments();
      }
    } catch { Alert.alert("Error", "Failed to add payment"); }
    finally { setSaving(false); }
  };

  const markPaid = (id) => {
    Alert.alert("Confirm", "Mark this payment as paid?", [
      { text: "Cancel" },
      {
        text: "Mark Paid", onPress: async () => {
          await fetch(`${BASE_URL}/api/payments/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "paid", paidAt: new Date() }),
          });
          fetchPayments();
        }
      }
    ]);
  };

  const statusConfig = {
    paid:    { label: "Paid",    bg: "#E1F5EE", text: "#085041", icon: "checkmark-circle-outline" },
    unpaid:  { label: "Unpaid",  bg: "#FCEBEB", text: "#A32D2D", icon: "close-circle-outline" },
    partial: { label: "Partial", bg: "#FAEEDA", text: "#633806", icon: "time-outline" },
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const statusOptions = ["unpaid", "paid", "partial"];

  // Reusable form fields renderer
  const renderFormFields = (formData, setFormData) => (
    <>
      {[
        { key: "studentId",        label: "Student ID *",               keyboard: "default" },
        { key: "studentName",      label: "Student Name",               keyboard: "default" },
        { key: "email",            label: "Student Email",              keyboard: "email-address" },
        { key: "amount",           label: "Amount (৳) *",               keyboard: "numeric" },
        { key: "semester",         label: "Semester * (e.g. 2025-Jan)", keyboard: "default" },
        { key: "scholarshipAmount",label: "Scholarship Amount (৳)",     keyboard: "numeric" },
      ].map(f => (
        <View key={f.key} style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>{f.label}</Text>
          <TextInput
            style={styles.fieldInput}
            value={formData[f.key]}
            onChangeText={val => setFormData(prev => ({ ...prev, [f.key]: val }))}
            placeholder={f.label.replace(" *", "")}
            placeholderTextColor="#ccc"
            keyboardType={f.keyboard}
            autoCapitalize={f.keyboard === "email-address" ? "none" : "sentences"}
          />
        </View>
      ))}

      <Text style={styles.fieldLabel}>Payment Status</Text>
      <View style={styles.statusRow}>
        {statusOptions.map(s => {
          const sc = statusConfig[s];
          const selected = formData.status === s;
          return (
            <TouchableOpacity
              key={s}
              style={[styles.statusOption, selected && { backgroundColor: sc.bg, borderColor: sc.text }]}
              onPress={() => setFormData(prev => ({ ...prev, status: s }))}
            >
              <Ionicons name={sc.icon} size={14} color={selected ? sc.text : "#aaa"} />
              <Text style={[styles.statusOptionText, selected && { color: sc.text }]}>{sc.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>All Payments</Text>
          <TouchableOpacity style={styles.newBtn} onPress={() => setAddModal(true)}>
            <Ionicons name="add" size={18} color="#0C447C" />
            <Text style={styles.newBtnText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#aaa" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, ID or semester..."
          placeholderTextColor="#bbb"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#bbb" />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="wallet-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>{search ? "No results found" : "No payment records yet"}</Text>
            </View>
          }
          renderItem={({ item }) => {
            const sc = statusConfig[item.status] || statusConfig.unpaid;
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sName}>{item.studentName || "Unknown"}</Text>
                    <Text style={styles.sId}>{item.studentId} · {item.semester}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                      <Ionicons name={sc.icon} size={12} color={sc.text} />
                      <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
                    </View>
                    {/* Edit Button */}
                    <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                      <Ionicons name="pencil-outline" size={15} color="#0C447C" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Amount</Text>
                  <Text style={styles.amountValue}>৳{item.amount}</Text>
                </View>

                {item.scholarshipAmount > 0 && (
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Scholarship</Text>
                    <Text style={[styles.amountValue, { color: "#0C447C" }]}>৳{item.scholarshipAmount}</Text>
                  </View>
                )}

                {item.paidAt && (
                  <View style={styles.cardFooter}>
                    <Ionicons name="calendar-outline" size={12} color="#aaa" />
                    <Text style={styles.footerText}>Paid on {formatDate(item.paidAt)}</Text>
                  </View>
                )}

                {item.status !== "paid" && (
                  <TouchableOpacity style={styles.markPaidBtn} onPress={() => markPaid(item._id)}>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#085041" />
                    <Text style={styles.markPaidText}>Mark as Paid</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}

      {/* ===== ADD MODAL ===== */}
      <Modal visible={addModal} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.overlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Payment</Text>
                <TouchableOpacity onPress={() => setAddModal(false)}>
                  <Ionicons name="close" size={22} color="#555" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {renderFormFields(form, setForm)}
                <TouchableOpacity
                  style={[styles.submitBtn, saving && { opacity: 0.7 }]}
                  onPress={addPayment}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.submitText}>Save Payment</Text>
                  }
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModal(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ===== EDIT MODAL ===== */}
      <Modal visible={editModal} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.overlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Payment</Text>
                <TouchableOpacity onPress={() => setEditModal(false)}>
                  <Ionicons name="close" size={22} color="#555" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {renderFormFields(editForm, setEditForm)}
                <TouchableOpacity
                  style={[styles.submitBtn, updating && { opacity: 0.7 }]}
                  onPress={saveEdit}
                  disabled={updating}
                >
                  {updating
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.submitText}>Save Changes</Text>
                  }
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  newBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  newBtnText: { color: "#0C447C", fontWeight: "600", fontSize: 13 },

  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#fff", margin: 14, marginBottom: 2,
    borderRadius: 10, borderWidth: 0.5, borderColor: "#e0e0e0",
    paddingHorizontal: 12, height: 42,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },

  card: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    padding: 14, marginBottom: 10,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  sName: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
  sId: { fontSize: 12, color: "#888", marginTop: 2 },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "500" },
  editBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: "#E6F1FB", borderWidth: 0.5, borderColor: "#85B7EB",
    alignItems: "center", justifyContent: "center",
  },
  amountRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: "#f5f5f5",
  },
  amountLabel: { fontSize: 13, color: "#888" },
  amountValue: { fontSize: 13, fontWeight: "600", color: "#1a1a1a" },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10 },
  footerText: { fontSize: 12, color: "#aaa" },
  markPaidBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: "#E1F5EE", borderWidth: 0.5, borderColor: "#5DCAA5",
    borderRadius: 10, padding: 10, marginTop: 10,
  },
  markPaidText: { fontSize: 13, color: "#085041", fontWeight: "500" },

  emptyBox: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: "#bbb" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: "90%",
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#1a1a1a" },

  fieldWrap: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  fieldInput: {
    backgroundColor: "#f9f9f9", borderRadius: 10,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    padding: 12, fontSize: 14, color: "#333",
  },

  statusRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statusOption: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 4, padding: 10, borderRadius: 10,
    borderWidth: 0.5, borderColor: "#e0e0e0", backgroundColor: "#f9f9f9",
  },
  statusOptionText: { fontSize: 12, color: "#aaa", fontWeight: "500" },

  submitBtn: { backgroundColor: "#185FA5", padding: 15, borderRadius: 12, alignItems: "center", marginTop: 4 },
  submitText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  cancelBtn: { alignItems: "center", paddingVertical: 14 },
  cancelText: { color: "#888", fontSize: 14 },
});
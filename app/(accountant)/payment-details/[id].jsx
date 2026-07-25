import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { BASE_URL } from "../../../constants/api";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const statusConfig = {
  paid:   { label: "Paid",   bg: "#E1F5EE", text: "#085041" },
  unpaid: { label: "Unpaid", bg: "#FCEBEB", text: "#A32D2D" },
};

export default function PaymentDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editScholarship, setEditScholarship] = useState("");

  useEffect(() => { if (id) load(); }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/payments/${id}`);
      const data = await res.json();
      if (!res.ok) { setPayment(null); setLoading(false); return; }
      setPayment(data);
      setEditAmount(String(data.amount ?? "0"));
      setEditScholarship(String(data.scholarshipAmount ?? "0"));
    } catch {
      setPayment(null);
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`${BASE_URL}/api/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(editAmount),
          scholarshipAmount: Number(editScholarship) || 0,
        }),
      });
      if (res.ok) { Alert.alert("Saved", "Payment updated"); load(); }
      else Alert.alert("Error", "Could not update payment");
    } catch {
      Alert.alert("Error", "Network error");
    } finally { setUpdating(false); }
  };

  const markAsPaid = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`${BASE_URL}/api/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(editAmount),
          scholarshipAmount: Number(editScholarship) || 0,
          status: "paid",
          paidAt: new Date(),
        }),
      });
      if (res.ok) { Alert.alert("Success", "Marked as paid"); load(); }
      else Alert.alert("Error", "Could not update payment");
    } catch {
      Alert.alert("Error", "Network error");
    } finally { setUpdating(false); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const formatMoney = (n) => `৳${Number(n || 0).toLocaleString()}`;

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 60 }} /></View>;
  }

  if (!payment) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyBox}>
          <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Payment not found</Text>
        </View>
      </View>
    );
  }

  const sc = statusConfig[payment.status] || statusConfig.unpaid;
  const net = (Number(payment.amount) || 0) - (Number(payment.scholarshipAmount) || 0);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Payment Details</Text>
          <View style={[styles.badge, { backgroundColor: sc.bg, marginTop: 8 }]}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: sc.text }}>{sc.label}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>STUDENT</Text>
          <Text style={styles.bigText}>{payment.studentName || "Unknown"}</Text>
          <Text style={styles.metaLine}>{payment.email}</Text>
          {payment.studentId ? <Text style={styles.metaLine}>Student ID: {payment.studentId}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PAYMENT INFO</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Payment ID</Text><Text style={styles.infoValue}>{payment._id}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Semester / Purpose</Text><Text style={styles.infoValue}>{payment.semester}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Method</Text><Text style={styles.infoValue}>{payment.stripeSessionId ? "Stripe" : (payment.method || "Manual")}</Text></View>
          {payment.stripeSessionId ? (
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Transaction ID</Text><Text style={styles.infoValue} numberOfLines={1}>{payment.stripeSessionId}</Text></View>
          ) : null}
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Created</Text><Text style={styles.infoValue}>{formatDate(payment.createdAt)}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Paid Date</Text><Text style={styles.infoValue}>{payment.status === "paid" ? formatDate(payment.paidAt) : "—"}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AMOUNT</Text>
          <Text style={styles.fieldLabel}>Amount (৳)</Text>
          <TextInput style={styles.input} value={editAmount} onChangeText={setEditAmount} keyboardType="numeric" />

          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Scholarship Amount (৳)</Text>
          <TextInput style={styles.input} value={editScholarship} onChangeText={setEditScholarship} keyboardType="numeric" />

          <View style={styles.netRow}>
            <Text style={styles.netLabel}>Net Payable</Text>
            <Text style={styles.netValue}>{formatMoney(net)}</Text>
          </View>

          {updating ? (
            <ActivityIndicator color="#185FA5" style={{ marginTop: 16 }} />
          ) : (
            <>
              <TouchableOpacity style={styles.saveBtn} onPress={saveChanges}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
              {payment.status !== "paid" && (
                <TouchableOpacity style={styles.markPaidBtn} onPress={markAsPaid}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#085041" />
                  <Text style={styles.markPaidText}>Mark as Paid</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  header: { backgroundColor: "#2c3e50", paddingHorizontal: 20, paddingTop: 55, paddingBottom: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  title: { color: "#fff", fontSize: 20, fontWeight: "600" },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },

  section: { backgroundColor: "#fff", margin: 14, marginBottom: 0, borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: "#e0e0e0" },
  sectionLabel: { fontSize: 11, fontWeight: "600", color: "#999", letterSpacing: 1, marginBottom: 10 },
  bigText: { fontSize: 17, fontWeight: "700", color: "#1a1a1a" },
  metaLine: { fontSize: 13, color: "#888", marginTop: 3 },

  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: "#f0f0f0" },
  infoLabel: { fontSize: 13, color: "#888" },
  infoValue: { fontSize: 13, color: "#1a1a1a", fontWeight: "500", maxWidth: "60%", textAlign: "right" },

  fieldLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  input: { backgroundColor: "#f9f9f9", borderRadius: 10, borderWidth: 0.5, borderColor: "#e0e0e0", padding: 12, fontSize: 14, color: "#333" },

  netRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: "#f0f0f0" },
  netLabel: { fontSize: 14, color: "#333", fontWeight: "600" },
  netValue: { fontSize: 18, fontWeight: "700", color: "#185FA5" },

  saveBtn: { backgroundColor: "#185FA5", padding: 15, borderRadius: 12, alignItems: "center", marginTop: 16 },
  saveBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  markPaidBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: "#E1F5EE", borderWidth: 0.5, borderColor: "#5DCAA5",
    padding: 14, borderRadius: 12, marginTop: 10,
  },
  markPaidText: { color: "#085041", fontWeight: "600", fontSize: 14 },

  emptyBox: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: "#bbb" },
});
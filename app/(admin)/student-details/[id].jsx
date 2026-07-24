import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { BASE_URL } from "../../../constants/api";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const statusConfig = {
  paid:   { label: "Paid",   bg: "#E1F5EE", text: "#085041" },
  unpaid: { label: "Unpaid", bg: "#FCEBEB", text: "#A32D2D" },
};

export default function StudentDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) load(); }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/students/${id}`);
      const data = await res.json();
      if (!res.ok) { setStudent(null); setLoading(false); return; }
      setStudent(data);

      const paymentsRes = await fetch(`${BASE_URL}/api/payments/student/${data.email}`);
      const paymentsData = await paymentsRes.json();
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch {
      // keep whatever loaded
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const formatMoney = (n) => `৳${Number(n || 0).toLocaleString()}`;

  const totalPaid = payments.filter(p => p.status === "paid")
    .reduce((sum, p) => sum + ((Number(p.amount) || 0) - (Number(p.scholarshipAmount) || 0)), 0);
  const totalDue = payments.filter(p => p.status !== "paid")
    .reduce((sum, p) => sum + ((Number(p.amount) || 0) - (Number(p.scholarshipAmount) || 0)), 0);

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 60 }} /></View>;
  }

  if (!student) {
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
          <Text style={styles.emptyText}>Student not found</Text>
        </View>
      </View>
    );
  }

  const infoRows = [
    { label: "Student ID", value: student.studentId, icon: "card-outline" },
    { label: "Department", value: student.department, icon: "school-outline" },
    { label: "Session", value: student.session, icon: "calendar-outline" },
    { label: "Phone", value: student.phone, icon: "call-outline" },
    { label: "Hall Name", value: student.hallName, icon: "business-outline" },
    { label: "Room Number", value: student.roomNumber, icon: "grid-outline" },
    { label: "Seat Number", value: student.seatNumber, icon: "checkmark-circle-outline" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(student.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{student.name}</Text>
            <Text style={styles.email}>{student.email}</Text>
          </View>
        </View>
      </View>

      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>STUDENT INFO</Text>
        {infoRows.map(row => (
          <View key={row.label} style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name={row.icon} size={16} color="#185FA5" />
            </View>
            <Text style={styles.infoLabel}>{row.label}</Text>
            <Text style={styles.infoValue}>{row.value || "—"}</Text>
          </View>
        ))}
      </View>

      {/* Payment History */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>PAYMENT HISTORY</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Paid</Text>
            <Text style={[styles.summaryValue, { color: "#085041" }]}>{formatMoney(totalPaid)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Due</Text>
            <Text style={[styles.summaryValue, { color: "#A32D2D" }]}>{formatMoney(totalDue)}</Text>
          </View>
        </View>

        {payments.length === 0 ? (
          <Text style={styles.emptyLine}>No payment records</Text>
        ) : (
          payments.map(p => (
            <View key={p._id} style={styles.paymentRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentSemester}>{p.semester}</Text>
                <Text style={styles.metaLine}>{formatDate(p.paidAt || p.createdAt)}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: (statusConfig[p.status] || statusConfig.unpaid).bg }]}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: (statusConfig[p.status] || statusConfig.unpaid).text }}>
                  {formatMoney((Number(p.amount) || 0) - (Number(p.scholarshipAmount) || 0))}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "#2c3e50", paddingHorizontal: 20, paddingTop: 55, paddingBottom: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 16 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 13 },

  profileRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  avatarText: { fontSize: 20, fontWeight: "700", color: "#fff" },
  name: { fontSize: 19, fontWeight: "700", color: "#fff" },
  email: { fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 },

  section: { backgroundColor: "#fff", margin: 14, marginBottom: 0, borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: "#e0e0e0" },
  sectionLabel: { fontSize: 11, fontWeight: "600", color: "#999", letterSpacing: 1, marginBottom: 12 },

  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: "#f0f0f0" },
  infoIconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#E6F1FB", alignItems: "center", justifyContent: "center" },
  infoLabel: { flex: 1, fontSize: 13, color: "#888" },
  infoValue: { fontSize: 13, color: "#1a1a1a", fontWeight: "500", maxWidth: "45%", textAlign: "right" },

  metaLine: { fontSize: 12, color: "#888", marginTop: 4 },
  emptyLine: { fontSize: 13, color: "#bbb", fontStyle: "italic" },

  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  summaryBox: { flex: 1, backgroundColor: "#f9f9f9", borderRadius: 10, padding: 10, borderWidth: 0.5, borderColor: "#eee" },
  summaryLabel: { fontSize: 11, color: "#888" },
  summaryValue: { fontSize: 16, fontWeight: "700", marginTop: 2 },

  paymentRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: "#f0f0f0" },
  paymentSemester: { fontSize: 13, fontWeight: "600", color: "#1a1a1a" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },

  emptyBox: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: "#bbb" },
});
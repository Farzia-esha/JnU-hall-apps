import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function Reports() {
  const router = useRouter();
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [semester, setSemester] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ month: String(month), year: String(year) });
      if (semester.trim()) params.append("semester", semester.trim());
      const res = await fetch(`${BASE_URL}/api/payments/report?${params.toString()}`);
      const data = await res.json();
      setReport(data);
    } catch {
      setReport(null);
    } finally { setLoading(false); }
  };

  const formatMoney = (n) => `৳${Number(n || 0).toLocaleString()}`;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—";

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>Monthly & semester collection summary</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>FILTER</Text>

        <Text style={styles.fieldLabel}>Month</Text>
        <View style={styles.monthRow}>
          {monthNames.map((m, i) => (
            <TouchableOpacity
              key={m}
              style={[styles.monthChip, month === i + 1 && styles.monthChipActive]}
              onPress={() => setMonth(i + 1)}
            >
              <Text style={[styles.monthChipText, month === i + 1 && styles.monthChipTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Year</Text>
        <TextInput style={styles.input} value={String(year)} onChangeText={(v) => setYear(Number(v) || year)} keyboardType="numeric" />

        <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Semester (optional)</Text>
        <TextInput style={styles.input} value={semester} onChangeText={setSemester} placeholder="e.g. Spring 2026" placeholderTextColor="#ccc" />

        <TouchableOpacity style={styles.generateBtn} onPress={fetchReport} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateBtnText}>Generate Report</Text>}
        </TouchableOpacity>
      </View>

      {report && (
        <>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Collected</Text>
              <Text style={[styles.summaryValue, { color: "#085041" }]}>{formatMoney(report.totalCollected)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Due</Text>
              <Text style={[styles.summaryValue, { color: "#A32D2D" }]}>{formatMoney(report.totalDue)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Paid Records</Text>
              <Text style={styles.summaryValue}>{report.paidCount}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Unpaid Records</Text>
              <Text style={styles.summaryValue}>{report.unpaidCount}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>RECORDS ({report.totalRecords})</Text>
            {report.records.length === 0 ? (
              <Text style={styles.emptyLine}>No records found for this filter</Text>
            ) : (
              report.records.map(r => (
                <View key={r._id} style={styles.recordRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recordName}>{r.studentName || "Unknown"}</Text>
                    <Text style={styles.recordMeta}>{r.semester} · {formatDate(r.paidAt || r.createdAt)}</Text>
                  </View>
                  <Text style={{ color: r.status === "paid" ? "#085041" : "#A32D2D", fontWeight: "600", fontSize: 13 }}>
                    {formatMoney((Number(r.amount) || 0) - (Number(r.scholarshipAmount) || 0))}
                  </Text>
                </View>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "#2c3e50", paddingHorizontal: 20, paddingTop: 55, paddingBottom: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  title: { color: "#fff", fontSize: 20, fontWeight: "600" },
  subtitle: { color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 4 },

  section: { backgroundColor: "#fff", margin: 14, marginBottom: 0, borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: "#e0e0e0" },
  sectionLabel: { fontSize: 11, fontWeight: "600", color: "#999", letterSpacing: 1, marginBottom: 12 },
  fieldLabel: { fontSize: 12, color: "#888", marginBottom: 6 },
  input: { backgroundColor: "#f9f9f9", borderRadius: 10, borderWidth: 0.5, borderColor: "#e0e0e0", padding: 12, fontSize: 14, color: "#333" },

  monthRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  monthChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 0.5, borderColor: "#e0e0e0", backgroundColor: "#f9f9f9" },
  monthChipActive: { backgroundColor: "#E6F1FB", borderColor: "#85B7EB" },
  monthChipText: { fontSize: 12, color: "#888" },
  monthChipTextActive: { color: "#0C447C", fontWeight: "600" },

  generateBtn: { backgroundColor: "#185FA5", padding: 15, borderRadius: 12, alignItems: "center", marginTop: 18 },
  generateBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  summaryGrid: { flexDirection: "column", flexWrap: "wrap", gap: 10, marginHorizontal: 14, marginTop: 14 },
  summaryCard: { width: "100%", backgroundColor: "#fff", borderRadius: 12, borderWidth: 0.5, borderColor: "#e0e0e0", padding: 12 },
  summaryLabel: { fontSize: 11, color: "#888" },
  summaryValue: { fontSize: 16, fontWeight: "700", color: "#1a1a1a", marginTop: 4 },

  recordRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: "#f0f0f0" },
  recordName: { fontSize: 13, fontWeight: "600", color: "#1a1a1a" },
  recordMeta: { fontSize: 11, color: "#888", marginTop: 2 },
  emptyLine: { fontSize: 13, color: "#bbb", fontStyle: "italic" },
});
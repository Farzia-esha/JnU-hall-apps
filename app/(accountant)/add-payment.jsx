import { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, Alert, Modal, FlatList, KeyboardAvoidingView, Platform
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AddPayment() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [studentModal, setStudentModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSearch, setStudentSearch] = useState("");

  const [semester, setSemester] = useState("");
  const [amount, setAmount] = useState("");
  const [scholarshipAmount, setScholarshipAmount] = useState("0");
  const [status, setStatus] = useState("unpaid");

  const openStudentPicker = async () => {
    setStudentModal(true);
    setLoadingStudents(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/students`);
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const q = studentSearch.toLowerCase();
    return !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.studentId?.toLowerCase().includes(q);
  });

  const pickStudent = (s) => {
    setSelectedStudent(s);
    setStudentModal(false);
    setStudentSearch("");
  };

  const submit = async () => {
    if (!selectedStudent || !semester || !amount) {
      Alert.alert("Error", "Student, semester and amount are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: selectedStudent.name,
          email: selectedStudent.email,
          studentId: selectedStudent.studentId,
          semester,
          amount: Number(amount),
          scholarshipAmount: Number(scholarshipAmount) || 0,
          status,
          source: "manual",
          ...(status === "paid" ? { paidAt: new Date() } : {}),
        }),
      });
      if (res.ok) {
        Alert.alert("Success", "Payment record created");
        router.back();
      } else {
        Alert.alert("Error", "Could not create payment record");
      }
    } catch {
      Alert.alert("Error", "Network error");
    } finally { setSaving(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Payment</Text>
        <Text style={styles.subtitle}>Create a new payment record for a student</Text>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.fieldLabel}>Student</Text>
        <TouchableOpacity style={styles.studentPicker} onPress={openStudentPicker}>
          {selectedStudent ? (
            <View style={{ flex: 1 }}>
              <Text style={styles.studentPickerName}>{selectedStudent.name}</Text>
              <Text style={styles.studentPickerMeta}>{selectedStudent.email}</Text>
            </View>
          ) : (
            <Text style={styles.studentPickerPlaceholder}>Select a student</Text>
          )}
          <Ionicons name="chevron-down" size={18} color="#aaa" />
        </TouchableOpacity>

        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Semester / Purpose</Text>
        <TextInput
          style={styles.input}
          value={semester}
          onChangeText={setSemester}
          placeholder="e.g. Spring 2026"
          placeholderTextColor="#ccc"
        />

        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Amount (৳)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          placeholderTextColor="#ccc"
          keyboardType="numeric"
        />

        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Scholarship Amount (৳)</Text>
        <TextInput
          style={styles.input}
          value={scholarshipAmount}
          onChangeText={setScholarshipAmount}
          placeholder="0"
          placeholderTextColor="#ccc"
          keyboardType="numeric"
        />

        <View style={[styles.switchRow, { marginTop: 16 }]}>
          <Text style={styles.fieldLabel}>Status</Text>
          <TouchableOpacity
            style={[styles.toggleBtn, status === "paid" && styles.toggleBtnActive]}
            onPress={() => setStatus(prev => (prev === "paid" ? "unpaid" : "paid"))}
          >
            <Text style={[styles.toggleBtnText, status === "paid" && styles.toggleBtnTextActive]}>
              {status === "paid" ? "Paid" : "Unpaid"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={submit} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Create Payment</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* Student picker modal */}
      <Modal visible={studentModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Student</Text>
              <TouchableOpacity onPress={() => setStudentModal(false)}>
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color="#aaa" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search name, email or ID..."
                placeholderTextColor="#bbb"
                value={studentSearch}
                onChangeText={setStudentSearch}
              />
            </View>

            {loadingStudents ? (
              <ActivityIndicator color="#185FA5" style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={filteredStudents}
                keyExtractor={item => item._id}
                style={{ maxHeight: 380 }}
                ListEmptyComponent={<Text style={styles.emptyLine}>No students found</Text>}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.studentOption} onPress={() => pickStudent(item)}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.studentPickerName}>{item.name}</Text>
                      <Text style={styles.studentPickerMeta}>{item.email} · {item.studentId}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#aaa" />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "#2c3e50", paddingHorizontal: 20, paddingTop: 55, paddingBottom: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  title: { color: "#fff", fontSize: 22, fontWeight: "600" },
  subtitle: { color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 },

  form: { flex: 1 },
  formContent: { padding: 16, paddingBottom: 40 },
  fieldLabel: { fontSize: 13, color: "#555", marginBottom: 6, fontWeight: "500" },
  input: { backgroundColor: "#fff", borderRadius: 10, borderWidth: 0.5, borderColor: "#e0e0e0", padding: 13, fontSize: 14, color: "#333" },

  studentPicker: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", borderRadius: 10, borderWidth: 0.5, borderColor: "#e0e0e0", padding: 13,
  },
  studentPickerPlaceholder: { fontSize: 14, color: "#bbb" },
  studentPickerName: { fontSize: 14, fontWeight: "600", color: "#1a1a1a" },
  studentPickerMeta: { fontSize: 12, color: "#888", marginTop: 2 },

  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: "#FCEBEB", borderWidth: 0.5, borderColor: "#F09595" },
  toggleBtnActive: { backgroundColor: "#E1F5EE", borderColor: "#5DCAA5" },
  toggleBtnText: { fontSize: 13, color: "#A32D2D", fontWeight: "600" },
  toggleBtnTextActive: { color: "#085041" },

  saveBtn: { backgroundColor: "#185FA5", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 24, marginBottom: 40 },
  saveBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#1a1a1a" },

  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#f9f9f9", borderRadius: 10, borderWidth: 0.5, borderColor: "#e0e0e0",
    paddingHorizontal: 12, height: 42, marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },

  studentOption: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 12, borderRadius: 10, marginBottom: 6,
    borderWidth: 0.5, borderColor: "#e0e0e0", backgroundColor: "#f9f9f9",
  },
  emptyLine: { textAlign: "center", color: "#bbb", marginTop: 20 },
});
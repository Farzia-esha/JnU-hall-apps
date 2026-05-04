import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";

export default function AddStudent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", studentId: "", department: "",
    session: "", phone: "", hallName: "", roomNumber: "", seatNumber: ""
  });

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.studentId) {
      Alert.alert("Error", "নাম, email এবং Student ID আবশ্যক"); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { Alert.alert("Success", "Student add হয়েছে"); router.back(); }
    } catch { Alert.alert("Error", "Add হয়নি"); }
    finally { setLoading(false); }
  };

  const fields = [
    { key: "name", label: "নাম *" },
    { key: "email", label: "Email *" },
    { key: "studentId", label: "Student ID *" },
    { key: "department", label: "Department" },
    { key: "session", label: "Session" },
    { key: "phone", label: "Phone" },
    { key: "hallName", label: "Hall Name" },
    { key: "roomNumber", label: "Room Number" },
    { key: "seatNumber", label: "Seat Number" },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>➕ Add Student</Text>
      </View>
      <View style={styles.form}>
        {fields.map(f => (
          <View key={f.key}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput style={styles.input} value={form[f.key]}
              onChangeText={val => setForm({ ...form, [f.key]: val })} />
          </View>
        ))}
        <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Student</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "#2c3e50", padding: 20, paddingTop: 50 },
  backText: { color: "#fff", fontSize: 16, marginBottom: 8 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  form: { padding: 16 },
  label: { fontSize: 14, color: "#555", marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: "#fff", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#ddd", fontSize: 15 },
  btn: { backgroundColor: "#2ecc71", padding: 16, borderRadius: 10, alignItems: "center", marginTop: 24, marginBottom: 40 },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
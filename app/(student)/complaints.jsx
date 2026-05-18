import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, TextInput, Alert, Modal
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";

export default function Complaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const fetchComplaints = () => {
    fetch(`${BASE_URL}/api/complaints/student/${user?.email}`)
      .then(res => res.json())
      .then(data => { setComplaints(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchComplaints(); }, []);

  const submitComplaint = async () => {
    if (!title || !description) { Alert.alert("Error", "Please fill in all fields"); return; }
    try {
      const res = await fetch(`${BASE_URL}/api/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, studentEmail: user?.email, studentName: user?.name }),
      });
      if (res.ok) {
        Alert.alert("Success", "Complaint submitted successfully");
        setModal(false); setTitle(""); setDescription("");
        fetchComplaints();
      }
    } catch { Alert.alert("Error", "Failed to submit complaint"); }
  };

  const statusColor = (s) => s === "resolved" ? "#2ecc71" : s === "in_progress" ? "#f39c12" : "#e74c3c";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>📝 Complaints</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
            <Text style={styles.addText}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? <ActivityIndicator size="large" color="#e74c3c" style={{ marginTop: 40 }} /> :
        <FlatList
          data={complaints}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>No complaints found</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.cTitle}>{item.title}</Text>
                <Text style={[styles.status, { backgroundColor: statusColor(item.status) }]}>{item.status}</Text>
              </View>
              <Text style={styles.desc}>{item.description}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          )}
        />}

      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Complaint</Text>
            <TextInput placeholder="Subject" style={styles.input} value={title} onChangeText={setTitle} />
            <TextInput placeholder="Provide details..." style={[styles.input, { height: 100 }]}
              value={description} onChangeText={setDescription} multiline />
            <TouchableOpacity style={styles.submitBtn} onPress={submitComplaint}>
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "#e74c3c", padding: 20, paddingTop: 50 },
  backText: { color: "#fff", fontSize: 20, marginBottom: 8 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  addBtn: { backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  addText: { color: "#e74c3c", fontWeight: "bold" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cTitle: { fontSize: 16, fontWeight: "bold", color: "#222", flex: 1 },
  status: { color: "#fff", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, fontSize: 12 },
  desc: { fontSize: 14, color: "#555" },
  date: { fontSize: 12, color: "#999", marginTop: 6 },
  empty: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "#00000066", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16, color: "#222" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 15 },
  submitBtn: { backgroundColor: "#e74c3c", padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 10 },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelText: { textAlign: "center", color: "#999", fontSize: 15 },
});
import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, TextInput, Alert, Modal,
  KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function StudentComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
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
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          studentEmail: user?.email,
          studentName: user?.fullName,
        }),
      });
      if (res.ok) {
        Alert.alert("Success", "Complaint submitted successfully");
        setModal(false); setTitle(""); setDescription("");
        fetchComplaints();
      }
    } catch { Alert.alert("Error", "Failed to submit"); }
    finally { setSubmitting(false); }
  };

  const statusConfig = {
    pending:     { label: "Pending",     bg: "#FCEBEB", text: "#A32D2D", icon: "time-outline" },
    in_progress: { label: "In Progress", bg: "#FAEEDA", text: "#633806", icon: "reload-outline" },
    resolved:    { label: "Resolved",    bg: "#E1F5EE", text: "#085041", icon: "checkmark-circle-outline" },
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>My Complaints</Text>
          <TouchableOpacity style={styles.newBtn} onPress={() => setModal(true)}>
            <Ionicons name="add" size={18} color="#0C447C" />
            <Text style={styles.newBtnText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="chatbox-ellipses-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No complaints yet</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => setModal(true)}>
                <Text style={styles.emptyBtnText}>Submit your first complaint</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const sc = statusConfig[item.status] || statusConfig.pending;
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Ionicons name={sc.icon} size={12} color={sc.text} />
                    <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
                  </View>
                  <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                </View>
                <Text style={styles.cTitle}>{item.title}</Text>
                <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
              </View>
            );
          }}
        />
      )}

      {/* New Complaint Modal */}
      <Modal visible={modal} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.overlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Complaint</Text>
                <TouchableOpacity onPress={() => setModal(false)}>
                  <Ionicons name="close" size={22} color="#555" />
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>Subject</Text>
              <TextInput
                placeholder="Enter complaint subject"
                placeholderTextColor="#ccc"
                style={styles.input}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.fieldLabel}>Details</Text>
              <TextInput
                placeholder="Describe your complaint..."
                placeholderTextColor="#ccc"
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                onPress={submitComplaint}
                disabled={submitting}
              >
                {submitting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.submitText}>Submit Complaint</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "purple", paddingHorizontal: 20, paddingTop: 55, paddingBottom: 16 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "white", fontSize: 15 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#fff", fontSize: 20, fontWeight: "600" },
  newBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  newBtnText: { color: "#0C447C", fontWeight: "600", fontSize: 13 },

  card: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    padding: 14, marginBottom: 10,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "500" },
  dateText: { fontSize: 12, color: "#aaa" },
  cTitle: { fontSize: 15, fontWeight: "600", color: "#1a1a1a", marginBottom: 6 },
  desc: { fontSize: 13, color: "#666", lineHeight: 18 },

  emptyBox: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: "#bbb" },
  emptyBtn: {
    backgroundColor: "#E6F1FB", paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 10, marginTop: 4,
  },
  emptyBtnText: { color: "#185FA5", fontSize: 13, fontWeight: "500" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#1a1a1a" },
  fieldLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  input: {
    backgroundColor: "#f9f9f9", borderRadius: 10,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    padding: 12, fontSize: 14, color: "#333", marginBottom: 12,
  },
  textArea: { height: 110 },
  submitBtn: { backgroundColor: "#185FA5", padding: 15, borderRadius: 12, alignItems: "center", marginTop: 4 },
  submitText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  cancelBtn: { alignItems: "center", paddingVertical: 14 },
  cancelText: { color: "#888", fontSize: 14 },
});
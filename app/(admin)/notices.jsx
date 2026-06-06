import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, Modal, ActivityIndicator
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function AdminNotices() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [publishing, setPublishing] = useState(false);
  const router = useRouter();

  const fetchNotices = () => {
    fetch(`${BASE_URL}/api/notices`)
      .then(res => res.json())
      .then(data => { setNotices(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchNotices(); }, []);

  const publishNotice = async () => {
    if (!title || !content) { Alert.alert("Error", "All fields are required"); return; }
    setPublishing(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/notices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, postedBy: user?.email }),
      });
      if (res.ok) {
        Alert.alert("Success", "Notice published");
        setModal(false); setTitle(""); setContent("");
        fetchNotices();
      }
    } finally { setPublishing(false); }
  };

  const deleteNotice = (id) => {
    Alert.alert("Confirm", "Delete this notice?", [
      { text: "Cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          await fetch(`${BASE_URL}/api/admin/notices/${id}`, { method: "DELETE" });
          fetchNotices();
        }
      }
    ]);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Notices</Text>
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
          data={notices}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="megaphone-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No notices yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.iconWrap}>
                  <Ionicons name="megaphone-outline" size={20} color="#185FA5" />
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteNotice(item._id)}>
                  <Ionicons name="trash-outline" size={16} color="#A32D2D" />
                </TouchableOpacity>
              </View>
              <Text style={styles.nTitle}>{item.title}</Text>
              <Text style={styles.nContent}>{item.content}</Text>
              <View style={styles.cardFooter}>
                <Ionicons name="person-outline" size={12} color="#aaa" />
                <Text style={styles.footerText}>{item.postedBy || "Admin"}</Text>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.footerText}>{formatDate(item.createdAt)}</Text>
              </View>
            </View>
          )}
        />
      )}

      {/* New Notice Modal */}
      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Notice</Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              placeholder="Enter notice title"
              placeholderTextColor="#ccc"
              style={styles.input}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.fieldLabel}>Content</Text>
            <TextInput
              placeholder="Write notice content..."
              placeholderTextColor="#ccc"
              style={[styles.input, styles.textArea]}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.publishBtn, publishing && { opacity: 0.7 }]}
              onPress={publishNotice}
              disabled={publishing}
            >
              {publishing
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.publishText}>Publish Notice</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}>
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

  card: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    padding: 14, marginBottom: 10,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  iconWrap: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: "#E6F1FB", alignItems: "center", justifyContent: "center",
  },
  deleteBtn: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: "#FCEBEB", borderWidth: 0.5, borderColor: "#F09595",
    alignItems: "center", justifyContent: "center",
  },
  nTitle: { fontSize: 15, fontWeight: "600", color: "#1a1a1a", marginBottom: 6 },
  nContent: { fontSize: 14, color: "#555", lineHeight: 20 },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 12 },
  footerText: { fontSize: 12, color: "#aaa" },
  dot: { fontSize: 12, color: "#aaa" },

  emptyBox: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: "#bbb" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#1a1a1a" },
  fieldLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  input: {
    backgroundColor: "#f9f9f9", borderRadius: 10,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    padding: 12, fontSize: 14, color: "#333", marginBottom: 12,
  },
  textArea: { height: 110 },
  publishBtn: {
    backgroundColor: "#185FA5", padding: 15,
    borderRadius: 12, alignItems: "center", marginTop: 4,
  },
  publishText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  cancelBtn: { alignItems: "center", paddingVertical: 14 },
  cancelText: { color: "#888", fontSize: 14 },
});
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function AdminNotices() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  const fetchNotices = () => {
    fetch(`${BASE_URL}/api/notices`)
      .then(res => res.json())
      .then(data => { setNotices(data); setLoading(false); });
  };

  useEffect(() => { fetchNotices(); }, []);

  const publishNotice = async () => {
    if (!title || !content) { Alert.alert("Error", "All fields are required"); return; }
    const res = await fetch(`${BASE_URL}/api/admin/notices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, postedBy: user?.email }),
    });
    if (res.ok) { Alert.alert("Success", "Notice published successfully"); setModal(false); setTitle(""); setContent(""); fetchNotices(); }
  };

  const deleteNotice = (id) => {
    Alert.alert("Confirm", "Delete this notice?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await fetch(`${BASE_URL}/api/admin/notices/${id}`, { method: "DELETE" }); fetchNotices(); } }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>📢 Notices</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
            <Text style={styles.addText}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>
      {loading ? <ActivityIndicator size="large" color="#e67e22" style={{ marginTop: 40 }} /> :
        <FlatList data={notices} keyExtractor={item => item._id} contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>No notices available</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.nTitle}>{item.title}</Text>
                <TouchableOpacity onPress={() => deleteNotice(item._id)}><Text style={{ fontSize: 25,fontWeight:"bold" , color:"red"}}>X</Text></TouchableOpacity>
              </View>
              <Text style={styles.nContent}>{item.content}</Text>
            </View>
          )} />}
      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Notice</Text>
            <TextInput placeholder="Title" style={styles.input} value={title} onChangeText={setTitle} />
            <TextInput placeholder="Content" style={[styles.input, { height: 100 }]} value={content} onChangeText={setContent} multiline />
            <TouchableOpacity style={styles.submitBtn} onPress={publishNotice}><Text style={styles.submitText}>Publish</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setModal(false)}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "#2c3e50", padding: 20, paddingTop: 50 },
  backText: { color: "#fff", fontSize: 25, marginBottom: 8 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  addBtn: { backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  addText: { color: "#2c3e50", fontWeight: "bold" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  nTitle: { fontSize: 17, fontWeight: "bold", color: "#222", flex: 1 },
  nContent: { fontSize: 14, color: "#555", marginTop: 6 },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
  overlay: { flex: 1, backgroundColor: "#00000066", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 15 },
  submitBtn: { backgroundColor: "#e67e22", padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 10 },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancel: { textAlign: "center", color: "#999", fontSize: 16 },
});
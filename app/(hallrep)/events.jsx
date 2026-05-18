import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Modal, TextInput, Alert
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", activityUpdate: "" });
  const router = useRouter();

  const fetchEvents = () => {
    fetch(`${BASE_URL}/api/events`)
      .then(res => res.json())
      .then(data => { setEvents(Array.isArray(data) ? data : []); setLoading(false); });
  };

  useEffect(() => { fetchEvents(); }, []);

  const addEvent = async () => {
    if (!form.title || !form.date) { Alert.alert("Error", "Title and Date are required"); return; }
    const res = await fetch(`${BASE_URL}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, organizer: user?.email, organizerName: user?.name }),
    });
    if (res.ok) {
      Alert.alert("Success", "Event created successfully");
      setModal(false);
      setForm({ title: "", description: "", date: "", activityUpdate: "" });
      fetchEvents();
    }
  };

  const deleteEvent = (id) => {
    Alert.alert("Confirm", "Delete the event?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        await fetch(`${BASE_URL}/api/events/${id}`, { method: "DELETE" });
        fetchEvents();
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>📅 Events</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
            <Text style={styles.addText}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? <ActivityIndicator size="large" color="#16a085" style={{ marginTop: 40 }} /> :
        <FlatList data={events} keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>No events found</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.eTitle}>{item.title}</Text>
                <TouchableOpacity onPress={() => deleteEvent(item._id)}>
                  <Text style={{ fontSize: 18 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
              {item.description && <Text style={styles.desc}>{item.description}</Text>}
              <Text style={styles.date}>📅 {new Date(item.date).toLocaleDateString()}</Text>
              {item.activityUpdate && (
                <View style={styles.updateBox}>
                  <Text style={styles.updateText}>📌 {item.activityUpdate}</Text>
                </View>
              )}
              <Text style={styles.organizer}>Organizer: {item.organizerName || user?.name}</Text>
            </View>
          )} />}

      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Event</Text>
            {[
              { key: "title", label: "Event Title *" },
              { key: "date", label: "Date * (YYYY-MM-DD)" },
              { key: "description", label: "Description" },
              { key: "activityUpdate", label: "Activity Update" },
            ].map(f => (
              <TextInput key={f.key} placeholder={f.label} style={styles.input}
                value={form[f.key]} onChangeText={v => setForm({ ...form, [f.key]: v })} />
            ))}
            <TouchableOpacity style={styles.submitBtn} onPress={addEvent}>
              <Text style={styles.submitText}>Create Event</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "#16a085", padding: 20, paddingTop: 50 },
  backText: { color: "#fff", fontSize: 16, marginBottom: 8 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  addBtn: { backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  addText: { color: "#16a085", fontWeight: "bold" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  eTitle: { fontSize: 17, fontWeight: "bold", color: "#222", flex: 1 },
  desc: { fontSize: 14, color: "#555", marginBottom: 6 },
  date: { fontSize: 13, color: "#16a085", fontWeight: "600" },
  updateBox: { backgroundColor: "#e8f8f5", borderRadius: 8, padding: 8, marginTop: 8 },
  updateText: { fontSize: 13, color: "#16a085" },
  organizer: { fontSize: 12, color: "#999", marginTop: 6 },
  empty: { textAlign: "center", color: "#999", marginTop: 60, fontSize: 16 },
  overlay: { flex: 1, backgroundColor: "#00000066", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 15 },
  submitBtn: { backgroundColor: "#16a085", padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 10 },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancel: { textAlign: "center", color: "#999", fontSize: 15 },
});
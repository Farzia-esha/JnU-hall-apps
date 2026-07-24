import { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, ActivityIndicator, Alert
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AdminEvents() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "" });

  const fetchEvents = () => {
    setLoading(true);
    fetch(`${BASE_URL}/api/events`)
      .then(res => res.json())
      .then(data => { setEvents(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => { fetchEvents(); }, []));

  const openCreateModal = () => {
    setEditingEvent(null);
    setForm({ title: "", description: "", date: new Date().toISOString().split("T")[0] });
    setModal(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setForm({
      title: event.title || "",
      description: event.description || "",
      date: event.date || "",
    });
    setModal(true);
  };

  const saveEvent = async () => {
    if (!form.title || !form.date) {
      Alert.alert("Error", "Title and date are required");
      return;
    }
    setSaving(true);
    try {
      const isEditing = !!editingEvent;
      const url = isEditing ? `${BASE_URL}/api/events/${editingEvent._id}` : `${BASE_URL}/api/events`;
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setModal(false);
        fetchEvents();
      } else {
        Alert.alert("Error", "Could not save event");
      }
    } catch {
      Alert.alert("Error", "Network error");
    } finally { setSaving(false); }
  };

  const deleteEvent = (id) => {
    Alert.alert("Delete event", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          await fetch(`${BASE_URL}/api/events/${id}`, { method: "DELETE" });
          fetchEvents();
        }
      }
    ]);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Events</Text>
          <TouchableOpacity style={styles.newBtn} onPress={openCreateModal}>
            <Ionicons name="add" size={18} color="#0C447C" />
            <Text style={styles.newBtnText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="calendar-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No events yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.iconWrap}>
                  <Ionicons name="calendar-outline" size={18} color="#185FA5" />
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
                    <Ionicons name="pencil-outline" size={16} color="#0C447C" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteEvent(item._id)}>
                    <Ionicons name="trash-outline" size={16} color="#A32D2D" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.eTitle}>{item.title}</Text>
              {item.description ? <Text style={styles.eDesc}>{item.description}</Text> : null}
              <Text style={styles.eDate}>{formatDate(item.date)}</Text>
              {item.activityUpdate ? (
                <View style={styles.activityBox}>
                  <Ionicons name="megaphone-outline" size={12} color="#633806" />
                  <Text style={styles.activityText}>{item.activityUpdate}</Text>
                </View>
              ) : null}
            </View>
          )}
        />
      )}

      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingEvent ? "Edit Event" : "New Event"}</Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={val => setForm(prev => ({ ...prev, title: val }))}
              placeholder="Event title"
              placeholderTextColor="#ccc"
            />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={form.date}
              onChangeText={val => setForm(prev => ({ ...prev, date: val }))}
              placeholder="2026-07-24"
              placeholderTextColor="#ccc"
            />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.description}
              onChangeText={val => setForm(prev => ({ ...prev, description: val }))}
              placeholder="Event description..."
              placeholderTextColor="#ccc"
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={saveEvent} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
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
  newBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  newBtnText: { color: "#0C447C", fontWeight: "600", fontSize: 13 },

  card: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 0.5, borderColor: "#e0e0e0", padding: 14, marginBottom: 10 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  iconWrap: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#E6F1FB", alignItems: "center", justifyContent: "center" },
  cardActions: { flexDirection: "row", gap: 8 },
  editBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: "#E6F1FB", borderWidth: 0.5, borderColor: "#85B7EB", alignItems: "center", justifyContent: "center" },
  deleteBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: "#FCEBEB", borderWidth: 0.5, borderColor: "#F09595", alignItems: "center", justifyContent: "center" },
  eTitle: { fontSize: 15, fontWeight: "600", color: "#1a1a1a", marginBottom: 4 },
  eDesc: { fontSize: 13, color: "#666", lineHeight: 18, marginBottom: 6 },
  eDate: { fontSize: 12, color: "#888" },

  activityBox: { flexDirection: "row", alignItems: "flex-start", gap: 6, backgroundColor: "#FAEEDA", borderRadius: 8, padding: 8, marginTop: 10 },
  activityText: { flex: 1, fontSize: 12, color: "#633806" },

  emptyBox: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: "#bbb" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#1a1a1a" },
  fieldLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  input: { backgroundColor: "#f9f9f9", borderRadius: 10, borderWidth: 0.5, borderColor: "#e0e0e0", padding: 12, fontSize: 14, color: "#333" },
  textArea: { height: 90 },
  saveBtn: { backgroundColor: "#185FA5", padding: 15, borderRadius: 12, alignItems: "center", marginTop: 16 },
  saveBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
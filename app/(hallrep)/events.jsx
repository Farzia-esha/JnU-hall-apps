import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Modal, TextInput, Alert
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

const emptyForm = { title: "", description: "", date: "", activityUpdate: "" };

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = creating new, otherwise editing this event's id
  const [form, setForm] = useState(emptyForm);
  const router = useRouter();

  const getEventId = (item, index) => {
    if (typeof item?._id?.toString === "function") return item._id.toString();
    if (typeof item?.id?.toString === "function") return item.id.toString();
    return String(index);
  };

  const parseDateOnly = (value) => {
    if (!value) return null;

    if (typeof value === "string") {
      const trimmed = value.trim();
      const datePart = trimmed.split("T")[0];
      const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(datePart);
      if (match) {
        const [, year, month, day] = match;
        return new Date(Number(year), Number(month) - 1, Number(day));
      }

      const parsed = new Date(trimmed);
      if (!Number.isNaN(parsed.getTime())) {
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
      }
      return null;
    }

    if (value instanceof Date) {
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }

    return null;
  };

  const formatDisplayDate = (value) => {
    const date = parseDateOnly(value);
    if (!date) return value || "No date";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateForInput = (value) => {
    if (!value) return "";

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

      const date = parseDateOnly(trimmed);
      if (date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }

      return trimmed;
    }

    const date = parseDateOnly(value);
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    return "";
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/events`);
      const data = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error(data?.message || "Could not load events");
      }

      const normalizedEvents = Array.isArray(data) ? data : [];
      setEvents(normalizedEvents);
    } catch (err) {
      setEvents([]);
      setError(err?.message || "Something went wrong while loading events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (event) => {
    const eventId = getEventId(event, 0);
    setEditingId(eventId);
    setForm({
      title: event.title || "",
      description: event.description || "",
      date: formatDateForInput(event.date),
      activityUpdate: event.activityUpdate || "",
    });
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const saveEvent = async () => {
    if (!form.title || !form.date) { Alert.alert("Error", "Title and Date are required"); return; }
    setSaving(true);
    try {
      const isEditing = !!editingId;
      const url = isEditing ? `${BASE_URL}/api/events/${editingId}` : `${BASE_URL}/api/events`;
      const method = isEditing ? "PUT" : "POST";
      const body = isEditing
        ? { ...form }
        : { ...form, organizer: user?.email, organizerName: user?.name };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        Alert.alert("Success", isEditing ? "Event updated successfully" : "Event created successfully");
        closeModal();
        fetchEvents();
      } else {
        Alert.alert("Error", data?.message || "Could not save event");
      }
    } catch (err) {
      Alert.alert("Error", err?.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = (id) => {
    Alert.alert("Confirm", "Delete the event?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/events/${id}`, { method: "DELETE" });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            Alert.alert("Error", data?.message || "Could not delete event");
            return;
          }
          fetchEvents();
        } catch (err) {
          Alert.alert("Error", err?.message || "Network error");
        }
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Events</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Text style={styles.addText}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? <ActivityIndicator size="large" color="#16a085" style={{ marginTop: 40 }} /> : (
        <>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <FlatList data={events} keyExtractor={(item, index) => getEventId(item, index)}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={<Text style={styles.empty}>No events found</Text>}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.eTitle}>{item.title}</Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => openEdit(item)} style={{ marginRight: 12 }}>
                      <Text style={{ fontSize: 18 }}>edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteEvent(getEventId(item, 0))}>
                      <Text style={{ fontSize: 18 }}>delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
                <Text style={styles.date}>{formatDisplayDate(item.date)}</Text>
                {item.activityUpdate ? (
                  <View style={styles.updateBox}>
                    <Text style={styles.updateText}>📌 {item.activityUpdate}</Text>
                  </View>
                ) : null}
                <Text style={styles.organizer}>Organizer: {item.organizerName || user?.name || "Unknown"}</Text>
              </View>
            )} />
        </>
      )}

      <Modal visible={modal} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? "Edit Event" : "New Event"}</Text>
            {[
              { key: "title", label: "Event Title *" },
              { key: "date", label: "Date * (YYYY-MM-DD)" },
              { key: "description", label: "Description" },
              { key: "activityUpdate", label: "Activity Update" },
            ].map(f => (
              <TextInput
              key={f.key}
              placeholder={f.label}
              style={styles.input}
              value={form[f.key]}
              onChangeText={v => setForm({ ...form, [f.key]: v })}
              keyboardType={f.key === "date" ? "numbers-and-punctuation" : "default"}
              autoCapitalize="none"
            />
            ))}
            <TouchableOpacity style={[styles.submitBtn, saving && { opacity: 0.7 }]} onPress={saveEvent} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>{editingId ? "Save Changes" : "Create Event"}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={closeModal}>
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
  header: { backgroundColor: "#2c3e50", padding: 20, paddingTop: 50 },
  backText: { color: "#fff", fontSize: 16, marginBottom: 8 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  addBtn: { backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  addText: { color: "#16a085", fontWeight: "bold" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cardActions: { flexDirection: "row", alignItems: "center" },
  eTitle: { fontSize: 17, fontWeight: "bold", color: "#222", flex: 1 },
  desc: { fontSize: 14, color: "#555", marginBottom: 6 },
  date: { fontSize: 13, color: "#16a085", fontWeight: "600" },
  updateBox: { backgroundColor: "#e8f8f5", borderRadius: 8, padding: 8, marginTop: 8 },
  updateText: { fontSize: 13, color: "#16a085" },
  organizer: { fontSize: 12, color: "#999", marginTop: 6 },
  empty: { textAlign: "center", color: "#999", marginTop: 60, fontSize: 16 },
  error: { color: "#c0392b", textAlign: "center", marginTop: 12, marginHorizontal: 16, fontSize: 14 },
  overlay: { flex: 1, backgroundColor: "#00000066", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 15 },
  submitBtn: { backgroundColor: "#16a085", padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 10 },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancel: { textAlign: "center", color: "#999", fontSize: 15 },
});
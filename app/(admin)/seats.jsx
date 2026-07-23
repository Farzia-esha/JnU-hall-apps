import { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, ActivityIndicator, Alert
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SeatInventory() {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | vacant | occupied
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ hallName: "", roomNumber: "", seatNumber: "" });
  const router = useRouter();

  const fetchSeats = () => {
    setLoading(true);
    const q = filter === "all" ? "" : `?status=${filter}`;
    fetch(`${BASE_URL}/api/admin/seats${q}`)
      .then(res => res.json())
      .then(data => { setSeats(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => { fetchSeats(); }, [filter]));

  const addSeat = async () => {
    if (!form.hallName || !form.roomNumber || !form.seatNumber) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/seats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", data.message || "Could not add seat");
        return;
      }
      setModal(false);
      setForm({ hallName: form.hallName, roomNumber: form.roomNumber, seatNumber: "" });
      fetchSeats();
    } catch {
      Alert.alert("Error", "Network error");
    } finally {
      setSaving(false);
    }
  };

  const removeSeat = (id) => {
    Alert.alert("Remove seat", "Delete this seat from inventory?", [
      { text: "Cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          const res = await fetch(`${BASE_URL}/api/admin/seats/${id}`, { method: "DELETE" });
          const data = await res.json();
          if (!res.ok) Alert.alert("Error", data.message || "Could not remove seat");
          fetchSeats();
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Seat Inventory</Text>
          <TouchableOpacity style={styles.newBtn} onPress={() => setModal(true)}>
            <Ionicons name="add" size={18} color="#0C447C" />
            <Text style={styles.newBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterRow}>
        {["all", "vacant", "occupied"].map(f => (
          <TouchableOpacity key={f} style={[styles.filterTab, filter === f && styles.filterTabActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>{f[0].toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={seats}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="bed-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No seats added yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.seatTitle}>{item.hallName}</Text>
                <Text style={styles.seatSub}>Room {item.roomNumber} · Seat {item.seatNumber}</Text>
                {item.status === "occupied" && item.occupiedBy && (
                  <Text style={styles.occupiedBy}>Occupied by {item.occupiedBy}</Text>
                )}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.status === "vacant" ? "#E1F5EE" : "#FCEBEB" }]}>
                <Text style={{ fontSize: 12, color: item.status === "vacant" ? "#085041" : "#A32D2D", fontWeight: "500" }}>
                  {item.status === "vacant" ? "Vacant" : "Occupied"}
                </Text>
              </View>
              {item.status === "vacant" && (
                <TouchableOpacity style={styles.deleteBtn} onPress={() => removeSeat(item._id)}>
                  <Ionicons name="trash-outline" size={16} color="#A32D2D" />
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}

      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Seat</Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            {[
              { key: "hallName", label: "Hall Name" },
              { key: "roomNumber", label: "Room Number" },
              { key: "seatNumber", label: "Seat Number" },
            ].map(f => (
              <View key={f.key} style={{ marginBottom: 12 }}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  value={form[f.key]}
                  onChangeText={val => setForm(prev => ({ ...prev, [f.key]: val }))}
                  placeholder={f.label}
                  placeholderTextColor="#ccc"
                />
              </View>
            ))}

            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={addSeat} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Add Seat</Text>}
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

  filterRow: { flexDirection: "row", gap: 8, padding: 12, backgroundColor: "#fff", borderBottomWidth: 0.5, borderBottomColor: "#e0e0e0" },
  filterTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: "#e0e0e0", backgroundColor: "#f9f9f9" },
  filterTabActive: { backgroundColor: "#E6F1FB", borderColor: "#85B7EB" },
  filterTabText: { fontSize: 13, color: "#888" },
  filterTabTextActive: { color: "#0C447C", fontWeight: "600" },

  card: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fff", borderRadius: 14, borderWidth: 0.5, borderColor: "#e0e0e0", padding: 14, marginBottom: 10 },
  seatTitle: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
  seatSub: { fontSize: 12, color: "#888", marginTop: 2 },
  occupiedBy: { fontSize: 11, color: "#A32D2D", marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  deleteBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#FCEBEB", borderWidth: 0.5, borderColor: "#F09595", alignItems: "center", justifyContent: "center" },

  emptyBox: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: "#bbb" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#1a1a1a" },
  fieldLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  input: { backgroundColor: "#f9f9f9", borderRadius: 10, borderWidth: 0.5, borderColor: "#e0e0e0", padding: 12, fontSize: 14, color: "#333" },
  saveBtn: { backgroundColor: "#185FA5", padding: 15, borderRadius: 12, alignItems: "center", marginTop: 4 },
  saveBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
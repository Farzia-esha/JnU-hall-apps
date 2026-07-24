import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Alert, TextInput, Modal, ScrollView
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  const fetchStudents = () => {
    fetch(`${BASE_URL}/api/admin/students`)
      .then(res => res.json())
      .then(data => {
        setStudents(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(students);
    } else {
      const q = search.toLowerCase();
      setFiltered(students.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.studentId?.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q)
      ));
    }
  }, [search, students]);

  const openEdit = (student) => {
    setEditStudent(student);
    setEditForm({
      name: student.name || "",
      email: student.email || "",
      studentId: student.studentId || "",
      department: student.department || "",
      session: student.session || "",
      phone: student.phone || "",
      hallName: student.hallName || "",
      roomNumber: student.roomNumber || "",
      seatNumber: student.seatNumber || "",
    });
    setEditModal(true);
  };

  const saveEdit = async () => {
    if (!editForm.name || !editForm.email || !editForm.studentId) {
      Alert.alert("Error", "Name, email and Student ID are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/students/${editStudent._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        Alert.alert("Success", "Student updated successfully");
        setEditModal(false);
        fetchStudents();
      } else {
        Alert.alert("Error", "Update failed");
      }
    } catch {
      Alert.alert("Error", "Network error");
    } finally {
      setSaving(false);
    }
  };

  const deleteStudent = (id) => {
    Alert.alert("Confirm", "Are you sure you want to delete this student?", [
      { text: "Cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          await fetch(`${BASE_URL}/api/admin/students/${id}`, { method: "DELETE" });
          fetchStudents();
        }
      }
    ]);
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const avatarColors = [
    { bg: "#E6F1FB", text: "#0C447C" },
    { bg: "#E1F5EE", text: "#085041" },
    { bg: "#FAEEDA", text: "#633806" },
  ];

  const editFields = [
    { key: "name",       label: "Full Name *" },
    { key: "email",      label: "Email *" },
    { key: "studentId",  label: "Student ID *" },
    { key: "department", label: "Department" },
    { key: "session",    label: "Session" },
    { key: "phone",      label: "Phone" },
    { key: "hallName",   label: "Hall Name" },
    { key: "roomNumber", label: "Room Number" },
    { key: "seatNumber", label: "Seat Number" },
  ];

  const renderItem = ({ item, index }) => {
    const color = avatarColors[index % 3];
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push(`/(admin)/student-details/${item._id}`)}
      >
        <View style={[styles.avatar, { backgroundColor: color.bg }]}>
          <Text style={[styles.avatarText, { color: color.text }]}>
            {getInitials(item.name)}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.sName}>{item.name}</Text>
          <Text style={styles.sEmail} numberOfLines={1}>{item.email}</Text>
          <View style={styles.tags}>
            {item.department && (
              <View style={[styles.tag, { backgroundColor: "#E6F1FB" }]}>
                <Text style={[styles.tagText, { color: "#0C447C" }]}>{item.department}</Text>
              </View>
            )}
            {item.roomNumber && (
              <View style={[styles.tag, { backgroundColor: "#E1F5EE" }]}>
                <Text style={[styles.tagText, { color: "#085041" }]}>Room {item.roomNumber}</Text>
              </View>
            )}
            {item.seatNumber && (
              <View style={[styles.tag, { backgroundColor: "#FAEEDA" }]}>
                <Text style={[styles.tagText, { color: "#633806" }]}>Seat {item.seatNumber}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Edit + Delete Buttons — stopPropagation so tap doesn't also navigate */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={(e) => { e.stopPropagation?.(); openEdit(item); }}
          >
            <Ionicons name="pencil-outline" size={16} color="#0C447C" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={(e) => { e.stopPropagation?.(); deleteStudent(item._id); }}
          >
            <Ionicons name="trash-outline" size={16} color="#A32D2D" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
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
          <Text style={styles.title}>All Students</Text>
          {!loading && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{students.length} students</Text>
            </View>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#aaa" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, ID or department..."
          placeholderTextColor="#bbb"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#bbb" />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>
                {search ? "No results found" : "No students yet"}
              </Text>
            </View>
          }
          renderItem={renderItem}
        />
      )}

      {/* Edit Modal */}
      <Modal visible={editModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Student</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {editFields.map(f => (
                <View key={f.key} style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>{f.label}</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={editForm[f.key]}
                    onChangeText={val => setEditForm({ ...editForm, [f.key]: val })}
                    placeholder={f.label.replace(" *", "")}
                    placeholderTextColor="#ccc"
                  />
                </View>
              ))}

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                onPress={saveEdit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>

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
  countBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  countText: { color: "#fff", fontSize: 12 },

  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#fff", margin: 14, marginBottom: 2,
    borderRadius: 10, borderWidth: 0.5, borderColor: "#e0e0e0",
    paddingHorizontal: 12, height: 42,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },

  card: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    padding: 14, marginBottom: 10,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  avatarText: { fontSize: 15, fontWeight: "600" },
  info: { flex: 1, minWidth: 0 },
  sName: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
  sEmail: { fontSize: 12, color: "#888", marginTop: 2 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  tagText: { fontSize: 11, fontWeight: "500" },

  actions: { flexDirection: "column", gap: 6, flexShrink: 0 },
  editBtn: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: "#E6F1FB", borderWidth: 0.5, borderColor: "#85B7EB",
    alignItems: "center", justifyContent: "center",
  },
  deleteBtn: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: "#FCEBEB", borderWidth: 0.5, borderColor: "#F09595",
    alignItems: "center", justifyContent: "center",
  },

  emptyBox: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: "#bbb" },

  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: "88%",
  },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#1a1a1a" },

  fieldWrap: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  fieldInput: {
    backgroundColor: "#f9f9f9", borderRadius: 10,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    padding: 12, fontSize: 14, color: "#333",
  },

  saveBtn: {
    backgroundColor: "#185FA5", padding: 15,
    borderRadius: 12, alignItems: "center", marginTop: 8,
  },
  saveBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  cancelBtn: { alignItems: "center", paddingVertical: 14 },
  cancelText: { color: "#888", fontSize: 14 },
});
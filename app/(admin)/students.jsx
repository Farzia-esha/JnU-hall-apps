import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchStudents = () => {
    fetch(`${BASE_URL}/api/admin/students`)
      .then(res => res.json())
      .then(data => { setStudents(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, []);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>👨‍🎓 All Students</Text>
      </View>
      {loading ? <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 40 }} /> :
        <FlatList
          data={students}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>No students available</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <View>
                  <Text style={styles.sName}>{item.name}</Text>
                  <Text style={styles.sId}>{item.studentId} • {item.department}</Text>
                  <Text style={styles.sInfo}>Room: {item.roomNumber || "—"} | Seat: {item.seatNumber || "—"}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteStudent(item._id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "purple", padding: 20, paddingTop: 50 },
  backText: { color: "#fff", fontSize: 25, marginBottom: 8 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sName: { fontSize: 17, fontWeight: "bold", color: "#222" },
  sId: { fontSize: 14, color: "#555", marginTop: 2 },
  sInfo: { fontSize: 13, color: "#888", marginTop: 2 },
  deleteBtn: { padding: 8 },
  deleteText: { fontSize: 20 },
  empty: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 16 },
});
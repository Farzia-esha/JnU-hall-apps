import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";

export default function CanteenFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`${BASE_URL}/api/canteen/feedback`)
      .then(res => res.json())
      .then(data => { setFeedbacks(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>💬 Student Feedback</Text>
        <Text style={styles.count}>মোট: {feedbacks.length}টি</Text>
      </View>
      {loading ? <ActivityIndicator size="large" color="#2980b9" style={{ marginTop: 40 }} /> :
        <FlatList data={feedbacks} keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>কোনো feedback নেই</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.feedback}>{item.feedback || item.message}</Text>
              <Text style={styles.student}>👤 {item.studentName || "Anonymous"}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          )} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "#2980b9", padding: 20, paddingTop: 50 },
  backText: { color: "#fff", fontSize: 16, marginBottom: 8 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  count: { color: "#cce4ff", fontSize: 13, marginTop: 4 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  feedback: { fontSize: 15, color: "#333", lineHeight: 22 },
  student: { fontSize: 13, color: "#888", marginTop: 8 },
  date: { fontSize: 12, color: "#bbb", marginTop: 4 },
  empty: { textAlign: "center", color: "#999", marginTop: 60, fontSize: 16 },
});
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`${BASE_URL}/api/notices`)
      .then(res => res.json())
      .then(data => { setNotices(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>📢 Notices</Text>
      </View>
      {loading ? <ActivityIndicator size="large" color="#2e86de" style={{ marginTop: 40 }} /> :
        <FlatList
          data={notices}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>No notices found</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.noticeTitle}>{item.title}</Text>
              <Text style={styles.noticeContent}>{item.content}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString("bn-BD")}</Text>
            </View>
          )}
        />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "purple", padding: 20, paddingTop: 50 },
  backText: { color: "#fff", fontSize: 20, marginBottom: 8 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  noticeTitle: { fontSize: 17, fontWeight: "bold", color: "#222", marginBottom: 6 },
  noticeContent: { fontSize: 15, color: "#555", lineHeight: 22 },
  date: { fontSize: 12, color: "#999", marginTop: 8 },
  empty: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 16 },
});
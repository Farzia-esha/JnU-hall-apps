import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TouchableOpacity
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Hall Rep: view-only list of canteen feedback submitted by students.
export default function HallRepCanteenFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchFeedback = () => {
    setLoading(true);
    fetch(`${BASE_URL}/api/canteen/feedback`)
      .then(res => res.json())
      .then(data => { setFeedbacks(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchFeedback(); }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Canteen Feedback</Text>
          {!loading && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{feedbacks.length} total</Text>
            </View>
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0F6E56" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={feedbacks}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchFeedback}
          refreshing={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="restaurant-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No feedback yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.iconWrap}>
                  <Ionicons name="restaurant-outline" size={16} color="#0F6E56" />
                </View>
                {item.rating != null && (
                  <View style={styles.ratingPill}>
                    <Ionicons name="star" size={12} color="#B8860B" />
                    <Text style={styles.ratingText}>{item.rating}/5</Text>
                  </View>
                )}
              </View>
              {item.message && <Text style={styles.message}>{item.message}</Text>}
              <View style={styles.footer}>
                <Ionicons name="person-outline" size={12} color="#aaa" />
                <Text style={styles.footerText}>
                  {item.studentName || item.studentEmail || item.name || "Anonymous"}
                </Text>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.footerText}>{formatDate(item.createdAt)}</Text>
              </View>
            </View>
          )}
        />
      )}

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

  card: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    padding: 14, marginBottom: 10,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  iconWrap: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: "#E1F5EE",
    alignItems: "center", justifyContent: "center",
  },
  ratingPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#FDF3DD", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  ratingText: { fontSize: 12, fontWeight: "600", color: "#B8860B" },
  message: { fontSize: 14, color: "#444", lineHeight: 20 },
  footer: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 12 },
  footerText: { fontSize: 12, color: "#aaa" },
  dot: { fontSize: 12, color: "#aaa" },

  emptyBox: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: "#bbb" },
});
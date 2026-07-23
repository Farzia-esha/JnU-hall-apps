import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TouchableOpacity
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function StudentEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "upcoming" | "past"
  const router = useRouter();

  useEffect(() => {
    fetch(`${BASE_URL}/api/events`)
      .then(res => res.json())
      .then(data => { setEvents(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const isUpcoming = (dateStr) => dateStr >= today;

  const filtered = events.filter(e => {
    if (filter === "upcoming") return isUpcoming(e.date);
    if (filter === "past") return !isUpcoming(e.date);
    return true;
  });

  const upcomingCount = events.filter(e => isUpcoming(e.date)).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      weekday: "short", day: "numeric", month: "short", year: "numeric"
    });
  };

  const getDaysLeft = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff > 1) return `${diff} days left`;
    return null;
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Hall Events</Text>
          {upcomingCount > 0 && (
            <View style={styles.upcomingBadge}>
              <Text style={styles.upcomingBadgeText}>{upcomingCount} upcoming</Text>
            </View>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {[
          { key: "all",      label: "All" },
          { key: "upcoming", label: "Upcoming" },
          { key: "past",     label: "Past" },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterTabText, filter === f.key && styles.filterTabTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
              <Ionicons name="calendar-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>
                {filter === "upcoming" ? "No upcoming events" :
                 filter === "past" ? "No past events" : "No events yet"}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const upcoming = isUpcoming(item.date);
            const daysLeft = getDaysLeft(item.date);
            return (
              <View style={styles.card}>

                {/* Date + Status */}
                <View style={styles.cardTop}>
                  <View style={[
                    styles.dateBadge,
                    { backgroundColor: upcoming ? "#E1F5EE" : "#f5f6fa" }
                  ]}>
                    <Ionicons
                      name="calendar-outline"
                      size={12}
                      color={upcoming ? "#0F6E56" : "#aaa"}
                    />
                    <Text style={[
                      styles.dateBadgeText,
                      { color: upcoming ? "#0F6E56" : "#aaa" }
                    ]}>
                      {formatDate(item.date)}
                    </Text>
                  </View>
                  {daysLeft && upcoming && (
                    <View style={styles.daysLeftBadge}>
                      <Text style={styles.daysLeftText}>{daysLeft}</Text>
                    </View>
                  )}
                </View>

                {/* Title */}
                <Text style={styles.eTitle}>{item.title}</Text>

                {/* Venue */}
                {item.venue && (
                  <View style={styles.venueRow}>
                    <Ionicons name="location-outline" size={13} color="#aaa" />
                    <Text style={styles.venueText}>{item.venue}</Text>
                  </View>
                )}

                {/* Description */}
                {item.description && (
                  <Text style={styles.desc}>{item.description}</Text>
                )}

                {/* Activity Update */}
                {item.activityUpdate && (
                  <View style={styles.activityBox}>
                    <Ionicons name="megaphone-outline" size={14} color="#0F6E56" />
                    <Text style={styles.activityText}>{item.activityUpdate}</Text>
                  </View>
                )}

                {/* Organizer */}
                <View style={styles.cardFooter}>
                  <Ionicons name="person-outline" size={12} color="#aaa" />
                  <Text style={styles.organizerText}>{item.organizerName || "Hall Rep"}</Text>
                </View>

              </View>
            );
          }}
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
  upcomingBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  upcomingBadgeText: { color: "#fff", fontSize: 12 },

  filterRow: {
    flexDirection: "row", gap: 8,
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: "#fff", borderBottomWidth: 0.5, borderBottomColor: "#e0e0e0",
  },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 0.5, borderColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
  },
  filterTabActive: { backgroundColor: "#E6F1FB", borderColor: "#85B7EB" },
  filterTabText: { fontSize: 13, color: "#888" },
  filterTabTextActive: { color: "#0C447C", fontWeight: "600" },

  card: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    padding: 14, marginBottom: 10,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" },
  dateBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  dateBadgeText: { fontSize: 12, fontWeight: "500" },
  daysLeftBadge: {
    backgroundColor: "#9FE1CB", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  daysLeftText: { fontSize: 11, color: "#085041", fontWeight: "600" },
  eTitle: { fontSize: 16, fontWeight: "600", color: "#1a1a1a", marginBottom: 6 },
  venueRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 },
  venueText: { fontSize: 13, color: "#888" },
  desc: { fontSize: 13, color: "#666", lineHeight: 18, marginBottom: 8 },
  activityBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 6,
    backgroundColor: "#E1F5EE", borderRadius: 8, padding: 10, marginBottom: 10,
    borderWidth: 0.5, borderColor: "#5DCAA5",
  },
  activityText: { fontSize: 13, color: "#085041", flex: 1, lineHeight: 18 },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 4 },
  organizerText: { fontSize: 12, color: "#aaa" },

  emptyBox: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: "#bbb" },
});
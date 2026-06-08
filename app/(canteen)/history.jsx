import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TouchableOpacity, Alert
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const mealSections = [
  { key: "breakfast", label: "Breakfast", icon: "sunny-outline",      color: "#E6F1FB", iconColor: "#185FA5" },
  { key: "lunch",     label: "Lunch",     icon: "restaurant-outline",  color: "#E1F5EE", iconColor: "#0F6E56" },
  { key: "dinner",    label: "Dinner",    icon: "moon-outline",        color: "#FAEEDA", iconColor: "#854F0B" },
];

export default function MenuHistory() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const router = useRouter();

  const fetchMenus = () => {
    setLoading(true);
    fetch(`${BASE_URL}/api/canteen/menu`)
      .then(res => res.json())
      .then(data => { setMenus(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchMenus(); }, []);

  const deleteMenu = (id, date) => {
    Alert.alert("Delete Menu", `Delete menu for ${date}?`, [
      { text: "Cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          await fetch(`${BASE_URL}/api/canteen/menu/${id}`, { method: "DELETE" });
          fetchMenus();
        }
      }
    ]);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  const isToday = (dateStr) => {
    return dateStr === new Date().toISOString().split("T")[0];
  };

  const totalItems = (menu) =>
    (menu.breakfast?.length || 0) + (menu.lunch?.length || 0) + (menu.dinner?.length || 0);

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Menu History</Text>
          {!loading && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{menus.length} days</Text>
            </View>
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={menus}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="time-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No menu history yet</Text>
            </View>
          }
          renderItem={({ item }) => {
            const open = expanded === item._id;
            return (
              <View style={styles.card}>

                {/* Card Header — tap to expand */}
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => setExpanded(open ? null : item._id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dateWrap}>
                    <Ionicons name="calendar-outline" size={16} color="#185FA5" />
                    <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                    {isToday(item.date) && (
                      <View style={styles.todayBadge}>
                        <Text style={styles.todayText}>Today</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.cardRight}>
                    <View style={styles.itemCountPill}>
                      <Text style={styles.itemCountText}>{totalItems(item)} items</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => deleteMenu(item._id, item.date)}
                    >
                      <Ionicons name="trash-outline" size={15} color="#A32D2D" />
                    </TouchableOpacity>
                    <Ionicons
                      name={open ? "chevron-up" : "chevron-down"}
                      size={16} color="#aaa"
                    />
                  </View>
                </TouchableOpacity>

                {/* Expanded Detail */}
                {open && (
                  <View style={styles.detail}>
                    {mealSections.map(s => (
                      <View key={s.key} style={styles.mealBlock}>
                        <View style={styles.mealHeaderRow}>
                          <View style={[styles.mealIcon, { backgroundColor: s.color }]}>
                            <Ionicons name={s.icon} size={14} color={s.iconColor} />
                          </View>
                          <Text style={[styles.mealLabel, { color: s.iconColor }]}>{s.label}</Text>
                        </View>
                        {item[s.key]?.length > 0 ? item[s.key].map((food, i) => (
                          <View key={i} style={styles.foodRow}>
                            <Text style={styles.foodName}>{food.name}</Text>
                            <Text style={styles.foodPrice}>৳{food.price}</Text>
                          </View>
                        )) : (
                          <Text style={styles.noFood}>Not available</Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}

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
  countBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  countText: { color: "#fff", fontSize: 12 },

  card: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    marginBottom: 10, overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", padding: 14,
  },
  dateWrap: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  dateText: { fontSize: 14, fontWeight: "600", color: "#1a1a1a" },
  todayBadge: {
    backgroundColor: "#E1F5EE", borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  todayText: { fontSize: 11, color: "#085041", fontWeight: "600" },
  cardRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  itemCountPill: {
    backgroundColor: "#f5f6fa", borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 0.5, borderColor: "#e0e0e0",
  },
  itemCountText: { fontSize: 11, color: "#888" },
  deleteBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: "#FCEBEB", borderWidth: 0.5, borderColor: "#F09595",
    alignItems: "center", justifyContent: "center",
  },

  detail: {
    borderTopWidth: 0.5, borderTopColor: "#f0f0f0",
    padding: 14, gap: 12,
  },
  mealBlock: { gap: 6 },
  mealHeaderRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  mealIcon: { width: 24, height: 24, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  mealLabel: { fontSize: 13, fontWeight: "600" },
  foodRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: "#f5f5f5",
  },
  foodName: { fontSize: 13, color: "#333" },
  foodPrice: { fontSize: 13, color: "#185FA5", fontWeight: "500" },
  noFood: { fontSize: 12, color: "#bbb" },

  emptyBox: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: "#bbb" },
});
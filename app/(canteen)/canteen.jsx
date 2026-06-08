import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const mealSections = [
  { key: "breakfast", label: "Breakfast", icon: "sunny-outline",      color: "#E6F1FB", iconColor: "#185FA5" },
  { key: "lunch",     label: "Lunch",     icon: "restaurant-outline",  color: "#E1F5EE", iconColor: "#0F6E56" },
  { key: "dinner",    label: "Dinner",    icon: "moon-outline",        color: "#FAEEDA", iconColor: "#854F0B" },
];

const MealSection = ({ section, items }) => (
  <View style={[styles.section, { borderLeftColor: section.iconColor }]}>
    <View style={styles.mealHeader}>
      <View style={[styles.mealIcon, { backgroundColor: section.color }]}>
        <Ionicons name={section.icon} size={18} color={section.iconColor} />
      </View>
      <Text style={[styles.mealTitle, { color: section.iconColor }]}>{section.label}</Text>
      <View style={styles.countPill}>
        <Text style={styles.countPillText}>{items?.length || 0} items</Text>
      </View>
    </View>
    {items?.length > 0 ? items.map((item, i) => (
      <View key={i} style={styles.menuRow}>
        <Text style={styles.menuItem}>{item.name}</Text>
        <Text style={styles.menuPrice}>৳{item.price}</Text>
      </View>
    )) : (
      <Text style={styles.noItem}>Not available today</Text>
    )}
  </View>
);

export default function CanteenToday() {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`${BASE_URL}/api/canteen/menu/today`)
      .then(res => res.json())
      .then(data => { setMenu(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long"
  });

  const totalItems = menu
    ? (menu.breakfast?.length || 0) + (menu.lunch?.length || 0) + (menu.dinner?.length || 0)
    : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Today's Menu</Text>
        <Text style={styles.date}>{today}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 40 }} />
      ) : menu?.message ? (
        <View style={styles.emptyBox}>
          <Ionicons name="restaurant-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Menu not posted yet</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#0F6E56" />
            <Text style={styles.summaryText}>
              {totalItems} items available today
            </Text>
          </View>

          {mealSections.map(s => (
            <MealSection key={s.key} section={s} items={menu?.[s.key]} />
          ))}
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "#2c3e50", paddingHorizontal: 20, paddingTop: 55, paddingBottom: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  title: { color: "#fff", fontSize: 20, fontWeight: "600" },
  date: { color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 },
  content: { padding: 16 },
  summaryCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#E1F5EE", borderRadius: 10,
    padding: 12, marginBottom: 14,
    borderWidth: 0.5, borderColor: "#5DCAA5",
  },
  summaryText: { fontSize: 13, color: "#085041", fontWeight: "500" },
  section: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    padding: 14, marginBottom: 12, borderLeftWidth: 3,
  },
  mealHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  mealIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  mealTitle: { fontSize: 15, fontWeight: "600", flex: 1 },
  countPill: {
    backgroundColor: "#f5f6fa", borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 0.5, borderColor: "#e0e0e0",
  },
  countPillText: { fontSize: 11, color: "#888" },
  menuRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: "#f0f0f0",
  },
  menuItem: { fontSize: 14, color: "#333" },
  menuPrice: { fontSize: 14, color: "#185FA5", fontWeight: "600" },
  noItem: { fontSize: 13, color: "#bbb" },
  emptyBox: { alignItems: "center", marginTop: 80, gap: 10 },
  emptyText: { fontSize: 15, color: "#bbb" },
});
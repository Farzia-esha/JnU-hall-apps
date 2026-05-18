import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";

export default function Canteen() {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`${BASE_URL}/api/canteen/menu/today`)
      .then(res => res.json())
      .then(data => { setMenu(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const MealSection = ({ title, items, color }) => (
    <View style={[styles.section, { borderLeftColor: color }]}>
      <Text style={[styles.mealTitle, { color }]}>{title}</Text>
      {items?.length > 0 ? items.map((item, i) => (
        <View key={i} style={styles.menuRow}>
          <Text style={styles.menuItem}>{item.name}</Text>
          <Text style={styles.menuPrice}>৳{item.price}</Text>
        </View>
      )) : <Text style={styles.noItem}>আজ নেই</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>🍽️ আজকের Canteen Menu</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString("bn-EN")}</Text>
      </View>

      {loading ? <ActivityIndicator size="large" color="#9b59b6" style={{ marginTop: 40 }} /> :
        menu?.message ? <Text style={styles.empty}>আজকের menu এখনো post হয়নি</Text> :
          <View style={styles.content}>
            <MealSection title="🌅 সকালের নাস্তা" items={menu?.breakfast} color="#f39c12" />
            <MealSection title="☀️ দুপুরের খাবার" items={menu?.lunch} color="#2ecc71" />
            <MealSection title="🌙 রাতের খাবার" items={menu?.dinner} color="#9b59b6" />
          </View>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "#9b59b6", padding: 20, paddingTop: 50 },
  backText: { color: "#fff", fontSize: 20, marginBottom: 8 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  date: { color: "#ddd", fontSize: 13, marginTop: 4 },
  content: { padding: 16 },
  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, elevation: 2 },
  mealTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  menuRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
  menuItem: { fontSize: 15, color: "#333" },
  menuPrice: { fontSize: 15, color: "#666", fontWeight: "600" },
  noItem: { color: "#999", fontSize: 14 },
  empty: { textAlign: "center", color: "#999", marginTop: 60, fontSize: 16 },
});
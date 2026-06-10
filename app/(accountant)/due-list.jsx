import { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TouchableOpacity, Alert
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

export default function DueList() {
  const [dueList, setDueList] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => { fetchDue(); }, [])
  );

  const fetchDue = () => {
    setLoading(true);
    fetch(`${BASE_URL}/api/payments/due`)
      .then(res => res.json())
      .then(data => { setDueList(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const markPaid = (id, name) => {
    Alert.alert("Mark as Paid", `Mark ${name || "this student"}'s payment as paid?`, [
      { text: "Cancel" },
      {
        text: "Mark Paid", onPress: async () => {
          await fetch(`${BASE_URL}/api/payments/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "paid", paidAt: new Date() }),
          });
          fetchDue();
        }
      }
    ]);
  };

  const totalDue = dueList.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Due List</Text>
          {!loading && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{dueList.length} unpaid</Text>
            </View>
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={dueList}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            dueList.length > 0 ? (
              <View style={styles.summaryCard}>
                <Ionicons name="alert-circle-outline" size={18} color="#A32D2D" />
                <Text style={styles.summaryText}>
                  Total due: <Text style={{ fontWeight: "600", color: "#A32D2D" }}>৳{totalDue.toLocaleString()}</Text> from {dueList.length} students
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="checkmark-circle-outline" size={56} color="#5DCAA5" />
              <Text style={styles.emptyText}>All clear!</Text>
              <Text style={styles.emptySubText}>No unpaid students</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatarWrap}>
                  <Text style={styles.avatarText}>
                    {(item.studentName || "?").slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.sName}>{item.studentName || "Unknown"}</Text>
                  <Text style={styles.sId}>{item.studentId} · {item.semester}</Text>
                </View>
                <View style={styles.dueAmountWrap}>
                  <Text style={styles.dueLabel}>Due</Text>
                  <Text style={styles.dueAmount}>৳{item.amount}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.markPaidBtn}
                onPress={() => markPaid(item._id, item.studentName)}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color="#085041" />
                <Text style={styles.markPaidText}>Mark as Paid</Text>
              </TouchableOpacity>
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

  summaryCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FCEBEB", borderRadius: 10, padding: 12, marginBottom: 14,
    borderWidth: 0.5, borderColor: "#F09595",
  },
  summaryText: { fontSize: 13, color: "#555", flex: 1 },

  card: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    padding: 14, marginBottom: 10,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  avatarWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#FCEBEB", alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "600", color: "#A32D2D" },
  info: { flex: 1 },
  sName: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
  sId: { fontSize: 12, color: "#888", marginTop: 2 },
  dueAmountWrap: { alignItems: "flex-end" },
  dueLabel: { fontSize: 11, color: "#aaa" },
  dueAmount: { fontSize: 16, fontWeight: "600", color: "#A32D2D" },

  markPaidBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: "#E1F5EE", borderWidth: 0.5, borderColor: "#5DCAA5",
    borderRadius: 10, padding: 10,
  },
  markPaidText: { fontSize: 13, color: "#085041", fontWeight: "500" },

  emptyBox: { alignItems: "center", marginTop: 80, gap: 8 },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#5DCAA5" },
  emptySubText: { fontSize: 14, color: "#bbb" },
});
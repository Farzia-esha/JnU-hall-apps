import { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const statusConfig = {
  paid:   { label: "Paid",   bg: "#E1F5EE", text: "#085041", icon: "checkmark-circle-outline" },
  unpaid: { label: "Unpaid", bg: "#FCEBEB", text: "#A32D2D", icon: "alert-circle-outline" },
};

export default function AccountantPayments() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | paid | unpaid

  const fetchPayments = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "all") params.append("status", filter);
    if (search.trim()) params.append("search", search.trim());
    fetch(`${BASE_URL}/api/payments?${params.toString()}`)
      .then(res => res.json())
      .then(data => { setPayments(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => { fetchPayments(); }, [filter]));

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const formatMoney = (n) => `৳${Number(n || 0).toLocaleString()}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>All Payments</Text>
          <TouchableOpacity style={styles.newBtn} onPress={() => router.push("/(accountant)/add-payment")}>
            <Ionicons name="add" size={18} color="#0C447C" />
            <Text style={styles.newBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#aaa" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          placeholderTextColor="#bbb"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchPayments}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => { setSearch(""); fetchPayments(); }}>
            <Ionicons name="close-circle" size={18} color="#bbb" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        {["all", "unpaid", "paid"].map(f => (
          <TouchableOpacity key={f} style={[styles.filterTab, filter === f && styles.filterTabActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>{f[0].toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="wallet-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No payment records</Text>
            </View>
          }
          renderItem={({ item }) => {
            const sc = statusConfig[item.status] || statusConfig.unpaid;
            const net = (Number(item.amount) || 0) - (Number(item.scholarshipAmount) || 0);
            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => router.push(`/(accountant)/payment-details/${item._id}`)}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Ionicons name={sc.icon} size={12} color={sc.text} />
                    <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
                  </View>
                  <Text style={styles.dateText}>{formatDate(item.paidAt || item.createdAt)}</Text>
                </View>
                <Text style={styles.name}>{item.studentName || "Unknown"}</Text>
                <Text style={styles.meta}>{item.email}</Text>
                <Text style={styles.meta}>{item.semester}</Text>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Amount: {formatMoney(item.amount)}</Text>
                  {Number(item.scholarshipAmount) > 0 && (
                    <Text style={styles.scholarshipLabel}>Scholarship: -{formatMoney(item.scholarshipAmount)}</Text>
                  )}
                  <Text style={styles.netLabel}>Net: {formatMoney(net)}</Text>
                </View>
              </TouchableOpacity>
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
  newBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  newBtnText: { color: "#0C447C", fontWeight: "600", fontSize: 13 },

  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#fff", margin: 14, marginBottom: 8,
    borderRadius: 10, borderWidth: 0.5, borderColor: "#e0e0e0",
    paddingHorizontal: 12, height: 42,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },

  filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: 14, marginBottom: 4 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: "#e0e0e0", backgroundColor: "#fff" },
  filterTabActive: { backgroundColor: "#E6F1FB", borderColor: "#85B7EB" },
  filterTabText: { fontSize: 13, color: "#888" },
  filterTabTextActive: { color: "#0C447C", fontWeight: "600" },

  card: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 0.5, borderColor: "#e0e0e0", padding: 14, marginBottom: 10 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "500" },
  dateText: { fontSize: 12, color: "#aaa" },
  name: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
  meta: { fontSize: 12, color: "#888", marginTop: 2 },

  amountRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  amountLabel: { fontSize: 12, color: "#333" },
  scholarshipLabel: { fontSize: 12, color: "#854F0B" },
  netLabel: { fontSize: 12, color: "#185FA5", fontWeight: "600" },

  emptyBox: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: "#bbb" },
});
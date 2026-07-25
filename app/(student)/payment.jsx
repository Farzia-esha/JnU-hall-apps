import { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL } from "../../constants/api";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const redirectUrl = Linking.createURL("payment-redirect");

const statusConfig = {
  paid:   { label: "Paid",   bg: "#E1F5EE", text: "#085041", icon: "checkmark-circle-outline" },
  unpaid: { label: "Unpaid", bg: "#FCEBEB", text: "#A32D2D", icon: "alert-circle-outline" },
};

export default function StudentPayment() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const router = useRouter();

  const fetchPayments = () => {
    if (!user?.email) { setLoading(false); return; }
    setLoading(true);
    fetch(`${BASE_URL}/api/payments/student/${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        // Most recent first
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPayments(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => { fetchPayments(); }, [user?.email]));

  const statusConfigFor = (item) => statusConfig[item.status] || statusConfig.unpaid;
  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
  const formatMoney = (n) => `৳${Number(n || 0).toLocaleString()}`;
  const netOf = (p) => (Number(p.amount) || 0) - (Number(p.scholarshipAmount) || 0);

  const totalPaid = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + netOf(p), 0);
  const totalDue = payments.filter(p => p.status !== "paid").reduce((sum, p) => sum + netOf(p), 0);

  const payNow = async (payment) => {
    setPayingId(payment._id);
    try {
      const res = await fetch(`${BASE_URL}/api/payments/${payment._id}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ successUrl: redirectUrl, cancelUrl: redirectUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", data.message || "Could not start payment");
        return;
      }

      await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      const statusRes = await fetch(`${BASE_URL}/api/payments/session-status/${data.sessionId}`);
      const statusData = await statusRes.json();
      if (statusData.status === "paid") {
        Alert.alert("Payment received", "Thank you! Your payment was successful.");
      }
      fetchPayments();
    } catch {
      Alert.alert("Error", "Payment could not be started");
    } finally {
      setPayingId(null);
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payment Status</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={item => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          ListHeaderComponent={
            payments.length > 0 ? (
              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Total Paid</Text>
                  <Text style={[styles.summaryAmount, { color: "#085041" }]}>{formatMoney(totalPaid)}</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Total Due</Text>
                  <Text style={[styles.summaryAmount, { color: "#A32D2D" }]}>{formatMoney(totalDue)}</Text>
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="card-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No payment records</Text>
            </View>
          }
          renderItem={({ item }) => {
            const sc = statusConfigFor(item);
            const net = netOf(item);
            const isPaying = payingId === item._id;
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.semester}>{item.semester || "Payment"}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Ionicons name={sc.icon} size={12} color={sc.text} />
                    <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
                  </View>
                </View>

                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Amount</Text>
                  <Text style={styles.amountValue}>{formatMoney(item.amount)}</Text>
                </View>

                {Number(item.scholarshipAmount) > 0 && (
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Scholarship</Text>
                    <Text style={[styles.amountValue, { color: "#0C447C" }]}>-{formatMoney(item.scholarshipAmount)}</Text>
                  </View>
                )}

                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Net</Text>
                  <Text style={[styles.amountValue, { color: "#185FA5", fontWeight: "700" }]}>{formatMoney(net)}</Text>
                </View>

                {item.status === "paid" ? (
                  (item.paidAt || item.createdAt) && (
                    <View style={styles.cardFooter}>
                      <Ionicons name="calendar-outline" size={12} color="#aaa" />
                      <Text style={styles.footerText}>Paid on {formatDate(item.paidAt || item.createdAt)}</Text>
                    </View>
                  )
                ) : (
                  <TouchableOpacity
                    style={[styles.payBtn, isPaying && { opacity: 0.7 }]}
                    onPress={() => payNow(item)}
                    disabled={isPaying || net <= 0}
                  >
                    {isPaying ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="card-outline" size={15} color="#fff" />
                        <Text style={styles.payBtnText}>Pay {formatMoney(net)} with Stripe</Text>
                      </>
                    )}
                  </TouchableOpacity>
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
  header: { backgroundColor: "purple", paddingHorizontal: 20, paddingTop: 55, paddingBottom: 16 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "white", fontSize: 15 },
  title: { color: "#fff", fontSize: 20, fontWeight: "600" },

  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  summaryCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 12,
    borderWidth: 0.5, borderColor: "#e0e0e0", padding: 14,
  },
  summaryLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  summaryAmount: { fontSize: 22, fontWeight: "600" },

  card: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    padding: 14, marginBottom: 10,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  semester: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "500" },
  amountRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: "#f5f5f5",
  },
  amountLabel: { fontSize: 13, color: "#888" },
  amountValue: { fontSize: 13, fontWeight: "600", color: "#1a1a1a" },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10 },
  footerText: { fontSize: 12, color: "#aaa" },

  payBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: "#635BFF", borderRadius: 10, padding: 12, marginTop: 12,
  },
  payBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },

  emptyBox: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: "#bbb" },
});
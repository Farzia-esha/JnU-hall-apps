// import { useEffect, useState } from "react";
// import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
// import { useAuth } from "../../context/AuthContext";
// import { BASE_URL } from "../../constants/api";
// import { useRouter } from "expo-router";

// export default function Payment() {
//   const { user } = useAuth();
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     fetch(`${BASE_URL}/api/payments/student/${user?.studentId || user?.email}`)
//       .then(res => res.json())
//       .then(data => { setPayments(Array.isArray(data) ? data : []); setLoading(false); })
//       .catch(() => setLoading(false));
//   }, []);

//   const statusColor = (status) => status === "paid" ? "#2ecc71" : status === "partial" ? "#f39c12" : "#e74c3c";

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
//         <Text style={styles.title}>💳 Payment Status</Text>
//       </View>
//       {loading ? <ActivityIndicator size="large" color="#2ecc71" style={{ marginTop: 40 }} /> :
//         <FlatList
//           data={payments}
//           keyExtractor={item => item._id}
//           contentContainerStyle={{ padding: 16 }}
//           ListEmptyComponent={<Text style={styles.empty}>No payment records found</Text>}
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <View style={styles.row}>
//                 <Text style={styles.semester}>{item.semester}</Text>
//                 <Text style={[styles.status, { backgroundColor: statusColor(item.status) }]}>{item.status}</Text>
//               </View>
//               <Text style={styles.amount}>Amount: ৳{item.amount}</Text>
//               {item.scholarshipAmount > 0 && <Text style={styles.scholarship}>Scholarship: ৳{item.scholarshipAmount}</Text>}
//               {item.paidAt && <Text style={styles.date}>Paid: {new Date(item.paidAt).toLocaleDateString()}</Text>}
//             </View>
//           )}
//         />}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f5f6fa" },
//   header: { backgroundColor: "#2ecc71", padding: 20, paddingTop: 50 },
//   backText: { color: "#fff", fontSize: 20, marginBottom: 8 },
//   title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
//   card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
//   row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
//   semester: { fontSize: 17, fontWeight: "bold", color: "#222" },
//   status: { color: "#fff", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, fontSize: 13, fontWeight: "600" },
//   amount: { fontSize: 15, color: "#555" },
//   scholarship: { fontSize: 14, color: "#27ae60", marginTop: 4 },
//   date: { fontSize: 12, color: "#999", marginTop: 4 },
//   empty: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 16 },
// });


import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function StudentPayment() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`${BASE_URL}/api/payments/student/${user?.uid}`)
      .then(res => res.json())
      .then(data => { setPayments(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statusConfig = {
    paid:        { label: "Paid",        bg: "#E1F5EE", text: "#085041", icon: "checkmark-circle-outline" },
    unpaid:      { label: "Unpaid",      bg: "#FCEBEB", text: "#A32D2D", icon: "close-circle-outline" },
    partial:     { label: "Partial",     bg: "#FAEEDA", text: "#633806", icon: "time-outline" },
    scholarship: { label: "Scholarship", bg: "#E6F1FB", text: "#0C447C", icon: "ribbon-outline" },
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const totalPaid = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalDue = payments.filter(p => p.status === "unpaid").reduce((sum, p) => sum + (p.amount || 0), 0);

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
                  <Text style={[styles.summaryAmount, { color: "#085041" }]}>৳{totalPaid}</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Total Due</Text>
                  <Text style={[styles.summaryAmount, { color: "#A32D2D" }]}>৳{totalDue}</Text>
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
            const sc = statusConfig[item.status] || statusConfig.unpaid;
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
                  <Text style={styles.amountValue}>৳{item.amount || 0}</Text>
                </View>

                {item.scholarshipAmount > 0 && (
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Scholarship</Text>
                    <Text style={[styles.amountValue, { color: "#0C447C" }]}>৳{item.scholarshipAmount}</Text>
                  </View>
                )}

                {item.paidAt && (
                  <View style={styles.cardFooter}>
                    <Ionicons name="calendar-outline" size={12} color="#aaa" />
                    <Text style={styles.footerText}>Paid on {formatDate(item.paidAt)}</Text>
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

  emptyBox: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: "#bbb" },
});
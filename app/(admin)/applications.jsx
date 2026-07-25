import { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Alert, Modal, ScrollView
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const statusConfig = {
  pending:  { label: "Pending",  bg: "#FAEEDA", text: "#633806", icon: "time-outline" },
  approved: { label: "Approved", bg: "#E1F5EE", text: "#085041", icon: "checkmark-circle-outline" },
  rejected: { label: "Rejected", bg: "#FCEBEB", text: "#A32D2D", icon: "close-circle-outline" },
};

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  const [seatModal, setSeatModal] = useState(false);
  const [seatModalMode, setSeatModalMode] = useState("approve"); // "approve" or "assign"
  const [selectedApp, setSelectedApp] = useState(null);
  const [vacantSeats, setVacantSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [approving, setApproving] = useState(false);

  const router = useRouter();

  const fetchApplications = () => {
    setLoading(true);
    const q = filter === "all" ? "" : `?status=${filter}`;
    fetch(`${BASE_URL}/api/admin/applications${q}`)
      .then(res => res.json())
      .then(data => { setApplications(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => { fetchApplications(); }, [filter]));

  const openSeatPicker = async (application, mode = "approve") => {
    setSelectedApp(application);
    setSeatModalMode(mode);
    setSeatModal(true);
    setLoadingSeats(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/seats?status=vacant`);
      setVacantSeats(await res.json());
    } catch {
      setVacantSeats([]);
    } finally {
      setLoadingSeats(false);
    }
  };

  const approveWithSeat = async (seat) => {
    setApproving(true);
    try {
      if (seatModalMode === "assign") {
        // Post-payment seat assignment
        const res = await fetch(`${BASE_URL}/api/admin/applications/${selectedApp._id}/assign-seat`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seatId: seat._id }),
        });
        const data = await res.json();
        if (!res.ok) {
          Alert.alert("Error", `[assign-seat] ${data.message || "Could not assign seat"}`);
          return;
        }
        Alert.alert("Success", `Seat assigned to ${selectedApp.studentName}! ${seat.hallName} / Room ${seat.roomNumber} / Seat ${seat.seatNumber}`);
      } else {
        // Approval with pre-selected seat
        const res = await fetch(`${BASE_URL}/api/admin/applications/${selectedApp._id}/approve`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seatId: seat._id, eligibilityNotes: "" }),
        });
        const data = await res.json();
        if (!res.ok) {
          Alert.alert("Error", `[approve] ${data.message || "Could not approve"}`);
          return;
        }
        Alert.alert("Approved", `${selectedApp.studentName} approved! Seat ${seat.hallName} / Room ${seat.roomNumber} / Seat ${seat.seatNumber} is reserved until payment.`);
      }
      setSeatModal(false);
      fetchApplications();
    } catch (err) {
      Alert.alert("Error", `Network error: ${err.message}`);
    } finally {
      setApproving(false);
    }
  };

  const approveWithoutSeat = async (application) => {
    Alert.alert("Approve without seat?", "This student can pay and choose their seat. Continue?", [
      { text: "Cancel" },
      {
        text: "Approve",
        onPress: async () => {
          try {
            const res = await fetch(`${BASE_URL}/api/admin/applications/${application._id}/approve`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ eligibilityNotes: "" }),
            });
            const data = await res.json();
            if (!res.ok) {
              Alert.alert("Error", data.message || "Could not approve");
              return;
            }
            Alert.alert("Approved", `${application.studentName} has been approved. They can now pay the fee.`);
            fetchApplications();
          } catch {
            Alert.alert("Error", "Network error");
          }
        }
      }
    ]);
  };

  const rejectApplication = (id) => {
    Alert.alert("Reject application", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Reject", style: "destructive", onPress: async () => {
          await fetch(`${BASE_URL}/api/admin/applications/${id}/reject`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason: "" }),
          });
          fetchApplications();
        }
      }
    ]);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Hall Applications</Text>
      </View>

      <View style={styles.filterRow}>
        {["pending", "approved", "rejected", "all"].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f[0].toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={applications}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No applications</Text>
            </View>
          }
          renderItem={({ item }) => {
            const sc = statusConfig[item.status] || statusConfig.pending;
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Ionicons name={sc.icon} size={12} color={sc.text} />
                    <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
                  </View>
                  <View style={[styles.payBadge, { backgroundColor: item.paymentStatus === "paid" ? "#E1F5EE" : "#FCEBEB" }]}>
                    <Text style={{ fontSize: 11, color: item.paymentStatus === "paid" ? "#085041" : "#A32D2D" }}>
                      {item.paymentStatus === "paid" ? "✓ Fee paid" : "◦ Fee unpaid"}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                </View>

                <Text style={styles.name}>{item.studentName}</Text>
                <Text style={styles.meta}>{item.studentId} · {item.department} · {item.session}</Text>
                <Text style={styles.meta}>{item.studentEmail}</Text>

                {item.status === "approved" && item.selectedHallName && (
                  <Text style={styles.seatInfo}>
                    Reserved: {item.selectedHallName} · Room {item.selectedRoomNumber} · Seat {item.selectedSeatNumber}
                  </Text>
                )}

                {item.status === "approved" && item.paymentStatus === "paid" && (
                  <Text style={styles.seatInfoPaid}>
                    Allocated: {item.hallName} · Room {item.roomNumber} · Seat {item.seatNumber}
                  </Text>
                )}

                {item.status === "approved" && item.paymentStatus === "unpaid" && !item.selectedHallName && (
                  <Text style={styles.statusMsg}>Awaiting student payment...</Text>
                )}

                {item.status === "pending" && (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnPrimary]}
                      onPress={() => openSeatPicker(item, "approve")}
                    >
                      <Ionicons name="checkmark-circle-outline" size={14} color="#085041" />
                      <Text style={[styles.actionText, { color: "#085041" }]}>Approve + Select Seat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnSecondary]}
                      onPress={() => approveWithoutSeat(item)}
                    >
                      <Ionicons name="checkmark-outline" size={14} color="#0C447C" />
                      <Text style={[styles.actionText, { color: "#0C447C" }]}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnReject]}
                      onPress={() => rejectApplication(item._id)}
                    >
                      <Ionicons name="close-circle-outline" size={14} color="#A32D2D" />
                      <Text style={[styles.actionText, { color: "#A32D2D" }]}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {item.status === "approved" && item.paymentStatus === "paid" && !item.hallName && (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnSuccess]}
                      onPress={() => openSeatPicker(item, "assign")}
                    >
                      <Ionicons name="bed-outline" size={14} color="#085041" />
                      <Text style={[styles.actionText, { color: "#085041" }]}>Assign Seat Now</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}

      {/* Seat picker modal */}
      <Modal visible={seatModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  {seatModalMode === "assign" ? "Assign a seat (payment received)" : "Select a seat for approval"}
                </Text>
                <Text style={styles.modalSubtitle}>{selectedApp?.studentName}</Text>
              </View>
              <TouchableOpacity onPress={() => setSeatModal(false)}>
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            {loadingSeats ? (
              <ActivityIndicator color="#185FA5" style={{ marginVertical: 20 }} />
            ) : vacantSeats.length === 0 ? (
              <View style={{ alignItems: "center", padding: 20 }}>
                <Ionicons name="bed-outline" size={40} color="#ccc" />
                <Text style={{ color: "#999", marginTop: 8 }}>No vacant seats available</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
                {vacantSeats.map(seat => (
                  <TouchableOpacity
                    key={seat._id}
                    style={styles.seatOption}
                    onPress={() => approveWithSeat(seat)}
                    disabled={approving}
                  >
                    <Ionicons name="bed-outline" size={18} color="#185FA5" />
                    <Text style={styles.seatOptionText}>
                      {seat.hallName} · Room {seat.roomNumber} · Seat {seat.seatNumber}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#aaa" />
                  </TouchableOpacity>
                ))}
                {approving && <ActivityIndicator color="#185FA5" style={{ marginTop: 10 }} />}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "#2c3e50", paddingHorizontal: 20, paddingTop: 55, paddingBottom: 16 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  title: { color: "#fff", fontSize: 20, fontWeight: "600" },

  filterRow: { flexDirection: "row", gap: 8, padding: 12, backgroundColor: "#fff", borderBottomWidth: 0.5, borderBottomColor: "#e0e0e0" },
  filterTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: "#e0e0e0", backgroundColor: "#f9f9f9" },
  filterTabActive: { backgroundColor: "#E6F1FB", borderColor: "#85B7EB" },
  filterTabText: { fontSize: 13, color: "#888" },
  filterTabTextActive: { color: "#0C447C", fontWeight: "600" },

  card: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 0.5, borderColor: "#e0e0e0", padding: 14, marginBottom: 10 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "500" },
  payBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  dateText: { fontSize: 12, color: "#aaa", marginLeft: "auto" },

  name: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
  meta: { fontSize: 12, color: "#888", marginTop: 2 },
  seatInfo: { fontSize: 13, color: "#0C5C4B", marginTop: 8, fontWeight: "500" },
  seatInfoPaid: { fontSize: 13, color: "#085041", marginTop: 8, fontWeight: "600", backgroundColor: "#E8F8F5", padding: 8, borderRadius: 6 },
  statusMsg: { fontSize: 12, color: "#9C7A00", marginTop: 8, fontStyle: "italic" },

  actions: { flexDirection: "row", gap: 6, marginTop: 12, flexWrap: "wrap" },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, padding: 9, borderRadius: 10, borderWidth: 0.5, flex: 1, minWidth: 120 },
  actionBtnPrimary: { backgroundColor: "#E1F5EE", borderColor: "#5DCAA5" },
  actionBtnSecondary: { backgroundColor: "#E6F1FB", borderColor: "#85B7EB" },
  actionBtnSuccess: { backgroundColor: "#E1F5EE", borderColor: "#5DCAA5" },
  actionBtnReject: { backgroundColor: "#FCEBEB", borderColor: "#F09595" },
  actionText: { fontSize: 12, fontWeight: "500" },

  emptyBox: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: "#bbb" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 10 },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#1a1a1a" },
  modalSubtitle: { fontSize: 13, color: "#888", marginTop: 4 },

  seatOption: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 14, borderRadius: 12, marginBottom: 8,
    borderWidth: 0.5, borderColor: "#e0e0e0", backgroundColor: "#f9f9f9",
  },
  seatOptionText: { flex: 1, fontSize: 14, color: "#1a1a1a" },
});
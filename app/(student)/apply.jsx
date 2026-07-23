import { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { BASE_URL } from "../../constants/api";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const redirectUrl = Linking.createURL("payment-redirect");

export default function ApplyForHall() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [application, setApplication] = useState(null);
  const [existingSeat, setExistingSeat] = useState(null); // profile-based seat check
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);

  const [form, setForm] = useState({
    studentName: user?.fullName || "",
    studentEmail: user?.email || "",
    studentId: "",
    department: "",
    session: "",
    phone: user?.phone || "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [settingsRes, appRes, profileRes] = await Promise.all([
        fetch(`${BASE_URL}/api/application-settings`),
        fetch(`${BASE_URL}/api/applications/me/${user?.email}`),
        fetch(`${BASE_URL}/api/student/profile/${user?.email}`),
      ]);
      setSettings(await settingsRes.json());
      setApplication(await appRes.json());

      const profile = await profileRes.json();
      // A student who already has a room/seat (whether allocated via an
      // earlier application, or added directly by admin) can't apply again.
      if (profile && profile.roomNumber) {
        setExistingSeat(profile);
      } else {
        setExistingSeat(null);
      }
    } catch {
      Alert.alert("Error", "Could not load application info");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, [user?.email]));

  const submitApplication = async () => {
    if (!form.studentId || !form.department || !form.session) {
      Alert.alert("Error", "Student ID, Department and Session are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, uid: user?.uid }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", data.message || "Could not submit application");
        return;
      }
      Alert.alert("Submitted", "Your application was submitted. Please pay the fee to continue.");
      load();
    } catch {
      Alert.alert("Error", "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const payFee = async () => {
    setPaying(true);
    try {
      const res = await fetch(`${BASE_URL}/api/payments/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application._id,
          amount: application.fee,
          studentEmail: user?.email,
          successUrl: redirectUrl,
          cancelUrl: redirectUrl,
        }),
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
        Alert.alert("Payment received", "Your application fee has been paid.");
      }
      load();
    } catch {
      Alert.alert("Error", "Payment could not be started");
    } finally {
      setPaying(false);
    }
  };

  const fields = [
    { key: "studentId",  label: "Student ID *", keyboard: "default" },
    { key: "department", label: "Department *", keyboard: "default" },
    { key: "session",    label: "Session * (e.g. 2024-25)", keyboard: "default" },
    { key: "phone",      label: "Phone", keyboard: "phone-pad" },
  ];

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 60 }} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Hall Seat Application</Text>
        <Text style={styles.subtitle}>
          {existingSeat
            ? "You already have a seat"
            : settings?.isOpen ? "Applications are currently open" : "Applications are currently closed"}
        </Text>
      </View>

      {/* Already has a seat — hide everything else */}
      {existingSeat ? (
        <View style={[styles.statusCard, { backgroundColor: "#E1F5EE", borderColor: "#5DCAA5" }]}>
          <Ionicons name="checkmark-circle-outline" size={22} color="#085041" />
          <Text style={[styles.statusTitle, { color: "#085041" }]}>You already have a hall seat</Text>
          <Text style={styles.statusSub}>
            {existingSeat.hallName} · Room {existingSeat.roomNumber} · Seat {existingSeat.seatNumber}
          </Text>
          <Text style={[styles.statusSub, { marginTop: 8 }]}>
            You don't need to apply again. Contact the hall admin if any of this needs to change.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.windowCard}>
            <Ionicons name="calendar-outline" size={18} color="#185FA5" />
            <Text style={styles.windowText}>
              Window: {formatDate(settings?.startDate)} – {formatDate(settings?.endDate)}
            </Text>
          </View>

          {/* No application yet, or previous one was rejected -> show form */}
          {(!application || application.status === "rejected") && (
            settings?.isOpen ? (
              <View style={styles.form}>
                {application?.status === "rejected" && (
                  <View style={styles.rejectedBox}>
                    <Ionicons name="close-circle-outline" size={16} color="#A32D2D" />
                    <Text style={styles.rejectedText}>
                      Your previous application was rejected{application.rejectionReason ? `: ${application.rejectionReason}` : "."} You can apply again below.
                    </Text>
                  </View>
                )}
                {fields.map(f => (
                  <View key={f.key} style={styles.fieldWrap}>
                    <Text style={styles.fieldLabel}>{f.label}</Text>
                    <TextInput
                      style={styles.input}
                      value={form[f.key]}
                      onChangeText={val => setForm(prev => ({ ...prev, [f.key]: val }))}
                      placeholder={f.label.replace(" *", "")}
                      placeholderTextColor="#ccc"
                      keyboardType={f.keyboard}
                    />
                  </View>
                ))}
                <Text style={styles.feeNote}>Application fee: ৳{settings?.fee || 0}</Text>
                <TouchableOpacity
                  style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                  onPress={submitApplication}
                  disabled={submitting}
                >
                  {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Application</Text>}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.closedBox}>
                <Ionicons name="lock-closed-outline" size={40} color="#ccc" />
                <Text style={styles.closedText}>Applications aren't open right now</Text>
              </View>
            )
          )}

          {/* Pending, unpaid -> ask for payment */}
          {application?.status === "pending" && application.paymentStatus !== "paid" && (
            <View style={styles.statusCard}>
              <Ionicons name="time-outline" size={22} color="#633806" />
              <Text style={styles.statusTitle}>Application submitted</Text>
              <Text style={styles.statusSub}>Pay the application fee to send this for admin review.</Text>
              <Text style={styles.statusSub}>You can also check "Payments" for this fee's due/paid status.</Text>
              <TouchableOpacity
                style={[styles.payBtn, paying && { opacity: 0.7 }]}
                onPress={payFee}
                disabled={paying}
              >
                {paying ? <ActivityIndicator color="#fff" /> : <Text style={styles.payBtnText}>Pay ৳{application.fee} with Stripe</Text>}
              </TouchableOpacity>
            </View>
          )}

          {/* Pending, paid -> waiting on admin */}
          {application?.status === "pending" && application.paymentStatus === "paid" && (
            <View style={styles.statusCard}>
              <Ionicons name="hourglass-outline" size={22} color="#185FA5" />
              <Text style={styles.statusTitle}>Awaiting admin approval</Text>
              <Text style={styles.statusSub}>Your fee has been received. You'll be notified once a seat is allocated.</Text>
            </View>
          )}

          {/* Approved */}
          {application?.status === "approved" && (
            <View style={[styles.statusCard, { backgroundColor: "#E1F5EE", borderColor: "#5DCAA5" }]}>
              <Ionicons name="checkmark-circle-outline" size={22} color="#085041" />
              <Text style={[styles.statusTitle, { color: "#085041" }]}>Seat allocated!</Text>
              <Text style={styles.statusSub}>
                {application.hallName} · Room {application.roomNumber} · Seat {application.seatNumber}
              </Text>
            </View>
          )}
        </>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "#2c3e50", paddingHorizontal: 20, paddingTop: 55, paddingBottom: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  title: { color: "#fff", fontSize: 22, fontWeight: "600" },
  subtitle: { color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 4 },

  windowCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#fff", margin: 16, marginBottom: 4, padding: 12,
    borderRadius: 10, borderWidth: 0.5, borderColor: "#e0e0e0",
  },
  windowText: { fontSize: 13, color: "#555" },

  form: { padding: 16 },
  fieldWrap: { marginBottom: 12 },
  fieldLabel: { fontSize: 13, color: "#555", marginBottom: 5, fontWeight: "500" },
  input: {
    backgroundColor: "#fff", borderRadius: 10,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    padding: 13, fontSize: 14, color: "#333",
  },
  feeNote: { fontSize: 13, color: "#888", marginBottom: 14, marginTop: 4 },
  submitBtn: { backgroundColor: "#185FA5", padding: 16, borderRadius: 12, alignItems: "center" },
  submitText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  rejectedBox: {
    flexDirection: "row", gap: 8, backgroundColor: "#FCEBEB",
    borderWidth: 0.5, borderColor: "#F09595", borderRadius: 10,
    padding: 12, marginBottom: 16,
  },
  rejectedText: { fontSize: 13, color: "#A32D2D", flex: 1, lineHeight: 18 },

  closedBox: { alignItems: "center", marginTop: 60, gap: 10, paddingHorizontal: 30 },
  closedText: { fontSize: 15, color: "#bbb", textAlign: "center" },

  statusCard: {
    margin: 16, padding: 18, borderRadius: 14,
    backgroundColor: "#FAEEDA", borderWidth: 0.5, borderColor: "#EF9F27",
    alignItems: "center", gap: 6,
  },
  statusTitle: { fontSize: 16, fontWeight: "600", color: "#633806", marginTop: 4 },
  statusSub: { fontSize: 13, color: "#666", textAlign: "center", lineHeight: 18 },
  payBtn: { backgroundColor: "#635BFF", padding: 14, borderRadius: 12, marginTop: 10, alignSelf: "stretch", alignItems: "center" },
  payBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`${BASE_URL}/api/student/profile/${user?.email}`)
      .then(res => res.json())
      .then(data => { setProfile(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2e86de" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>আমার Profile</Text>
      </View>

      <View style={styles.card}>
        {[
          { label: "নাম", value: profile?.name },
          { label: "Email", value: profile?.email },
          { label: "Student ID", value: profile?.studentId },
          { label: "Department", value: profile?.department },
          { label: "Session", value: profile?.session },
          { label: "Phone", value: profile?.phone },
          { label: "Hall", value: profile?.hallName },
          { label: "Room", value: profile?.roomNumber },
          { label: "Seat", value: profile?.seatNumber },
        ].map((item, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value || "—"}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { backgroundColor: "#2e86de", padding: 20, paddingTop: 50 },
  backBtn: { marginBottom: 8 },
  backText: { color: "#fff", fontSize: 16 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  card: { margin: 16, backgroundColor: "#fff", borderRadius: 12, padding: 16, elevation: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  label: { color: "#666", fontSize: 15 },
  value: { color: "#222", fontSize: 15, fontWeight: "600" },
});
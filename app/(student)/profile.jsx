import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const sections = [
    {
      title: "Personal Info",
      icon: "person-outline",
      color: "#E6F1FB", iconColor: "#185FA5",
      fields: [
        { label: "Full Name",   value: profile?.name,       icon: "person-outline" },
        { label: "Email",       value: profile?.email,      icon: "mail-outline" },
        { label: "Phone",       value: profile?.phone,      icon: "call-outline" },
      ]
    },
    {
      title: "Academic Info",
      icon: "school-outline",
      color: "#E1F5EE", iconColor: "#0F6E56",
      fields: [
        { label: "Student ID",  value: profile?.studentId,  icon: "card-outline" },
        { label: "Department",  value: profile?.department, icon: "school-outline" },
        { label: "Session",     value: profile?.session,    icon: "calendar-outline" },
      ]
    },
    {
      title: "Hall Info",
      icon: "business-outline",
      color: "#FAEEDA", iconColor: "#854F0B",
      fields: [
        { label: "Hall Name",   value: profile?.hallName,   icon: "business-outline" },
        { label: "Room Number", value: profile?.roomNumber, icon: "grid-outline" },
        { label: "Seat Number", value: profile?.seatNumber, icon: "checkmark-circle-outline" },
      ]
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Profile</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 40 }} />
      ) : profile?.message ? (
        <View style={styles.emptyBox}>
          <Ionicons name="person-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Profile not found</Text>
          <Text style={styles.emptySubText}>Ask admin to add your student record</Text>
        </View>
      ) : (
        <View style={styles.content}>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(profile?.name || "")}</Text>
            </View>
            <Text style={styles.avatarName}>{profile?.name}</Text>
            <Text style={styles.avatarDept}>{profile?.department} · {profile?.session}</Text>
          </View>

          {sections.map((section, si) => (
            <View key={si} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: section.color }]}>
                  <Ionicons name={section.icon} size={16} color={section.iconColor} />
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              {section.fields.map((field, fi) => (
                <View key={fi} style={[styles.row, fi === section.fields.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={styles.rowLeft}>
                    <Ionicons name={field.icon} size={16} color="#aaa" />
                    <Text style={styles.label}>{field.label}</Text>
                  </View>
                  <Text style={styles.value}>{field.value || "—"}</Text>
                </View>
              ))}
            </View>
          ))}

        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "purple", paddingHorizontal: 20, paddingTop: 55, paddingBottom: 16 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "white", fontSize: 13 },
  title: { color: "#fff", fontSize: 20, fontWeight: "600" },

  content: { padding: 16 },
  avatarSection: { alignItems: "center", marginBottom: 20 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#E6F1FB", alignItems: "center", justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: { fontSize: 26, fontWeight: "600", color: "#0C447C" },
  avatarName: { fontSize: 18, fontWeight: "600", color: "#1a1a1a" },
  avatarDept: { fontSize: 13, color: "#888", marginTop: 4 },

  section: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    padding: 14, marginBottom: 12,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: "#555" },

  row: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: "#f0f0f0",
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 14, color: "#666" },
  value: { fontSize: 14, color: "#1a1a1a", fontWeight: "500", maxWidth: "55%", textAlign: "right" },

  emptyBox: { alignItems: "center", marginTop: 80, gap: 8 },
  emptyText: { fontSize: 16, color: "#bbb" },
  emptySubText: { fontSize: 13, color: "#ccc" },
});
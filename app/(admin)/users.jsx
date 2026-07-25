import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Alert, Modal, ScrollView
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const roles = [
  { key: "student",         label: "Student",         icon: "school-outline",    color: "#E6F1FB", iconColor: "#185FA5" },
  { key: "accountant",      label: "Accountant",      icon: "wallet-outline",    color: "#E1F5EE", iconColor: "#0F6E56" },
  { key: "canteen_manager", label: "Canteen Manager", icon: "restaurant-outline",color: "#E6F1FB", iconColor: "#185FA5" },
  { key: "hall_rep",        label: "Hall Rep",        icon: "calendar-outline",  color: "#E1F5EE", iconColor: "#0F6E56" },
];

const roleConfig = {
  student:         { label: "Student",         bg: "#E6F1FB", text: "#0C447C" },
  admin:           { label: "Admin",           bg: "#FAEEDA", text: "#633806" },
  accountant:      { label: "Accountant",      bg: "#E1F5EE", text: "#085041" },
  canteen_manager: { label: "Canteen Manager", bg: "#E6F1FB", text: "#0C447C" },
  hall_rep:        { label: "Hall Rep",        bg: "#E1F5EE", text: "#085041" },
};

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleModal, setRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const fetchUsers = () => {
    setLoading(true);
    fetch(`${BASE_URL}/api/admin/users`)
      .then(res => res.json())
      .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setRoleModal(true);
  };

  const updateRole = async (newRole) => {
    if (selectedUser.role === newRole) {
      setRoleModal(false); return;
    }
    if (selectedUser._id === currentUser?.id) {
      Alert.alert("Error", "You cannot change your own role");
      return;
    }
    setUpdating(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/users/${selectedUser._id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        Alert.alert("Success", `Role updated to ${roleConfig[newRole]?.label}`);
        setRoleModal(false);
        fetchUsers();
      } else {
        Alert.alert("Error", "Failed to update role");
      }
    } catch { Alert.alert("Error", "Network error"); }
    finally { setUpdating(false); }
  };

  const deleteUser = (id, name) => {
    if (id === currentUser?.id) {
      Alert.alert("Error", "You cannot delete your own account");
      return;
    }
    Alert.alert("Delete User", `Delete "${name}"? This cannot be undone.`, [
      { text: "Cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          await fetch(`${BASE_URL}/api/admin/users/${id}`, { method: "DELETE" });
          fetchUsers();
        }
      }
    ]);
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const avatarColors = [
    { bg: "#E6F1FB", text: "#0C447C" },
    { bg: "#E1F5EE", text: "#085041" },
    { bg: "#FAEEDA", text: "#633806" },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>User Management</Text>
          {!loading && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{users.length} users</Text>
            </View>
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const color = avatarColors[index % 3];
            const rc = roleConfig[item.role] || roleConfig.student;
            const isCurrentUser = item._id === currentUser?.id;
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={[styles.avatar, { backgroundColor: color.bg }]}>
                    <Text style={[styles.avatarText, { color: color.text }]}>
                      {getInitials(item.fullName || "")}
                    </Text>
                  </View>

                  <View style={styles.info}>
                    <View style={styles.nameRow}>
                      <Text style={styles.userName}>{item.fullName}</Text>
                      {isCurrentUser && (
                        <View style={styles.youBadge}>
                          <Text style={styles.youText}>You</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <Text style={styles.joinDate}>Joined {formatDate(item.createdAt)}</Text>
                  </View>
                </View>

                <View style={styles.cardBottom}>
                  <View style={[styles.roleBadge, { backgroundColor: rc.bg }]}>
                    <Text style={[styles.roleText, { color: rc.text }]}>{rc.label}</Text>
                  </View>

                  {!isCurrentUser && (
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.editRoleBtn}
                        onPress={() => openRoleModal(item)}
                      >
                        <Ionicons name="shield-outline" size={14} color="#0C447C" />
                        <Text style={styles.editRoleText}>Change Role</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => deleteUser(item._id, item.fullName)}
                      >
                        <Ionicons name="trash-outline" size={15} color="#A32D2D" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Role Selection Modal */}
      <Modal visible={roleModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Change Role</Text>
                <Text style={styles.modalSub}>{selectedUser?.fullName}</Text>
              </View>
              <TouchableOpacity onPress={() => setRoleModal(false)}>
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            <Text style={styles.currentRoleLabel}>
              Current: <Text style={{ fontWeight: "600", color: "#1a1a1a" }}>
                {roleConfig[selectedUser?.role]?.label}
              </Text>
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {roles.map(r => {
                const isSelected = selectedUser?.role === r.key;
                return (
                  <TouchableOpacity
                    key={r.key}
                    style={[styles.roleOption, isSelected && styles.roleOptionSelected]}
                    onPress={() => updateRole(r.key)}
                    disabled={updating}
                  >
                    <View style={[styles.roleOptionIcon, { backgroundColor: r.color }]}>
                      <Ionicons name={r.icon} size={20} color={r.iconColor} />
                    </View>
                    <Text style={[styles.roleOptionLabel, isSelected && { color: "#185FA5", fontWeight: "600" }]}>
                      {r.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color="#185FA5" />
                    )}
                  </TouchableOpacity>
                );
              })}

              {updating && (
                <ActivityIndicator color="#185FA5" style={{ marginTop: 12 }} />
              )}
            </ScrollView>
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
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#fff", fontSize: 20, fontWeight: "600" },
  countBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  countText: { color: "#fff", fontSize: 12 },

  card: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    padding: 14, marginBottom: 10,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText: { fontSize: 15, fontWeight: "600" },
  info: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  userName: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
  youBadge: {
    backgroundColor: "#E6F1FB", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10,
  },
  youText: { fontSize: 10, color: "#0C447C", fontWeight: "600" },
  userEmail: { fontSize: 12, color: "#888", marginTop: 2 },
  joinDate: { fontSize: 11, color: "#bbb", marginTop: 2 },

  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 12, fontWeight: "500" },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  editRoleBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#E6F1FB", borderWidth: 0.5, borderColor: "#85B7EB",
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  editRoleText: { fontSize: 12, color: "#0C447C", fontWeight: "500" },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: "#FCEBEB", borderWidth: 0.5, borderColor: "#F09595",
    alignItems: "center", justifyContent: "center",
  },

  emptyBox: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: "#bbb" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "70%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#1a1a1a" },
  modalSub: { fontSize: 13, color: "#888", marginTop: 2 },
  currentRoleLabel: { fontSize: 13, color: "#888", marginBottom: 14 },

  roleOption: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 12, marginBottom: 8,
    borderWidth: 0.5, borderColor: "#e0e0e0", backgroundColor: "#f9f9f9",
  },
  roleOptionSelected: { borderColor: "#185FA5", backgroundColor: "#E6F1FB" },
  roleOptionIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  roleOptionLabel: { flex: 1, fontSize: 15, color: "#1a1a1a" },
});
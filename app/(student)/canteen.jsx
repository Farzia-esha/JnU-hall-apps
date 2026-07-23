import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Modal, TextInput, Alert,
  KeyboardAvoidingView, Platform
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const mealSections = [
  { key: "breakfast", label: "Breakfast", icon: "sunny-outline",      color: "#E6F1FB", iconColor: "#185FA5" },
  { key: "lunch",     label: "Lunch",     icon: "restaurant-outline",  color: "#E1F5EE", iconColor: "#0F6E56" },
  { key: "dinner",    label: "Dinner",    icon: "moon-outline",        color: "#FAEEDA", iconColor: "#854F0B" },
];

const MealSection = ({ section, items }) => (
  <View style={[styles.section, { borderLeftColor: section.iconColor }]}>
    <View style={styles.mealHeader}>
      <View style={[styles.mealIcon, { backgroundColor: section.color }]}>
        <Ionicons name={section.icon} size={18} color={section.iconColor} />
      </View>
      <Text style={[styles.mealTitle, { color: section.iconColor }]}>{section.label}</Text>
      <View style={styles.countPill}>
        <Text style={styles.countPillText}>{items?.length || 0} items</Text>
      </View>
    </View>
    {items?.length > 0 ? items.map((item, i) => (
      <View key={i} style={styles.menuRow}>
        <Text style={styles.menuItem}>{item.name}</Text>
        <Text style={styles.menuPrice}>৳{item.price}</Text>
      </View>
    )) : (
      <Text style={styles.noItem}>Not available today</Text>
    )}
  </View>
);

export default function StudentCanteen() {
  const { user } = useAuth();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch(`${BASE_URL}/api/canteen/menu/today`)
      .then(res => res.json())
      .then(data => { setMenu(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const submitFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert("Error", "Please write your feedback");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/canteen/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback: feedbackText.trim(),
          studentName: user?.fullName,
          studentEmail: user?.email,
        }),
      });
      if (res.ok) {
        Alert.alert("Thank you!", "Your feedback has been submitted");
        setFeedbackModal(false);
        setFeedbackText("");
      } else {
        Alert.alert("Error", "Failed to submit feedback");
      }
    } catch { Alert.alert("Error", "Network error"); }
    finally { setSubmitting(false); }
  };

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long"
  });

  const totalItems = menu
    ? (menu.breakfast?.length || 0) + (menu.lunch?.length || 0) + (menu.dinner?.length || 0)
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Today's Menu</Text>
          <Text style={styles.date}>{today}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 40 }} />
        ) : menu?.message ? (
          <View style={styles.emptyBox}>
            <Ionicons name="restaurant-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Menu not posted yet</Text>
            <Text style={styles.emptySubText}>Check back later</Text>
          </View>
        ) : (
          <View style={styles.content}>

            {/* Summary */}
            <View style={styles.summaryCard}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#0F6E56" />
              <Text style={styles.summaryText}>{totalItems} items available today</Text>
            </View>

            {mealSections.map(s => (
              <MealSection key={s.key} section={s} items={menu?.[s.key]} />
            ))}

          </View>
        )}

        {/* Feedback Button */}
        <TouchableOpacity
          style={styles.feedbackBtn}
          onPress={() => setFeedbackModal(true)}
        >
          {/* <Ionicons name="chatbubble-outline" size={18} color="#0F6E56" /> */}
          <Text style={styles.feedbackBtnText}>Give Feedback on Today's Food</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Feedback Modal */}
      <Modal visible={feedbackModal} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.overlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Canteen Feedback</Text>
                <TouchableOpacity onPress={() => setFeedbackModal(false)}>
                  <Ionicons name="close" size={22} color="#555" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Share your thoughts about today's food
              </Text>

              <Text style={styles.fieldLabel}>Your Feedback</Text>
              <TextInput
                style={styles.feedbackInput}
                placeholder="e.g. Food was great today! The chicken curry was delicious..."
                placeholderTextColor="#ccc"
                value={feedbackText}
                onChangeText={setFeedbackText}
                multiline
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.charCount}>{feedbackText.length}/500</Text>

              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                onPress={submitFeedback}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="send-outline" size={16} color="#fff" />
                    <Text style={styles.submitText}>Submit Feedback</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setFeedbackModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "#2c3e50", paddingHorizontal: 20, paddingTop: 55, paddingBottom: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  title: { color: "#fff", fontSize: 20, fontWeight: "600" },
  date: { color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 },

  content: { padding: 16 },
  summaryCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#E1F5EE", borderRadius: 10, padding: 12, marginBottom: 14,
    borderWidth: 0.5, borderColor: "#5DCAA5",
  },
  summaryText: { fontSize: 13, color: "#085041", fontWeight: "500" },

  section: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    padding: 14, marginBottom: 12, borderLeftWidth: 3,
  },
  mealHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  mealIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  mealTitle: { fontSize: 15, fontWeight: "600", flex: 1 },
  countPill: {
    backgroundColor: "#f5f6fa", borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 0.5, borderColor: "#e0e0e0",
  },
  countPillText: { fontSize: 11, color: "#888" },
  menuRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: "#f0f0f0",
  },
  menuItem: { fontSize: 14, color: "#333" },
  menuPrice: { fontSize: 14, color: "#185FA5", fontWeight: "600" },
  noItem: { fontSize: 13, color: "#bbb" },

  feedbackBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#0F6E56", borderWidth: 0.5, borderColor: "#5DCAA5",
    borderRadius: 12, margin: 16, padding: 14,
  },
  feedbackBtnText: { fontSize: 14, color: "white", fontWeight: "500" },

  emptyBox: { alignItems: "center", marginTop: 80, gap: 8 },
  emptyText: { fontSize: 16, color: "#bbb" },
  emptySubText: { fontSize: 13, color: "#ccc" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#1a1a1a" },
  modalSubtitle: { fontSize: 13, color: "#888", marginBottom: 16 },
  fieldLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  feedbackInput: {
    backgroundColor: "#f9f9f9", borderRadius: 10,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    padding: 12, fontSize: 14, color: "#333",
    height: 120, marginBottom: 4,
  },
  charCount: { fontSize: 11, color: "#bbb", textAlign: "right", marginBottom: 14 },
  submitBtn: {
    backgroundColor: "#0F6E56", padding: 15, borderRadius: 12,
    alignItems: "center", flexDirection: "row", justifyContent: "center",
    gap: 8,
  },
  submitText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  cancelBtn: { alignItems: "center", paddingVertical: 14 },
  cancelText: { color: "#888", fontSize: 14 },
});
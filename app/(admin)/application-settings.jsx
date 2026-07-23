import { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, Alert, Switch, Platform
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BASE_URL } from "../../constants/api";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";


export default function ApplicationSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [fee, setFee] = useState("500");
  const [mode, setMode] = useState("auto"); // "auto" | "manual"
  const [manualOpen, setManualOpen] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/application-settings`);
      const data = await res.json();
      if (data.startDate) setStartDate(new Date(data.startDate));
      if (data.endDate) setEndDate(new Date(data.endDate));
      setFee(String(data.fee ?? 500));
      setMode(data.mode || "auto");
      setManualOpen(!!data.manualOpen);
    } catch {
      Alert.alert("Error", "Could not load settings");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/application-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate, endDate, fee: Number(fee), mode, manualOpen,
        }),
      });
      if (res.ok) {
        Alert.alert("Saved", "Application window settings updated");
      } else {
        Alert.alert("Error", "Could not save settings");
      }
    } catch {
      Alert.alert("Error", "Network error");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 60 }} /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Application Settings</Text>
        <Text style={styles.subtitle}>Control when students can apply for a hall seat</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>APPLICATION WINDOW (DEFAULT)</Text>

        <Text style={styles.fieldLabel}>Start date</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowStartPicker(true)}>
          <Ionicons name="calendar-outline" size={16} color="#185FA5" />
          <Text style={styles.dateBtnText}>{formatDate(startDate)}</Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(e, d) => { setShowStartPicker(false); if (d) setStartDate(d); }}
          />
        )}

        <Text style={[styles.fieldLabel, { marginTop: 12 }]}>End date</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowEndPicker(true)}>
          <Ionicons name="calendar-outline" size={16} color="#185FA5" />
          <Text style={styles.dateBtnText}>{formatDate(endDate)}</Text>
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(e, d) => { setShowEndPicker(false); if (d) setEndDate(d); }}
          />
        )}

        <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Application fee (৳)</Text>
        <TextInput
          style={styles.input}
          value={fee}
          onChangeText={setFee}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>MANUAL OVERRIDE</Text>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Override the dates above</Text>
            <Text style={styles.switchSub}>When on, the toggle below controls open/closed instead of the dates.</Text>
          </View>
          <Switch
            value={mode === "manual"}
            onValueChange={(v) => setMode(v ? "manual" : "auto")}
          />
        </View>

        {mode === "manual" && (
          <View style={[styles.switchRow, { marginTop: 4 }]}>
            <Text style={styles.switchLabel}>Applications open</Text>
            <Switch value={manualOpen} onValueChange={setManualOpen} />
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.7 }]}
        onPress={save}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Settings</Text>}
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "#2c3e50", paddingHorizontal: 20, paddingTop: 55, paddingBottom: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  title: { color: "#fff", fontSize: 20, fontWeight: "600" },
  subtitle: { color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 4 },

  section: { backgroundColor: "#fff", margin: 16, marginBottom: 0, borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: "#e0e0e0" },
  sectionLabel: { fontSize: 11, fontWeight: "600", color: "#999", letterSpacing: 1, marginBottom: 12 },
  fieldLabel: { fontSize: 12, color: "#888", marginBottom: 6 },
  dateBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#f9f9f9", borderRadius: 10, borderWidth: 0.5, borderColor: "#e0e0e0", padding: 12 },
  dateBtnText: { fontSize: 14, color: "#333" },
  input: { backgroundColor: "#f9f9f9", borderRadius: 10, borderWidth: 0.5, borderColor: "#e0e0e0", padding: 12, fontSize: 14, color: "#333" },

  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  switchLabel: { fontSize: 14, color: "#333", fontWeight: "500" },
  switchSub: { fontSize: 12, color: "#999", marginTop: 2 },

  saveBtn: { backgroundColor: "#185FA5", margin: 16, padding: 16, borderRadius: 12, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
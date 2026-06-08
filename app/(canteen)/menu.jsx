import React, { useState, useEffect, memo } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const mealConfig = [
  { key: "breakfast", label: "Breakfast", icon: "sunny-outline",      color: "#E6F1FB", iconColor: "#185FA5", borderColor: "#185FA5" },
  { key: "lunch",     label: "Lunch",     icon: "restaurant-outline",  color: "#E1F5EE", iconColor: "#0F6E56", borderColor: "#0F6E56" },
  { key: "dinner",    label: "Dinner",    icon: "moon-outline",        color: "#FAEEDA", iconColor: "#854F0B", borderColor: "#854F0B" },
];

const MealInput = memo(({ config, list, updateItem, addItem, removeItem }) => (
  <View style={[styles.section, { borderLeftColor: config.borderColor }]}>
    <View style={styles.mealHeader}>
      <View style={[styles.mealIconWrap, { backgroundColor: config.color }]}>
        <Ionicons name={config.icon} size={18} color={config.iconColor} />
      </View>
      <Text style={[styles.mealTitle, { color: config.iconColor }]}>{config.label}</Text>
    </View>

    {list.map((item, i) => (
      <View key={i} style={styles.itemRow}>
        <TextInput
          placeholder="Item name"
          placeholderTextColor="#ccc"
          style={[styles.input, { flex: 2 }]}
          value={item.name}
          onChangeText={v => updateItem(i, "name", v)}
          returnKeyType="next"
        />
        <TextInput
          placeholder="Price"
          placeholderTextColor="#ccc"
          style={[styles.input, { flex: 1, marginLeft: 8 }]}
          value={String(item.price ?? "")}
          keyboardType="numeric"
          onChangeText={v => updateItem(i, "price", v)}
          returnKeyType="done"
        />
        {list.length > 1 && (
          <TouchableOpacity onPress={() => removeItem(i)} style={styles.removeBtn}>
            <Ionicons name="close-circle" size={20} color="#F09595" />
          </TouchableOpacity>
        )}
      </View>
    ))}

    <TouchableOpacity onPress={addItem} style={styles.addItemBtn}>
      <Ionicons name="add-circle-outline" size={16} color={config.iconColor} />
      <Text style={[styles.addItemText, { color: config.iconColor }]}>Add Item</Text>
    </TouchableOpacity>
  </View>
));

const today = new Date().toISOString().split("T")[0];

const emptyMeals = {
  breakfast: [{ name: "", price: "" }],
  lunch:     [{ name: "", price: "" }],
  dinner:    [{ name: "", price: "" }],
};

const menuToForm = (menu) => ({
  breakfast: menu.breakfast?.length ? menu.breakfast.map(i => ({ name: i.name, price: String(i.price) })) : [{ name: "", price: "" }],
  lunch:     menu.lunch?.length     ? menu.lunch.map(i => ({ name: i.name, price: String(i.price) }))     : [{ name: "", price: "" }],
  dinner:    menu.dinner?.length    ? menu.dinner.map(i => ({ name: i.name, price: String(i.price) }))    : [{ name: "", price: "" }],
});

export default function CanteenMenu() {
  const [date, setDate] = useState(today);
  const [meals, setMeals] = useState(emptyMeals);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // আজকের menu আছে কিনা
  const router = useRouter();

  // Page load হলে আজকের menu fetch করো
  useEffect(() => {
    fetchTodayMenu();
  }, []);

  const fetchTodayMenu = async () => {
    setFetching(true);
    try {
      const res = await fetch(`${BASE_URL}/api/canteen/menu/today`);
      const data = await res.json();

      if (data && !data.message) {
        // আজকের menu আছে — form-এ বসিয়ে দাও
        setMeals(menuToForm(data));
        setIsEditing(true);
      } else {
        // নেই — empty form
        setMeals(emptyMeals);
        setIsEditing(false);
      }
    } catch {
      setMeals(emptyMeals);
      setIsEditing(false);
    } finally {
      setFetching(false);
    }
  };

  const updateItem = (mealKey, index, field, value) => {
    setMeals(prev => {
      const updated = [...prev[mealKey]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [mealKey]: updated };
    });
  };

  const addItem = (mealKey) => {
    setMeals(prev => ({ ...prev, [mealKey]: [...prev[mealKey], { name: "", price: "" }] }));
  };

  const removeItem = (mealKey, index) => {
    setMeals(prev => ({ ...prev, [mealKey]: prev[mealKey].filter((_, i) => i !== index) }));
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      const formatItems = (list) =>
        list.filter(i => i.name.trim()).map(i => ({ name: i.name, price: Number(i.price) || 0 }));

      const res = await fetch(`${BASE_URL}/api/canteen/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          breakfast: formatItems(meals.breakfast),
          lunch:     formatItems(meals.lunch),
          dinner:    formatItems(meals.dinner),
        }),
      });
      const data = await res.json();
      Alert.alert(
        "Success",
        data.message,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert("Error", "Post failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              {isEditing ? "Edit Today's Menu" : "Post Menu"}
            </Text>
            <Text style={styles.subtitle}>
              {isEditing ? "Update today's canteen menu" : "Upload today's canteen menu"}
            </Text>
          </View>

          {fetching ? (
            <ActivityIndicator size="large" color="#185FA5" style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.content}>

              {/* Edit mode banner */}
              {isEditing && (
                <View style={styles.editBanner}>
                  <Ionicons name="information-circle-outline" size={18} color="#0C447C" />
                  <Text style={styles.editBannerText}>
                    Today's menu already exists — saving will update it
                  </Text>
                </View>
              )}

              {/* Date */}
              <Text style={styles.fieldLabel}>Date</Text>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={18} color="#185FA5" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.dateInput}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#ccc"
                />
              </View>

              {/* Meal Inputs */}
              {mealConfig.map(config => (
                <MealInput
                  key={config.key}
                  config={config}
                  list={meals[config.key]}
                  updateItem={(i, field, val) => updateItem(config.key, i, field, val)}
                  addItem={() => addItem(config.key)}
                  removeItem={(i) => removeItem(config.key, i)}
                />
              ))}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name={isEditing ? "save-outline" : "cloud-upload-outline"}
                      size={18} color="#fff"
                    />
                    <Text style={styles.submitText}>
                      {isEditing ? "Save Changes" : "Post Menu"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

            </View>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: { backgroundColor: "#2c3e50", paddingHorizontal: 20, paddingTop: 55, paddingBottom: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  title: { color: "#fff", fontSize: 22, fontWeight: "600" },
  subtitle: { color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 },

  content: { padding: 16 },

  editBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#E6F1FB", borderRadius: 10,
    padding: 12, marginBottom: 16,
    borderWidth: 0.5, borderColor: "#85B7EB",
  },
  editBannerText: { fontSize: 13, color: "#0C447C", flex: 1 },

  fieldLabel: { fontSize: 12, color: "#888", marginBottom: 6, fontWeight: "500" },
  dateRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 10,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    paddingHorizontal: 12, marginBottom: 16,
  },
  dateInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: "#333" },

  section: {
    backgroundColor: "#fff", borderRadius: 12,
    padding: 14, marginBottom: 12, borderLeftWidth: 3,
  },
  mealHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  mealIconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  mealTitle: { fontSize: 15, fontWeight: "600" },
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  input: {
    backgroundColor: "#f9f9f9", borderRadius: 8,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    paddingHorizontal: 10, paddingVertical: 10, fontSize: 14, color: "#333",
  },
  removeBtn: { marginLeft: 8, padding: 2 },
  addItemBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  addItemText: { fontSize: 13, fontWeight: "500" },

  submitBtn: {
    backgroundColor: "#185FA5", padding: 16, borderRadius: 12,
    alignItems: "center", flexDirection: "row", justifyContent: "center",
    gap: 8, marginTop: 8,
  },
  submitText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
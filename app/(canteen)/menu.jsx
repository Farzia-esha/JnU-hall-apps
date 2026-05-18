

import React, { useState, memo } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";

/* =========================
   Meal Input Component
========================= */

const MealInput = memo(({
  title,
  list,
  setList,
  color,
  updateItem,
  addItem,
  removeItem,
}) => (
  <View
    style={[
      styles.section,
      { borderLeftColor: color },
    ]}
  >
    <Text
      style={[styles.mealTitle, { color }]}
    >
      {title}
    </Text>

    {list.map((item, i) => (
      <View key={i} style={styles.itemRow}>

        {/* Item Name */}
        <TextInput
          placeholder="Item Name"
          style={[
            styles.input,
            { flex: 2 },
          ]}
          value={item.name}
          onChangeText={(v) =>
            updateItem(
              list,
              setList,
              i,
              "name",
              v
            )
          }
        />

        {/* Price */}
        <TextInput
          placeholder="Price"
          style={[
            styles.input,
            {
              flex: 1,
              marginLeft: 8,
            },
          ]}
          value={item.price}
          keyboardType="numeric"
          onChangeText={(v) =>
            updateItem(
              list,
              setList,
              i,
              "price",
              v
            )
          }
        />

        {/* Remove Button */}
        {list.length > 1 && (
          <TouchableOpacity
            onPress={() =>
              removeItem(
                list,
                setList,
                i
              )
            }
            style={styles.removeBtn}
          >
            <Text style={styles.removeText}>
              ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>
    ))}

    {/* Add Item Button */}
    <TouchableOpacity
      onPress={() =>
        addItem(list, setList)
      }
      style={styles.addItemBtn}
    >
      <Text
        style={[
          styles.addItemText,
          { color },
        ]}
      >
        + Add Item
      </Text>
    </TouchableOpacity>
  </View>
));

/* =========================
   Main Component
========================= */

export default function CanteenMenu() {

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [breakfast, setBreakfast] =
    useState([
      { name: "", price: "" },
    ]);

  const [lunch, setLunch] =
    useState([
      { name: "", price: "" },
    ]);

  const [dinner, setDinner] =
    useState([
      { name: "", price: "" },
    ]);

  const [loading, setLoading] =
    useState(false);

  const router = useRouter();

  /* =========================
     Update Input
  ========================= */

  const updateItem = (
    list,
    setList,
    index,
    field,
    value
  ) => {
    const updated = [...list];

    updated[index][field] = value;

    setList(updated);
  };

  /* =========================
     Add Item
  ========================= */

  const addItem = (
    list,
    setList
  ) => {
    setList([
      ...list,
      {
        name: "",
        price: "",
      },
    ]);
  };

  /* =========================
     Remove Item
  ========================= */

  const removeItem = (
    list,
    setList,
    index
  ) => {
    setList(
      list.filter(
        (_, i) => i !== index
      )
    );
  };

  /* =========================
     Submit Menu
  ========================= */

  const handleSubmit = async () => {

    setLoading(true);

    try {

      const formatItems = (list) =>
        list
          .filter((i) =>
            i.name.trim()
          )
          .map((i) => ({
            name: i.name,
            price:
              Number(i.price) || 0,
          }));

      const res = await fetch(
        `${BASE_URL}/api/canteen/menu`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            date,

            breakfast:
              formatItems(
                breakfast
              ),

            lunch:
              formatItems(
                lunch
              ),

            dinner:
              formatItems(
                dinner
              ),
          }),
        }
      );

      const data =
        await res.json();

      Alert.alert(
        "Success",
        data.message
      );

    } catch {

      Alert.alert(
        "Error",
        "Post failed"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
    >

      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 50,
        }}
      >

        {/* Header */}
        <View style={styles.header}>

          <TouchableOpacity
            onPress={() =>
              router.back()
            }
          >
            <Text style={styles.backText}>
              ← Back
            </Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            🍽️ Post Menu
          </Text>

        </View>

        {/* Content */}
        <View style={styles.content}>

          {/* Date */}
          <Text style={styles.label}>
            Date
          </Text>

          <TextInput
            style={styles.dateInput}
            value={date}
            onChangeText={setDate}
          />

          {/* Breakfast */}
          <MealInput
            title="☀️ সকালের নাস্তা"
            list={breakfast}
            setList={setBreakfast}
            color="#f39c12"
            updateItem={updateItem}
            addItem={addItem}
            removeItem={removeItem}
          />

          {/* Lunch */}
          <MealInput
            title="☀️ দুপুরের খাবার"
            list={lunch}
            setList={setLunch}
            color="#2ecc71"
            updateItem={updateItem}
            addItem={addItem}
            removeItem={removeItem}
          />

          {/* Dinner */}
          <MealInput
            title="🌙 রাতের খাবার"
            list={dinner}
            setList={setDinner}
            color="#8e44ad"
            updateItem={updateItem}
            addItem={addItem}
            removeItem={removeItem}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
          >

            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>
                Post Menu
              </Text>
            )}

          </TouchableOpacity>

        </View>

      </ScrollView>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },

  header: {
    backgroundColor: "#8e44ad",
    padding: 20,
    paddingTop: 50,
  },

  backText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  content: {
    padding: 16,
  },

  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },

  dateInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 16,
    fontSize: 15,
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 2,
  },

  mealTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#eee",
    fontSize: 14,
  },

  removeBtn: {
    marginLeft: 8,
    padding: 6,
  },

  removeText: {
    color: "#e74c3c",
    fontSize: 16,
    fontWeight: "bold",
  },

  addItemBtn: {
    marginTop: 4,
  },

  addItemText: {
    fontSize: 14,
    fontWeight: "600",
  },

  submitBtn: {
    backgroundColor: "#8e44ad",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 40,
  },

  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

});
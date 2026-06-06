// // import { useState } from "react";
// // import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
// // import { BASE_URL } from "../../constants/api";
// // import { useRouter } from "expo-router";

// // export default function AddStudent() {
// //   const router = useRouter();
// //   const [loading, setLoading] = useState(false);
// //   const [form, setForm] = useState({
// //     name: "", email: "", studentId: "", department: "",
// //     session: "", phone: "", hallName: "", roomNumber: "", seatNumber: ""
// //   });

// //   const handleSubmit = async () => {
// //     if (!form.name || !form.email || !form.studentId) {
// //       Alert.alert("Error", "Name, email and Student ID are required"); return;
// //     }
// //     setLoading(true);
// //     try {
// //       const res = await fetch(`${BASE_URL}/api/admin/students`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify(form),
// //       });
// //       if (res.ok) { Alert.alert("Success", "Student added successfully"); router.back(); }
// //     } catch { Alert.alert("Error", "Add failed"); }
// //     finally { setLoading(false); }
// //   };

// //   const fields = [
// //     { key: "name", label: "Name *" },
// //     { key: "email", label: "Email *" },
// //     { key: "studentId", label: "Student ID *" },
// //     { key: "department", label: "Department" },
// //     { key: "session", label: "Session" },
// //     { key: "phone", label: "Phone" },
// //     { key: "hallName", label: "Hall Name" },
// //     { key: "roomNumber", label: "Room Number" },
// //     { key: "seatNumber", label: "Seat Number" },
// //   ];

// //   return (
// //     <ScrollView style={styles.container}>
// //       <View style={styles.header}>
// //         <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
// //         <Text style={styles.title}>➕ Add Student</Text>
// //       </View>
// //       <View style={styles.form}>
// //         {fields.map(f => (
// //           <View key={f.key}>
// //             <Text style={styles.label}>{f.label}</Text>
// //             <TextInput style={styles.input} value={form[f.key]}
// //               onChangeText={val => setForm({ ...form, [f.key]: val })} />
// //           </View>
// //         ))}
// //         <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
// //           {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Student</Text>}
// //         </TouchableOpacity>
// //       </View>
// //     </ScrollView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: "#f5f6fa" },
// //   header: { backgroundColor: "purple", padding: 20, paddingTop: 50 },
// //   backText: { color: "#fff", fontSize: 25, marginBottom: 8 },
// //   title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
// //   form: { padding: 16 },
// //   label: { fontSize: 14, color: "#555", marginBottom: 4, marginTop: 8 },
// //   input: { backgroundColor: "#fff", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#ddd", fontSize: 15 },
// //   btn: { backgroundColor: "purple", padding: 16, borderRadius: 10, alignItems: "center", marginTop: 24, marginBottom: 40 },
// //   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// // });

// import { useState } from "react";
// import {
//   View, Text, StyleSheet, TextInput, TouchableOpacity,
//   ScrollView, Alert, ActivityIndicator
// } from "react-native";
// import { BASE_URL } from "../../constants/api";
// import { useRouter } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";

// export default function AddStudent() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [form, setForm] = useState({
//     name: "", email: "", studentId: "", department: "",
//     session: "", phone: "", hallName: "", roomNumber: "", seatNumber: ""
//   });

//   const handleSubmit = async () => {
//     if (!form.name || !form.email || !form.studentId) {
//       Alert.alert("Error", "Name, email and Student ID are required");
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await fetch(`${BASE_URL}/api/admin/students`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });
//       if (res.ok) {
//         Alert.alert("Success", "Student added successfully");
//         router.back();
//       } else {
//         Alert.alert("Error", "Failed to add student");
//       }
//     } catch {
//       Alert.alert("Error", "Network error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fields = [
//     { key: "name",       label: "Full Name",   required: true,  icon: "person-outline",       keyboard: "default" },
//     { key: "email",      label: "Email",       required: true,  icon: "mail-outline",          keyboard: "email-address" },
//     { key: "studentId",  label: "Student ID",  required: true,  icon: "card-outline",          keyboard: "default" },
//     { key: "department", label: "Department",  required: false, icon: "school-outline",        keyboard: "default" },
//     { key: "session",    label: "Session",     required: false, icon: "calendar-outline",      keyboard: "default" },
//     { key: "phone",      label: "Phone",       required: false, icon: "call-outline",          keyboard: "phone-pad" },
//     { key: "hallName",   label: "Hall Name",   required: false, icon: "business-outline",      keyboard: "default" },
//     { key: "roomNumber", label: "Room Number", required: false, icon: "grid-outline",          keyboard: "default" },
//     { key: "seatNumber", label: "Seat Number", required: false, icon: "checkmark-circle-outline", keyboard: "default" },
//   ];

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
//           <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
//           <Text style={styles.backText}>Back</Text>
//         </TouchableOpacity>
//         <Text style={styles.title}>Add Student</Text>
//         <Text style={styles.subtitle}>Fill in the student details below</Text>
//       </View>

//       <View style={styles.form}>

//         {/* Required section */}
//         <Text style={styles.sectionLabel}>REQUIRED INFO</Text>
//         {fields.filter(f => f.required).map(f => (
//           <View key={f.key} style={styles.fieldWrap}>
//             <Text style={styles.fieldLabel}>{f.label} <Text style={{ color: "#A32D2D" }}>*</Text></Text>
//             <View style={styles.inputRow}>
//               <Ionicons name={f.icon} size={18} color="#185FA5" style={styles.inputIcon} />
//               <TextInput
//                 style={styles.input}
//                 value={form[f.key]}
//                 onChangeText={val => setForm({ ...form, [f.key]: val })}
//                 placeholder={`Enter ${f.label.toLowerCase()}`}
//                 placeholderTextColor="#ccc"
//                 keyboardType={f.keyboard}
//                 autoCapitalize={f.keyboard === "email-address" ? "none" : "sentences"}
//               />
//             </View>
//           </View>
//         ))}

//         {/* Optional section */}
//         <Text style={[styles.sectionLabel, { marginTop: 20 }]}>ROOM & OTHER INFO</Text>
//         {fields.filter(f => !f.required).map(f => (
//           <View key={f.key} style={styles.fieldWrap}>
//             <Text style={styles.fieldLabel}>{f.label}</Text>
//             <View style={styles.inputRow}>
//               <Ionicons name={f.icon} size={18} color="#888" style={styles.inputIcon} />
//               <TextInput
//                 style={styles.input}
//                 value={form[f.key]}
//                 onChangeText={val => setForm({ ...form, [f.key]: val })}
//                 placeholder={`Enter ${f.label.toLowerCase()}`}
//                 placeholderTextColor="#ccc"
//                 keyboardType={f.keyboard}
//               />
//             </View>
//           </View>
//         ))}

//         {/* Submit */}
//         <TouchableOpacity
//           style={[styles.submitBtn, loading && { opacity: 0.7 }]}
//           onPress={handleSubmit}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <>
//               <Ionicons name="person-add-outline" size={18} color="#fff" />
//               <Text style={styles.submitText}>Add Student</Text>
//             </>
//           )}
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
//           <Text style={styles.cancelText}>Cancel</Text>
//         </TouchableOpacity>

//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f5f6fa" },

//   header: { backgroundColor: "#2c3e50", paddingHorizontal: 20, paddingTop: 55, paddingBottom: 20 },
//   backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
//   backText: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
//   title: { color: "#fff", fontSize: 22, fontWeight: "600" },
//   subtitle: { color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 },

//   form: { padding: 16, paddingBottom: 40 },
//   sectionLabel: {
//     fontSize: 11, fontWeight: "600", color: "#999",
//     letterSpacing: 1, marginBottom: 10,
//   },
//   fieldWrap: { marginBottom: 12 },
//   fieldLabel: { fontSize: 13, color: "#555", marginBottom: 5, fontWeight: "500" },
//   inputRow: {
//     flexDirection: "row", alignItems: "center",
//     backgroundColor: "#fff", borderRadius: 10,
//     borderWidth: 0.5, borderColor: "#e0e0e0",
//     paddingHorizontal: 12,
//   },
//   inputIcon: { marginRight: 8 },
//   input: { flex: 1, paddingVertical: 13, fontSize: 14, color: "#333" },

//   submitBtn: {
//     backgroundColor: "#185FA5", padding: 16,
//     borderRadius: 12, alignItems: "center",
//     flexDirection: "row", justifyContent: "center",
//     gap: 8, marginTop: 24,
//   },
//   submitText: { color: "#fff", fontWeight: "600", fontSize: 15 },
//   cancelBtn: { alignItems: "center", paddingVertical: 14 },
//   cancelText: { color: "#888", fontSize: 14 },
// });

import { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard
} from "react-native";
import { BASE_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AddStudent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", studentId: "", department: "",
    session: "", phone: "", hallName: "", roomNumber: "", seatNumber: ""
  });

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!form.name || !form.email || !form.studentId) {
      Alert.alert("Error", "Name, email and Student ID are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        Alert.alert("Success", "Student added successfully");
        router.back();
      } else {
        Alert.alert("Error", "Failed to add student");
      }
    } catch {
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "name",       label: "Full Name",   required: true,  icon: "person-outline",           keyboard: "default" },
    { key: "email",      label: "Email",       required: true,  icon: "mail-outline",              keyboard: "email-address" },
    { key: "studentId",  label: "Student ID",  required: true,  icon: "card-outline",              keyboard: "default" },
    { key: "department", label: "Department",  required: false, icon: "school-outline",            keyboard: "default" },
    { key: "session",    label: "Session",     required: false, icon: "calendar-outline",          keyboard: "default" },
    { key: "phone",      label: "Phone",       required: false, icon: "call-outline",              keyboard: "phone-pad" },
    { key: "hallName",   label: "Hall Name",   required: false, icon: "business-outline",          keyboard: "default" },
    { key: "roomNumber", label: "Room Number", required: false, icon: "grid-outline",              keyboard: "default" },
    { key: "seatNumber", label: "Seat Number", required: false, icon: "checkmark-circle-outline",  keyboard: "default" },
  ];

  const renderField = (f) => (
    <View key={f.key} style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>
        {f.label}
        {f.required && <Text style={{ color: "#A32D2D" }}> *</Text>}
      </Text>
      <View style={styles.inputRow}>
        <Ionicons
          name={f.icon}
          size={18}
          color={f.required ? "#185FA5" : "#aaa"}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          value={form[f.key]}
          onChangeText={val => setForm(prev => ({ ...prev, [f.key]: val }))}
          placeholder={`Enter ${f.label.toLowerCase()}`}
          placeholderTextColor="#ccc"
          keyboardType={f.keyboard}
          autoCapitalize={f.keyboard === "email-address" ? "none" : "words"}
          returnKeyType="next"
          blurOnSubmit={false}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 60 }}
        >

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Add Student</Text>
            <Text style={styles.subtitle}>Fill in the student details below</Text>
          </View>

          <View style={styles.form}>

            {/* Required fields */}
            <Text style={styles.sectionLabel}>REQUIRED INFO</Text>
            {fields.filter(f => f.required).map(renderField)}

            {/* Optional fields */}
            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>ROOM & OTHER INFO</Text>
            {fields.filter(f => !f.required).map(renderField)}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="person-add-outline" size={18} color="#fff" />
                  <Text style={styles.submitText}>Add Student</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

          </View>
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

  form: { padding: 16 },
  sectionLabel: {
    fontSize: 11, fontWeight: "600", color: "#999",
    letterSpacing: 1, marginBottom: 10,
  },
  fieldWrap: { marginBottom: 12 },
  fieldLabel: { fontSize: 13, color: "#555", marginBottom: 5, fontWeight: "500" },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 10,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 13, fontSize: 14, color: "#333" },

  submitBtn: {
    backgroundColor: "#185FA5", padding: 16,
    borderRadius: 12, alignItems: "center",
    flexDirection: "row", justifyContent: "center",
    gap: 8, marginTop: 24,
  },
  submitText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  cancelBtn: { alignItems: "center", paddingVertical: 14 },
  cancelText: { color: "#888", fontSize: 14 },
});
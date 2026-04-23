// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { router } from 'expo-router';

// export default function Dashboard() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Dashboard</Text>

//       <TouchableOpacity style={styles.card}>
//         <Text>📢 Notices</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.card}>
//         <Text>🛠 Complaints</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.card}>
//         <Text>💰 Payment</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.logout}
//         onPress={() => router.replace('/login')}
//       >
//         <Text style={{color:'#fff'}}>Logout</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container:{ flex:1, padding:20 },
//   title:{ fontSize:24, marginBottom:20 },
//   card:{ padding:20, backgroundColor:'#eee', marginBottom:10 },
//   logout:{ backgroundColor:'red', padding:15, marginTop:20, alignItems:'center' }
// });


import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function Dashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <TouchableOpacity style={styles.card}>
        <Text>📢 Notices</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text>🛠 Complaints</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text>💰 Payment</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logout}
        onPress={() => router.replace("/login")}
      >
        <Text style={{ color: "#fff" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  card: { padding: 20, backgroundColor: "#eee", marginBottom: 10 },
  logout: {
    backgroundColor: "red",
    padding: 15,
    marginTop: 20,
    alignItems: "center",
  },
});
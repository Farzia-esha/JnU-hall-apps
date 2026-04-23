
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>

      {/* TITLE */}
      <Text
        style={{
          fontSize: 40,
          fontWeight: "bold",
          color: "#2e86de",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        Welcome to{"\n"}NFC Hall
      </Text>

      {/* IMAGE */}
      <Image
        source={require("./../assets/images/logo.jpg")}
        style={{
          width: 200,
          height: 200,
          marginBottom: 20,
          borderRadius: 100,
        }}
      />

      <Link href="/login" asChild>
        <TouchableOpacity
          style={{
            backgroundColor: "#2e86de",
            paddingVertical: 12,
            paddingHorizontal: 40,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            LOGIN
          </Text>
        </TouchableOpacity>
      </Link>

    </View>
  );
}
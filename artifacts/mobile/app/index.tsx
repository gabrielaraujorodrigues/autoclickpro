import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={s.container}>
      <Text style={s.title}>AutoClickPro</Text>
      <Text style={s.sub}>Automacao Inteligente</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0d0d", alignItems: "center", justifyContent: "center" },
  title: { color: "#00ff88", fontSize: 28, fontWeight: "800" },
  sub: { color: "#888888", fontSize: 14, marginTop: 8 },
});

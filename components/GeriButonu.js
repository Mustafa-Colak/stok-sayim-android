import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function GeriButonu({ yazi = "Geri" }) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={styles.container}
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <MaterialCommunityIcons name="arrow-left" size={28} color="#333" />
      <Text style={styles.text}>{yazi}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 18,
    marginLeft: 8,
    color: "#333",
  },
});

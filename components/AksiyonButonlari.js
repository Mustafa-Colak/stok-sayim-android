// e:\edev\stok-sayim\components\AksiyonButonlari.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const KlavyeAcButonu = ({ onPress, style }) => (
  <TouchableOpacity
    style={[styles.buton, { backgroundColor: "#6c757d" }, style]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <MaterialCommunityIcons name="keyboard" size={22} color="#fff" />
    <Text style={styles.butonText}>Klavyeyi Aç</Text>
  </TouchableOpacity>
);

export const UrunEkleButonu = ({ onPress, hizliMod, style }) => (
  <TouchableOpacity
    style={[styles.buton, style]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <MaterialCommunityIcons name="plus" size={22} color="#fff" />
    <Text style={styles.butonText}>
      {hizliMod ? "Hızlı Ekle (Miktar: 1)" : "Ürün Ekle"}
    </Text>
  </TouchableOpacity>
);

export const SayimiSonlandirButonu = ({ onPress, style }) => (
  <TouchableOpacity
    style={[styles.buton, { backgroundColor: "gray" }, style]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <MaterialCommunityIcons name="lock-check" size={22} color="#fff" />
    <Text style={styles.butonText}>Sayımı Sonlandır</Text>
  </TouchableOpacity>
);

export const SayimaDevamEtButonu = ({ onPress, style }) => (
  <TouchableOpacity
    style={[styles.buton, { backgroundColor: "#28a745" }, style]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <MaterialCommunityIcons name="refresh" size={22} color="#fff" />
    <Text style={styles.butonText}>Devam Et</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  buton: {
    backgroundColor: "#007bff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 4,
    marginVertical: 5,
  },
  butonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
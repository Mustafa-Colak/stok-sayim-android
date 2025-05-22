// e:\edev\stok-sayim\components\KalanGunUyarisi.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const KalanGunUyarisi = ({ kalanGun, onTamSurumeGec }) => {
  if (kalanGun <= 0 || kalanGun > 5) return null;
  
  return (
    <View style={styles.uyariKutusu}>
      <Text style={styles.uyariMetni}>
        Deneme sürenizin bitmesine {kalanGun} gün kaldı.
      </Text>
      <TouchableOpacity
        style={styles.tamSurumeGecBtn}
        onPress={onTamSurumeGec}
      >
        <Text style={styles.tamSurumeGecBtnText}>Tam Sürüme Geç</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  uyariKutusu: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffeeba",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  uyariMetni: {
    color: "#856404",
    fontSize: 12,
    flex: 1,
  },
  tamSurumeGecBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginLeft: 10,
  },
  tamSurumeGecBtnText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default KalanGunUyarisi;
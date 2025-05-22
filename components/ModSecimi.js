// e:\edev\stok-sayim\components\ModSecimi.js
import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

const ModSecimi = ({ hizliMod, onModDegistir, containerStyle }) => {
  return (
    <View style={containerStyle}>
      <View style={styles.modeContainer}>
        <Text style={styles.modeText}>Hızlı Sayım Modu:</Text>
        <Switch
          value={hizliMod}
          onValueChange={onModDegistir}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={hizliMod ? "#007bff" : "#f4f3f4"}
        />
      </View>
      <Text style={styles.modeDescription}>
        {hizliMod
          ? "Hızlı mod: Sadece barkod girin, miktar otomatik 1 olarak eklenir."
          : "Manuel mod: Barkod ve miktar girmeniz gerekir."}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  modeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  modeText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modeDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
    fontStyle: "italic",
  },
});

export default ModSecimi;
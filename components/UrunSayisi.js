// e:\edev\stok-sayim\components\UrunSayisi.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UrunSayisi = ({ toplam, gosterilen }) => {
  if (toplam === 0) return null;
  
  return (
    <View style={styles.countContainer}>
      <Text style={styles.countText}>
        Toplam: {toplam} ürün
        {gosterilen < toplam
          ? ` (Son ${gosterilen} gösteriliyor)`
          : ""}
      </Text>
      <Text style={styles.limitBilgisi}>
        {toplam >= 40 && toplam < 50
          ? `Limit: ${toplam}/50 ürün`
          : ""}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  countContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
    paddingHorizontal: 5,
  },
  countText: {
    fontSize: 14,
    color: "#333",
  },
  limitBilgisi: {
    fontSize: 12,
    color: "#6c757d",
    fontWeight: "normal",
  },
});

export default UrunSayisi;
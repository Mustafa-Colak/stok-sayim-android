// e:\edev\stok-sayim\components\UrunSatiri.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Performans için memoize edilmiş bileşen
const UrunSatiri = React.memo(({ item, onSil }) => (
  <View style={styles.row}>
    <Text style={styles.text}>
      {item.barkod} - {item.miktar} {item.not ? `(${item.not})` : ""}
    </Text>
    <TouchableOpacity onPress={() => onSil(item.id)}>
      <MaterialCommunityIcons name="trash-can-outline" size={22} color="red" />
    </TouchableOpacity>
  </View>
));

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  text: {
    fontSize: 16,
    flex: 1,
  }
});

export default UrunSatiri;
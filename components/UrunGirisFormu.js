// e:\edev\stok-sayim\components\UrunGirisFormu.js
import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

const UrunGirisFormu = ({ 
  barkod, 
  setBarkod, 
  miktar, 
  setMiktar, 
  not, 
  setNot, 
  hizliMod, 
  barkodInputRef,
  onBarkodSubmit,
  onUrunEkle,
  containerStyle,
  inputStyle
}) => {
  return (
    <View style={containerStyle}>
      <View style={styles.barkodInputContainer}>
        <TextInput
          ref={barkodInputRef}
          value={barkod}
          onChangeText={setBarkod}
          placeholder="Barkod"
          style={[inputStyle, { flex: 1 }]}
          onSubmitEditing={onBarkodSubmit}
          returnKeyType={hizliMod ? "done" : "next"}
          blurOnSubmit={false}
          autoFocus={false}
        />
      </View>
      
      {!hizliMod && (
        <TextInput
          value={miktar}
          onChangeText={setMiktar}
          placeholder="Miktar"
          keyboardType="numeric"
          style={inputStyle}
          returnKeyType="next"
          blurOnSubmit={false}
        />
      )}
      
      {!hizliMod && (
        <TextInput
          value={not}
          onChangeText={setNot}
          placeholder="Not (opsiyonel)"
          style={inputStyle}
          onSubmitEditing={onUrunEkle}
          returnKeyType="done"
          blurOnSubmit={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  barkodInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default UrunGirisFormu;
// e:\edev\stok-sayim\components\SayimDetayForm.js
import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "../styles/SayimDetayStyles";

const SayimDetayForm = ({ hizliMod, onUrunEkle }) => {
  const [barkod, setBarkod] = useState("");
  const [miktar, setMiktar] = useState("1");
  const [not, setNot] = useState("");
  const [klavyeOtomatikAcilsin, setKlavyeOtomatikAcilsin] = useState(false);
  
  const barkodInputRef = useRef(null);
  
  // Barkod alanına odaklanma - Otomatik odaklanmayı kontrol ediyoruz
  useEffect(() => {
    if (klavyeOtomatikAcilsin) {
      const timer = setTimeout(() => {
        if (barkodInputRef.current) {
          barkodInputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [klavyeOtomatikAcilsin]);
  
  const handleUrunEkle = () => {
    // Ürün eklendiğinde başarılı olursa formu temizle
    if (onUrunEkle(barkod, miktar, not, hizliMod)) {
      setBarkod("");
      if (!hizliMod) setMiktar("1");
      setNot("");
      
      // Barkod alanına odaklan
      if (barkodInputRef.current && klavyeOtomatikAcilsin) {
        barkodInputRef.current.focus();
      }
    }
  };
  
  const barkodGirisiniTamamla = () => {
    if (hizliMod) {
      handleUrunEkle();
    }
  };
  
  // Klavyeyi manuel olarak açma fonksiyonu
  const klavyeyiAc = () => {
    setKlavyeOtomatikAcilsin(true);
    if (barkodInputRef.current) {
      barkodInputRef.current.focus();
    }
  };
  
  return (
    <>
      <View style={styles.inputContainer}>
        <View style={formStyles.barkodInputContainer}>
          <TextInput
            ref={barkodInputRef}
            value={barkod}
            onChangeText={setBarkod}
            placeholder="Barkod"
            style={[styles.input, { flex: 1 }]}
            onSubmitEditing={barkodGirisiniTamamla}
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
            style={styles.input}
            returnKeyType="next"
            blurOnSubmit={false}
          />
        )}
        
        {!hizliMod && (
          <TextInput
            value={not}
            onChangeText={setNot}
            placeholder="Not (opsiyonel)"
            style={styles.input}
            onSubmitEditing={handleUrunEkle}
            returnKeyType="done"
            blurOnSubmit={false}
          />
        )}
      </View>

      {/* Klavye açma butonu */}
      {!klavyeOtomatikAcilsin && (
        <TouchableOpacity
          style={[formStyles.buton, { backgroundColor: "#6c757d", marginBottom: 10 }]}
          onPress={klavyeyiAc}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="keyboard" size={22} color="#fff" />
          <Text style={formStyles.butonText}>Klavyeyi Aç</Text>
        </TouchableOpacity>
      )}

      {/* Ürün ekle butonu */}
      <TouchableOpacity
        style={formStyles.buton}
        onPress={handleUrunEkle}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="plus" size={22} color="#fff" />
        <Text style={formStyles.butonText}>
          {hizliMod ? "Hızlı Ekle (Miktar: 1)" : "Ürün Ekle"}
        </Text>
      </TouchableOpacity>
    </>
  );
};

const formStyles = StyleSheet.create({
  barkodInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
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

export default SayimDetayForm;
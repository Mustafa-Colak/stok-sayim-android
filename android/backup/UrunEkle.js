import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import common from "../../styles/CommonStyles";

export default function UrunEkle({ navigation, route }) {
  const { sayimId, sayimAd } = route.params;
  const STORAGE_KEY = `sayim_${sayimId}`;

  const [barkod, setBarkod] = useState("");
  const [ad, setAd] = useState("");
  const [miktar, setMiktar] = useState("1");

  const barkodInput = useRef(null);

  useEffect(() => {
    barkodInput.current?.focus();
  }, []);

  const urunEkle = async () => {
    if (!barkod.trim()) {
      Alert.alert("Uyarı", "Barkod boş olamaz.");
      return;
    }

    const yeniUrun = {
      id: Date.now().toString(),
      barkod: barkod.trim(),
      ad: ad.trim(),
      miktar: parseInt(miktar) || 1,
    };

    try {
      const veri = await AsyncStorage.getItem(STORAGE_KEY);
      const urunler = veri ? JSON.parse(veri) : [];

      urunler.push(yeniUrun);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(urunler));

      navigation.replace("SayimDetay", { sayimId, sayimAd }); // ✅ Doğru parametrelerle yönlendir
    } catch (e) {
      Alert.alert("Hata", "Ürün eklenemedi.");
    }
  };

  return (
    <View style={common.container}>
      <Text style={common.title}>Ürün Ekle</Text>

      <TextInput
        ref={barkodInput}
        style={common.input}
        placeholder="Barkod (zorunlu)"
        value={barkod}
        onChangeText={setBarkod}
        keyboardType="numeric"
      />

      <TextInput
        style={common.input}
        placeholder="Ürün adı (opsiyonel)"
        value={ad}
        onChangeText={setAd}
      />

      <TextInput
        style={common.input}
        placeholder="Miktar"
        value={miktar}
        onChangeText={setMiktar}
        keyboardType="numeric"
      />

      <Button title="Ekle" onPress={urunEkle} />
    </View>
  );
}

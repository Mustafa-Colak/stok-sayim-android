import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import common from "../styles/CommonStyles";

export default function YeniSayim({ navigation }) {
  const [sayimAdi, setSayimAdi] = useState("");
  const [oncekiSayimlar, setOncekiSayimlar] = useState([]);

  useEffect(() => {
    const getirSayimlar = async () => {
      try {
        const veri = await AsyncStorage.getItem("sayimlar");
        if (veri) {
          const liste = JSON.parse(veri);
          setOncekiSayimlar(liste.reverse());
        }
      } catch (e) {
        Alert.alert("Hata", "Sayım listesi yüklenemedi.");
      }
    };
    getirSayimlar();
  }, []);

  const sayimEkle = async () => {
    if (!sayimAdi.trim()) {
      Alert.alert("Uyarı", "Sayım adı boş olamaz.");
      return;
    }

    // Tarih formatını _DDMMYY şeklinde oluştur
    const now = new Date();
    const gun = String(now.getDate()).padStart(2, "0");
    const ay = String(now.getMonth() + 1).padStart(2, "0");
    const yil = String(now.getFullYear()).slice(-2);
    const tarihEki = `_${gun}${ay}${yil}`;

    // Sayım adına tarih ekini ekle
    const sayimAdiTarihli = sayimAdi.trim() + tarihEki;

    const yeniId = Date.now().toString();
    const yeniSayim = {
      id: yeniId,
      ad: sayimAdiTarihli,
      durum: "baslamamis", // ✅ varsayılan durum
    };

    try {
      const veri = await AsyncStorage.getItem("sayimlar");
      const mevcut = veri ? JSON.parse(veri) : [];

      const ayniAdVar = mevcut.find(
        (s) => s.ad.toLowerCase() === sayimAdiTarihli.toLowerCase()
      );
      if (ayniAdVar) {
        Alert.alert("Uyarı", "Bu isimde bir sayım zaten var.");
        return;
      }

      const guncel = [...mevcut, yeniSayim];
      await AsyncStorage.setItem("sayimlar", JSON.stringify(guncel));
      navigation.replace("SayimDetay", {
        sayimId: yeniId,
        sayimAd: sayimAdiTarihli,
      });
    } catch (e) {
      Alert.alert("Hata", "Sayım eklenemedi.");
    }
  };

  return (
    <View style={common.container}>
      <Text style={common.title}>Yeni Sayım Oluştur</Text>
      <Text style={common.subtitle}>
        Aynı isimde sayım oluşturmamaya dikkat edin.
      </Text>

      <Text style={[common.subtitle, { marginTop: 20 }]}>
        📄 Önceki Sayımlar:
      </Text>
      <FlatList
        data={oncekiSayimlar}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={{ fontSize: 16, paddingVertical: 4 }}>• {item.ad}</Text>
        )}
        ListEmptyComponent={
          <Text style={{ color: "#888", fontStyle: "italic" }}>
            Henüz sayım yok.
          </Text>
        }
      />

      <TextInput
        style={common.input}
        placeholder="Yeni sayım adı girin"
        value={sayimAdi}
        onChangeText={setSayimAdi}
      />
      <Button title="Ekle" onPress={sayimEkle} />
    </View>
  );
}

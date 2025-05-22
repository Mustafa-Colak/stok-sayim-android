// e:\edev\stok-sayim\screens\YeniSayim.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import commonStyles from "../styles/CommonStyles"; // commonStyles olarak import ettim
import yeniSayimStyles from "../styles/YeniSayimStyles"; // yeniSayimStyles olarak import ettim

export default function YeniSayim({ navigation }) {
  const [sayimNotu, setSayimNotu] = useState("");
  const [oncekiSayimlar, setOncekiSayimlar] = useState([]);

  useEffect(() => {
    const getirSayimlar = async () => {
      try {
        const veri = await AsyncStorage.getItem("sayimlar");
        if (veri) {
          const liste = JSON.parse(veri);
          // En son eklenenler üstte olacak şekilde sırala
          setOncekiSayimlar(
            liste.sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
          );
        }
      } catch (e) {
        Alert.alert("Hata", "Sayım listesi yüklenemedi.");
      }
    };
    getirSayimlar();
  }, []);

  const sayimEkle = async () => {
    if (!sayimNotu.trim()) {
      Alert.alert("Uyarı", "Sayım notu boş olamaz.");
      return;
    }

    const now = new Date();
    const gun = String(now.getDate()).padStart(2, "0");
    const ay = String(now.getMonth() + 1).padStart(2, "0"); // Aylar 0'dan başlar
    const yil = String(now.getFullYear()).slice(-2);
    const tarihEki = `_${gun}${ay}${yil}`;
    const sayimNotuTarihli = sayimNotu.trim() + tarihEki;
    const yeniId = Date.now().toString();

    const yeniSayim = {
      id: yeniId,
      not: sayimNotuTarihli, // 'ad' alanını 'not' olarak değiştirdik
      durum: "baslamamis",
      tarih: now.toISOString(), // Tarihi ISO formatında kaydet
      urunSayisi: 0, // Başlangıç ürün sayısını 0 olarak ayarla
    };

    try {
      const veri = await AsyncStorage.getItem("sayimlar");
      const mevcut = veri ? JSON.parse(veri) : [];

      const ayniNotVar = mevcut.find(
        (s) => s.not && s.not.toLowerCase() === sayimNotuTarihli.toLowerCase() // 'ad' yerine 'not' kontrolü ve null check
      );
      if (ayniNotVar) {
        Alert.alert(
          "Uyarı",
          `"${sayimNotuTarihli}" notuyla bir sayım zaten var.`
        );
        return;
      }

      const guncel = [...mevcut, yeniSayim];
      await AsyncStorage.setItem("sayimlar", JSON.stringify(guncel));

      // Önceki sayımlar listesini de güncelle
      setOncekiSayimlar(
        guncel.sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
      );
      setSayimNotu(""); // Input'u temizle

      navigation.replace("SayimDetay", {
        sayimId: yeniId,
        sayimNot: sayimNotuTarihli, // 'sayimAd' parametresini 'sayimNot' olarak değiştirdik
      });
    } catch (e) {
      console.error("Sayım ekleme hatası:", e);
      Alert.alert("Hata", "Sayım eklenemedi.");
    }
  };

  return (
    <View style={yeniSayimStyles.container}>
      <TextInput
        style={yeniSayimStyles.input}
        placeholder="Yeni sayım notu girin (örn: Depo A Rafları)"
        value={sayimNotu}
        onChangeText={setSayimNotu}
      />

      <Text style={commonStyles.subtitle}>
        Aynı not ile sayım oluşturmamaya dikkat edin. Tarih otomatik
        eklenecektir.
      </Text>

      <TouchableOpacity style={yeniSayimStyles.button} onPress={sayimEkle}>
        <MaterialCommunityIcons
          name="plus-circle-outline"
          size={20}
          color="#fff"
        />
        <Text style={yeniSayimStyles.buttonText}>Sayımı Oluştur ve Başla</Text>
      </TouchableOpacity>

      <Text
        style={[
          commonStyles.subtitle,
          {
            marginTop: 30,
            marginBottom: 10,
            textAlign: "left",
            fontWeight: "bold",
          },
        ]}
      >
        📄 Önceki Sayımlar:
      </Text>
      <FlatList
        data={oncekiSayimlar}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              paddingVertical: 6,
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
            }}
          >
            <Text style={{ fontSize: 16 }}>• {item.not}</Text>
            {/* 'item.ad' yerine 'item.not' */}
            <Text style={{ fontSize: 12, color: "#777", marginLeft: 10 }}>
              {new Date(item.tarih).toLocaleDateString("tr-TR")}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text
            style={{
              color: "#888",
              fontStyle: "italic",
              textAlign: "center",
              marginTop: 10,
            }}
          >
            Henüz sayım kaydı yok.
          </Text>
        }
        style={{ maxHeight: 200 }} // Liste için maksimum yükseklik
      />
    </View>
  );
}

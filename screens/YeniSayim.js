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
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTema } from "../contexts/ThemeContext"; // ThemeContext'i import et

import commonStyles from "../styles/CommonStyles"; 
import yeniSayimStyles from "../styles/YeniSayimStyles";

export default function YeniSayim({ navigation }) {
  const { tema, karanlikTema } = useTema(); // ThemeContext'ten tema bilgilerini al
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
      Alert.alert("Uyarı", "Sayım adı boş olamaz.");
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
      not: sayimNotuTarihli,
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
          `"${sayimNotuTarihli}" adıyla bir sayım zaten var.`
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

  // Tema renklerini kullanarak dinamik stiller oluştur
  const dinamikStiller = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: tema.arkaplan,
    },
    input: {
      borderWidth: 1,
      borderColor: tema.girdiBorder,
      backgroundColor: tema.girdi,
      color: tema.metin,
      borderRadius: 4,
      padding: 12,
      marginBottom: 10,
      fontSize: 16,
    },
    button: {
      backgroundColor: tema.buton,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 4,
      marginVertical: 10,
    },
    buttonText: {
      color: tema.butonMetin,
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 8,
    },
    subtitle: {
      fontSize: 14,
      color: tema.ikincilMetin,
      marginBottom: 16,
      textAlign: "center",
    },
    listHeader: {
      marginTop: 30,
      marginBottom: 10,
      textAlign: "left",
      fontWeight: "bold",
      color: tema.metin,
    },
    listItemContainer: {
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: tema.sinir,
    },
    listItemText: {
      fontSize: 16,
      color: tema.metin,
    },
    listItemDate: {
      fontSize: 12,
      color: tema.ikincilMetin,
      marginLeft: 10,
    },
    emptyListText: {
      color: tema.ikincilMetin,
      fontStyle: "italic",
      textAlign: "center",
      marginTop: 10,
    }
  });

  return (
    <View style={dinamikStiller.container}>
      <TextInput
        style={dinamikStiller.input}
        placeholder="Yeni sayım adı girin (örn: Depo A Rafları)"
        placeholderTextColor={tema.ikincilMetin}
        value={sayimNotu}
        onChangeText={setSayimNotu}
      />

      <Text style={dinamikStiller.subtitle}>
        Aynı ad ile sayım oluşturmamaya dikkat edin. Tarih otomatik
        eklenecektir.
      </Text>

      <TouchableOpacity style={dinamikStiller.button} onPress={sayimEkle}>
        <MaterialCommunityIcons
          name="plus-circle-outline"
          size={20}
          color={tema.butonMetin}
        />
        <Text style={dinamikStiller.buttonText}>Sayımı Oluştur ve Başla</Text>
      </TouchableOpacity>

      <Text
        style={dinamikStiller.listHeader}
      >
        📄 Önceki Sayımlar:
      </Text>
      <FlatList
        data={oncekiSayimlar}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={dinamikStiller.listItemContainer}>
            <Text style={dinamikStiller.listItemText}>• {item.not}</Text>
            <Text style={dinamikStiller.listItemDate}>
              {new Date(item.tarih).toLocaleDateString("tr-TR")}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={dinamikStiller.emptyListText}>
            Henüz sayım kaydı yok.
          </Text>
        }
        style={{ maxHeight: 200 }} // Liste için maksimum yükseklik
      />
    </View>
  );
}
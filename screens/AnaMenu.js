import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "../styles/AnaMenuStyles";

export default function AnaMenu({ navigation }) {
  const kartlar = [
    {
      baslik: "Sayım Listesi",
      aciklama: "Kayıtlı sayımları görüntüle, düzenle veya sil",
      ikon: "clipboard-list-outline",
      ekran: "SayimListesi",
    },
    {
      baslik: "Yeni Sayım",
      aciklama: "Yeni bir sayım listesi oluştur",
      ikon: "plus-box-outline",
      ekran: "YeniSayim",
    },
    {
      baslik: "Rapor Oluştur",
      aciklama: "Sayımı PDF, CSV, JSON veya XLSX olarak dışa aktar",
      ikon: "chart-box-outline",
      ekran: "RaporOlustur",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.baslik}>Ana Menü</Text>
      {kartlar.map((k, i) => (
        <TouchableOpacity
          key={i}
          style={styles.kart}
          onPress={() => navigation.navigate(k.ekran)}
        >
          <MaterialCommunityIcons name={k.ikon} size={36} color="#2196F3" />
          <View style={{ flex: 1 }}>
            <Text style={styles.kartBaslik}>{k.baslik}</Text>
            <Text style={styles.kartAciklama}>{k.aciklama}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={28} color="#999" />
        </TouchableOpacity>
      ))}
    </View>
  );
}
// e:\edev\stok-sayim\screens\AnaMenu.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import styles from "../styles/AnaMenuStyles"; // Stil dosyasını import ediyoruz

const menuItems = [
  {
    id: "1",
    title: "Yeni Sayım Başlat",
    icon: "plus-circle-outline",
    screen: "YeniSayim",
    description: "Yeni bir envanter sayımı oluşturun.",
    params: {},
  },
  {
    id: "2",
    title: "Devam Eden Sayımlar",
    icon: "format-list-bulleted",
    screen: "SayimListesi",
    description: "Mevcut sayımlarınızı görüntüleyin ve yönetin.",
    params: {},
  },
  {
    id: "3",
    title: "Rapor Oluştur",
    icon: "file-chart-outline",
    screen: "SayimListesi", // Rapor oluşturmak için SayimListesi'ne yönlendir
    params: { purpose: "selectForReport" }, // Özel parametre
    description: "Sayı seçerek rapor oluşturun.",
  },
  // { id: '4', title: 'Ayarlar', icon: 'cog-outline', screen: 'Ayarlar', description: 'Uygulama ayarlarını yapılandırın.' },
];

export default function AnaMenu() {
  const navigation = useNavigation();

  const handlePress = (screen, params) => {
    if (screen) {
      navigation.navigate(screen, params);
    } else {
      console.warn("Ekran adı tanımlanmamış.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.baslik}>Ana Menü</Text>
      <ScrollView>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.kart} // AnaMenuStyles.js'den gelen stil
            onPress={() => handlePress(item.screen, item.params)}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={30}
              color="#007bff"
            />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.kartBaslik}>{item.title}</Text>
              <Text style={styles.kartAciklama}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

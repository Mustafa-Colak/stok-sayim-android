// e:\edev\stok-sayim\screens\AnaMenu.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import styles from "../styles/AnaMenuStyles"; // Stil dosyasını import ediyoruz
import { lisansBilgisiYukle, denemeSuresiniKontrolEt } from "../utils/LisansYonetimi";

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
  const [lisansBilgisi, setLisansBilgisi] = useState(null);
  const [kalanGun, setKalanGun] = useState(0);

  // Lisans bilgilerini yükle
  const lisansBilgileriniYukle = async () => {
    try {
      const bilgi = await lisansBilgisiYukle();
      setLisansBilgisi(bilgi);
      
      const sureDurumu = await denemeSuresiniKontrolEt();
      if (!sureDurumu.sureDoldu && sureDurumu.kalanGun) {
        setKalanGun(sureDurumu.kalanGun);
      }
    } catch (error) {
      console.error("Lisans bilgisi yükleme hatası:", error);
    }
  };

  // Sayfa her odaklandığında lisans bilgilerini güncelle
  useFocusEffect(
    React.useCallback(() => {
      lisansBilgileriniYukle();
    }, [])
  );

  // Sayfa ilk yüklendiğinde
  useEffect(() => {
    lisansBilgileriniYukle();
  }, []);

  const handlePress = (screen, params) => {
    if (screen) {
      navigation.navigate(screen, params);
    } else {
      console.warn("Ekran adı tanımlanmamış.");
    }
  };

  // Lisans bilgilerini göster
  const lisansBilgileriniGoster = () => {
    if (!lisansBilgisi) return;

    const lisansTipi = lisansBilgisi.tip === "ucretli" ? "Tam Sürüm" : "Ücretsiz Deneme";
    const baslangicTarihi = lisansBilgisi.baslangicTarihi 
      ? new Date(lisansBilgisi.baslangicTarihi).toLocaleDateString('tr-TR') 
      : "Bilinmiyor";
    
    let mesaj = `Lisans Tipi: ${lisansTipi}\nBaşlangıç Tarihi: ${baslangicTarihi}`;
    
    if (lisansBilgisi.tip === "ucretsiz") {
      mesaj += `\nKalan Deneme Süresi: ${kalanGun} gün`;
      mesaj += "\n\nÜcretsiz sürüm limitleri:";
      mesaj += "\n- Maksimum 3 aktif sayım";
      mesaj += "\n- Sayım başına maksimum 50 ürün";
      mesaj += "\n- 30 günlük deneme süresi";
    } else if (lisansBilgisi.tip === "ucretli") {
      mesaj += "\n\nTam sürümü kullanıyorsunuz. Tüm özellikler aktif.";
    }

    Alert.alert(
      "Lisans Bilgileri",
      mesaj,
      [
        { 
          text: lisansBilgisi.tip === "ucretsiz" ? "Tam Sürüme Geç" : "Tamam", 
          onPress: () => {
            if (lisansBilgisi.tip === "ucretsiz") {
              navigation.navigate("Ayarlar");
            }
          }
        }
      ]
    );
  };

  // Lisans kartı için duruma göre renk ve ikon belirle
  const getLisansKartBilgileri = () => {
    if (!lisansBilgisi) {
      return {
        renk: "#6c757d",
        ikon: "help-circle-outline",
        baslik: "Lisans Bilgisi",
        aciklama: "Yükleniyor..."
      };
    }

    if (lisansBilgisi.tip === "ucretli") {
      return {
        renk: "#28a745",
        ikon: "check-circle-outline",
        baslik: "Tam Sürüm Lisansı",
        aciklama: "Tüm özellikler aktif"
      };
    } else {
      // Ücretsiz sürüm
      if (kalanGun <= 5) {
        return {
          renk: "#dc3545",
          ikon: "alert-circle-outline",
          baslik: "Deneme Süresi Bitiyor",
          aciklama: `Kalan gün: ${kalanGun}`
        };
      } else {
        return {
          renk: "#ffc107",
          ikon: "timer-sand",
          baslik: "Ücretsiz Deneme",
          aciklama: `Kalan gün: ${kalanGun}`
        };
      }
    }
  };

  const lisansKartBilgileri = getLisansKartBilgileri();

  return (
    <View style={styles.container}>
      <Text style={styles.baslik}>Ana Menü</Text>
      <ScrollView>
        {/* Mevcut Menü Öğeleri */}
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.kart}
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

        {/* Lisans Bilgisi Kartı - En altta */}
        <TouchableOpacity
          style={[
            styles.kart, 
            { 
              borderLeftColor: lisansKartBilgileri.renk, 
              borderLeftWidth: 5,
              marginTop: 20 // Üstteki kartlardan biraz daha ayrı durması için
            }
          ]}
          onPress={lisansBilgileriniGoster}
        >
          <MaterialCommunityIcons
            name={lisansKartBilgileri.ikon}
            size={30}
            color={lisansKartBilgileri.renk}
          />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.kartBaslik}>{lisansKartBilgileri.baslik}</Text>
            <Text style={styles.kartAciklama}>{lisansKartBilgileri.aciklama}</Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color="#6c757d"
          />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
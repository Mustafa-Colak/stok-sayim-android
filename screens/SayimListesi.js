// e:\edev\stok-sayim\screens\SayimListesi.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import common from "../styles/CommonStyles";
import {
  sayimSayisiLimitiniKontrolEt,
  denemeSuresiniKontrolEt,
} from "../utils/LisansYonetimi";

export default function SayimListesi({ navigation, route }) {
  const [sayimlar, setSayimlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [yenileniyor, setYenileniyor] = useState(false);
  const [kalanGun, setKalanGun] = useState(0);
  const [urunSayilari, setUrunSayilari] = useState({}); // Her sayım için ürün sayısını tutacak

  // Rapor oluşturma amacıyla mı açıldı?
  const isForReport = route.params?.purpose === "selectForReport";

  // Sayfa her odaklandığında sayımları yükle
  useFocusEffect(
    useCallback(() => {
      // Her odaklanmada sayımları yükle
      sayimlariYukle();

      // Route params'tan durum güncellemesi kontrolü
      if (route.params?.durumuGuncelle) {
        // Parametreyi temizle
        navigation.setParams({ durumuGuncelle: undefined });
      }

      // Lisans durumunu kontrol et
      lisansDurumunuKontrolEt();
    }, [route.params])
  );

  // Sayfa ilk yüklendiğinde
  useEffect(() => {
    sayimlariYukle();

    // Rapor oluşturma amacıyla açıldıysa başlığı güncelle
    if (isForReport) {
      navigation.setOptions({
        title: "Rapor İçin Sayım Seçin",
      });
    }
  }, []);

  // Lisans durumunu kontrol et
  const lisansDurumunuKontrolEt = async () => {
    const sureDurumu = await denemeSuresiniKontrolEt();
    if (!sureDurumu.sureDoldu && sureDurumu.kalanGun <= 5) {
      // Son 5 gün kaldığında uyarı göster
      setKalanGun(sureDurumu.kalanGun);
    } else {
      setKalanGun(0);
    }
  };

  // Sayımları yükleme fonksiyonu
  const sayimlariYukle = async () => {
    setYukleniyor(true);
    try {
      const veri = await AsyncStorage.getItem("sayimlar");
      if (veri) {
        const liste = JSON.parse(veri);
        // Sayımları tarihe göre sırala (en yeni en üstte)
        liste.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
        setSayimlar(liste);

        // Her sayım için ürün sayılarını yükle
        await urunSayilariniYukle(liste);
      } else {
        setSayimlar([]);
      }
    } catch (error) {
      console.error("Sayım yükleme hatası:", error);
      Alert.alert("Hata", "Sayımlar yüklenirken bir sorun oluştu.");
    } finally {
      setYukleniyor(false);
      setYenileniyor(false);
    }
  };

  // Her sayım için ürün sayılarını yükleme
  const urunSayilariniYukle = async (sayimListesi) => {
    try {
      const sayilar = {};

      // Her sayım için ürün sayısını al
      for (const sayim of sayimListesi) {
        const urunlerStr = await AsyncStorage.getItem(`sayim_${sayim.id}`);
        if (urunlerStr) {
          const urunler = JSON.parse(urunlerStr);
          sayilar[sayim.id] = urunler.length;
        } else {
          sayilar[sayim.id] = 0;
        }
      }

      setUrunSayilari(sayilar);
    } catch (error) {
      console.error("Ürün sayıları yükleme hatası:", error);
    }
  };

  // Yenileme işlemi
  const yenile = () => {
    setYenileniyor(true);
    sayimlariYukle();
  };

  // Yeni sayım oluşturma fonksiyonu
  const yeniSayimOlustur = async () => {
    // Önce deneme süresi kontrolü
    const sureDurumu = await denemeSuresiniKontrolEt();
    if (sureDurumu.sureDoldu) {
      Alert.alert("Deneme Süresi Doldu", sureDurumu.mesaj, [
        {
          text: "Tam Sürüme Geç",
          onPress: () => navigation.navigate("Ayarlar"),
        },
        { text: "Kapat", style: "cancel" },
      ]);
      return;
    }

    // Sonra sayım sayısı limiti kontrolü
    const limitDurumu = await sayimSayisiLimitiniKontrolEt();
    if (limitDurumu.limitAsildi) {
      Alert.alert("Limit Aşıldı", limitDurumu.mesaj, [
        {
          text: "Tam Sürüme Geç",
          onPress: () => navigation.navigate("Ayarlar"),
        },
        { text: "Kapat", style: "cancel" },
      ]);
      return;
    }

    // Limit aşılmadıysa yeni sayım oluşturmaya devam et
    navigation.navigate("YeniSayim");
  };

  // Sayım silme fonksiyonu
  const sayimSil = (id, not) => {
    Alert.alert(
      "Sayım Sil",
      `"${not}" sayımını silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          onPress: async () => {
            try {
              // Önce sayımı listeden kaldır
              const yeniListe = sayimlar.filter((s) => s.id !== id);
              await AsyncStorage.setItem("sayimlar", JSON.stringify(yeniListe));
              setSayimlar(yeniListe);

              // Sonra sayıma ait ürünleri sil
              await AsyncStorage.removeItem(`sayim_${id}`);

              Alert.alert("Başarılı", "Sayım başarıyla silindi.");
            } catch (error) {
              console.error("Sayım silme hatası:", error);
              Alert.alert("Hata", "Sayım silinirken bir sorun oluştu.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // Sayım durumuna göre renk belirleme
  const durumRenginiGetir = (durum) => {
    switch (durum) {
      case "baslamamis":
        return "#6c757d"; // Gri
      case "devam":
        return "#007bff"; // Mavi
      case "kapandi":
        return "#28a745"; // Yeşil
      default:
        return "#6c757d";
    }
  };

  // Sayım durumuna göre metin belirleme
  const durumMetniniGetir = (durum) => {
    switch (durum) {
      case "baslamamis":
        return "Başlanmadı";
      case "devam":
        return "Devam Ediyor";
      case "kapandi":
        return "Tamamlandı";
      default:
        return "Bilinmiyor";
    }
  };

  // Sayım öğesi seçildiğinde çağrılacak fonksiyon
  const sayimSecildi = (item) => {
    // Eğer rapor oluşturma amacıyla açıldıysa, RaporOlustur ekranına yönlendir
    if (isForReport) {
      navigation.navigate("RaporOlustur", {
        sayimId: item.id,
        sayimNot: item.not,
      });
    } else {
      // Normal durumda SayimDetay ekranına yönlendir
      navigation.navigate("SayimDetay", {
        sayimId: item.id,
        sayimNot: item.not,
      });
    }
  };

  // Sayım öğesi render fonksiyonu - Tamamen yeniden düzenlendi
  const renderSayimItem = ({ item }) => (
    <TouchableOpacity
      style={styles.sayimItem}
      onPress={() => sayimSecildi(item)}
    >
      <View style={styles.sayimContentContainer}>
        {/* Sol taraf - Sayım bilgileri */}
        <View style={styles.sayimBilgileri}>
          <Text
            style={styles.sayimNot}
            numberOfLines={2} // İki satıra kadar izin ver
            ellipsizeMode="tail"
          >
            {item.not || "İsimsiz Sayım"}
          </Text>

          <Text style={styles.sayimMiktar}>
            {urunSayilari[item.id] !== undefined
              ? `${urunSayilari[item.id]} ürün`
              : "Yükleniyor..."}
          </Text>
        </View>

        {/* Sağ taraf - Durum ve silme butonu */}
        <View style={styles.sayimActions}>
          <View
            style={[
              styles.durumBadge,
              { backgroundColor: durumRenginiGetir(item.durum) },
            ]}
          >
            <Text style={styles.durumText}>
              {durumMetniniGetir(item.durum)}
            </Text>
          </View>

          {!isForReport && (
            <TouchableOpacity
              style={styles.silButon}
              onPress={() => sayimSil(item.id, item.not)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={22}
                color="red"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={common.container}>
      <Text style={common.title}>
        {isForReport ? "Rapor İçin Sayım Seçin" : "Sayım Listesi"}
      </Text>

      {/* Kalan gün uyarısı */}
      {kalanGun > 0 && kalanGun <= 5 && (
        <View style={styles.uyariKutusu}>
          <Text style={styles.uyariMetni}>
            Deneme sürenizin bitmesine {kalanGun} gün kaldı. Tam sürüme geçmeyi
            düşünün.
          </Text>
          <TouchableOpacity
            style={styles.tamSurumeGecBtn}
            onPress={() => navigation.navigate("Ayarlar")}
          >
            <Text style={styles.tamSurumeGecBtnText}>Tam Sürüme Geç</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={sayimlar}
        keyExtractor={(item) => item.id}
        renderItem={renderSayimItem}
        refreshControl={
          <RefreshControl refreshing={yenileniyor} onRefresh={yenile} />
        }
        ListEmptyComponent={
          yukleniyor ? (
            <Text style={common.subtitle}>Yükleniyor...</Text>
          ) : (
            <Text style={common.subtitle}>Henüz sayım bulunmuyor.</Text>
          )
        }
        contentContainerStyle={[
          sayimlar.length === 0 && styles.emptyList,
          styles.listContainer,
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Rapor oluşturma modunda yeni sayım butonu gösterme */}
      {!isForReport && (
        <TouchableOpacity
          style={common.fabButton}
          onPress={yeniSayimOlustur}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// Stiller doğrudan bu dosyada tanımlandı
const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 80, // FAB için alan bırak
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sayimItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sayimContentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sayimBilgileri: {
    flex: 1,
    marginRight: 10,
  },
  sayimNot: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4, // İsim ile miktar arasında boşluk
    flexShrink: 1, // Metni sığdırmak için
  },
  sayimMiktar: {
    fontSize: 12,
    color: "#6c757d",
    fontStyle: "italic",
  },
  sayimActions: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  durumBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  durumText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  silButon: {
    padding: 5,
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
  uyariKutusu: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffeeba",
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 15,
  },
  uyariMetni: {
    color: "#856404",
    fontSize: 14,
    marginBottom: 10,
  },
  tamSurumeGecBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: "flex-end",
  },
  tamSurumeGecBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

// e:\edev\stok-sayim\screens\AnaMenu.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal, // Modal bileşenini import ediyoruz
  TouchableWithoutFeedback, // Dışarı tıklamayı yakalamak için
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import styles from "../styles/AnaMenuStyles"; // Stil dosyasını import ediyoruz
import {
  lisansBilgisiYukle,
  denemeSuresiniKontrolEt,
} from "../utils/LisansYonetimi";

// UstaHesap turkuaz rengi
const USTAHESAP_TURKUAZ = "#00a0b0";

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
  const [modalVisible, setModalVisible] = useState(false); // Modal görünürlüğü için state

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

  // Lisans bilgilerini göster - Güvenlik kontrolü ekledik
  const lisansBilgileriniGoster = () => {
    // Lisans bilgisi yüklenmeden önce tıklanırsa hata vermesin
    if (!lisansBilgisi) {
      Alert.alert("Bilgi", "Lisans bilgileri yükleniyor, lütfen bekleyin.");
      return;
    }
    setModalVisible(true);
  };

  // Ayarlar menüsüne tıklandığında
  const ayarlariGoster = () => {
    // Şimdilik boş bir işlem, ileride ayarlar ekranına yönlendirilebilir
    Alert.alert("Bilgi", "Ayarlar menüsü yakında eklenecek.");
  };

  // Lisans kartı için duruma göre renk ve ikon belirle - Güvenlik kontrolü ekledik
  const getLisansKartBilgileri = () => {
    // Varsayılan değerler tanımla
    const varsayilanBilgiler = {
      renk: "#6c757d",
      ikon: "help-circle-outline",
      baslik: "Lisans Bilgisi",
      aciklama: "Yükleniyor...",
    };

    // Lisans bilgisi yoksa varsayılan değerleri döndür
    if (!lisansBilgisi) {
      return varsayilanBilgiler;
    }

    if (lisansBilgisi.tip === "ucretli") {
      return {
        renk: "#28a745",
        ikon: "check-circle-outline",
        baslik: "Tam Sürüm Lisansı",
        aciklama: "Tüm özellikler aktif",
      };
    } else {
      // Ücretsiz sürüm
      if (kalanGun <= 5) {
        return {
          renk: "#dc3545",
          ikon: "alert-circle-outline",
          baslik: "Deneme Süresi Bitiyor",
          aciklama: `Kalan gün: ${kalanGun}`,
        };
      } else {
        return {
          renk: "#ffc107",
          ikon: "timer-sand",
          baslik: "Ücretsiz Deneme",
          aciklama: `Kalan gün: ${kalanGun}`,
        };
      }
    }
  };

  // Lisans bilgisi içeriğini hazırlayan fonksiyon - Güvenlik kontrolü ekledik
  const getLisansBilgisiIcerigi = () => {
    if (!lisansBilgisi) return "Lisans bilgileri yüklenemedi.";

    const lisansTipi =
      lisansBilgisi.tip === "ucretli" ? "Tam Sürüm" : "Ücretsiz Deneme";
    const baslangicTarihi = lisansBilgisi.baslangicTarihi
      ? new Date(lisansBilgisi.baslangicTarihi).toLocaleDateString("tr-TR")
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

    return mesaj;
  };

  // Her render'da lisansKartBilgileri'ni hesapla
  const lisansKartBilgileri = getLisansKartBilgileri();

  return (
    <View style={styles.container}>
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
              color={USTAHESAP_TURKUAZ} // UstaHesap turkuaz rengi
            />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.kartBaslik}>{item.title}</Text>
              <Text style={styles.kartAciklama}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Ayarlar Kartı - YENİ */}
        <TouchableOpacity style={styles.kart} onPress={ayarlariGoster}>
          <MaterialCommunityIcons
            name="cog-outline"
            size={30}
            color={USTAHESAP_TURKUAZ} // UstaHesap turkuaz rengi
          />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.kartBaslik}>Ayarlar</Text>
            <Text style={styles.kartAciklama}>
              Uygulama ayarlarını yapılandırın.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Lisans Bilgisi Kartı - Güvenlik kontrolü ekledik */}
        <TouchableOpacity
          style={[
            styles.kart,
            {
              borderLeftColor: lisansKartBilgileri?.renk || "#6c757d",
              borderLeftWidth: 5,
              marginTop: 20,
            },
          ]}
          onPress={lisansBilgileriniGoster}
        >
          <MaterialCommunityIcons
            name={lisansKartBilgileri?.ikon || "help-circle-outline"}
            size={30}
            color={lisansKartBilgileri?.renk || "#6c757d"}
          />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.kartBaslik}>
              {lisansKartBilgileri?.baslik || "Lisans Bilgisi"}
            </Text>
            <Text style={styles.kartAciklama}>
              {lisansKartBilgileri?.aciklama || "Yükleniyor..."}
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color="#6c757d"
          />
        </TouchableOpacity>
      </ScrollView>

      {/* Lisans Bilgisi Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={modalStyles.centeredView}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={modalStyles.modalView}>
                <Text style={modalStyles.modalTitle}>Lisans Bilgileri</Text>
                <Text style={modalStyles.modalText}>
                  {getLisansBilgisiIcerigi()}
                </Text>

                <View style={modalStyles.buttonContainer}>
                  {lisansBilgisi?.tip === "ucretsiz" && (
                    <TouchableOpacity
                      style={[modalStyles.button, modalStyles.buttonUpgrade]}
                      onPress={() => {
                        setModalVisible(false);
                        navigation.navigate("Ayarlar");
                      }}
                    >
                      <Text style={modalStyles.buttonText}>Tam Sürüme Geç</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[modalStyles.button, modalStyles.buttonClose]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={modalStyles.buttonText}>Kapat</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// Modal için yeni stiller
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Yarı saydam arka plan
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 25,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    alignSelf: "center",
  },
  modalText: {
    marginBottom: 20,
    fontSize: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    minWidth: 100,
    alignItems: "center",
  },
  buttonUpgrade: {
    backgroundColor: "#007bff",
  },
  buttonClose: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

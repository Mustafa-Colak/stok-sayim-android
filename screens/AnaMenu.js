import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTema } from "../contexts/ThemeContext"; // ThemeContext'i import et
import AsyncStorage from "@react-native-async-storage/async-storage"; // AsyncStorage'ı import et
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
    screen: "SayimListesi",
    params: { purpose: "selectForReport" },
    description: "Sayı seçerek rapor oluşturun.",
  },
];

export default function AnaMenu() {
  const navigation = useNavigation();
  const { tema, karanlikTema } = useTema(); // ThemeContext'ten tema bilgilerini al
  const [lisansBilgisi, setLisansBilgisi] = useState(null);
  const [kalanGun, setKalanGun] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

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

  // Debug bilgilerini gösteren fonksiyon
  const debugUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("user_data");
      const lastLoginTime = await AsyncStorage.getItem("last_login_time");
      
      Alert.alert(
        "Debug Bilgileri",
        `Kullanıcı Verileri: ${userDataString ? JSON.stringify(JSON.parse(userDataString), null, 2) : "Yok"}\n\nSon Giriş: ${lastLoginTime || "Yok"}`
      );
    } catch (error) {
      console.error("Debug hatası:", error);
      Alert.alert("Hata", "Debug bilgileri alınamadı.");
    }
  };

  // Çıkış yapma fonksiyonu
  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Çıkış Yap",
          onPress: async () => {
            try {
              console.log("Çıkış yapılıyor...");

              // Oturum bilgilerini temizle
              await AsyncStorage.removeItem("last_login_time");

              // Kullanıcı verilerini tamamen sil
              await AsyncStorage.removeItem("user_data");

              console.log("Çıkış yapıldı, Login ekranına yönlendiriliyor...");

              // Login ekranına yönlendir
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (error) {
              console.error("Çıkış yapma hatası:", error);
              Alert.alert("Hata", "Çıkış yapılırken bir hata oluştu.");
            }
          },
        },
      ]
    );
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
    // Ayarlar ekranına yönlendir
    navigation.navigate("Ayarlar");
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

  // Tema renklerini kullanarak dinamik stiller oluştur
  const dinamikStiller = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tema.arkaplan,
      padding: 16,
    },
    kart: {
      backgroundColor: tema.kart,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: karanlikTema ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    kartBaslik: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 4,
      color: tema.metin,
    },
    kartAciklama: {
      fontSize: 14,
      color: tema.ikincilMetin,
    },
    modalView: {
      margin: 20,
      backgroundColor: tema.kart,
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
      color: tema.metin,
    },
    modalText: {
      marginBottom: 20,
      fontSize: 16,
      lineHeight: 24,
      color: tema.metin,
    },
    logoutButton: {
      backgroundColor: "#dc3545",
      marginTop: 20,
    },
    logoutText: {
      color: "#fff",
    },
  });

  return (
    <View style={dinamikStiller.container}>
      <ScrollView>
        {/* Mevcut Menü Öğeleri */}
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={dinamikStiller.kart}
            onPress={() => handlePress(item.screen, item.params)}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={30}
              color={tema.vurgu}
            />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={dinamikStiller.kartBaslik}>{item.title}</Text>
              <Text style={dinamikStiller.kartAciklama}>
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Ayarlar Kartı */}
        <TouchableOpacity style={dinamikStiller.kart} onPress={ayarlariGoster}>
          <MaterialCommunityIcons
            name="cog-outline"
            size={30}
            color={tema.vurgu}
          />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={dinamikStiller.kartBaslik}>Ayarlar</Text>
            <Text style={dinamikStiller.kartAciklama}>
              Uygulama ayarlarını yapılandırın.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Lisans Bilgisi Kartı */}
        <TouchableOpacity
          style={[
            dinamikStiller.kart,
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
            <Text style={dinamikStiller.kartBaslik}>
              {lisansKartBilgileri?.baslik || "Lisans Bilgisi"}
            </Text>
            <Text style={dinamikStiller.kartAciklama}>
              {lisansKartBilgileri?.aciklama || "Yükleniyor..."}
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={tema.ikincilMetin}
          />
        </TouchableOpacity>

        {/* Debug Butonu - Sadece geliştirme modunda göster */}
        {__DEV__ && (
          <TouchableOpacity
            style={[
              dinamikStiller.kart,
              { backgroundColor: "#6c757d", marginTop: 20 }
            ]}
            onPress={debugUserData}
          >
            <MaterialCommunityIcons
              name="bug"
              size={30}
              color="#fff"
            />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={[dinamikStiller.kartBaslik, { color: "#fff" }]}>
                Debug Bilgileri
              </Text>
              <Text style={[dinamikStiller.kartAciklama, { color: "#ddd" }]}>
                Kullanıcı verilerini ve oturum durumunu kontrol et
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Çıkış Yap Butonu */}
        <TouchableOpacity
          style={[dinamikStiller.kart, dinamikStiller.logoutButton]}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={30} color="#fff" />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text
              style={[dinamikStiller.kartBaslik, dinamikStiller.logoutText]}
            >
              Çıkış Yap
            </Text>
            <Text
              style={[dinamikStiller.kartAciklama, dinamikStiller.logoutText]}
            >
              Hesabınızdan güvenli çıkış yapın
            </Text>
          </View>
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
              <View style={dinamikStiller.modalView}>
                <Text style={dinamikStiller.modalTitle}>Lisans Bilgileri</Text>
                <Text style={dinamikStiller.modalText}>
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

// Modal için sabit stiller
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
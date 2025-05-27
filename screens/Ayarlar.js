// e:\edev\stok-sayim\screens\Ayarlar.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTema } from "../contexts/ThemeContext"; // ThemeContext'ten useTema hook'unu import ediyoruz

// Ekran genişliğini al
const screenWidth = Dimensions.get('window').width;
// Küçük ekranlar için kontrol (Samsung Galaxy A51 gibi)
const isSmallScreen = screenWidth < 380;

export default function Ayarlar({ navigation }) {
  // ThemeContext'ten tema bilgilerini al
  const { tema, karanlikTema, temaDegistir } = useTema();
  
  // Özel alanlar
  const [alanlar, setAlanlar] = useState([
    { id: "alan1", isim: "Alan 1", aktif: false },
    { id: "alan2", isim: "Alan 2", aktif: false },
    { id: "alan3", isim: "Alan 3", aktif: false },
    { id: "alan4", isim: "Alan 4", aktif: false },
    { id: "alan5", isim: "Alan 5", aktif: false },
  ]);

  // Düzenleme modu
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);

  // Ayarları yükle
  useEffect(() => {
    ozelAlanlariYukle();
  }, []);

  // Özel alanları yükle
  const ozelAlanlariYukle = async () => {
    try {
      // Özel alanları yükle
      const kayitliAlanlar = await AsyncStorage.getItem("ozel_alanlar");
      if (kayitliAlanlar !== null) {
        setAlanlar(JSON.parse(kayitliAlanlar));
      }
    } catch (error) {
      console.error("Özel alanlar yüklenirken hata oluştu:", error);
    }
  };

  // Tema değişikliğini kaydet - ThemeContext'in temaDegistir fonksiyonunu kullan
  const temaAyariniDegistir = (deger) => {
    temaDegistir(deger);
    Alert.alert(
      "Tema Değiştirildi",
      "Tema ayarı kaydedildi.",
      [{ text: "Tamam" }]
    );
  };

  // Alan durumunu değiştir
  const alanDurumunuDegistir = async (id, deger) => {
    const yeniAlanlar = alanlar.map((alan) =>
      alan.id === id ? { ...alan, aktif: deger } : alan
    );
    setAlanlar(yeniAlanlar);

    try {
      await AsyncStorage.setItem("ozel_alanlar", JSON.stringify(yeniAlanlar));
    } catch (error) {
      console.error("Alan durumu kaydedilirken hata oluştu:", error);
    }
  };

  // Alan ismini değiştir
  const alanIsminiDegistir = (id, yeniIsim) => {
    const yeniAlanlar = alanlar.map((alan) =>
      alan.id === id ? { ...alan, isim: yeniIsim } : alan
    );
    setAlanlar(yeniAlanlar);
  };

  // Değişiklikleri kaydet
  const degisiklikleriKaydet = async () => {
    try {
      await AsyncStorage.setItem("ozel_alanlar", JSON.stringify(alanlar));
      setDuzenlemeModu(false);
      Alert.alert("Başarılı", "Alan isimleri kaydedildi.");
    } catch (error) {
      console.error("Alan isimleri kaydedilirken hata oluştu:", error);
      Alert.alert("Hata", "Alan isimleri kaydedilemedi.");
    }
  };

  // Tema renklerini kullanarak dinamik stiller oluştur
  const dinamikStiller = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: tema.arkaplan,
    },
    baslik: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      color: tema.metin,
    },
    ayarKart: {
      backgroundColor: tema.kart,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: karanlikTema ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    ayarBaslik: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: tema.sinir,
      paddingBottom: 8,
      flexWrap: 'wrap', // Satır sığmazsa alt satıra geç
      justifyContent: 'space-between', // Öğeleri yatayda dağıt
    },
    ayarBaslikIcon: {
      marginRight: 8,
    },
    ayarBaslikText: {
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: "600",
      color: tema.metin,
      flex: isSmallScreen ? undefined : 1, // Küçük ekranlarda flex kullanma
      marginRight: isSmallScreen ? 8 : 0, // Küçük ekranlarda sağ margin ekle
    },
    ayarSatir: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: tema.sinir,
    },
    ayarText: {
      fontSize: 16,
      color: tema.metin,
    },
    bilgiText: {
      fontSize: 14,
      color: tema.ikincilMetin,
      fontStyle: "italic",
      marginBottom: 12,
    },
    alanInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: tema.girdiBorder,
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: 12,
      fontSize: 16,
      color: tema.metin,
      backgroundColor: tema.girdi,
    },
    // Başlık içeriği için container
    baslikIcerik: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: isSmallScreen ? undefined : 1,
    },
    // Buton container'ı
    butonContainer: {
      marginTop: isSmallScreen ? 8 : 0,
      alignSelf: isSmallScreen ? 'flex-end' : undefined,
    }
  });

  return (
    <ScrollView style={dinamikStiller.container}>
      {/* Tema Ayarı */}
      <View style={dinamikStiller.ayarKart}>
        <View style={dinamikStiller.ayarBaslik}>
          <View style={dinamikStiller.baslikIcerik}>
            <MaterialCommunityIcons
              name="theme-light-dark"
              size={24}
              color={tema.vurgu}
              style={dinamikStiller.ayarBaslikIcon}
            />
            <Text style={dinamikStiller.ayarBaslikText}>Tema Ayarları</Text>
          </View>
        </View>

        <View style={dinamikStiller.ayarSatir}>
          <Text style={dinamikStiller.ayarText}>Karanlık Tema</Text>
          <Switch
            value={karanlikTema}
            onValueChange={temaAyariniDegistir}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={karanlikTema ? "#007bff" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Özel Alanlar */}
      <View style={dinamikStiller.ayarKart}>
        <View style={dinamikStiller.ayarBaslik}>
          <View style={dinamikStiller.baslikIcerik}>
            <MaterialCommunityIcons
              name="form-textbox"
              size={24}
              color={tema.vurgu}
              style={dinamikStiller.ayarBaslikIcon}
            />
            <Text style={dinamikStiller.ayarBaslikText}>Özel Alanlar</Text>
          </View>

          <View style={dinamikStiller.butonContainer}>
            <TouchableOpacity
              style={[styles.duzenleButon, { backgroundColor: tema.vurgu }]}
              onPress={() => {
                if (duzenlemeModu) {
                  degisiklikleriKaydet();
                } else {
                  setDuzenlemeModu(true);
                }
              }}
            >
              <Text style={styles.duzenleButonText}>
                {duzenlemeModu ? "Kaydet" : "Düzenle"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={dinamikStiller.bilgiText}>
          Aktif edilen alanlar sayım detayında görünür. Alanlar aktif
          edildiğinde hızlı sayım modu pasif olur.
        </Text>

        {alanlar.map((alan) => (
          <View key={alan.id} style={dinamikStiller.ayarSatir}>
            {duzenlemeModu ? (
              <TextInput
                style={dinamikStiller.alanInput}
                value={alan.isim}
                onChangeText={(text) => alanIsminiDegistir(alan.id, text)}
                placeholder="Alan adını girin"
                placeholderTextColor={tema.ikincilMetin}
              />
            ) : (
              <Text style={dinamikStiller.ayarText}>{alan.isim}</Text>
            )}
            <Switch
              value={alan.aktif}
              onValueChange={(deger) => alanDurumunuDegistir(alan.id, deger)}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={alan.aktif ? "#007bff" : "#f4f3f4"}
            />
          </View>
        ))}
      </View>

      {/* Lisans Bilgileri */}
      <View style={dinamikStiller.ayarKart}>
        <View style={dinamikStiller.ayarBaslik}>
          <View style={dinamikStiller.baslikIcerik}>
            <MaterialCommunityIcons 
              name="license" 
              size={24} 
              color={tema.vurgu}
              style={dinamikStiller.ayarBaslikIcon}
            />
            <Text style={dinamikStiller.ayarBaslikText}>Lisans Bilgileri</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.lisansButon}>
          <Text style={styles.lisansButonText}>Tam Sürüme Geç</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Sabit stiller
const styles = StyleSheet.create({
  duzenleButon: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    minWidth: 80, // Minimum genişlik
    alignItems: 'center', // İçeriği ortala
  },
  duzenleButonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14, // Daha küçük font boyutu
  },
  lisansButon: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  lisansButonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
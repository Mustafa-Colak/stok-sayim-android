import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { lisansBilgisiYukle, tamSurumeYukselt, denemeSuresiniKontrolEt } from "../utils/LisansYonetimi";
import common from "../styles/CommonStyles";

export default function Ayarlar() {
  const [lisansBilgisi, setLisansBilgisi] = useState(null);
  const [lisansKodu, setLisansKodu] = useState("");
  const [kalanGun, setKalanGun] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const bilgileriYukle = async () => {
      const lisans = await lisansBilgisiYukle();
      setLisansBilgisi(lisans);
      
      const sureDurumu = await denemeSuresiniKontrolEt();
      if (!sureDurumu.sureDoldu) {
        setKalanGun(sureDurumu.kalanGun || 0);
      }
      
      setYukleniyor(false);
    };
    
    bilgileriYukle();
  }, []);

  const lisansKoduOnayla = async () => {
    if (!lisansKodu.trim()) {
      Alert.alert("Hata", "Lütfen bir lisans kodu girin.");
      return;
    }
    
    const sonuc = await tamSurumeYukselt(lisansKodu);
    if (sonuc.basarili) {
      Alert.alert("Başarılı", "Tam sürüme başarıyla yükseltildi. Tüm özellikler artık kullanılabilir.");
      // Lisans bilgisini güncelle
      const yeniLisans = await lisansBilgisiYukle();
      setLisansBilgisi(yeniLisans);
      setLisansKodu("");
    } else {
      Alert.alert("Hata", sonuc.mesaj || "Lisans kodu doğrulanamadı.");
    }
  };

  if (yukleniyor) {
    return (
      <View style={[common.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={common.container}>
      <Text style={common.title}>Ayarlar</Text>
      
      {/* Lisans Bilgisi */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lisans Bilgisi</Text>
        <View style={styles.lisansKutusu}>
          <Text style={styles.lisansBaslik}>
            Mevcut Lisans: 
            <Text style={[
              styles.lisansTipi, 
              {color: lisansBilgisi?.tip === "ucretli" ? "#28a745" : "#dc3545"}
            ]}>
              {" "}{lisansBilgisi?.tip === "ucretli" ? "TAM SÜRÜM" : "ÜCRETSİZ SÜRÜM"}
            </Text>
          </Text>
          
          {lisansBilgisi?.tip !== "ucretli" && (
            <>
              <Text style={styles.kalanGun}>
                Deneme sürenizin bitmesine {kalanGun} gün kaldı.
              </Text>
              
              <Text style={styles.limitBilgisi}>
                Ücretsiz sürüm limitleri:
              </Text>
              <Text style={styles.limitDetay}>• Maksimum 3 aktif sayım</Text>
              <Text style={styles.limitDetay}>• Her sayımda maksimum 50 ürün</Text>
              <Text style={styles.limitDetay}>• 30 günlük deneme süresi</Text>
              
              <View style={styles.lisansGirisKutusu}>
                <TextInput
                  value={lisansKodu}
                  onChangeText={setLisansKodu}
                  placeholder="Lisans kodunu girin"
                  style={styles.lisansInput}
                />
                <TouchableOpacity 
                  style={styles.lisansBtn}
                  onPress={lisansKoduOnayla}
                >
                  <Text style={styles.lisansBtnText}>Etkinleştir</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.satinAlBtn}
                onPress={() => Alert.alert(
                  "Satın Alma", 
                  "Gerçek bir uygulamada burada satın alma sayfasına yönlendirme yapılır."
                )}
              >
                <MaterialCommunityIcons name="cart-outline" size={20} color="#fff" />
                <Text style={styles.satinAlBtnText}>Tam Sürümü Satın Al</Text>
              </TouchableOpacity>
            </>
          )}
          
          {lisansBilgisi?.tip === "ucretli" && (
            <Text style={styles.tesekkur}>
              Tam sürümü satın aldığınız için teşekkür ederiz! Tüm özelliklere sınırsız erişiminiz var.
            </Text>
          )}
        </View>
      </View>
      
      {/* Diğer ayarlar buraya eklenebilir */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uygulama Hakkında</Text>
        <Text style={styles.versiyon}>Versiyon: 1.0.0</Text>
        <Text style={styles.telif}>© 2025 Stok Sayım Uygulaması</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  lisansKutusu: {
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
  },
  lisansBaslik: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  lisansTipi: {
    fontWeight: "bold",
  },
  kalanGun: {
    fontSize: 14,
    marginBottom: 15,
    color: "#dc3545",
  },
  limitBilgisi: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  limitDetay: {
    fontSize: 14,
    marginBottom: 3,
    marginLeft: 5,
  },
  lisansGirisKutusu: {
    flexDirection: "row",
    marginTop: 15,
    marginBottom: 15,
  },
  lisansInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    padding: 8,
    marginRight: 10,
  },
  lisansBtn: {
    backgroundColor: "#007bff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 4,
    justifyContent: "center",
  },
  lisansBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  satinAlBtn: {
    backgroundColor: "#28a745",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 4,
  },
  satinAlBtnText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  tesekkur: {
    fontSize: 14,
    color: "#28a745",
    fontWeight: "500",
  },
  versiyon: {
    fontSize: 14,
    marginBottom: 5,
  },
  telif: {
    fontSize: 12,
    color: "#6c757d",
  },
});
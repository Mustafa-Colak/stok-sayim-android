// e:\edev\stok-sayim\screens\SayimListesi.js
import React, { useState, useCallback, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Swipeable from "react-native-gesture-handler/Swipeable";
import styles from "../styles/SayimListesiStyles"; // Stil dosyasını import ediyoruz

export default function SayimListesi() {
  const navigation = useNavigation();
  const route = useRoute(); // route parametrelerine erişim için
  const [sayimlar, setSayimlar] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [silinenSayimId, setSilinenSayimId] = useState(null);
  const [kapatilanSayimId, setKapatilanSayimId] = useState(null);
  let rowRefs = new Map();

  const isSelectForReportMode = route.params?.purpose === "selectForReport";

  const fetchSayimlar = useCallback(async () => {
    setRefreshing(true);
    try {
      const sayimlarListesiStr = await AsyncStorage.getItem("sayimlar");
      if (sayimlarListesiStr) {
        const sayimlarMetadaListesi = JSON.parse(sayimlarListesiStr);

        const enrichedSayimlar = await Promise.all(
          sayimlarMetadaListesi.map(async (meta) => {
            let urunSayisi = 0;
            if (meta.id) {
              try {
                const urunlerStr = await AsyncStorage.getItem(
                  `sayim_${meta.id}`
                );
                if (urunlerStr) {
                  const urunler = JSON.parse(urunlerStr);
                  urunSayisi = urunler.length;
                }
              } catch (e) {
                console.error(
                  `SayimListesi: sayim ${meta.id} için ürün sayısı alınırken hata:`,
                  e
                );
                urunSayisi = meta.urunSayisi || 0;
              }
            } else {
              urunSayisi = meta.urunSayisi || 0;
            }
            return {
              id: meta.id,
              not: meta.not, 
              tarih: meta.tarih, 
              durum: meta.durum || "Başlamadı",
              urunSayisi: urunSayisi,
            };
          })
        );

        setSayimlar(
          enrichedSayimlar.sort((a, b) => {
            const dateA = a.tarih ? new Date(a.tarih) : null;
            const dateB = b.tarih ? new Date(b.tarih) : null;

            // Geçersiz tarihleri sona at
            if (dateA && isNaN(dateA.getTime())) return 1;
            if (dateB && isNaN(dateB.getTime())) return -1;
            if (!dateA && dateB) return 1;
            if (dateA && !dateB) return -1;
            if (!dateA && !dateB) return 0; // İkisi de null ise sıralama değişmesin

            return dateB - dateA; // En yeni tarih en üste
          })
        );
      } else {
        setSayimlar([]);
      }
    } catch (error) {
      console.error("Sayimlar yüklenirken hata:", error);
      Alert.alert("Hata", "Sayımlar yüklenemedi.");
    }
    setRefreshing(false);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isSelectForReportMode
        ? "Rapor için Sayım Seçin"
        : "Stok Sayım / Sayımlar",
      headerRight: () =>
        !isSelectForReportMode && (
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={28}
            color="#fff"
            style={{ marginRight: 16 }}
            onPress={() => navigation.navigate("YeniSayim")}
          />
        ),
      headerTintColor: "#fff",
      headerStyle: { backgroundColor: "#007bff" },
    });
  }, [navigation, isSelectForReportMode]);

  useFocusEffect(
    useCallback(() => {
      fetchSayimlar();
      if (silinenSayimId) setSilinenSayimId(null);
      if (kapatilanSayimId) setKapatilanSayimId(null);
      return () => {
        rowRefs.forEach((ref) => ref?.close());
        rowRefs.clear();
      };
    }, [fetchSayimlar, silinenSayimId, kapatilanSayimId])
  );

  const handleKapat = async (sayimId, sayimNotu) => {
    Alert.alert(
      "Sayımı Kapat",
      `"${sayimNotu}" notlu sayımı kapatmak istediğinizden emin misiniz? Kapatılan sayım düzenlenemez.`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Evet, Kapat",
          onPress: async () => {
            try {
              const sayimlarStr = await AsyncStorage.getItem("sayimlar");
              if (sayimlarStr) {
                let sayimlarArray = JSON.parse(sayimlarStr);
                sayimlarArray = sayimlarArray.map((s) =>
                  s.id === sayimId ? { ...s, durum: "Kapandı" } : s
                );
                await AsyncStorage.setItem(
                  "sayimlar",
                  JSON.stringify(sayimlarArray)
                );
                setKapatilanSayimId(sayimId); // Animasyon için
                fetchSayimlar(); // Listeyi yenile
              }
            } catch (error) {
              console.error("Sayım kapatma hatası:", error);
              Alert.alert("Hata", "Sayım kapatılamadı.");
            }
          },
        },
      ]
    );
  };

  const handleSil = async (sayimId, sayimNotu) => {
    Alert.alert(
      "Sayımı Sil",
      `"${sayimNotu}" notlu sayımı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Evet, Sil",
          style: "destructive",
          onPress: async () => {
            try {
              // Ana sayımlar listesinden sil
              const sayimlarStr = await AsyncStorage.getItem("sayimlar");
              if (sayimlarStr) {
                let sayimlarArray = JSON.parse(sayimlarStr);
                sayimlarArray = sayimlarArray.filter((s) => s.id !== sayimId);
                await AsyncStorage.setItem(
                  "sayimlar",
                  JSON.stringify(sayimlarArray)
                );
              }
              // Sayıma ait ürünleri sil
              await AsyncStorage.removeItem(`sayim_${sayimId}`);
              setSilinenSayimId(sayimId); // Animasyon için
              fetchSayimlar(); // Listeyi yenile
            } catch (error) {
              console.error("Sayım silme hatası:", error);
              Alert.alert("Hata", "Sayım silinemedi.");
            }
          },
        },
      ]
    );
  };

  const handleSayimPress = (item) => {
    if (isSelectForReportMode) {
      navigation.navigate("RaporOlustur", {
        sayimNot: item.not,
        sayimId: item.id, // RaporOlustur ekranı sayimId'yi de bekliyor
      });
    } else {
      navigation.navigate("SayimDetay", {
        sayimId: item.id,
        sayimNot: item.not,
        sayimDurumu: item.durum,
      });
    }
  };

  const renderRightActions = (progress, dragX, item) => {
    if (item.durum === "Kapandı" || isSelectForReportMode) {
      return null;
    }
    return (
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: "#28a745" }]} // Yeşil renk kapatma için
          onPress={() => {
            rowRefs.get(item.id)?.close();
            handleKapat(item.id, item.not);
          }}
        >
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton} // Kırmızı renk silme için (varsayılan)
          onPress={() => {
            rowRefs.get(item.id)?.close();
            handleSil(item.id, item.not);
          }}
        >
          <MaterialCommunityIcons
            name="delete-outline"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    if (silinenSayimId === item.id || kapatilanSayimId === item.id) {
      return (
        <View style={styles.deletedRow}>
          <Text style={styles.itemText}>
            {kapatilanSayimId === item.id
              ? `"${item.not}" kapatıldı.`
              : `"${item.not}" silindi.`}
          </Text>
        </View>
      );
    }

    const durumStyle =
      item.durum === "baslamamis" // Durumları küçük harfle kontrol et
        ? styles.durumBaslamamis
        : item.durum === "devam" // Durumları küçük harfle kontrol et
        ? styles.durumDevam
        : styles.durumKapandi;

    let tarihGosterimi = "Tarih bilgisi yok";
    if (item.tarih) {
      const tarihObj = new Date(item.tarih);
      if (!isNaN(tarihObj.getTime())) {
        tarihGosterimi = tarihObj.toLocaleDateString("tr-TR");
      }
    }

    return (
      <Swipeable
        ref={(ref) => rowRefs.set(item.id, ref)}
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, item)
        }
        overshootRight={false}
        enabled={item.durum !== "Kapandı" && !isSelectForReportMode}
      >
        <TouchableOpacity
          style={styles.itemRow}
          onPress={() => handleSayimPress(item)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.itemText}>{item.not}</Text>
            <Text style={{ fontSize: 12, color: "#777" }}>
              {tarihGosterimi} - {item.urunSayisi || 0} ürün
            </Text>
          </View>
          <Text style={[styles.durumText, durumStyle]}>{item.durum}</Text>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      {sayimlar.length === 0 && !refreshing ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 18, color: "#888" }}>
            Henüz sayım kaydı bulunmuyor.
          </Text>
          {!isSelectForReportMode && (
            <TouchableOpacity
              style={[
                styles.button,
                { marginTop: 20, backgroundColor: "#28a745", width: "80%" },
              ]}
              onPress={() => navigation.navigate("YeniSayim")}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <Text style={styles.buttonText}> Yeni Sayım Oluştur</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={sayimlar}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchSayimlar}
              colors={["#007bff"]}
            />
          }
        />
      )}
    </View>
  );
}
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import common from "../styles/CommonStyles";

const durumMetni = {
  baslamamis: "Başlamamış",
  devam: "Devam Ediyor",
  kapandi: "Kapanmış",
};

export default function SayimListesi({ navigation, route }) {
  const [sayimlar, setSayimlar] = useState([]);
  const [silinenSayimlar, setSilinenSayimlar] = useState([]);

  // Sayımları ve durumlarını yükle
  const sayimlariYukle = async () => {
    try {
      const veri = await AsyncStorage.getItem("sayimlar");
      if (!veri) {
        return;
      }

      let sayimlar = JSON.parse(veri);

      // Her sayımın durumunu kontrol et ve güncelle
      const guncelSayimlar = await Promise.all(
        sayimlar.map(async (sayim) => {
          // Sayımın ürünlerini kontrol et
          const urunVeri = await AsyncStorage.getItem(`sayim_${sayim.id}`);
          const urunler = urunVeri ? JSON.parse(urunVeri) : [];

          // Sayım durumunu güncelle
          let guncelDurum = sayim.durum;
          if (sayim.durum !== "kapandi") {
            guncelDurum = urunler.length === 0 ? "baslamamis" : "devam";
          }
          
          return {
            ...sayim,
            durum: guncelDurum
          };
        })
      );
      
      // Güncel sayımları AsyncStorage'a kaydet
      await AsyncStorage.setItem("sayimlar", JSON.stringify(guncelSayimlar));
      
      // State'i güncelle
      setSayimlar(guncelSayimlar);
    } catch (e) {
      Alert.alert("Hata", "Sayım listesi yüklenemedi.");
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      sayimlariYukle();
    });
    return unsubscribe;
  }, [navigation]);

  // Sayım durumu değiştiğinde otomatik yenile
  useEffect(() => {
    if (route.params?.durumuGuncelle) {
      sayimlariYukle();
      // Parametreyi temizle
      navigation.setParams({ durumuGuncelle: undefined });
    }
  }, [route.params?.durumuGuncelle]);

  const yeniSayimEkle = () => {
    navigation.navigate("YeniSayim", {
      onEkle: async (yeni) => {
        const guncel = [...sayimlar, yeni];
        await AsyncStorage.setItem("sayimlar", JSON.stringify(guncel));
        setSayimlar(guncel);
            },
    });
  };

  const sayimSil = async (id) => {
    const silinen = sayimlar.find((s) => s.id === id);
    const kalan = sayimlar.filter((s) => s.id !== id);

    setSayimlar(kalan);
    setSilinenSayimlar((prev) => [...prev, silinen]);

    await AsyncStorage.setItem("sayimlar", JSON.stringify(kalan));
    await AsyncStorage.removeItem(`sayim_${id}`);
  };

  const sayimGeriAl = async (id) => {
    const geriAlinan = silinenSayimlar.find((s) => s.id === id);
    const yeniSayimlar = [...sayimlar, geriAlinan];
    const yeniSilinen = silinenSayimlar.filter((s) => s.id !== id);

    setSayimlar(yeniSayimlar);
    setSilinenSayimlar(yeniSilinen);
    await AsyncStorage.setItem("sayimlar", JSON.stringify(yeniSayimlar));
  };

  const silmeButonu = (id) => (
    <TouchableOpacity
      style={styles.deleteButton}
        onPress={() =>
        Alert.alert(
          "Sayımı Sil",
          "Bu sayımı silmek istediğinize emin misiniz?",
          [
            { text: "İptal", style: "cancel" },
            {
              text: "Sil",
              style: "destructive",
              onPress: () => sayimSil(id),
  },
          ]
        )
      }
    >
      <MaterialCommunityIcons name="trash-can-outline" size={24} color="#fff" />
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => silmeButonu(item.id)}>
      <TouchableOpacity
        style={styles.itemRow}
        onPress={() =>
          navigation.navigate("SayimDetay", {
            sayimId: item.id,
            sayimAd: item.ad,
          })
        }
      >
        <Text style={styles.itemText}>{item.ad}</Text>
        <Text style={[
          styles.durumText, 
          item.durum === "baslamamis" ? styles.durumBaslamamis : 
          item.durum === "devam" ? styles.durumDevam : 
          styles.durumKapandi
        ]}>
          {durumMetni[item.durum] || "Durum Yok"}
          </Text>
      </TouchableOpacity>
    </Swipeable>
  );

  const renderSilinen = ({ item }) => (
    <View style={styles.deletedRow}>
      <Text style={styles.itemText}>{item.ad}</Text>
      <TouchableOpacity onPress={() => sayimGeriAl(item.id)}>
        <Text style={styles.undoText}>Geri Al</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={common.container}>
      <Text style={common.title}>Sayım Listesi</Text>

      <FlatList
        data={sayimlar}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={common.subtitle}>Henüz kayıtlı sayım yok.</Text>
}
      />

      {silinenSayimlar.length > 0 && (
        <>
          <Text style={[common.title, { marginTop: 30 }]}>
            Silinen Sayımlar
          </Text>
          <FlatList
            data={silinenSayimlar}
            keyExtractor={(item) => item.id}
            renderItem={renderSilinen}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </>
      )}

      <TouchableOpacity style={common.floatingButton} onPress={yeniSayimEkle}>
        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "bold", marginLeft: 5 }}>
          Yeni Sayım
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  itemRow: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  deletedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#eee",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  durumText: {
    fontSize: 14,
    position: "absolute",
    right: 20,
    top: 18,
  },
  durumBaslamamis: {
    color: "#888",
  },
  durumDevam: {
    color: "#007bff",
    fontWeight: "500",
  },
  durumKapandi: {
    color: "#28a745",
    fontWeight: "500",
  },
  undoText: {
    color: "#007bff",
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginHorizontal: 20,
  },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 64,
  },
});
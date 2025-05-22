// e:\edev\stok-sayim\screens\RaporOlustur.js
import React, { useLayoutEffect, useEffect, useState } from "react";
import { View, Text, Alert, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import { useTema } from "../contexts/ThemeContext"; // ThemeContext'i import et

import common from "../styles/CommonStyles";
import styles from "../styles/RaporOlusturStyles";

export default function RaporOlustur({ navigation, route }) {
  const { tema, karanlikTema } = useTema(); // ThemeContext'ten tema bilgilerini al
  const { sayimId, sayimNot } = route.params || {};

  // Eğer sayimId veya sayimNot yoksa, kullanıcıyı uyar ve geri gönder
  useEffect(() => {
    if (!sayimId || !sayimNot) {
      Alert.alert(
        "Hata",
        "Sayım bilgileri bulunamadı. Lütfen tekrar deneyin.",
        [{ text: "Tamam", onPress: () => navigation.goBack() }]
      );
    }
  }, [sayimId, sayimNot, navigation]);

  const STORAGE_KEY = `sayim_${sayimId}`;
  const [urunler, setUrunler] = useState([]);
  // Dosya adını otomatik olarak sayım notundan oluştur
  const dosyaAdi = sayimNot
    ? sayimNot.replace(/\s+/g, "_").toLowerCase()
    : "rapor";

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Dışa Aktar",
    });
  }, [navigation]);

  useEffect(() => {
    const yukle = async () => {
      if (!sayimId) return;

      try {
        const veri = await AsyncStorage.getItem(STORAGE_KEY);
        if (veri) {
          const parsedData = JSON.parse(veri);
          // Yüklenen veride ad alanı eksikse ekleyelim (geriye dönük uyumluluk)
          const urunlerWithAd = parsedData.map((item) => ({
            ...item,
            ad: item.ad || "", // Eğer ad yoksa veya null/undefined ise boş string yap
          }));
          setUrunler(urunlerWithAd);
          console.log(`${urunlerWithAd.length} ürün yüklendi`);
        } else {
          console.log("Ürün verisi bulunamadı");
          setUrunler([]); // Veri yoksa boş array set et
        }
      } catch (e) {
        console.error("Veri yükleme hatası:", e);
        Alert.alert("Hata", "Ürünler yüklenemedi: " + e.message);
        setUrunler([]); // Hata durumunda boş array set et
      }
    };
    yukle();
  }, [sayimId, STORAGE_KEY]);

  const csvUret = () => {
    if (urunler.length === 0) return null;
    // Kolon sıralamasını değiştirdim: Barkod - Miktar - Not
    let csv = "Barkod,Miktar,Not\n";
    urunler.forEach((u) => {
      // CSV formatı için özel karakterleri düzgün escape et ve undefined/null kontrolü yap
      const barkod = u.barkod
        ? `"${String(u.barkod).replace(/"/g, '""')}"`
        : '""';
      const ad = u.ad ? `"${String(u.ad).replace(/"/g, '""')}"` : '""';
      // Sıralamayı değiştirdim: barkod, miktar, ad (not)
      csv += `${barkod},${u.miktar},${ad}\n`;
    });
    return csv;
  };

  const jsonUret = () => {
    if (urunler.length === 0) return null;
    // JSON formatında da alanların sırasını değiştirdim
    return JSON.stringify(
      urunler.map((u) => ({
        barkod: u.barkod || "",
        miktar: u.miktar,
        not: u.ad || "", // ad alanını not olarak adlandırdım
      })),
      null,
      2
    );
  };

  const pdfUret = () => {
    if (urunler.length === 0) return null;

    // HTML özel karakterleri escape et
    const escapeHTML = (str) => {
      // str null veya undefined ise boş string döndür
      if (str === null || str === undefined) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    // Tablo satırlarını oluştururken sıralamayı değiştirdim
    const rows = urunler
      .map(
        (u) => `
      <tr>
        <td>${escapeHTML(u.barkod || "")}</td>
        <td>${u.miktar}</td>
        <td>${escapeHTML(u.ad || "")}</td>
      </tr>
    `
      )
      .join("");

    // PDF için karanlık tema desteği ekle
    const pdfStyle = karanlikTema 
      ? `
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #2d2d2d; color: #fff; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #555; padding: 8px; text-align: left; }
        th { background-color: #444; }
        h1 { text-align: center; }
      `
      : `
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        h1 { text-align: center; }
      `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            ${pdfStyle}
          </style>
        </head>
        <body>
          <h1>${escapeHTML(sayimNot)} - Stok Raporu</h1>
          <p>Tarih: ${new Date().toLocaleDateString()}</p>
          <p>Toplam Ürün: ${urunler.length}</p>
          <table>
            <tr><th>Barkod</th><th>Miktar</th><th>Not</th></tr>
            ${rows}
          </table>
        </body>
      </html>
    `;
  };

  const dosyaPaylas = async (veri, dosyaAdiParam, mime, format) => {
    if (!veri) {
      Alert.alert("Uyarı", "Sayımda ürün yok.");
      return;
    }

    try {
      const path = `${FileSystem.documentDirectory}${dosyaAdiParam}`;
      console.log(`Dosya oluşturuluyor: ${path}`);

      await FileSystem.writeAsStringAsync(path, veri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      console.log("Dosya yazıldı");

      if (await Sharing.isAvailableAsync()) {
        console.log("Paylaşım başlatılıyor");
        await Sharing.shareAsync(path, { mimeType: mime, UTI: mime });
        console.log("Paylaşım tamamlandı");
      } else {
        Alert.alert("Paylaşım desteklenmiyor", "Dosya konumu: " + path);
      }
    } catch (e) {
      console.error(`${format} oluşturma hatası:`, e);
      Alert.alert("Hata", `${format} oluşturulamadı: ${e.message}`);
    }
  };

  const raporCSV = () => {
    const csv = csvUret();
    dosyaPaylas(csv, `${dosyaAdi}.csv`, "text/csv", "CSV");
  };

  const raporJSON = () => {
    const json = jsonUret();
    dosyaPaylas(json, `${dosyaAdi}.json`, "application/json", "JSON");
  };

  const raporPDF = async () => {
    const html = pdfUret();
    if (!html) {
      Alert.alert("Uyarı", "Sayımda ürün yok.");
      return;
    }

    try {
      console.log("PDF oluşturuluyor...");
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });
      console.log(`PDF oluşturuldu: ${uri}`);

      // Oluşturulan PDF'i kullanıcının istediği isimle yeni bir dosyaya kopyala
      const yeniDosyaYolu = `${FileSystem.documentDirectory}${dosyaAdi}.pdf`;

      // Önce eski dosya varsa sil
      try {
        const dosyaBilgisi = await FileSystem.getInfoAsync(yeniDosyaYolu);
        if (dosyaBilgisi.exists) {
          await FileSystem.deleteAsync(yeniDosyaYolu);
        }
      } catch (e) {
        console.log("Eski dosya silme hatası (önemli değil):", e);
      }

      // Dosyayı kopyala
      await FileSystem.copyAsync({
        from: uri,
        to: yeniDosyaYolu,
      });

      console.log(`PDF kopyalandı: ${yeniDosyaYolu}`);

      if (await Sharing.isAvailableAsync()) {
        console.log("PDF paylaşılıyor");
        await Sharing.shareAsync(yeniDosyaYolu, {
          mimeType: "application/pdf",
          dialogTitle: `${dosyaAdi}.pdf Paylaş`,
        });
        console.log("PDF paylaşıldı");
      } else {
        Alert.alert(
          "Paylaşım desteklenmiyor",
          "Dosya konumu: " + yeniDosyaYolu
        );
      }
    } catch (e) {
      console.error("PDF oluşturma hatası:", e);
      Alert.alert("Hata", "PDF oluşturulamadı: " + e.message);
    }
  };

  // Tema renklerini kullanarak dinamik stiller oluştur
  const dinamikStiller = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: tema.arkaplan,
    },
    subtitle: {
      fontWeight: "bold", 
      fontSize: 18,
      color: tema.metin,
      textAlign: "center",
      marginVertical: 10,
    },
    urunSayisi: {
      textAlign: "center", 
      color: tema.ikincilMetin,
      marginBottom: 10,
    },
    cardContainer: {
      marginTop: 20,
    },
    card: {
      backgroundColor: tema.kart,
      borderWidth: 2,
      borderRadius: 8,
      padding: 20,
      marginVertical: 10,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: karanlikTema ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "bold",
    }
  });

  const kart = (baslik, onPress, renk) => {
    // Karanlık temada daha uygun renkler kullan
    const renkDegeri = karanlikTema ? {
      "#007bff": "#4a9eff", // Mavi rengi daha açık
      "#28a745": "#4caf50", // Yeşil rengi daha açık
      "#6f42c1": "#9b74d2"  // Mor rengi daha açık
    }[renk] || renk : renk;
    
    return (
      <TouchableOpacity
        style={[dinamikStiller.card, { borderColor: renkDegeri }]}
        onPress={onPress}
      >
        <Text style={[dinamikStiller.cardTitle, { color: renkDegeri }]}>{baslik}</Text>
      </TouchableOpacity>
    );
  };

  // Eğer sayimId veya sayimNot yoksa, boş bir ekran göster veya yükleniyor mesajı
  if (!sayimId || !sayimNot) {
    return (
      <View style={dinamikStiller.container}>
        <Text style={{ color: tema.metin }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ backgroundColor: tema.arkaplan }}
      contentContainerStyle={dinamikStiller.container}
    >
      <Text style={dinamikStiller.subtitle}>
        Seçilen Sayım: {sayimNot}
      </Text>

      <Text style={dinamikStiller.urunSayisi}>
        Toplam {urunler.length} Ürün
      </Text>

      <View style={dinamikStiller.cardContainer}>
        {kart("CSV Olarak Dışa Aktar", raporCSV, "#007bff")}
        {kart("PDF Olarak Dışa Aktar", raporPDF, "#28a745")}
        {kart("JSON Olarak Dışa Aktar", raporJSON, "#6f42c1")}
      </View>
    </ScrollView>
  );
}
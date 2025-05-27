// e:\edev\stok-sayim\screens\RaporOlustur.js
import React, { useLayoutEffect, useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
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
  // Özel alanlar için state
  const [ozelAlanlar, setOzelAlanlar] = useState([]);
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
        // Özel alanları yükle
        const alanlarJson = await AsyncStorage.getItem("ozel_alanlar");
        if (alanlarJson) {
          const alanlar = JSON.parse(alanlarJson);
          setOzelAlanlar(alanlar);
        }

        // Ürünleri yükle
        const veri = await AsyncStorage.getItem(STORAGE_KEY);
        if (veri) {
          const parsedData = JSON.parse(veri);
          // Yüklenen veride ad alanı eksikse ekleyelim (geriye dönük uyumluluk)
          const urunlerWithAd = parsedData.map((item) => ({
            ...item,
            ad: item.ad || "", // Eğer ad yoksa veya null/undefined ise boş string yap
            ozelAlanlar: item.ozelAlanlar || {}, // Eğer ozelAlanlar yoksa boş obje yap
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

  // Aktif özel alanları filtrele
  const aktifOzelAlanlar = ozelAlanlar.filter((alan) => alan.aktif);

  // Ürünlerde kullanılmış olan tüm özel alanları tespit et
  const kullanilmisOzelAlanlar = React.useMemo(() => {
    // Tüm özel alanları içeren bir harita oluştur
    const tumAlanlar = {};
    ozelAlanlar.forEach((alan) => {
      tumAlanlar[alan.id] = { ...alan };
    });

    // Ürünlerde kullanılmış alanları tespit et
    const kullanilmisAlanIds = new Set();
    urunler.forEach((urun) => {
      if (urun.ozelAlanlar) {
        Object.keys(urun.ozelAlanlar).forEach((alanId) => {
          // Eğer bu alanda bir değer varsa ve boş değilse
          if (
            urun.ozelAlanlar[alanId] &&
            urun.ozelAlanlar[alanId].trim() !== ""
          ) {
            kullanilmisAlanIds.add(alanId);
          }
        });
      }
    });

    // Kullanılmış alanları döndür
    return ozelAlanlar.filter((alan) => kullanilmisAlanIds.has(alan.id));
  }, [urunler, ozelAlanlar]);

  // Raporlarda gösterilecek alanlar - hem aktif hem de kullanılmış alanları içerir
  const gosterilecekAlanlar = React.useMemo(() => {
    // Önce aktif alanları ekle
    const alanMap = new Map();
    aktifOzelAlanlar.forEach((alan) => {
      alanMap.set(alan.id, alan);
    });

    // Sonra kullanılmış ama aktif olmayan alanları ekle
    kullanilmisOzelAlanlar.forEach((alan) => {
      if (!alanMap.has(alan.id)) {
        alanMap.set(alan.id, alan);
      }
    });

    // Map'ten array'e dönüştür
    return Array.from(alanMap.values());
  }, [aktifOzelAlanlar, kullanilmisOzelAlanlar]);

  const csvUret = () => {
    if (urunler.length === 0) return null;

    // CSV başlık satırını oluştur - İstenen sıralama: Barkod, Özel Alanlar, Not, Miktar
    let basliklar = ["Barkod"];

    // Gösterilecek özel alanları başlıklara ekle
    gosterilecekAlanlar.forEach((alan) => {
      basliklar.push(alan.isim);
    });

    // Not ve Miktar alanlarını sona ekle
    basliklar.push("Not", "Miktar");

    // CSV başlık satırını oluştur
    let csv = basliklar.join(",") + "\n";

    // Her ürün için satır oluştur
    urunler.forEach((u) => {
      // CSV formatı için özel karakterleri düzgün escape et ve undefined/null kontrolü yap
      const barkod = u.barkod
        ? `"${String(u.barkod).replace(/"/g, '""')}"`
        : '""';
      const ad = u.not ? `"${String(u.not).replace(/"/g, '""')}"` : '""';

      // Barkod ile başla
      let satir = barkod;

      // Gösterilecek özel alanları ekle
      gosterilecekAlanlar.forEach((alan) => {
        const deger =
          u.ozelAlanlar && u.ozelAlanlar[alan.id]
            ? `"${String(u.ozelAlanlar[alan.id]).replace(/"/g, '""')}"`
            : '""';
        satir += `,${deger}`;
      });

      // Not ve Miktar alanlarını ekle
      satir += `,${ad},${u.miktar}`;

      csv += satir + "\n";
    });

    return csv;
  };

  // Tab aralıklı text (TSV) formatı oluşturma fonksiyonu
  const tsvUret = () => {
    if (urunler.length === 0) return null;

    // TSV başlık satırını oluştur - İstenen sıralama: Barkod, Özel Alanlar, Not, Miktar
    let basliklar = ["Barkod"];

    // Gösterilecek özel alanları başlıklara ekle
    gosterilecekAlanlar.forEach((alan) => {
      basliklar.push(alan.isim);
    });

    // Not ve Miktar alanlarını sona ekle
    basliklar.push("Not", "Miktar");

    // TSV başlık satırını oluştur
    let tsv = basliklar.join("\t") + "\n";

    // Her ürün için satır oluştur
    urunler.forEach((u) => {
      // TSV formatı için özel karakterleri düzgün escape et ve undefined/null kontrolü yap
      const barkod = u.barkod ? String(u.barkod).replace(/\t/g, " ") : "";
      const not = u.not ? String(u.not).replace(/\t/g, " ") : "";

      // Barkod ile başla
      let satir = barkod;

      // Gösterilecek özel alanları ekle
      gosterilecekAlanlar.forEach((alan) => {
        const deger = 
          u.ozelAlanlar && u.ozelAlanlar[alan.id] 
            ? String(u.ozelAlanlar[alan.id]).replace(/\t/g, " ")
            : "";
        satir += `\t${deger}`;
      });

      // Not ve Miktar alanlarını ekle
      satir += `\t${not}\t${u.miktar}`;

      tsv += satir + "\n";
    });

    return tsv;
  };

  // XML formatı oluşturma fonksiyonu
  const xmlUret = () => {
    if (urunler.length === 0) return null;

    // XML özel karakterleri escape et
    const escapeXML = (str) => {
      if (str === null || str === undefined) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    // XML başlangıç
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<StokRaporu Tarih="${new Date().toISOString()}" SayimNot="${escapeXML(sayimNot)}">\n`;

    // Her ürün için XML elementi oluştur
    urunler.forEach((u, index) => {
      xml += `  <Urun ID="${index + 1}">\n`;
      xml += `    <Barkod>${escapeXML(u.barkod || "")}</Barkod>\n`;
      
      // Gösterilecek özel alanları ekle
      gosterilecekAlanlar.forEach((alan) => {
        const deger = 
          u.ozelAlanlar && u.ozelAlanlar[alan.id] !== undefined
            ? escapeXML(u.ozelAlanlar[alan.id])
            : "";
        xml += `    <OzelAlan Isim="${escapeXML(alan.isim)}">${deger}</OzelAlan>\n`;
      });
      
      // Not ve Miktar alanlarını ekle
      xml += `    <Not>${escapeXML(u.not || "")}</Not>\n`;
      xml += `    <Miktar>${u.miktar}</Miktar>\n`;
      xml += `  </Urun>\n`;
    });

    // XML kapanış
    xml += '</StokRaporu>';
    
    return xml;
  };

  const jsonUret = () => {
    if (urunler.length === 0) return null;

    // JSON formatında tüm aktif alanları içeren nesneler oluştur
    return JSON.stringify(
      urunler.map((u) => {
        // İstenen sıralama: Barkod, Özel Alanlar, Not, Miktar
        const urunJson = {
          barkod: u.barkod || "",
        };

        // Gösterilecek özel alanları ekle
        gosterilecekAlanlar.forEach((alan) => {
          if (u.ozelAlanlar && u.ozelAlanlar[alan.id] !== undefined) {
            urunJson[alan.isim] = u.ozelAlanlar[alan.id];
          } else {
            urunJson[alan.isim] = "";
          }
        });

        // Not ve Miktar alanlarını ekle
        urunJson.not = u.not || "";
        urunJson.miktar = u.miktar;

        return urunJson;
      }),
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

    // Tablo başlıkları - İstenen sıralama: Barkod, Özel Alanlar, Not, Miktar
    let tableHeaders = `
      <tr>
        <th>Barkod</th>
        ${gosterilecekAlanlar
          .map((alan) => `<th>${escapeHTML(alan.isim)}</th>`)
          .join("")}
        <th>Not</th>
        <th>Miktar</th>
      </tr>
    `;

    // Tablo satırlarını oluştur
    const rows = urunler
      .map(
        (u) => `
      <tr>
        <td>${escapeHTML(u.barkod || "")}</td>
        ${gosterilecekAlanlar
          .map((alan) => {
            const deger =
              u.ozelAlanlar && u.ozelAlanlar[alan.id] !== undefined
                ? escapeHTML(u.ozelAlanlar[alan.id])
                : "";
            return `<td>${deger}</td>`;
          })
          .join("")}
        <td>${escapeHTML(u.not || "")}</td>
        <td>${u.miktar}</td>
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
            ${tableHeaders}
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

  const raporTSV = () => {
    const tsv = tsvUret();
    dosyaPaylas(tsv, `${dosyaAdi}.tsv`, "text/tab-separated-values", "TSV");
  };

  const raporXML = () => {
    const xml = xmlUret();
    dosyaPaylas(xml, `${dosyaAdi}.xml`, "application/xml", "XML");
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
    },
    alanBilgisi: {
      color: tema.ikincilMetin,
      fontSize: 14,
      textAlign: "center",
      marginTop: 10,
      fontStyle: "italic",
    },
    pasifAlanUyari: {
      color: karanlikTema ? "#ff9800" : "#e65100",
      fontSize: 14,
      textAlign: "center",
      marginTop: 5,
      fontStyle: "italic",
    },
  });

  const kart = (baslik, onPress, renk) => {
    // Karanlık temada daha uygun renkler kullan
    const renkDegeri = karanlikTema
      ? {
          "#007bff": "#4a9eff", // Mavi rengi daha açık
          "#28a745": "#4caf50", // Yeşil rengi daha açık
          "#6f42c1": "#9b74d2", // Mor rengi daha açık
          "#ff9800": "#ffb74d", // Turuncu rengi daha açık
          "#e91e63": "#f48fb1", // Pembe rengi daha açık
        }[renk] || renk
      : renk;

    return (
      <TouchableOpacity
        style={[dinamikStiller.card, { borderColor: renkDegeri }]}
        onPress={onPress}
      >
        <Text style={[dinamikStiller.cardTitle, { color: renkDegeri }]}>
          {baslik}
        </Text>
      </TouchableOpacity>
    );
  };

  // Pasif ama kullanılmış alanları bul
  const pasifKullanilmisAlanlar = kullanilmisOzelAlanlar.filter(
    (alan) => !aktifOzelAlanlar.some((aktifAlan) => aktifAlan.id === alan.id)
  );

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
      <Text style={dinamikStiller.subtitle}>Seçilen Sayım: {sayimNot}</Text>

      <Text style={dinamikStiller.urunSayisi}>
        Toplam {urunler.length} Ürün
      </Text>

      {aktifOzelAlanlar.length > 0 && (
        <Text style={dinamikStiller.alanBilgisi}>
          Aktif Özel Alanlar:{" "}
          {aktifOzelAlanlar.map((alan) => alan.isim).join(", ")}
        </Text>
      )}

      {pasifKullanilmisAlanlar.length > 0 && (
        <Text style={dinamikStiller.pasifAlanUyari}>
          Pasif Edilmiş Veri İçeren Alanlar:{" "}
          {pasifKullanilmisAlanlar.map((alan) => alan.isim).join(", ")}
        </Text>
      )}

      <View style={dinamikStiller.cardContainer}>
        {kart("CSV Olarak Dışa Aktar", raporCSV, "#007bff")}
        {kart("TSV Olarak Dışa Aktar", raporTSV, "#ff9800")}
        {kart("PDF Olarak Dışa Aktar", raporPDF, "#28a745")}
        {kart("XML Olarak Dışa Aktar", raporXML, "#e91e63")}
        {kart("JSON Olarak Dışa Aktar", raporJSON, "#6f42c1")}
      </View>
    </ScrollView>
  );
}
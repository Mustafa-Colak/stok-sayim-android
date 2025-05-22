import React, { useLayoutEffect, useEffect, useState } from 'react';
import {
  View, Text, Alert, TextInput, TouchableOpacity, StyleSheet, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Buffer } from 'buffer';

import common from '../styles/CommonStyles';

export default function RaporOlustur({ navigation, route }) {
  const { sayimId, sayimAd } = route.params || {};
  
  // Eğer sayimId veya sayimAd yoksa, kullanıcıyı uyar ve geri gönder
  useEffect(() => {
    if (!sayimId || !sayimAd) {
      Alert.alert(
        "Hata", 
        "Sayım bilgileri bulunamadı. Lütfen tekrar deneyin.",
        [{ text: "Tamam", onPress: () => navigation.goBack() }]
      );
    }
  }, [sayimId, sayimAd, navigation]);

  const STORAGE_KEY = `sayim_${sayimId}`;
  const [urunler, setUrunler] = useState([]);
  const [dosyaAdi, setDosyaAdi] = useState(
    sayimAd ? sayimAd.replace(/\s+/g, '_').toLowerCase() : 'rapor'
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Stok Sayım / ${sayimAd || 'Rapor'} / Rapor`,
    });
  }, [navigation, sayimAd]);

  useEffect(() => {
    const yukle = async () => {
      if (!sayimId) return;
      
      try {
        const veri = await AsyncStorage.getItem(STORAGE_KEY);
        if (veri) {
          const parsedData = JSON.parse(veri);
          setUrunler(parsedData);
          console.log(`${parsedData.length} ürün yüklendi`);
        } else {
          console.log("Ürün verisi bulunamadı");
        }
      } catch (e) {
        console.error("Veri yükleme hatası:", e);
        Alert.alert("Hata", "Ürünler yüklenemedi: " + e.message);
      }
    };
    yukle();
  }, [sayimId, STORAGE_KEY]);

  const csvUret = () => {
    if (urunler.length === 0) return null;
    let csv = 'Barkod,Ürün Adı,Miktar\n';
    urunler.forEach(u => {
      // CSV formatı için özel karakterleri düzgün escape et
      const barkod = u.barkod ? `"${u.barkod.replace(/"/g, '""')}"` : '""';
      const ad = `"${u.ad.replace(/"/g, '""')}"`;
      csv += `${barkod},${ad},${u.miktar}\n`;
    });
    return csv;
  };

  const jsonUret = () => {
    if (urunler.length === 0) return null;
    return JSON.stringify(
      urunler.map(u => ({
        barkod: u.barkod || '',
        ad: u.ad,
        miktar: u.miktar
      })),
      null,
      2
    );
  };

  const pdfUret = () => {
    if (urunler.length === 0) return null;
    
    // HTML özel karakterleri escape et
    const escapeHTML = (str) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };
    
    const rows = urunler.map(u => `
      <tr>
        <td>${escapeHTML(u.barkod || '')}</td>
        <td>${escapeHTML(u.ad)}</td>
        <td>${u.miktar}</td>
      </tr>
    `).join('');
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { text-align: center; }
          </style>
        </head>
        <body>
          <h1>${escapeHTML(sayimAd)} - Stok Raporu</h1>
          <p>Tarih: ${new Date().toLocaleDateString()}</p>
          <p>Toplam Ürün: ${urunler.length}</p>
          <table>
            <tr><th>Barkod</th><th>Ürün Adı</th><th>Miktar</th></tr>
            ${rows}
          </table>
        </body>
      </html>
    `;
  };

  // XLSX yerine basit CSV kullanarak Excel uyumlu dosya oluştur
  const excelUret = () => {
    return csvUret(); // Excel CSV'yi açabilir
  };

  const dosyaPaylas = async (veri, dosyaAdi, mime, format) => {
    if (!veri) {
      Alert.alert("Uyarı", "Sayımda ürün yok.");
      return;
    }
    
    try {
      const path = `${FileSystem.documentDirectory}${dosyaAdi}`;
      console.log(`Dosya oluşturuluyor: ${path}`);
      
      await FileSystem.writeAsStringAsync(path, veri, { encoding: FileSystem.EncodingType.UTF8 });
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
    dosyaPaylas(csv, `${dosyaAdi}.csv`, 'text/csv', 'CSV');
  };

  const raporJSON = () => {
    const json = jsonUret();
    dosyaPaylas(json, `${dosyaAdi}.json`, 'application/json', 'JSON');
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
        base64: false
      });
      console.log(`PDF oluşturuldu: ${uri}`);
      
      if (await Sharing.isAvailableAsync()) {
        console.log("PDF paylaşılıyor");
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
        console.log("PDF paylaşıldı");
      } else {
        Alert.alert("Paylaşım desteklenmiyor", "Dosya konumu: " + uri);
      }
    } catch (e) {
      console.error("PDF oluşturma hatası:", e);
      Alert.alert("Hata", "PDF oluşturulamadı: " + e.message);
    }
  };

  const raporExcel = () => {
    const csv = excelUret();
    dosyaPaylas(csv, `${dosyaAdi}.csv`, 'text/csv', 'Excel');
  };

  const kart = (baslik, onPress, renk) => (
    <TouchableOpacity style={[styles.card, { borderColor: renk }]} onPress={onPress}>
      <Text style={[styles.cardTitle, { color: renk }]}>{baslik}</Text>
    </TouchableOpacity>
  );

  // Eğer sayimId veya sayimAd yoksa, boş bir ekran göster
  if (!sayimId || !sayimAd) {
    return <View style={common.container}></View>;
  }

  return (
    <ScrollView contentContainerStyle={common.container}>
      <Text style={common.title}>Rapor Oluştur</Text>
      <Text style={common.subtitle}>Dosya adı girin (uzantılar otomatik eklenir)</Text>

      <TextInput
        placeholder="Dosya adı (örn: rapor_sayim)"
        value={dosyaAdi}
        onChangeText={setDosyaAdi}
        style={common.input}
      />

      <View style={{ marginTop: 20 }}>
        {kart("CSV Olarak Dışa Aktar", raporCSV, "#007bff")}
        {kart("PDF Olarak Dışa Aktar", raporPDF, "#28a745")}
        {kart("JSON Olarak Dışa Aktar", raporJSON, "#6f42c1")}
        {kart("Excel Uyumlu CSV Olarak Dışa Aktar", raporExcel, "#ff9800")}
      </View>
      
      <View style={{marginTop: 20, marginBottom: 20}}>
        <Text style={{textAlign: 'center', color: '#666'}}>
          Toplam {urunler.length} ürün bulundu
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});
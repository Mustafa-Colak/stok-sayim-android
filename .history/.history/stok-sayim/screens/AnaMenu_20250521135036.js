import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function AnaMenu({ navigation }) {
  const fonksiyonlar = [
    { baslik: 'Sayım Listesi', aciklama: 'Mevcut sayımları görüntüle', ekran: 'SayimListesi' },
    { baslik: 'Yeni Sayım', aciklama: 'Yeni bir sayım başlat', ekran: 'YeniSayim' },
    { baslik: 'Sayım Detayı', aciklama: 'Sayım ürünlerini düzenle', ekran: 'SayimDetay' },
    { baslik: 'Ürün Ekle', aciklama: 'Manuel veya barkod ile ürün ekle', ekran: 'UrunEkle' },
    { baslik: 'Sayımı Sil', aciklama: 'Kayıtlı sayımı sil', ekran: 'SayimSil' },
    { baslik: 'Raporlama', aciklama: 'Sayımı dışa aktar / incele', ekran: 'Raporlama' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Stok Sayım Uygulaması</Text>
      <View style={styles.grid}>
        {fonksiyonlar.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => navigation.navigate(item.ekran)}
          >
            <Text style={styles.cardTitle}>{item.baslik}</Text>
            <Text style={styles.cardText}>{item.aciklama}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  cardText: { fontSize: 14, color: '#555' },
});

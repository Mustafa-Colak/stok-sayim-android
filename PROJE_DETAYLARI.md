# 📦 Stok Sayım Mobil Uygulaması

Bu uygulama, depo veya mağaza gibi ortamlarda stok sayım işlemlerini dijitalleştirmek için geliştirilmiş React Native tabanlı bir mobil uygulamadır.

## 🚀 Temel Özellikler

- Sayım oluşturma (isimlendirme)
- Her sayım için bağımsız ürün listesi
- Ürün ekleme (manuel ve hızlı mod)
- Ürünleri listeleme ve detaylarını görüntüleme
- Veri kalıcılığı (`AsyncStorage`) ile çalışır
- Çoklu dil desteği (Türkçe ve İngilizce)
- Giriş ekranı ve ana menü
- Ortak stiller (`CommonStyles`)
- Ürün arama özelliği (filtreleme)
- Ekranlarda breadcrumb benzeri başlıklar

## 📁 Dosya Yapısı (Kısaca)

```
/screens
  GirisEkrani.js
  SayimListesi.js
  SayimDetay.js
  UrunEkle.js
  UrunDetay.js
  ...
/styles
  CommonStyles.js
  SayimListesiStyles.js
  ...
```

## 🛠️ Kullanılan Teknolojiler

- React Native
- Expo
- AsyncStorage
- React Navigation
- Expo Icons

## 📌 Geliştirme Aşamaları

- [x] Giriş ekranı ve çoklu dil
- [x] Sayım listesi yönetimi
- [x] Sayım detay ekranı
- [x] Ürün ekleme (hızlı / manuel)
- [x] Kalıcı veri saklama
- [x] Ortak stil yönetimi
- [x] Arama kutusu entegrasyonu
- [ ] Ürün güncelleme ekranı
- [ ] Rapor oluşturma (CSV / PDF)
- [ ] Barkod entegrasyonu

## 👤 Geliştirici Notları

Bu proje modüler yapıdadır. Ekran bileşenleri sade tutulmuş ve tüm stiller dış dosyalara taşınmıştır. Ortak UI bileşenleri ilerleyen sürümlerde `components/` klasörüne taşınabilir.

## 💡 Geliştirme Önerileri

- 📱 Barkod tarayıcı entegrasyonu (expo-barcode-scanner)
- 🧮 Ürün güncelleme sırasında toplam stoğu göstermek
- 🔁 Aynı ürün eklendiğinde birleştirerek miktarı artırmak
- 🧹 Tüm veriyi sıfırlamak için ayarlar ekranı
- 📤 CSV / PDF dışa aktarım (rapor paylaşımı)
- 🕵️ Ürün geçmişini izleme (kim, ne zaman, ne miktarda ekledi)
- 🌐 Bulut senkronizasyon (Firebase, Supabase, vb.)
- 🔐 Gelişmiş kullanıcı yönetimi (Admin, Sayımcı vs.)
- 🧪 Uygulama içi test verileri üretici mod


### 📊 Raporlama & Görselleştirme
- 📈 Sayım sonuçlarını grafiklerle göster (örn: ürün bazlı sütun grafiği)
- 🗂️ Sayım karşılaştırmaları (önceki sayımlarla fark analizi)
- 📆 Tarihe göre filtreleme (örneğin: son 7 gün, ay seçimi)

### 📷 Barkod ve Kamera Entegrasyonu
- 📷 Ürün fotoğrafı çekme (kamera ile ürün görseli ekleme)
- 📇 Barkod okutunca sistemde varsa detayları otomatik getirme

### 👤 Kullanıcı Özelleştirme & Güvenlik
- 👥 Çoklu kullanıcı desteği (örneğin farklı personel sayım yapabilir)
- 🛡️ PIN ile uygulamayı koruma / yönetici girişi
- 🕵️ Aktivite günlüğü (log) tutma: kim ne zaman ne yaptı?

### ☁️ Veri Yönetimi
- ☁️ Firebase / Supabase ile senkronizasyon
- 🔄 Otomatik yedekleme ve geri yükleme
- 💾 Export/Import (JSON/CSV dosyası ile veri aktarımı)

### 🧪 Geliştirici Araçları & Test
- 🧹 Test verisi oluşturma butonu (örnek ürünler ekle)
- 🧪 Demo modu (veri kaydedilmez, sadece deneyim amaçlı)
- 🧰 “Debug” ekranı (mevcut AsyncStorage içeriğini göster)

### 📱 UI/UX İyileştirmeleri
- 🌙 Karanlık mod
- 🎨 Tema seçimi (renk seçenekleri)
- 🧭 Navigation bar’da aktif sayfa vurgulama
- 🔔 Geri bildirimler için toast mesajları / animasyonlu uyarılar


### 🚀 Ekstra Geliştirme Önerileri

1. 🔄 Otomatik eş zamanlama (aralıklarla verileri yedekle)
2. 🗓️ Sayım planlayıcı: Gelecekteki sayım tarihlerini takvime ekleme
3. 📌 Favori ürünler listesi oluşturma (sık sayılanlar)
4. 🧾 Ürünlere açıklama / not alanı ekleme
5. 📍 Sayım konumu seçme (depo, şube, raf)
6. 🔁 Offline mod desteği (internet yokken devam et)
7. 🔗 Dış sistemlerle entegrasyon (Excel, ERP, SQL vb.)
8. 📶 QR kod üzerinden sayım paylaşımı (başka cihazda açılabilir)
9. 📊 Gerçek zamanlı özet: Toplam ürün sayısı, toplam miktar
10. 🧯 Veritabanı sıfırlama & yedek geri yükleme seçenekleri
11. 🎯 Ürünler için kategori ve etiketleme desteği
12. 🧱 Grid görünüm: Kart/kutu düzeninde ürün listesi
13. 🔃 Ürünleri elle sıralama (sürükle-bırak)
14. 📋 “Bu ürün zaten listede” uyarısı
15. 🔁 Aynı ürün tekrar eklendiğinde birleştirme / uyarı seçeneği
16. 🧾 Sayım tamamlandı olarak işaretleme (kilitleme)
17. 🧩 Modül modül çalışma: Sayım + Rapor + Ayarlar ayrı modüller
18. 📥 CSV içe aktarma (ürünleri dışarıdan yükleme)
19. 🔔 Sayım hatırlatıcı bildirimleri (günlük, haftalık)
20. 📤 Sayım PDF çıktısına logo ve başlık ekleme

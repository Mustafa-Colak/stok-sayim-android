# Stok Sayım Uygulaması Lisans Sistemi

Bu belge, Stok Sayım uygulamasının lisanslama sisteminin tüm yönlerini kapsamlı bir şekilde açıklar.

## İçindekiler

1. [Mevcut Lisanslama Mantığı](#mevcut-lisanslama-mantığı)
2. [Lisans Sunucusu Kullanımı](#lisans-sunucusu-kullanımı)
3. [Mobil Uygulama Entegrasyonu](#mobil-uygulama-entegrasyonu)
4. [Ödeme Sistemleri Entegrasyonu](#ödeme-sistemleri-entegrasyonu)
5. [Çevrimdışı Kullanım Desteği](#çevrimdışı-kullanım-desteği)
6. [Güvenlik Önlemleri](#güvenlik-önlemleri)
7. [Lisans Yenileme Süreci](#lisans-yenileme-süreci)
8. [Hazır Abonelik Sistemleri](#hazır-abonelik-sistemleri)

---

## Mevcut Lisanslama Mantığı

### Genel Bakış

Uygulama iki farklı lisans modeli sunmaktadır:

1. **Ücretsiz Sürüm (Deneme)**: Sınırlı özellikler ve kullanım limitleri ile 30 günlük deneme süresi
2. **Ücretli Sürüm (Tam)**: Tüm özelliklere ve sınırsız kullanıma erişim

### Ücretsiz Sürüm Limitleri

Ücretsiz sürüm aşağıdaki kısıtlamalara sahiptir:

- **Deneme Süresi**: 30 gün
- **Maksimum Sayım Sayısı**: 5 sayım (toplam)
- **Maksimum Ürün Sayısı**: Her sayımda en fazla 50 ürün

Bu limitler `utils/LisansYonetimi.js` dosyasında tanımlanmıştır:

```javascript
const UCRETSIZ_LIMITLER = {
  maksimumSayimSayisi: 5,
  maksimumUrunSayisi: 50,
  denemeGunSayisi: 30
};
```

### Lisans Kontrol Mekanizması

Uygulama, lisans durumunu aşağıdaki şekilde kontrol eder:

#### 1. İlk Kullanımda

Kullanıcı uygulamayı ilk kez açtığında, bir lisans bilgisi oluşturulur ve cihazın yerel depolama alanına kaydedilir:

```javascript
const yeniLisans = {
  tip: "ucretsiz",
  baslangicTarihi: new Date().toISOString(),
  kalan_gun: UCRETSIZ_LIMITLER.denemeGunSayisi
};
```

#### 2. Deneme Süresi Kontrolü

Uygulama her açıldığında, deneme süresinin dolup dolmadığı kontrol edilir:

```javascript
const baslangic = new Date(lisansBilgisi.baslangicTarihi);
const bugun = new Date();
const farkGun = Math.floor((bugun - baslangic) / (1000 * 60 * 60 * 24));

if (farkGun >= UCRETSIZ_LIMITLER.denemeGunSayisi) {
  // Deneme süresi dolmuş
}
```

#### 3. Sayım Limiti Kontrolü

Yeni bir sayım oluşturulduğunda, toplam sayım sayısı kontrol edilir:

```javascript
const sayimlar = JSON.parse(sayimlarStr);
if (sayimlar.length >= UCRETSIZ_LIMITLER.maksimumSayimSayisi) {
  // Sayım limiti aşılmış
}
```

#### 4. Ürün Sayısı Limiti Kontrolü

Bir sayıma yeni ürün eklendiğinde, o sayımdaki toplam ürün sayısı kontrol edilir:

```javascript
const urunler = JSON.parse(urunlerStr);
if (urunler.length >= UCRETSIZ_LIMITLER.maksimumUrunSayisi) {
  // Ürün sayısı limiti aşılmış
}
```

### Tam Sürüme Geçiş

Kullanıcılar, deneme süresi dolmadan veya dolduktan sonra tam sürüme geçebilirler. Tam sürüme geçiş için şu yöntem kullanılır:

#### Lisans Kodu ile Aktivasyon

```javascript
if (lisansKodu === "PREMIUM123") {
  const lisansBilgisi = {
    tip: "ucretli",
    baslangicTarihi: new Date().toISOString(),
    lisansKodu: lisansKodu
  };
  // Lisans bilgisini kaydet
}
```

### Lisans Doğrulama Güvenliği

Mevcut sistemde lisans doğrulama işlemi tamamen cihaz üzerinde gerçekleştirilmektedir. Bu, aşağıdaki güvenlik risklerini taşır:

1. Sabit lisans kodunun tersine mühendislikle çıkarılması riski
2. Cihaz saatinin değiştirilmesiyle deneme süresinin uzatılması riski
3. Yerel depolama verilerinin manipüle edilmesi riski

### Geliştirilmiş Lisanslama Önerileri

Daha güvenli bir lisanslama sistemi için aşağıdaki iyileştirmeler yapılabilir:

#### 1. Sunucu Tabanlı Doğrulama

Lisans kodlarını bir sunucu üzerinden doğrulamak, yetkisiz kullanımı önemli ölçüde azaltır:

```javascript
// Örnek sunucu doğrulama kodu
const response = await fetch('https://api.stoksayim.com/lisans/dogrula', {
  method: 'POST',
  body: JSON.stringify({ lisansKodu, cihazId })
});
```

#### 2. Cihaz Bağlama

Her lisansı belirli sayıda cihaza bağlamak, lisansın paylaşılmasını engeller.

#### 3. Periyodik Doğrulama

Lisansın düzenli aralıklarla (internet bağlantısı varken) doğrulanması:

```javascript
// Uygulama açıldığında ve belirli aralıklarla lisansı doğrula
setInterval(async () => {
  if (internetBaglantisiVar) {
    await lisansGecerliliginiKontrolEt();
  }
}, 24 * 60 * 60 * 1000); // Günde bir kez
```

#### 4. Abonelik Tabanlı Model

Tek seferlik satın alma yerine, yenilenebilir abonelik modeli kullanmak:

- Aylık/Yıllık abonelik planları
- Otomatik yenileme
- Abonelik durumunun sunucu tarafında takibi

#### 5. Uygulama İçi Satın Alma

Google Play ve App Store'un kendi satın alma sistemlerini kullanmak:

```javascript
// Uygulama içi satın alma örneği
const { responseCode, results } = await InAppPurchases.purchaseItemAsync('premium_upgrade');
if (responseCode === InAppPurchases.IAPResponseCode.OK) {
  // Satın alma başarılı
}
```

---

## Lisans Sunucusu Kullanımı

### Genel Bakış

Lisans sunucusu, uygulamanın lisans doğrulamasını güvenli bir şekilde gerçekleştirmek için kullanılan merkezi bir sistemdir. Bu sistem sayesinde:

- Lisans kodları güvenli bir şekilde doğrulanır
- Lisans kullanımı takip edilir
- Yetkisiz kullanım engellenir
- Abonelik yönetimi yapılır

### Lisans Sunucusu Mimarisi

#### 1. Temel Bileşenler

Lisans sunucusu aşağıdaki bileşenlerden oluşur:

- **API Sunucusu**: Lisans doğrulama isteklerini işler
- **Veritabanı**: Lisans bilgilerini saklar
- **Yönetim Paneli**: Lisansları yönetmek için arayüz sağlar
- **Ödeme Entegrasyonu**: Lisans satın alma işlemlerini yönetir

#### 2. Veritabanı Yapısı

Lisans veritabanı aşağıdaki temel tabloları içerir:

- **Lisanslar**:
  - `lisans_kodu` (benzersiz kod)
  - `durum` (aktif, süresi dolmuş, iptal edilmiş)
  - `olusturma_tarihi`
  - `bitis_tarihi`
  - `lisans_tipi` (aylık, yıllık, ömür boyu)
  - `kullanici_id`

- **Cihazlar**:
  - `cihaz_id` (benzersiz cihaz tanımlayıcısı)
  - `lisans_kodu` (bağlı olduğu lisans)
  - `son_dogrulama_tarihi`
  - `cihaz_bilgileri` (model, işletim sistemi vb.)

- **Doğrulama Kayıtları**:
  - `lisans_kodu`
  - `cihaz_id`
  - `dogrulama_tarihi`
  - `ip_adresi`
  - `sonuc` (başarılı/başarısız)

### Lisans Sunucusu Kurulumu

#### 1. Sunucu Gereksinimleri

- Node.js veya PHP tabanlı bir web sunucusu
- MongoDB, MySQL veya PostgreSQL veritabanı
- HTTPS desteği (SSL sertifikası)
- Güvenilir bir hosting hizmeti (AWS, Google Cloud, DigitalOcean vb.)

#### 2. Örnek Sunucu Kodu (Node.js + Express + MongoDB)

```javascript
const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const app = express();

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost/lisans_sistemi', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Lisans modeli
const LisansSchema = new mongoose.Schema({
  kod: { type: String, required: true, unique: true },
  durum: { type: String, enum: ['aktif', 'suresi_dolmus', 'iptal'], default: 'aktif' },
  olusturma_tarihi: { type: Date, default: Date.now },
  bitis_tarihi: { type: Date, required: true },
  lisans_tipi: { type: String, required: true },
  kullanici_email: { type: String, required: true }
});

const Lisans = mongoose.model('Lisans', LisansSchema);

// Cihaz modeli
const CihazSchema = new mongoose.Schema({
  cihaz_id: { type: String, required: true, unique: true },
  lisans_kodu: { type: String, required: true },
  son_dogrulama_tarihi: { type: Date, default: Date.now },
  cihaz_bilgileri: { type: Object }
});

const Cihaz = mongoose.model('Cihaz', CihazSchema);

// Middleware
app.use(express.json());

// Lisans doğrulama endpoint'i
app.post('/api/dogrula', async (req, res) => {
  try {
    const { lisans_kodu, cihaz_id, cihaz_bilgileri } = req.body;
    
    // Lisans kodunu kontrol et
    const lisans = await Lisans.findOne({ kod: lisans_kodu });
    
    if (!lisans) {
      return res.status(400).json({ basarili: false, mesaj: 'Geçersiz lisans kodu' });
    }
    
    // Lisans süresini kontrol et
    if (lisans.durum !== 'aktif' || new Date() > lisans.bitis_tarihi) {
      return res.status(400).json({ 
        basarili: false, 
        mesaj: 'Lisans süresi dolmuş',
        durum: 'suresi_dolmus'
      });
    }
    
    // Cihaz kaydını kontrol et veya oluştur
    let cihaz = await Cihaz.findOne({ cihaz_id });
    
    if (cihaz && cihaz.lisans_kodu !== lisans_kodu) {
      return res.status(400).json({ 
        basarili: false, 
        mesaj: 'Bu cihaz başka bir lisansa bağlı' 
      });
    }
    
    if (!cihaz) {
      // Lisansa bağlı cihaz sayısını kontrol et
      const cihazSayisi = await Cihaz.countDocuments({ lisans_kodu });
      
      if (cihazSayisi >= 3) { // Maksimum 3 cihaz
        return res.status(400).json({ 
          basarili: false, 
          mesaj: 'Maksimum cihaz sayısına ulaşıldı' 
        });
      }
      
      // Yeni cihaz kaydı oluştur
      cihaz = new Cihaz({
        cihaz_id,
        lisans_kodu,
        cihaz_bilgileri
      });
    }
    
    // Cihaz son doğrulama tarihini güncelle
    cihaz.son_dogrulama_tarihi = new Date();
    cihaz.cihaz_bilgileri = cihaz_bilgileri;
    await cihaz.save();
    
    // Başarılı yanıt
    return res.json({
      basarili: true,
      lisans_tipi: lisans.lisans_tipi,
      bitis_tarihi: lisans.bitis_tarihi,
      // Güvenlik tokeni oluştur (24 saat geçerli)
      token: generateToken(lisans_kodu, cihaz_id)
    });
    
  } catch (error) {
    console.error('Doğrulama hatası:', error);
    return res.status(500).json({ basarili: false, mesaj: 'Sunucu hatası' });
  }
});

// Güvenlik tokeni oluşturma
function generateToken(lisansKodu, cihazId) {
  const secret = process.env.JWT_SECRET || 'gizli_anahtar';
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 saat geçerli
  
  const data = `${lisansKodu}:${cihazId}:${expiresAt.getTime()}`;
  const hmac = crypto.createHmac('sha256', secret);
  const signature = hmac.update(data).digest('hex');
  
  return {
    token: signature,
    expires_at: expiresAt
  };
}

// Sunucuyu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Lisans sunucusu ${PORT} portunda çalışıyor`);
});
```

---

## Mobil Uygulama Entegrasyonu

### 1. Lisans Doğrulama İşlevi

Uygulamanın `utils/LisansYonetimi.js` dosyasına aşağıdaki fonksiyonları ekleyin:

```javascript
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceInfo from 'react-native-device-info';

// Cihaz kimliği oluşturma
export const getCihazId = async () => {
  try {
    // Daha önce oluşturulmuş bir cihaz kimliği var mı?
    let cihazId = await AsyncStorage.getItem('cihaz_id');
    
    if (!cihazId) {
      // Cihaz bilgilerinden benzersiz bir kimlik oluştur
      const deviceInfo = {
        uniqueId: await DeviceInfo.getUniqueId(),
        brand: await DeviceInfo.getBrand(),
        model: await DeviceInfo.getModel(),
        systemVersion: await DeviceInfo.getSystemVersion(),
      };
      
      // Cihaz bilgilerinden bir hash oluştur
      cihazId = JSON.stringify(deviceInfo);
      
      // Cihaz kimliğini kaydet
      await AsyncStorage.setItem('cihaz_id', cihazId);
    }
    
    return cihazId;
  } catch (error) {
    console.error("Cihaz kimliği oluşturma hatası:", error);
    // Fallback olarak rastgele bir kimlik
    return Math.random().toString(36).substring(2, 15);
  }
};

// Sunucu üzerinden lisans doğrulama
export const tamSurumeYukselt = async (lisansKodu) => {
  try {
    const cihazId = await getCihazId();
    const cihazBilgileri = {
      marka: await DeviceInfo.getBrand(),
      model: await DeviceInfo.getModel(),
      isletimSistemi: await DeviceInfo.getSystemName(),
      surum: await DeviceInfo.getSystemVersion(),
      uygulamaSurumu: await DeviceInfo.getVersion()
    };
    
    // Lisans kodunu sunucuya gönder ve doğrula
    const response = await fetch('https://api.stoksayim.com/api/dogrula', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lisans_kodu: lisansKodu,
        cihaz_id: cihazId,
        cihaz_bilgileri: cihazBilgileri
      }),
    });

    const sonuc = await response.json();

    if (sonuc.basarili) {
      // Sunucu doğrulamayı onayladı
      const lisansBilgisi = {
        tip: "ucretli",
        baslangicTarihi: new Date().toISOString(),
        bitisTarihi: new Date(sonuc.bitis_tarihi).toISOString(),
        lisansKodu: lisansKodu,
        lisansTipi: sonuc.lisans_tipi,
        token: sonuc.token.token,
        tokenSonGecerlilik: new Date(sonuc.token.expires_at).toISOString()
      };
      await AsyncStorage.setItem("lisans_bilgisi", JSON.stringify(lisansBilgisi));
      return { basarili: true };
    } else {
      return { 
        basarili: false, 
        mesaj: sonuc.mesaj || "Geçersiz lisans kodu. Lütfen doğru kodu girdiğinizden emin olun."
      };
    }
  } catch (error) {
    console.error("Lisans doğrulama hatası:", error);
    return { 
      basarili: false, 
      mesaj: "Lisans doğrulanırken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin."
    };
  }
};

// Periyodik lisans doğrulama
export const lisansGecerliliginiKontrolEt = async () => {
  try {
    const lisansBilgisi = await lisansBilgisiYukle();
    
    // Ücretsiz sürümde kontrol yok
    if (lisansBilgisi.tip !== "ucretli") {
      return { gecerli: false };
    }
    
    // Token süresi dolmuş mu kontrol et
    const tokenSonGecerlilik = new Date(lisansBilgisi.tokenSonGecerlilik);
    const simdikiZaman = new Date();
    
    // Token süresi dolmamışsa ve çevrimdışı modda ise, lisansı geçerli say
    if (tokenSonGecerlilik > simdikiZaman) {
      return { gecerli: true };
    }
    
    // Token süresi dolmuşsa ve internet bağlantısı varsa, sunucudan doğrula
    const cihazId = await getCihazId();
    const cihazBilgileri = {
      marka: await DeviceInfo.getBrand(),
      model: await DeviceInfo.getModel(),
      isletimSistemi: await DeviceInfo.getSystemName(),
      surum: await DeviceInfo.getSystemVersion(),
      uygulamaSurumu: await DeviceInfo.getVersion()
    };
    
    const response = await fetch('https://api.stoksayim.com/api/dogrula', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lisans_kodu: lisansBilgisi.lisansKodu,
        cihaz_id: cihazId,
        cihaz_bilgileri: cihazBilgileri
      }),
    });

    const sonuc = await response.json();
    
    if (sonuc.basarili) {
      // Token'ı güncelle
      lisansBilgisi.token = sonuc.token.token;
      lisansBilgisi.tokenSonGecerlilik = new Date(sonuc.token.expires_at).toISOString();
      await AsyncStorage.setItem("lisans_bilgisi", JSON.stringify(lisansBilgisi));
      return { gecerli: true };
    } else {
      // Lisans geçersiz olmuş, ücretsiz sürüme geri dön
      if (sonuc.durum === 'suresi_dolmus') {
        const yeniLisans = {
          tip: "ucretsiz",
          baslangicTarihi: new Date().toISOString(),
          kalan_gun: 0 // Deneme süresi dolmuş olarak işaretle
        };
        await AsyncStorage.setItem("lisans_bilgisi", JSON.stringify(yeniLisans));
        return { 
          gecerli: false, 
          mesaj: "Lisans süreniz dolmuş. Lütfen lisansınızı yenileyin."
        };
      }
      return { 
        gecerli: false, 
        mesaj: sonuc.mesaj || "Lisansınız artık geçerli değil."
      };
    }
  } catch (error) {
    console.error("Lisans kontrol hatası:", error);
    // Hata durumunda, token süresi dolmamışsa lisansı geçerli say
    const lisansBilgisi = await lisansBilgisiYukle();
    const tokenSonGecerlilik = new Date(lisansBilgisi.tokenSonGecerlilik);
    const simdikiZaman = new Date();
    
    if (tokenSonGecerlilik > simdikiZaman) {
      return { gecerli: true };
    }
    
    // Token süresi dolmuşsa ama internet bağlantısı yoksa, kullanıcıya uyarı ver ama engelleme
    return { 
      gecerli: true, 
      uyari: "Lisans doğrulanamadı. İnternet bağlantınızı kontrol edin."
    };
  }
};
```

### 2. Uygulamaya Entegrasyon

Uygulamanın ana bileşeninde (örneğin App.js) lisans kontrolünü ekleyin:

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { lisansGecerliliginiKontrolEt } from './utils/LisansYonetimi';
import NetInfo from '@react-native-community/netinfo';

export default function App() {
  const [lisansUyarisi, setLisansUyarisi] = useState(null);
  
  // Uygulama başladığında ve belirli aralıklarla lisansı kontrol et
  useEffect(() => {
    const lisansKontrol = async () => {
      const sonuc = await lisansGecerliliginiKontrolEt();
      
      if (!sonuc.gecerli) {
        setLisansUyarisi(sonuc.mesaj || "Lisansınız geçerli değil.");
      } else if (sonuc.uyari) {
        setLisansUyarisi(sonuc.uyari);
      } else {
        setLisansUyarisi(null);
      }
    };
    
    // Başlangıçta kontrol et
    lisansKontrol();
    
    // İnternet bağlantısı değiştiğinde kontrol et
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        lisansKontrol();
      }
    });
    
    // Periyodik kontrol (her 24 saatte bir)
    const interval = setInterval(lisansKontrol, 24 * 60 * 60 * 1000);
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);
  
  // Lisans uyarısı varsa göster
  useEffect(() => {
    if (lisansUyarisi) {
      Alert.alert("Lisans Uyarısı", lisansUyarisi);
    }
  }, [lisansUyarisi]);
  
  // Uygulama içeriği...
}
```

---

## Ödeme Sistemleri Entegrasyonu

### 1. Stripe Entegrasyonu

```javascript
const stripe = require('stripe')('your_stripe_secret_key');

// Yeni abonelik oluşturma
app.post('/api/abonelik/olustur', async (req, res) => {
  try {
    const { email, odeme_yontemi_id, plan_id } = req.body;
    
    // Müşteri oluştur veya mevcut müşteriyi bul
    let musteri;
    const mevcut_musteriler = await stripe.customers.list({ email });
    
    if (mevcut_musteriler.data.length > 0) {
      musteri = mevcut_musteriler.data[0];
    } else {
      musteri = await stripe.customers.create({
        email,
        payment_method: odeme_yontemi_id,
        invoice_settings: {
          default_payment_method: odeme_yontemi_id,
        },
      });
    }
    
    // Abonelik oluştur
    const abonelik = await stripe.subscriptions.create({
      customer: musteri.id,
      items: [{ plan: plan_id }],
      expand: ['latest_invoice.payment_intent'],
    });
    
    // Başarılı ödeme durumunda lisans oluştur
    if (abonelik.status === 'active') {
      // Lisans kodu oluştur
      const lisansKodu = generateLicenseCode();
      
      // Bitiş tarihini hesapla
      const bitisTarihi = new Date();
      bitisTarihi.setFullYear(bitisTarihi.getFullYear() + 1); // 1 yıllık abonelik
      
      // Lisansı veritabanına kaydet
      const yeniLisans = new Lisans({
        kod: lisansKodu,
        durum: 'aktif',
        bitis_tarihi: bitisTarihi,
        lisans_tipi: 'yillik',
        kullanici_email: email,
        odeme_bilgileri: {
          stripe_musteri_id: musteri.id,
          stripe_abonelik_id: abonelik.id
        }
      });
      
      await yeniLisans.save();
      
      // Lisans bilgilerini döndür
      return res.json({
        basarili: true,
        lisans_kodu: lisansKodu,
        bitis_tarihi: bitisTarihi
      });
    } else {
      return res.status(400).json({
        basarili: false,
        mesaj: 'Ödeme işlemi tamamlanamadı'
      });
    }
    
  } catch (error) {
    console.error('Abonelik oluşturma hatası:', error);
    return res.status(500).json({
      basarili: false,
      mesaj: 'Sunucu hatası'
    });
  }
});

// Benzersiz lisans kodu oluşturma
function generateLicenseCode() {
  const karakterler = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let kod = '';
  
  // 5 gruplu, her grupta 5 karakter olan bir kod oluştur (XXXXX-XXXXX-XXXXX-XXXXX-XXXXX)
  for (let grup = 0; grup < 5; grup++) {
    for (let i = 0; i < 5; i++) {
      kod += karakterler.charAt(Math.floor(Math.random() * karakterler.length));
    }
    if (grup < 4) kod += '-';
  }
  
  return kod;
}
```

### 2. İyzico Entegrasyonu (Türkiye için)

```javascript
const Iyzipay = require('iyzipay');

// İyzico yapılandırması
const iyzipay = new Iyzipay({
  apiKey: 'your_api_key',
  secretKey: 'your_secret_key',
  uri: 'https://sandbox-api.iyzipay.com' // Canlı ortam için: 'https://api.iyzipay.com'
});

// Ödeme formu oluşturma
app.post('/api/odeme/form-olustur', async (req, res) => {
  try {
    const { email, isim, fiyat, paket_adi } = req.body;
    
    // Benzersiz bir sipariş ID'si oluştur
    const siparisId = 'SP' + Date.now();
    
    // Ödeme formu talebi oluştur
    const request = {
      locale: 'tr',
      conversationId: siparisId,
      price: fiyat,
      paidPrice: fiyat,
      currency: 'TRY',
      basketId: siparisId,
      paymentGroup: 'PRODUCT',
      callbackUrl: 'https://api.stoksayim.com/api/odeme/sonuc',
      
      buyer: {
        id: 'BY' + Date.now(),
        name: isim.split(' ')[0],
        surname: isim.split(' ').slice(1).join(' ') || 'Soyad',
        email: email,
        identityNumber: '11111111111', // TC Kimlik No (gerekli)
        registrationAddress: 'Örnek Adres',
        ip: req.ip,
        city: 'Istanbul',
        country: 'Turkey'
      },
      
      shippingAddress: {
        contactName: isim,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Örnek Adres'
      },
      
      billingAddress: {
        contactName: isim,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Örnek Adres'
      },
      
      basketItems: [
        {
          id: paket_adi,
          name: 'Stok Sayım Uygulaması - ' + paket_adi,
          category1: 'Yazılım',
          itemType: 'VIRTUAL',
          price: fiyat
        }
      ]
    };
    
    // Ödeme formu oluştur
    iyzipay.checkoutFormInitialize.create(request, function (err, result) {
      if (err) {
        console.error('İyzico form oluşturma hatası:', err);
        return res.status(500).json({
          basarili: false,
          mesaj: 'Ödeme formu oluşturulamadı'
        });
      }
      
      // Ödeme formu bilgilerini kaydet
      const yeniOdeme = {
        siparis_id: siparisId,
        email: email,
        isim: isim,
        paket_adi: paket_adi,
        fiyat: fiyat,
        durum: 'beklemede',
        olusturma_tarihi: new Date()
      };
      
      // Veritabanına kaydet (örnek)
      // await OdemeBilgisi.create(yeniOdeme);
      
      // Ödeme formunu döndür
      return res.json({
        basarili: true,
        formContent: result.checkoutFormContent,
        token: result.token
      });
    });
    
  } catch (error) {
    console.error('Ödeme formu oluşturma hatası:', error);
    return res.status(500).json({
      basarili: false,
      mesaj: 'Sunucu hatası'
    });
  }
});

// Ödeme sonucu işleme
app.post('/api/odeme/sonuc', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Ödeme sonucunu doğrula
    iyzipay.checkoutForm.retrieve({
      locale: 'tr',
      conversationId: 'SP' + Date.now(),
      token: token
    }, async function (err, result) {
      if (err || result.status !== 'success') {
        console.error('Ödeme doğrulama hatası:', err || result);
        return res.redirect('https://stoksayim.com/odeme-basarisiz');
      }
      
      // Ödeme başarılı, sipariş bilgilerini al
      const siparisId = result.basketId;
      
      // Sipariş bilgilerini veritabanından al (örnek)
      // const siparis = await OdemeBilgisi.findOne({ siparis_id: siparisId });
      
      // Lisans kodu oluştur
      const lisansKodu = generateLicenseCode();
      
      // Bitiş tarihini hesapla
      const bitisTarihi = new Date();
      bitisTarihi.setFullYear(bitisTarihi.getFullYear() + 1); // 1 yıllık lisans
      
      // Lisansı veritabanına kaydet
      const yeniLisans = new Lisans({
        kod: lisansKodu,
        durum: 'aktif',
        bitis_tarihi: bitisTarihi,
        lisans_tipi: 'yillik',
        kullanici_email: siparis.email,
        odeme_bilgileri: {
          siparis_id: siparisId,
          odeme_yontemi: 'iyzico',
          odeme_tarihi: new Date()
        }
      });
      
      await yeniLisans.save();
      
      // Sipariş durumunu güncelle
      // siparis.durum = 'tamamlandi';
      // siparis.lisans_kodu = lisansKodu;
      // await siparis.save();
      
      // Kullanıcıya lisans kodunu e-posta ile gönder
      // await sendLicenseEmail(siparis.email, lisansKodu, bitisTarihi);
      
      // Başarılı sayfasına yönlendir
      return res.redirect(`https://stoksayim.com/odeme-basarili?lisans=${lisansKodu}`);
    });
    
  } catch (error) {
    console.error('Ödeme sonucu işleme hatası:', error);
    return res.redirect('https://stoksayim.com/odeme-basarisiz');
  }
});
```

---

## Çevrimdışı Kullanım Desteği

### 1. Token Tabanlı Doğrulama

```javascript
// Uygulama tarafında token kontrolü
export const lisansGecerliMi = async () => {
  try {
    const lisansBilgisi = await lisansBilgisiYukle();
    
    // Ücretsiz sürümde lisans kontrolü yok
    if (lisansBilgisi.tip !== "ucretli") {
      return true;
    }
    
    // Token süresi dolmuş mu kontrol et
    const tokenSonGecerlilik = new Date(lisansBilgisi.tokenSonGecerlilik);
    const simdikiZaman = new Date();
    
    // Token geçerli mi?
    if (tokenSonGecerlilik > simdikiZaman) {
      return true;
    }
    
    // Token süresi dolmuş, internet bağlantısı var mı?
    const netInfo = await NetInfo.fetch();
    
    if (netInfo.isConnected) {
      // İnternet varsa sunucudan doğrula
      const sonuc = await lisansGecerliliginiKontrolEt();
      return sonuc.gecerli;
    } else {
      // İnternet yoksa, tolerans süresi tanı (örn: 7 gün)
      const toleransSuresi = 7 * 24 * 60 * 60 * 1000; // 7 gün (milisaniye)
      const tokenSuresiDolmaSuresi = simdikiZaman - tokenSonGecerlilik;
      
      if (tokenSuresiDolmaSuresi < toleransSuresi) {
        // Tolerans süresi içinde, kullanıma izin ver ama uyarı göster
        return true;
      } else {
        // Tolerans süresi aşıldı, kullanıma izin verme
        return false;
      }
    }
  } catch (error) {
    console.error("Lisans kontrol hatası:", error);
    // Hata durumunda, güvenli tarafta kal ve kullanıma izin ver
    return true;
  }
};
```

### 2. Uygulama Açılışında Kontrol

```javascript
// App.js içinde
useEffect(() => {
  const lisansKontrol = async () => {
    const lisansGecerli = await lisansGecerliMi();
    
    if (!lisansGecerli) {
      // Lisans geçersiz, kullanıcıyı bilgilendir
      Alert.alert(
        "Lisans Doğrulama Gerekiyor",
        "Lisansınızın geçerliliğini doğrulamak için internet bağlantısı gerekiyor. Lütfen internet bağlantınızı kontrol edin ve uygulamayı yeniden başlatın.",
        [
          { 
            text: "Ücretsiz Sürüme Geç", 
            onPress: async () => {
              // Ücretsiz sürüme geç
              const yeniLisans = {
                tip: "ucretsiz",
                baslangicTarihi: new Date().toISOString(),
                kalan_gun: UCRETSIZ_LIMITLER.denemeGunSayisi
              };
              await AsyncStorage.setItem("lisans_bilgisi", JSON.stringify(yeniLisans));
              // Uygulamayı yeniden başlat
              RNRestart.Restart();
            }
          },
          { text: "Tamam", style: "cancel" }
        ]
      );
    }
  };
  
  lisansKontrol();
}, []);
```

---

## Güvenlik Önlemleri

### 1. Lisans Doğrulama Güvenliği

- **HTTPS Kullanımı**: Tüm API istekleri HTTPS üzerinden yapılmalıdır.
- **API Anahtarı Doğrulama**: Sunucu isteklerinde API anahtarı kullanın.
- **Rate Limiting**: Brute force saldırılarını önlemek için istek sınırlaması yapın.
- **IP Kısıtlaması**: Şüpheli IP adreslerinden gelen istekleri engelleyin.

### 2. Cihaz Manipülasyonu Önleme

- **Cihaz Kimliği Doğrulama**: Cihaz kimliğinin değiştirilip değiştirilmediğini kontrol edin.
- **Jailbreak/Root Tespiti**: Jailbreak veya root yapılmış cihazlarda ek güvenlik önlemleri alın.
- **Saat Manipülasyonu Tespiti**: Cihaz saatinin değiştirilip değiştirilmediğini kontrol edin.

```javascript
// Cihaz saati manipülasyonu kontrolü
export const saatManipulasyonuKontrolEt = async () => {
  try {
    // Sunucudan gerçek zamanı al
    const response = await fetch('https://api.stoksayim.com/api/zaman');
    const { sunucuZamani } = await response.json();
    
    // Sunucu zamanı ile cihaz zamanını karşılaştır
    const sunucuTarih = new Date(sunucuZamani);
    const cihazTarih = new Date();
    
    // 5 dakikadan fazla fark varsa manipülasyon olabilir
    const farkDakika = Math.abs((sunucuTarih - cihazTarih) / (1000 * 60));
    
    if (farkDakika > 5) {
      return {
        manipulasyonTespit: true,
        mesaj: "Cihazınızın saati doğru değil. Lütfen cihaz saatinizi otomatik olarak ayarlayın."
      };
    }
    
    return { manipulasyonTespit: false };
  } catch (error) {
    console.error("Saat kontrolü hatası:", error);
    // Hata durumunda, internet bağlantısı olmayabilir, bu yüzden manipülasyon olarak işaretleme
    return { manipulasyonTespit: false };
  }
};
```

---

## Lisans Yenileme Süreci

### 1. Otomatik Yenileme (Abonelik Modeli)

Stripe veya İyzico gibi ödeme sistemleri kullanarak otomatik yenileme:

```javascript
// Stripe webhook handler
app.post('/api/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = 'your_webhook_secret';
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Abonelik yenilendi
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;
    
    // Abonelik bilgilerini al
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = subscription.customer;
    
    // Müşteri bilgilerini al
    const customer = await stripe.customers.retrieve(customerId);
    const email = customer.email;
    
    // Lisansı bul ve güncelle
    const lisans = await Lisans.findOne({ 
      'odeme_bilgileri.stripe_musteri_id': customerId,
      'odeme_bilgileri.stripe_abonelik_id': subscriptionId
    });
    
    if (lisans) {
      // Bitiş tarihini güncelle
      const yeniBitisTarihi = new Date();
      yeniBitisTarihi.setFullYear(yeniBitisTarihi.getFullYear() + 1); // 1 yıl ekle
      
      lisans.bitis_tarihi = yeniBitisTarihi;
      lisans.durum = 'aktif';
      await lisans.save();
      
      // Kullanıcıya bilgilendirme e-postası gönder
      // await sendLicenseRenewalEmail(email, lisans.kod, yeniBitisTarihi);
    }
  }
  
  // Abonelik iptal edildi
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const customerId = subscription.customer;
    
    // Lisansı bul ve güncelle
    const lisans = await Lisans.findOne({ 
      'odeme_bilgileri.stripe_musteri_id': customerId,
      'odeme_bilgileri.stripe_abonelik_id': subscription.id
    });
    
    if (lisans) {
      lisans.durum = 'iptal';
      await lisans.save();
    }
  }
  
  res.json({ received: true });
});
```

### 2. Manuel Yenileme

Kullanıcıların lisanslarını manuel olarak yenilemesi için:

```javascript
// Lisans yenileme endpoint'i
app.post('/api/lisans/yenile', async (req, res) => {
  try {
    const { lisans_kodu, odeme_yontemi_id } = req.body;
    
    // Lisansı bul
    const lisans = await Lisans.findOne({ kod: lisans_kodu });
    
    if (!lisans) {
      return res.status(400).json({
        basarili: false,
        mesaj: 'Geçersiz lisans kodu'
      });
    }
    
    // Ödeme işlemini gerçekleştir (Stripe örneği)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 19900, // 199 TL
      currency: 'try',
      payment_method: odeme_yontemi_id,
      confirm: true
    });
    
    if (paymentIntent.status === 'succeeded') {
      // Bitiş tarihini güncelle
      const yeniBitisTarihi = new Date();
      
      // Eğer lisans süresi dolmamışsa, mevcut bitiş tarihine 1 yıl ekle
      if (new Date() < lisans.bitis_tarihi) {
        yeniBitisTarihi.setTime(lisans.bitis_tarihi.getTime());
      }
      
      yeniBitisTarihi.setFullYear(yeniBitisTarihi.getFullYear() + 1); // 1 yıl ekle
      
      lisans.bitis_tarihi = yeniBitisTarihi;
      lisans.durum = 'aktif';
      await lisans.save();
      
      // Kullanıcıya bilgilendirme e-postası gönder
      // await sendLicenseRenewalEmail(lisans.kullanici_email, lisans.kod, yeniBitisTarihi);
      
      return res.json({
        basarili: true,
        bitis_tarihi: yeniBitisTarihi
      });
    } else {
      return res.status(400).json({
        basarili: false,
        mesaj: 'Ödeme işlemi tamamlanamadı'
      });
    }
    
  } catch (error) {
    console.error('Lisans yenileme hatası:', error);
    return res.status(500).json({
      basarili: false,
      mesaj: 'Sunucu hatası'
    });
  }
});
```

---

## Hazır Abonelik Sistemleri

Mobil uygulamalar için hazır abonelik/lisans yönetim sistemleri:

### 1. RevenueCat

RevenueCat, mobil uygulamalar için en popüler abonelik yönetim platformlarından biridir.

**Avantajları:**
- Hem iOS hem de Android için tek bir API
- Abonelik durumlarını sunucu tarafında takip eder
- Detaylı analitik ve raporlama
- Kolay entegrasyon
- Ücretsiz başlangıç planı mevcut
- Türkiye'de çalışır

**Nasıl Entegre Edilir:**
```javascript
import Purchases from 'react-native-purchases';

// Başlatma
Purchases.setDebugLogsEnabled(true);
Purchases.configure({ apiKey: 'your_api_key' });

// Paketleri alma
const offerings = await Purchases.getOfferings();
if (offerings.current !== null) {
  // Kullanıcıya paketleri göster
  const packages = offerings.current.availablePackages;
}

// Satın alma
try {
  const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
  if (customerInfo.entitlements.active['premium']) {
    // Kullanıcı premium özelliklerine erişebilir
  }
} catch (e) {
  console.log('Satın alma hatası:', e);
}
```

### 2. Adapty

Adapty, mobil uygulamalar için abonelik analitik ve yönetim platformudur.

**Avantajları:**
- A/B testi özellikleri
- Kullanıcı davranışına göre özelleştirilmiş teklifler
- Churn (kayıp) önleme araçları
- Kolay entegrasyon
- Türkiye'de çalışır

**Nasıl Entegre Edilir:**
```javascript
import Adapty from 'react-native-adapty';

// Başlatma
await Adapty.activate('your_api_key');

// Paketleri alma
const paywalls = await Adapty.getPaywalls();
const products = paywalls[0].products;

// Satın alma
try {
  const purchaserInfo = await Adapty.makePurchase(products[0]);
  if (purchaserInfo.accessLevels['premium'].isActive) {
    // Kullanıcı premium özelliklere erişebilir
  }
} catch (e) {
  console.log('Satın alma hatası:', e);
}
```

### 3. Firebase + Uygulama Mağazaları

Google Play ve Apple App Store'un kendi abonelik sistemlerini Firebase ile birleştirerek güçlü bir çözüm oluşturabilirsiniz.

**Avantajları:**
- Resmi mağaza API'leri kullanıldığı için güvenilir
- Firebase ile sunucu tarafı doğrulama
- Düşük maliyet (Firebase'in ücretsiz planı yeterli olabilir)
- Türkiye'de çalışır

**Nasıl Entegre Edilir:**
```javascript
import { Platform } from 'react-native';
import * as InAppPurchases from 'expo-in-app-purchases';
import firebase from '@react-native-firebase/app';
import functions from '@react-native-firebase/functions';

// Başlatma
await InAppPurchases.connectAsync();

// Ürünleri alma
const productIds = Platform.select({
  ios: ['com.yourapp.premium.monthly'],
  android: ['com.yourapp.premium.monthly'],
});
const { responseCode, results } = await InAppPurchases.getProductsAsync(productIds);

// Satın alma
try {
  const { responseCode, results } = await InAppPurchases.purchaseItemAsync(productIds[0]);
  if (responseCode === InAppPurchases.IAPResponseCode.OK) {
    // Makbuzu Firebase'e doğrulama için gönder
    const receipt = results[0].transactionReceipt;
    const { data } = await functions().httpsCallable('verifyPurchase')({
      receipt,
      productId: productIds[0],
      platform: Platform.OS
    });
    
    if (data.valid) {
      // Kullanıcı bilgilerini güncelle
      await AsyncStorage.setItem("lisans_bilgisi", JSON.stringify({
        tip: "ucretli",
        baslangicTarihi: new Date().toISOString(),
        sonKullanmaTarihi: data.expiryDate
      }));
    }
  }
} catch (e) {
  console.log('Satın alma hatası:', e);
}
```

### 4. Türkiye'de Yerel Ödeme Çözümleri

#### İyzico

Türkiye'nin önde gelen ödeme çözümlerinden biridir.

**Avantajları:**
- Türkiye'ye özel ödeme yöntemleri
- Yerel destek
- Kolay entegrasyon

**Nasıl Entegre Edilir:**
```javascript
// İyzico entegrasyonu örneği (web view içinde)
const iyzicoCheckout = `
  <script src="https://www.iyzico.com/checkoutform/js/iyzico.js"></script>
  <script>
    const iyzico = new Iyzico({
      apiKey: 'YOUR_API_KEY',
      baseUrl: 'https://sandbox-api.iyzipay.com'
    });
    
    iyzico.startCheckout({
      price: '29.99',
      paidPrice: '29.99',
      callback: (result) => {
        window.ReactNativeWebView.postMessage(JSON.stringify(result));
      }
    });
  </script>
`;
```

#### PayTR

Türkiye'de yaygın kullanılan bir diğer ödeme çözümüdür.

**Avantajları:**
- Türkiye'ye özel ödeme yöntemleri
- Düşük komisyon oranları
- Kolay entegrasyon

### Türkiye'de Abonelik Sistemi İçin Öneriler

1. **Başlangıç İçin**: RevenueCat + Google Play/App Store
   - En kolay ve hızlı çözüm
   - Teknik zorluklar minimal
   - Türkiye'de sorunsuz çalışır

2. **Daha Düşük Komisyon İçin**: Stripe + Kendi Sunucunuz
   - Daha düşük işlem ücretleri
   - Tam kontrol
   - Ancak daha fazla teknik çalışma gerektirir
   - Kullanıcılar uygulamadan çıkıp web üzerinden ödeme yapmalıdır

3. **Yerel Çözüm İçin**: İyzico veya PayTR + Kendi Sunucunuz
   - Türkiye'ye özel ödeme yöntemleri
   - Yerel destek
   - Ancak uygulama içi satın alma politikalarına dikkat etmeniz gerekir

---

## Sonuç

Bu belge, Stok Sayım uygulaması için mevcut lisanslama mantığını, lisans sunucusu kurulumunu, mobil uygulama entegrasyonunu, ödeme sistemleri entegrasyonunu ve güvenlik önlemlerini kapsamlı bir şekilde açıklamaktadır.

Mevcut basit lisanslama sisteminden daha güvenli ve ölçeklenebilir bir çözüme geçmek için, bu belgede açıklanan yöntemlerden birini seçebilirsiniz. Seçiminiz, aşağıdaki faktörlere bağlı olacaktır:

- Uygulama kullanıcı tabanı büyüklüğü
- Lisans ihlali riski
- Teknik kaynaklar ve bütçe
- Kullanıcı deneyimi öncelikleri

Hangi yöntemi seçerseniz seçin, güvenlik ve kullanıcı deneyimi arasında bir denge kurmanız önemlidir. Çok katı güvenlik önlemleri kullanıcı deneyimini olumsuz etkileyebilir, ancak çok gevşek önlemler de lisans ihlallerine yol açabilir.

En iyi uygulama, çevrimdışı kullanımı destekleyen ancak düzenli olarak lisans doğrulaması yapan bir sistem oluşturmaktır. Bu, kullanıcılarınıza kesintisiz bir deneyim sunarken, lisanslarınızın korunmasını da sağlar.
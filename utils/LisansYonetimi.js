import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

// Ücretsiz sürüm limitleri
const UCRETSIZ_LIMITLER = {
  maksimumSayimSayisi: 5,
  maksimumUrunSayisi: 50,
  denemeGunSayisi: 30
};

// Lisans doğrulama için kullanılacak basit bir anahtar
const LISANS_DOGRULAMA_ANAHTARI = "stoksayim_2025_gizli_anahtar";

// Lisans bilgisini yükleme
export const lisansBilgisiYukle = async () => {
  try {
    const lisansBilgisi = await AsyncStorage.getItem("lisans_bilgisi");
    if (lisansBilgisi) {
      return JSON.parse(lisansBilgisi);
    } else {
      // İlk kullanımda lisans bilgisini oluştur
      const yeniLisans = {
        tip: "ucretsiz",
        baslangicTarihi: new Date().toISOString(),
        kalan_gun: UCRETSIZ_LIMITLER.denemeGunSayisi
      };
      await AsyncStorage.setItem("lisans_bilgisi", JSON.stringify(yeniLisans));
      return yeniLisans;
    }
  } catch (error) {
    console.error("Lisans bilgisi yükleme hatası:", error);
    return { tip: "ucretsiz", hata: true };
  }
};

// Sayım sayısı limitini kontrol etme
export const sayimSayisiLimitiniKontrolEt = async () => {
  try {
    const lisansBilgisi = await lisansBilgisiYukle();
    
    // Ücretli sürümde limit yok
    if (lisansBilgisi.tip === "ucretli") {
      return { limitAsildi: false };
    }
    
    // Ücretsiz sürümde limit kontrolü
    const sayimlarStr = await AsyncStorage.getItem("sayimlar");
    if (!sayimlarStr) {
      return { limitAsildi: false };
    }
    
    const sayimlar = JSON.parse(sayimlarStr);
    // Tüm sayımları kontrol et (aktif veya kapalı fark etmeksizin)
    
    if (sayimlar.length >= UCRETSIZ_LIMITLER.maksimumSayimSayisi) {
      return { 
        limitAsildi: true, 
        mesaj: `Ücretsiz sürümde en fazla ${UCRETSIZ_LIMITLER.maksimumSayimSayisi} sayım oluşturabilirsiniz.`
      };
    }
    
    return { limitAsildi: false };
  } catch (error) {
    console.error("Sayım sayısı limit kontrolü hatası:", error);
    return { limitAsildi: false }; // Hata durumunda kullanıcıyı engelleme
  }
};

// Ürün sayısı limitini kontrol etme
export const urunSayisiLimitiniKontrolEt = async (sayimId) => {
  try {
    const lisansBilgisi = await lisansBilgisiYukle();
    
    // Ücretli sürümde limit yok
    if (lisansBilgisi.tip === "ucretli") {
      return { limitAsildi: false };
    }
    
    // Ücretsiz sürümde limit kontrolü
    const urunlerStr = await AsyncStorage.getItem(`sayim_${sayimId}`);
    if (!urunlerStr) {
      return { limitAsildi: false };
    }
    
    const urunler = JSON.parse(urunlerStr);
    
    if (urunler.length >= UCRETSIZ_LIMITLER.maksimumUrunSayisi) {
      return { 
        limitAsildi: true, 
        mesaj: `Ücretsiz sürümde bir sayımda en fazla ${UCRETSIZ_LIMITLER.maksimumUrunSayisi} ürün ekleyebilirsiniz.`
      };
    }
    
    return { limitAsildi: false };
  } catch (error) {
    console.error("Ürün sayısı limit kontrolü hatası:", error);
    return { limitAsildi: false }; // Hata durumunda kullanıcıyı engelleme
  }
};

// Deneme süresini kontrol etme
export const denemeSuresiniKontrolEt = async () => {
  try {
    const lisansBilgisi = await lisansBilgisiYukle();
    
    // Ücretli sürümde süre limiti yok
    if (lisansBilgisi.tip === "ucretli") {
      return { sureDoldu: false };
    }
    
    // Başlangıç tarihi kontrolü
    if (!lisansBilgisi.baslangicTarihi) {
      return { sureDoldu: false }; // Başlangıç tarihi yoksa sorun çıkmasın
    }
    
    const baslangic = new Date(lisansBilgisi.baslangicTarihi);
    const bugun = new Date();
    const farkGun = Math.floor((bugun - baslangic) / (1000 * 60 * 60 * 24));
    
    if (farkGun >= UCRETSIZ_LIMITLER.denemeGunSayisi) {
      return { 
        sureDoldu: true, 
        mesaj: `${UCRETSIZ_LIMITLER.denemeGunSayisi} günlük deneme süreniz doldu. Uygulamayı kullanmaya devam etmek için tam sürüme geçin.`
      };
    }
    
    // Kalan gün sayısını güncelle
    const kalanGun = UCRETSIZ_LIMITLER.denemeGunSayisi - farkGun;
    if (lisansBilgisi.kalan_gun !== kalanGun) {
      lisansBilgisi.kalan_gun = kalanGun;
      await AsyncStorage.setItem("lisans_bilgisi", JSON.stringify(lisansBilgisi));
    }
    
    return { 
      sureDoldu: false,
      kalanGun: kalanGun
    };
  } catch (error) {
    console.error("Deneme süresi kontrolü hatası:", error);
    return { sureDoldu: false }; // Hata durumunda kullanıcıyı engelleme
  }
};

// Cihaz kimliği oluşturma
export const getCihazId = async () => {
  try {
    // Daha önce oluşturulmuş bir cihaz kimliği var mı?
    let cihazId = await AsyncStorage.getItem('cihaz_id');
    
    if (!cihazId) {
      // Cihaz bilgilerinden benzersiz bir kimlik oluştur
      const deviceInfo = {
        platform: Platform.OS,
        version: Platform.Version,
        brand: Platform.OS === 'android' ? 'Android Device' : 'iOS Device',
        uniqueId: Date.now().toString() + Math.random().toString(36).substring(2, 10)
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

// Lisans kodunu doğrula (çevrimdışı)
const lisansKoduDogrula = async (lisansKodu) => {
  try {
    // Lisans kodu formatını kontrol et (örnek: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX)
    const lisansRegex = /^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/;
    if (!lisansRegex.test(lisansKodu)) {
      return { 
        gecerli: false, 
        mesaj: "Geçersiz lisans kodu formatı. Lütfen doğru formatta girin."
      };
    }
    
    // Basit bir doğrulama algoritması
    // Gerçek uygulamada daha karmaşık bir algoritma kullanılmalıdır
    const cihazId = await getCihazId();
    
    // Lisans kodunun son bölümünü kontrol et
    const lisansParcalari = lisansKodu.split('-');
    const sonParca = lisansParcalari[4];
    
    // Test için sabit lisans kodları
    if (lisansKodu === "STOKS-AYIM2-02500-DEMO0-12345") {
      return { 
        gecerli: true,
        lisansTipi: "demo",
        bitisTarihi: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 gün
      };
    } else if (lisansKodu === "STOKS-AYIM2-02500-YILLK-67890") {
      return { 
        gecerli: true,
        lisansTipi: "yillik",
        bitisTarihi: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 yıl
      };
    } else if (lisansKodu === "STOKS-AYIM2-02500-SRSZ-ABCDE") {
      return { 
        gecerli: true,
        lisansTipi: "sinirsiz",
        bitisTarihi: new Date(2099, 11, 31) // Çok uzak bir tarih
      };
    } else if (lisansKodu === "PREMIUM123") {
      // Eski test lisans kodu için geriye dönük uyumluluk
      return { 
        gecerli: true,
        lisansTipi: "premium",
        bitisTarihi: new Date(2099, 11, 31) // Çok uzak bir tarih
      };
    }
    
    // Gerçek bir doğrulama için, lisans kodunun bir checksum'ı kontrol edilebilir
    // Bu örnek basit bir kontrol yapıyor
    const checksum = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      lisansKodu + LISANS_DOGRULAMA_ANAHTARI
    );
    
    // Checksum'ın son 5 karakteri sonParca ile eşleşiyor mu?
    // Not: Bu basit bir örnek, gerçek uygulamada daha güvenli bir yöntem kullanılmalıdır
    if (checksum.substring(checksum.length - 5).toUpperCase() === sonParca) {
      return { 
        gecerli: true,
        lisansTipi: "standart",
        bitisTarihi: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 yıl
      };
    }
    
    return { 
      gecerli: false, 
      mesaj: "Geçersiz lisans kodu. Lütfen doğru kodu girdiğinizden emin olun."
    };
  } catch (error) {
    console.error("Lisans kodu doğrulama hatası:", error);
    return { 
      gecerli: false, 
      mesaj: "Lisans doğrulama sırasında bir hata oluştu."
    };
  }
};

// Lisans tokenı oluştur
const lisansTokeniOlustur = async (lisansKodu, bitisTarihi, lisansTipi) => {
  try {
    const cihazId = await getCihazId();
    const simdi = new Date();
    
    // Token geçerlilik süresi (7 gün)
    const tokenSonGecerlilik = new Date();
    tokenSonGecerlilik.setDate(tokenSonGecerlilik.getDate() + 7);
    
    // Token verisi
    const tokenVerisi = {
      lisansKodu,
      cihazId,
      olusturmaTarihi: simdi.toISOString(),
      sonGecerlilikTarihi: tokenSonGecerlilik.toISOString()
    };
    
    // Token imzası (gerçek uygulamada daha güvenli bir yöntem kullanılmalıdır)
    const tokenImzasi = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      JSON.stringify(tokenVerisi) + LISANS_DOGRULAMA_ANAHTARI
    );
    
    return {
      token: tokenImzasi,
      tokenSonGecerlilik: tokenSonGecerlilik.toISOString()
    };
  } catch (error) {
    console.error("Token oluşturma hatası:", error);
    // Hata durumunda basit bir token döndür
    return {
      token: "error_token_" + Date.now(),
      tokenSonGecerlilik: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 1 gün
    };
  }
};

// Tam sürüme yükseltme (çevrimdışı)
export const tamSurumeYukselt = async (lisansKodu) => {
  try {
    // Lisans kodunu doğrula
    const dogrulamaSonucu = await lisansKoduDogrula(lisansKodu);
    
    if (dogrulamaSonucu.gecerli) {
      // Token oluştur
      const tokenBilgisi = await lisansTokeniOlustur(
        lisansKodu, 
        dogrulamaSonucu.bitisTarihi, 
        dogrulamaSonucu.lisansTipi
      );
      
      // Lisans bilgisini kaydet
      const lisansBilgisi = {
        tip: "ucretli",
        baslangicTarihi: new Date().toISOString(),
        bitisTarihi: dogrulamaSonucu.bitisTarihi.toISOString(),
        lisansKodu: lisansKodu,
        lisansTipi: dogrulamaSonucu.lisansTipi,
        token: tokenBilgisi.token,
        tokenSonGecerlilik: tokenBilgisi.tokenSonGecerlilik,
        sonKontrolTarihi: new Date().toISOString()
      };
      
      await AsyncStorage.setItem("lisans_bilgisi", JSON.stringify(lisansBilgisi));
      return { basarili: true };
    } else {
      return { 
        basarili: false, 
        mesaj: dogrulamaSonucu.mesaj || "Geçersiz lisans kodu. Lütfen doğru kodu girdiğinizden emin olun."
      };
    }
  } catch (error) {
    console.error("Lisans yükseltme hatası:", error);
    return { 
      basarili: false, 
      mesaj: "Lisans işlemi sırasında bir hata oluştu."
    };
  }
};

// Lisans geçerliliğini kontrol etme
export const lisansGecerliliginiKontrolEt = async () => {
  try {
    const lisansBilgisi = await lisansBilgisiYukle();
    
    // Ücretsiz sürümde deneme süresi kontrolü
    if (lisansBilgisi.tip === "ucretsiz") {
      const sureDurumu = await denemeSuresiniKontrolEt();
      
      if (sureDurumu.sureDoldu) {
        return { 
          gecerli: false, 
          mesaj: sureDurumu.mesaj 
        };
      }
      
      // Deneme süresi devam ediyor
      return { 
        gecerli: true, 
        kalanGun: sureDurumu.kalanGun 
      };
    }
    
    // Ücretli sürümde token ve bitiş tarihi kontrolü
    if (lisansBilgisi.tip === "ucretli") {
      const simdikiZaman = new Date();
      const bitisTarihi = new Date(lisansBilgisi.bitisTarihi);
      const tokenSonGecerlilik = new Date(lisansBilgisi.tokenSonGecerlilik);
      
      // Lisans süresi dolmuş mu?
      if (simdikiZaman > bitisTarihi) {
        return { 
          gecerli: false, 
          mesaj: "Lisans süreniz dolmuş. Lütfen lisansınızı yenileyin."
        };
      }
      
      // Token geçerli mi?
      if (simdikiZaman <= tokenSonGecerlilik) {
        // Token hala geçerli, lisans da geçerli
        return { gecerli: true };
      } else {
        // Token süresi dolmuş, ama lisans hala geçerli
        // Tolerans süresi tanı (örn: 30 gün)
        const toleransSuresi = 30 * 24 * 60 * 60 * 1000; // 30 gün (milisaniye)
        const tokenSuresiDolmaSuresi = simdikiZaman - tokenSonGecerlilik;
        
        if (tokenSuresiDolmaSuresi < toleransSuresi) {
          // Tolerans süresi içinde, kullanıma izin ver ama uyarı göster
          return { 
            gecerli: true,
            uyari: "Lisans doğrulaması için internet bağlantısı gerekiyor. Lütfen en kısa sürede internet bağlantısı sağlayın."
          };
        } else {
          // Tolerans süresi aşıldı
          return { 
            gecerli: false, 
            mesaj: "Lisans doğrulaması için çok uzun süredir internet bağlantısı sağlanamadı. Lütfen internet bağlantısı sağlayarak lisansınızı doğrulayın."
          };
        }
      }
    }
    
    // Tanımlanamayan lisans tipi
    return { gecerli: false, mesaj: "Geçersiz lisans tipi." };
  } catch (error) {
    console.error("Lisans geçerliliği kontrolü hatası:", error);
    return { gecerli: false, mesaj: "Lisans kontrolü sırasında bir hata oluştu." };
  }
};

// Lisans tokenını yenile (çevrimiçi olduğunda)
export const lisansTokeniniYenile = async () => {
  try {
    const lisansBilgisi = await lisansBilgisiYukle();
    
    // Ücretsiz sürümde token yok
    if (lisansBilgisi.tip !== "ucretli") {
      return { basarili: false };
    }
    
    // Token yenileme simülasyonu (gerçek uygulamada sunucuya istek yapılır)
    const tokenBilgisi = await lisansTokeniOlustur(
      lisansBilgisi.lisansKodu,
      new Date(lisansBilgisi.bitisTarihi),
      lisansBilgisi.lisansTipi
    );
    
    // Token bilgisini güncelle
    lisansBilgisi.token = tokenBilgisi.token;
    lisansBilgisi.tokenSonGecerlilik = tokenBilgisi.tokenSonGecerlilik;
    lisansBilgisi.sonKontrolTarihi = new Date().toISOString();
    
    await AsyncStorage.setItem("lisans_bilgisi", JSON.stringify(lisansBilgisi));
    
    return { basarili: true };
  } catch (error) {
    console.error("Token yenileme hatası:", error);
    return { basarili: false, mesaj: "Token yenileme sırasında bir hata oluştu." };
  }
};
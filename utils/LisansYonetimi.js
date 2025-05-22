import AsyncStorage from "@react-native-async-storage/async-storage";

// Ücretsiz sürüm limitleri
const UCRETSIZ_LIMITLER = {
  maksimumSayimSayisi: 3,
  maksimumUrunSayisi: 50,
  denemeGunSayisi: 30
};

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
    const aktifSayimlar = sayimlar.filter(s => s.durum !== "kapandi");
    
    if (aktifSayimlar.length >= UCRETSIZ_LIMITLER.maksimumSayimSayisi) {
      return { 
        limitAsildi: true, 
        mesaj: `Ücretsiz sürümde en fazla ${UCRETSIZ_LIMITLER.maksimumSayimSayisi} aktif sayım oluşturabilirsiniz.`
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

// Tam sürüme yükseltme
export const tamSurumeYukselt = async (lisansKodu) => {
  // Gerçek bir uygulamada, burada lisans kodunu bir API ile doğrularsınız
  // Bu örnek için sadece basit bir kontrol yapıyoruz
  if (lisansKodu === "PREMIUM123") {
    const lisansBilgisi = {
      tip: "ucretli",
      baslangicTarihi: new Date().toISOString(),
      lisansKodu: lisansKodu
    };
    await AsyncStorage.setItem("lisans_bilgisi", JSON.stringify(lisansBilgisi));
    return { basarili: true };
  } else {
    return { 
      basarili: false, 
      mesaj: "Geçersiz lisans kodu. Lütfen doğru kodu girdiğinizden emin olun."
    };
  }
};
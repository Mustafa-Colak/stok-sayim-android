// Sayım Detay ekranı için yardımcı fonksiyonlar
import AsyncStorage from "@react-native-async-storage/async-storage";

// Ürünleri yükleme fonksiyonu
export const urunleriYukle = async (sayimId) => {
  try {
    const veri = await AsyncStorage.getItem(`sayim_${sayimId}`);
    if (veri) {
      const yuklenenUrunler = JSON.parse(veri);
      return {
        tumUrunler: yuklenenUrunler,
        gosterilecekUrunler: [...yuklenenUrunler].reverse().slice(0, 50) // İlk 50 ürünü göster
      };
    } else {
      return {
        tumUrunler: [],
        gosterilecekUrunler: []
      };
    }
  } catch (error) {
    console.error("Ürün yükleme hatası:", error);
    throw error;
  }
};

// Sayım durumunu yükleme fonksiyonu
export const durumuYukle = async (sayimId) => {
  try {
    const listeStr = await AsyncStorage.getItem("sayimlar");
    if (listeStr) {
      const liste = JSON.parse(listeStr);
      const sayim = liste.find((s) => s.id === sayimId);
      if (sayim) {
        return sayim.durum;
      }
    }
    return "";
  } catch (error) {
    console.error("Durum yükleme hatası:", error);
    throw error;
  }
};

// Mod tercihini yükleme fonksiyonu
export const modTercihiniYukle = async () => {
  try {
    const modTercihi = await AsyncStorage.getItem("hizli_mod_tercihi");
    if (modTercihi !== null) {
      return JSON.parse(modTercihi);
    }
    return false;
  } catch (error) {
    console.error("Mod tercihi yükleme hatası:", error);
    return false;
  }
};

// Mod tercihini kaydetme fonksiyonu
export const modTercihiniKaydet = async (deger) => {
  try {
    await AsyncStorage.setItem("hizli_mod_tercihi", JSON.stringify(deger));
    return true;
  } catch (error) {
    console.error("Mod tercihi kaydetme hatası:", error);
    return false;
  }
};

// Sayım durumunu güncelleme fonksiyonu
export const sayimDurumuGuncelle = async (sayimId, yeniDurum) => {
  try {
    const listeStr = await AsyncStorage.getItem("sayimlar");
    if (!listeStr) return false;

    const liste = JSON.parse(listeStr);
    const guncel = liste.map((s) =>
      s.id === sayimId ? { ...s, durum: yeniDurum } : s
    );

    await AsyncStorage.setItem("sayimlar", JSON.stringify(guncel));
    return true;
  } catch (error) {
    console.error("Durum güncelleme hatası:", error);
    return false;
  }
};

// Ürünleri kaydetme fonksiyonu
export const urunleriKaydet = async (sayimId, urunler) => {
  try {
    await AsyncStorage.setItem(
      `sayim_${sayimId}`,
      JSON.stringify(urunler)
    );
    return true;
  } catch (error) {
    console.error("Ürün kaydetme hatası:", error);
    return false;
  }
};
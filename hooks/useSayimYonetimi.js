// e:\edev\stok-sayim\hooks\useSayimYonetimi.js
import { useState, useRef, useEffect, useCallback } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform, ToastAndroid } from 'react-native';
import {
  urunSayisiLimitiniKontrolEt,
  denemeSuresiniKontrolEt,
} from "../utils/LisansYonetimi";

export default function useSayimYonetimi(sayimId, navigation) {
  const [urunler, setUrunler] = useState([]);
  const [gosterilecekUrunler, setGosterilecekUrunler] = useState([]);
  const [sayimDurum, setSayimDurum] = useState("");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kalanGun, setKalanGun] = useState(0);
  
  // Asenkron işlemleri yönetmek için ref'ler
  const kayitBekliyor = useRef(false);
  const sonKayitZamani = useRef(0);
  const urunlerRef = useRef([]);
  
  // Sayfa yüklendiğinde
  useEffect(() => {
    urunleriYukle();
    durumuYukle();
    lisansDurumunuKontrolEt();

    // Kaydetme zamanlayıcısı
    const kaydetmeZamanlayici = setInterval(() => {
      if (kayitBekliyor.current && Date.now() - sonKayitZamani.current > 1000) {
        kayitBekliyor.current = false;
        AsyncStorage.setItem(
          `sayim_${sayimId}`,
          JSON.stringify(urunlerRef.current)
        ).catch((err) => console.error("Otomatik kaydetme hatası:", err));
      }
    }, 2000);

    // Temizleme işlemi
    return () => {
      clearInterval(kaydetmeZamanlayici);
      // Eğer bekleyen değişiklikler varsa kaydet
      if (kayitBekliyor.current) {
        AsyncStorage.setItem(
          `sayim_${sayimId}`,
          JSON.stringify(urunlerRef.current)
        ).catch((err) => console.error("Çıkış kaydetme hatası:", err));
      }
    };
  }, [sayimId]);

  // Lisans durumunu kontrol et
  const lisansDurumunuKontrolEt = async () => {
    const sureDurumu = await denemeSuresiniKontrolEt();
    if (!sureDurumu.sureDoldu && sureDurumu.kalanGun <= 5) {
      // Son 5 gün kaldığında uyarı göster
      setKalanGun(sureDurumu.kalanGun);
    } else {
      setKalanGun(0);
    }
  };

  const urunleriYukle = async () => {
    try {
      const veri = await AsyncStorage.getItem(`sayim_${sayimId}`);
      if (veri) {
        const yuklenenUrunler = JSON.parse(veri);
        urunlerRef.current = yuklenenUrunler;
        setUrunler(yuklenenUrunler);
        setGosterilecekUrunler([...yuklenenUrunler].reverse().slice(0, 50)); // İlk 50 ürünü göster
      } else {
        urunlerRef.current = [];
        setUrunler([]);
        setGosterilecekUrunler([]);
      }
    } catch (error) {
      console.error("Ürün yükleme hatası:", error);
    } finally {
      setYukleniyor(false);
    }
  };

  const durumuYukle = async () => {
    try {
      const listeStr = await AsyncStorage.getItem("sayimlar");
      if (listeStr) {
        const liste = JSON.parse(listeStr);
        const sayim = liste.find((s) => s.id === sayimId);
        if (sayim) {
          setSayimDurum(sayim.durum);
        }
      }
    } catch (error) {
      console.error("Durum yükleme hatası:", error);
    }
  };

  const urunEkle = async (barkod, miktar, not, hizliMod) => {
    // Önce deneme süresi kontrolü
    const sureDurumu = await denemeSuresiniKontrolEt();
    if (sureDurumu.sureDoldu) {
      Alert.alert("Deneme Süresi Doldu", sureDurumu.mesaj, [
        {
          text: "Tam Sürüme Geç",
          onPress: () => navigation.navigate("Ayarlar"),
        },
        { text: "Kapat", style: "cancel" },
      ]);
      return false;
    }

    // Sonra ürün sayısı limiti kontrolü
    const limitDurumu = await urunSayisiLimitiniKontrolEt(sayimId);
    if (limitDurumu.limitAsildi) {
      Alert.alert("Limit Aşıldı", limitDurumu.mesaj, [
        {
          text: "Tam Sürüme Geç",
          onPress: () => navigation.navigate("Ayarlar"),
        },
        { text: "Kapat", style: "cancel" },
      ]);
      return false;
    }

    // Barkod kontrolü
    if (!barkod.trim()) {
      Alert.alert("Uyarı", "Barkod girin");
      return false;
    }

    // Manuel modda miktar kontrolü
    if (!hizliMod && !miktar) {
      Alert.alert("Uyarı", "Miktar girin");
      return false;
    }

    // Yeni ürün oluştur
    const yeni = {
      id: Date.now().toString(),
      barkod: barkod.trim(),
      miktar: hizliMod ? 1 : parseInt(miktar) || 1,
      not: hizliMod ? "" : not.trim(), // Hızlı modda not alanını boş bırak
      ad: "", // Ürün adı (notu) şu an girilmediği için boş bırakıyoruz, raporlama için eklendi
    };

    // Önce ref'i güncelle
    const yeniListe = [...urunlerRef.current, yeni];
    urunlerRef.current = yeniListe;

    // Sonra state'i güncelle (sadece son 50 ürünü göster)
    setUrunler(yeniListe);
    setGosterilecekUrunler([...yeniListe].reverse().slice(0, 50));

    // Kayıt için işaretle
    kayitBekliyor.current = true;
    sonKayitZamani.current = Date.now();

    // Sayım durumunu güncelle (sadece başlamamış ise)
    if (sayimDurum === "baslamamis") {
      sayimDurumuGuncelle("devam");
    }
    
    return true;
  };

  const urunSil = useCallback(
    (id) => {
      // Önce ref'i güncelle
      const yeniListe = urunlerRef.current.filter((u) => u.id !== id);
      urunlerRef.current = yeniListe;

      // Sonra state'i güncelle
      setUrunler(yeniListe);
      setGosterilecekUrunler([...yeniListe].reverse().slice(0, 50));

      // Kayıt için işaretle
      kayitBekliyor.current = true;
      sonKayitZamani.current = Date.now();

      // Eğer liste boş kaldıysa durumu güncelle
      if (yeniListe.length === 0 && sayimDurum !== "kapandi") {
        sayimDurumuGuncelle("baslamamis");
      }
    },
    [sayimDurum]
  );

  const sayimDurumuGuncelle = async (yeniDurum) => {
    setSayimDurum(yeniDurum);

    try {
      const listeStr = await AsyncStorage.getItem("sayimlar");
      if (!listeStr) return;

      const liste = JSON.parse(listeStr);
      const guncel = liste.map((s) =>
        s.id === sayimId ? { ...s, durum: yeniDurum } : s
      );

      await AsyncStorage.setItem("sayimlar", JSON.stringify(guncel));

      // Durumu SayimListesi ekranına yansıtmak için
      const sayimListesiEkrani = navigation.getParent();
      if (sayimListesiEkrani) {
        sayimListesiEkrani.setParams({ durumuGuncelle: true });
      }
    } catch (error) {
      console.error("Durum güncelleme hatası:", error);
    }
  };

  const sayimiSonlandir = async () => {
    // Önce bekleyen değişiklikleri kaydet
    if (kayitBekliyor.current) {
      try {
        await AsyncStorage.setItem(
          `sayim_${sayimId}`,
          JSON.stringify(urunlerRef.current)
        );
        kayitBekliyor.current = false;
      } catch (error) {
        console.error("Kaydetme hatası:", error);
      }
    }

    await sayimDurumuGuncelle("kapandi");
    Alert.alert("Sayım Kapatıldı", "Bu sayım kapanmış olarak işaretlendi.");
    
    // Durumu SayimListesi ekranına yansıtmak için doğrudan navigate kullanıyoruz
    navigation.navigate("SayimListesi", { durumuGuncelle: true });
  };

  const sayimaDevamEt = async () => {
    // Önce bekleyen değişiklikleri kaydet
    if (kayitBekliyor.current) {
      try {
        await AsyncStorage.setItem(
          `sayim_${sayimId}`,
          JSON.stringify(urunlerRef.current)
        );
        kayitBekliyor.current = false;
      } catch (error) {
        console.error("Kaydetme hatası:", error);
      }
    }

    const yeniDurum = urunlerRef.current.length === 0 ? "baslamamis" : "devam";
    await sayimDurumuGuncelle(yeniDurum);
    Alert.alert("Devam Ediliyor", "Bu sayım tekrar düzenlenebilir hale geldi.");
    navigation.goBack();
  };

  return {
    urunler,
    gosterilecekUrunler,
    sayimDurum,
    yukleniyor,
    kalanGun,
    urunEkle,
    urunSil,
    sayimiSonlandir,
    sayimaDevamEt
  };
}
// e:\edev\stok-sayim\screens\SayimDetay.js
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  InteractionManager,
} from "react-native";
import common from "../styles/CommonStyles";
import styles from "../styles/SayimDetayStyles";

// Yardımcı fonksiyonlar ve bileşenler
import {
  urunleriYukle,
  durumuYukle,
  modTercihiniYukle,
  modTercihiniKaydet,
  sayimDurumuGuncelle,
  urunleriKaydet
} from "../utils/SayimDetayUtils";
import {
  UrunSatiri,
  ModSecici,
  SayimDurumuButonlari,
  UrunEkleButonu,
  UrunSayisiBilgisi
} from "../components/SayimDetayComponents";

export default function SayimDetay({ route, navigation }) {
  const { sayimId, sayimNot } = route.params;
  const [urunler, setUrunler] = useState([]);
  const [gosterilecekUrunler, setGosterilecekUrunler] = useState([]);
  const [barkod, setBarkod] = useState("");
  const [miktar, setMiktar] = useState("");
  const [not, setNot] = useState("");
  const [sayimDurum, setSayimDurum] = useState("");
  const [hizliMod, setHizliMod] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);

  // Referanslar
  const barkodInputRef = useRef(null);
  const flatListRef = useRef(null);
  const kayitBekliyor = useRef(false);
  const sonKayitZamani = useRef(0);
  const urunlerRef = useRef([]);

  // Sayfa yüklendiğinde
  useEffect(() => {
    // Önce arayüzü göster, sonra verileri yükle
    InteractionManager.runAfterInteractions(() => {
      veriYukle();
    });

    // Kaydetme zamanlayıcısı
    const kaydetmeZamanlayici = setInterval(() => {
      if (kayitBekliyor.current && Date.now() - sonKayitZamani.current > 1000) {
        kayitBekliyor.current = false;
        urunleriKaydet(sayimId, urunlerRef.current)
          .catch(err => console.error("Otomatik kaydetme hatası:", err));
      }
    }, 2000);

    // Temizleme işlemi
    return () => {
      clearInterval(kaydetmeZamanlayici);
      // Eğer bekleyen değişiklikler varsa kaydet
      if (kayitBekliyor.current) {
        urunleriKaydet(sayimId, urunlerRef.current)
          .catch(err => console.error("Çıkış kaydetme hatası:", err));
      }
    };
  }, [sayimId]);

  // Barkod alanına odaklanma
  useEffect(() => {
    if (!yukleniyor) {
      const timer = setTimeout(() => {
        if (barkodInputRef.current) {
          barkodInputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [yukleniyor]);

  // Tüm verileri yükleme
  const veriYukle = async () => {
    try {
      // Ürünleri yükle
      const urunVerisi = await urunleriYukle(sayimId);
      urunlerRef.current = urunVerisi.tumUrunler;
      setUrunler(urunVerisi.tumUrunler);
      setGosterilecekUrunler(urunVerisi.gosterilecekUrunler);

      // Durumu yükle
      const durum = await durumuYukle(sayimId);
      setSayimDurum(durum);

      // Mod tercihini yükle
      const modTercihi = await modTercihiniYukle();
      setHizliMod(modTercihi);
    } catch (error) {
      console.error("Veri yükleme hatası:", error);
      Alert.alert("Hata", "Veriler yüklenirken bir hata oluştu.");
    } finally {
      setYukleniyor(false);
    }
  };

  // Mod tercihini değiştirme
  const modTercihiniDegistir = (deger) => {
    setHizliMod(deger);
    
    // Mod değişikliğinde miktar alanına varsayılan değer atama
    if (!deger) { // Hızlı moddan normal moda geçildiğinde
      setMiktar("1");
      
      // Kullanıcıya bildirim göster
      if (Platform.OS === 'android') {
        ToastAndroid.show('Normal moda geçildi. Miktar manuel girilebilir.', ToastAndroid.SHORT);
      } else {
        Alert.alert('Mod Değişikliği', 'Normal moda geçildi. Miktar manuel girilebilir.');
      }
    } else {
      // Hızlı moda geçildiğinde bildirim göster
      if (Platform.OS === 'android') {
        ToastAndroid.show('Hızlı moda geçildi. Miktar otomatik 1 olarak ayarlanacak.', ToastAndroid.SHORT);
      } else {
        Alert.alert('Mod Değişikliği', 'Hızlı moda geçildi. Miktar otomatik 1 olarak ayarlanacak.');
      }
    }
    
    // Mod değişikliğinde barkod alanına odaklan
    setTimeout(() => {
      if (barkodInputRef.current) {
        barkodInputRef.current.focus();
      }
    }, 100);
    
    modTercihiniKaydet(deger).catch(
      (err) => console.error("Mod tercihi kaydetme hatası:", err)
    );
  };

  // Ürün ekleme
  const urunEkle = () => {
    // Barkod kontrolü
    if (!barkod.trim()) {
      Alert.alert("Uyarı", "Barkod girin");
      return;
    }

    // Manuel modda miktar kontrolü
    if (!hizliMod && !miktar) {
      Alert.alert("Uyarı", "Miktar girin");
      return;
    }

    // Yeni ürün oluştur
    const yeni = {
      id: Date.now().toString(),
      barkod: barkod.trim(),
      miktar: hizliMod ? 1 : parseInt(miktar) || 1,
      not: not.trim(),
      ad: "",
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
      durumuGuncelle("devam");
    }

    // Alanları temizle
    setBarkod("");
    if (!hizliMod) setMiktar("1"); // Normal modda miktar alanını "1" olarak ayarla
    setNot(""); // Not alanını temizle

    // Barkod alanına odaklan
    if (barkodInputRef.current) {
      barkodInputRef.current.focus();
    }
  };

  // Ürün silme
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
        durumuGuncelle("baslamamis");
      }
    },
    [sayimDurum]
  );

  // Durum güncelleme
  const durumuGuncelle = async (yeniDurum) => {
    setSayimDurum(yeniDurum);

    const basarili = await sayimDurumuGuncelle(sayimId, yeniDurum);
    if (basarili) {
      // Durumu SayimListesi ekranına yansıtmak için
      const sayimListesiEkrani = navigation.getParent();
      if (sayimListesiEkrani) {
        sayimListesiEkrani.setParams({ durumuGuncelle: true });
      }
    }
  };

  // Sayımı sonlandırma
  const sayimiSonlandir = async () => {
    // Önce bekleyen değişiklikleri kaydet
    if (kayitBekliyor.current) {
      const basarili = await urunleriKaydet(sayimId, urunlerRef.current);
      if (basarili) {
        kayitBekliyor.current = false;
      } else {
        Alert.alert("Hata", "Sayım kapatılırken bir sorun oluştu.");
        return;
      }
    }

    await durumuGuncelle("kapandi");
    Alert.alert("Sayım Kapatıldı", "Bu sayım kapanmış olarak işaretlendi.");
    navigation.goBack();
  };

  // Sayıma devam etme
  const sayimaDevamEt = async () => {
    // Önce bekleyen değişiklikleri kaydet
    if (kayitBekliyor.current) {
      const basarili = await urunleriKaydet(sayimId, urunlerRef.current);
      if (basarili) {
        kayitBekliyor.current = false;
      } else {
        Alert.alert("Hata", "Sayım açılırken bir sorun oluştu.");
        return;
      }
    }

    const yeniDurum = urunlerRef.current.length === 0 ? "baslamamis" : "devam";
    await durumuGuncelle(yeniDurum);
    Alert.alert("Devam Ediliyor", "Bu sayım tekrar düzenlenebilir hale geldi.");
    navigation.goBack();
  };

  // Barkod girişini tamamlama
  const barkodGirisiniTamamla = () => {
    if (hizliMod) {
      urunEkle();
    }
  };

  // Yükleniyor durumu
  if (yukleniyor) {
    return (
      <View
        style={[
          common.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={common.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={common.title}>{sayimNot}</Text>
      
      {/* Mod seçici */}
      <ModSecici 
        hizliMod={hizliMod} 
        onModDegistir={modTercihiniDegistir} 
      />
      
      {/* Giriş alanları */}
      <View style={styles.inputContainer}>
        <TextInput
          ref={barkodInputRef}
          value={barkod}
          onChangeText={setBarkod}
          placeholder="Barkod"
          style={styles.input}
          onSubmitEditing={barkodGirisiniTamamla}
          returnKeyType={hizliMod ? "done" : "next"}
          blurOnSubmit={false}
          autoFocus={true}
        />
        {!hizliMod && (
          <TextInput
            value={miktar}
            onChangeText={setMiktar}
            placeholder="Miktar"
            keyboardType="numeric"
            style={styles.input}
            returnKeyType="next"
            blurOnSubmit={false}
          />
        )}
        <TextInput
          value={not}
          onChangeText={setNot}
          placeholder="Not (opsiyonel)"
          style={styles.input}
          onSubmitEditing={urunEkle}
          returnKeyType="done"
          blurOnSubmit={false}
        />
      </View>
      
      {/* Ürün ekleme butonu */}
      <UrunEkleButonu onPress={urunEkle} hizliMod={hizliMod} />
      
      {/* Ürün sayısı bilgisi */}
      <UrunSayisiBilgisi 
        toplamUrun={urunler.length} 
        gosterilecekUrunSayisi={gosterilecekUrunler.length} 
      />
      
      {/* Ürün listesi */}
      <FlatList
        ref={flatListRef}
        data={gosterilecekUrunler}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <UrunSatiri item={item} onSil={urunSil} />}
        ListEmptyComponent={
          <Text style={common.subtitle}>Bu sayımda henüz ürün yok.</Text>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        style={{ flex: 1, marginTop: 10 }}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 45,
          offset: 45 * index,
          index,
        })}
      />
      
      {/* Sayım durumu butonları */}
      <SayimDurumuButonlari 
        sayimDurum={sayimDurum} 
        onSonlandir={sayimiSonlandir} 
        onDevamEt={sayimaDevamEt} 
      />
    </KeyboardAvoidingView>
  );
}
// e:\edev\stok-sayim\screens\SayimDetay.js
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  InteractionManager,
  ToastAndroid,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import common from "../styles/CommonStyles";
import styles from "../styles/SayimDetayStyles";
import {
  urunSayisiLimitiniKontrolEt,
  denemeSuresiniKontrolEt,
} from "../utils/LisansYonetimi";

// Performans için memoize edilmiş bileşen
const UrunSatiri = React.memo(({ item, onSil }) => (
  <View style={styles.row}>
    <Text style={styles.text}>
      {item.barkod} - {item.miktar} {item.not ? `(${item.not})` : ""}
    </Text>
    <TouchableOpacity onPress={() => onSil(item.id)}>
      <MaterialCommunityIcons name="trash-can-outline" size={22} color="red" />
    </TouchableOpacity>
  </View>
));

export default function SayimDetay({ route, navigation }) {
  const { sayimId, sayimNot } = route.params;
  const [urunler, setUrunler] = useState([]);
  const [gosterilecekUrunler, setGosterilecekUrunler] = useState([]); // Sadece gösterim için
  const [barkod, setBarkod] = useState("");
  const [miktar, setMiktar] = useState("");
  const [not, setNot] = useState(""); // Not alanı için state eklendi
  const [sayimDurum, setSayimDurum] = useState("");
  const [hizliMod, setHizliMod] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kalanGun, setKalanGun] = useState(0);
  const [klavyeOtomatikAcilsin, setKlavyeOtomatikAcilsin] = useState(false); // Klavye kontrolü için yeni state

  // Barkod input referansı
  const barkodInputRef = useRef(null);
  const flatListRef = useRef(null);

  // Asenkron işlemleri yönetmek için ref'ler
  const kayitBekliyor = useRef(false);
  const sonKayitZamani = useRef(0);
  const urunlerRef = useRef([]);

  // Sayfa yüklendiğinde
  useEffect(() => {
    // Önce arayüzü göster, sonra verileri yükle
    InteractionManager.runAfterInteractions(() => {
      urunleriYukle();
      durumuYukle();
      modTercihiniYukle();
      lisansDurumunuKontrolEt();

      // Veriler yüklendikten 1 saniye sonra klavye kontrolünü aktif et
      setTimeout(() => {
        setKlavyeOtomatikAcilsin(true);
      }, 1000);
    });

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

  // Barkod alanına odaklanma - Otomatik odaklanmayı kontrol ediyoruz
  useEffect(() => {
    if (!yukleniyor && klavyeOtomatikAcilsin) {
      const timer = setTimeout(() => {
        if (barkodInputRef.current) {
          barkodInputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [yukleniyor, klavyeOtomatikAcilsin]);

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

  const modTercihiniYukle = async () => {
    try {
      const modTercihi = await AsyncStorage.getItem("hizli_mod_tercihi");
      if (modTercihi !== null) {
        setHizliMod(JSON.parse(modTercihi));
      }
    } catch (error) {
      console.error("Mod tercihi yükleme hatası:", error);
    }
  };

  const modTercihiniKaydet = (deger) => {
    setHizliMod(deger);

    // Mod değişikliğinde miktar alanına varsayılan değer atama
    if (!deger) {
      // Hızlı moddan normal moda geçildiğinde
      setMiktar("1");

      // Kullanıcıya bildirim göster
      if (Platform.OS === "android") {
        ToastAndroid.show(
          "Normal moda geçildi. Miktar manuel girilebilir.",
          ToastAndroid.SHORT
        );
      } else {
        Alert.alert(
          "Mod Değişikliği",
          "Normal moda geçildi. Miktar manuel girilebilir."
        );
      }
    } else {
      // Hızlı moda geçildiğinde bildirim göster
      if (Platform.OS === "android") {
        ToastAndroid.show(
          "Hızlı moda geçildi. Miktar otomatik 1 olarak ayarlanacak.",
          ToastAndroid.SHORT
        );
      } else {
        Alert.alert(
          "Mod Değişikliği",
          "Hızlı moda geçildi. Miktar otomatik 1 olarak ayarlanacak."
        );
      }
    }

    // Mod değişikliğinde barkod alanına odaklan
    setTimeout(() => {
      if (barkodInputRef.current && klavyeOtomatikAcilsin) {
        barkodInputRef.current.focus();
      }
    }, 100);

    AsyncStorage.setItem("hizli_mod_tercihi", JSON.stringify(deger)).catch(
      (err) => console.error("Mod tercihi kaydetme hatası:", err)
    );
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

  const urunEkle = async () => {
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
      return;
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
      return;
    }

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

    // Alanları temizle
    setBarkod("");
    if (!hizliMod) setMiktar("1"); // Normal modda miktar alanını "1" olarak ayarla
    setNot(""); // Not alanını temizle

    // Barkod alanına odaklan
    if (barkodInputRef.current && klavyeOtomatikAcilsin) {
      barkodInputRef.current.focus();
    }
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

    // Durumu SayimListesi ekranına yansıtmak için
    // navigation.getParent() yerine doğrudan navigation.navigate kullanıyoruz
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

  const barkodGirisiniTamamla = () => {
    if (hizliMod) {
      urunEkle();
    }
  };

  // Klavyeyi manuel olarak açma fonksiyonu
  const klavyeyiAc = () => {
    setKlavyeOtomatikAcilsin(true);
    if (barkodInputRef.current) {
      barkodInputRef.current.focus();
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

      {/* Kalan gün uyarısı */}
      {kalanGun > 0 && kalanGun <= 5 && (
        <View style={extraStyles.uyariKutusu}>
          <Text style={extraStyles.uyariMetni}>
            Deneme sürenizin bitmesine {kalanGun} gün kaldı.
          </Text>
          <TouchableOpacity
            style={extraStyles.tamSurumeGecBtn}
            onPress={() => navigation.navigate("Ayarlar")}
          >
            <Text style={extraStyles.tamSurumeGecBtnText}>Tam Sürüme Geç</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.modeContainer}>
        <Text style={styles.modeText}>Hızlı Sayım Modu:</Text>
        <Switch
          value={hizliMod}
          onValueChange={modTercihiniKaydet}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={hizliMod ? "#007bff" : "#f4f3f4"}
        />
      </View>

      {/* Veri giriş alanları */}
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
          autoFocus={false} // Otomatik odaklanmayı kapat
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
        {/* Not alanını sadece hızlı mod seçili değilse göster */}
        {!hizliMod && (
          <TextInput
            value={not}
            onChangeText={setNot}
            placeholder="Not (opsiyonel)"
            style={styles.input}
            onSubmitEditing={urunEkle}
            returnKeyType="done"
            blurOnSubmit={false}
          />
        )}
      </View>

      {/* Klavye açma butonu */}
      {!klavyeOtomatikAcilsin && (
        <TouchableOpacity
          style={[
            styles.addBtn,
            { backgroundColor: "#6c757d", marginBottom: 10 },
          ]}
          onPress={klavyeyiAc}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="keyboard" size={22} color="#fff" />
          <Text style={styles.addText}>Klavyeyi Aç</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.addBtn}
        onPress={urunEkle}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="plus" size={22} color="#fff" />
        <Text style={styles.addText}>
          {hizliMod ? "Hızlı Ekle (Miktar: 1)" : "Ürün Ekle"}
        </Text>
      </TouchableOpacity>

      {/* Ürün sayısı ve limit bilgisi */}
      {urunler.length > 0 && (
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            Toplam: {urunler.length} ürün
            {gosterilecekUrunler.length < urunler.length
              ? ` (Son ${gosterilecekUrunler.length} gösteriliyor)`
              : ""}
          </Text>
          <Text style={extraStyles.limitBilgisi}>
            {urunler.length >= 40 && urunler.length < 50
              ? `Limit: ${urunler.length}/50 ürün`
              : ""}
          </Text>
        </View>
      )}

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
      {sayimDurum !== "kapandi" && (
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: "gray", marginTop: 10 }]}
          onPress={sayimiSonlandir}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="lock-check" size={22} color="#fff" />
          <Text style={styles.addText}>Sayımı Sonlandır</Text>
        </TouchableOpacity>
      )}
      {sayimDurum === "kapandi" && (
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: "#28a745", marginTop: 10 }]}
          onPress={sayimaDevamEt}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="refresh" size={22} color="#fff" />
          <Text style={styles.addText}>Devam Et</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

// Ek stiller
const extraStyles = StyleSheet.create({
  uyariKutusu: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffeeba",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  uyariMetni: {
    color: "#856404",
    fontSize: 12,
    flex: 1,
  },
  tamSurumeGecBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginLeft: 10,
  },
  tamSurumeGecBtnText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  limitBilgisi: {
    fontSize: 12,
    color: (urunler) => (urunler.length >= 45 ? "#dc3545" : "#6c757d"),
    fontWeight: (urunler) => (urunler.length >= 45 ? "bold" : "normal"),
  },
});

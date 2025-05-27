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
import { useTema } from "../contexts/ThemeContext"; // ThemeContext'i import et
import common from "../styles/CommonStyles";
import styles from "../styles/SayimDetayStyles";
import {
  urunSayisiLimitiniKontrolEt,
  denemeSuresiniKontrolEt,
} from "../utils/LisansYonetimi";

// Performans için memoize edilmiş bileşen
const UrunSatiri = React.memo(({ item, onSil, tema }) => (
  <View style={[styles.row, { backgroundColor: tema.kart }]}>
    <Text style={[styles.text, { color: tema.metin }]}>
      {item.barkod} - {item.miktar} {item.not ? `(${item.not})` : ""}
    </Text>
    <TouchableOpacity onPress={() => onSil(item.id)}>
      <MaterialCommunityIcons name="trash-can-outline" size={22} color="red" />
    </TouchableOpacity>
  </View>
));

export default function SayimDetay({ route, navigation }) {
  const { tema, karanlikTema } = useTema(); // ThemeContext'ten tema bilgilerini al
  const { sayimId, sayimNot } = route.params;
  const [urunler, setUrunler] = useState([]);
  const [gosterilecekUrunler, setGosterilecekUrunler] = useState([]); // Sadece gösterim için
  const [barkod, setBarkod] = useState("");
  const [miktar, setMiktar] = useState("1"); // Varsayılan değer 1 olarak ayarlandı
  const [not, setNot] = useState(""); // Not alanı için state eklendi
  const [sayimDurum, setSayimDurum] = useState("");
  const [hizliMod, setHizliMod] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kalanGun, setKalanGun] = useState(0);
  const [klavyeOtomatikAcilsin, setKlavyeOtomatikAcilsin] = useState(false); // Klavye kontrolü için yeni state

  // Özel alanlar için state
  const [ozelAlanlar, setOzelAlanlar] = useState([]);
  const [alanDegerleri, setAlanDegerleri] = useState({});
  const [aktifAlanVarMi, setAktifAlanVarMi] = useState(false);

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
      ozelAlanlariYukle();

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

  // Özel alanları yükle
  const ozelAlanlariYukle = async () => {
    try {
      // Özel alanları yükle
      const alanlarJson = await AsyncStorage.getItem("ozel_alanlar");
      if (alanlarJson) {
        const alanlar = JSON.parse(alanlarJson);
        setOzelAlanlar(alanlar);

        // Aktif olan alanlar var mı kontrol et
        const aktifAlanlar = alanlar.filter((alan) => alan.aktif);
        setAktifAlanVarMi(aktifAlanlar.length > 0);

        // Aktif alan varsa hızlı modu kapat
        if (aktifAlanlar.length > 0) {
          setHizliMod(false);
        }

        // Bu sayıma ait alan değerlerini yükle
        const alanDegerleriJson = await AsyncStorage.getItem(
          `sayim_alanlar_${sayimId}`
        );
        if (alanDegerleriJson) {
          setAlanDegerleri(JSON.parse(alanDegerleriJson));
        } else {
          // Varsayılan boş değerler oluştur
          const yeniDegerler = {};
          alanlar.forEach((alan) => {
            if (alan.aktif) {
              yeniDegerler[alan.id] = "";
            }
          });
          setAlanDegerleri(yeniDegerler);
        }
      }
    } catch (error) {
      console.error("Özel alanları yükleme hatası:", error);
    }
  };

  // Alan değerlerini kaydet
  const alanDegerleriniKaydet = async (yeniDegerler) => {
    try {
      await AsyncStorage.setItem(
        `sayim_alanlar_${sayimId}`,
        JSON.stringify(yeniDegerler)
      );
    } catch (error) {
      console.error("Alan değerleri kaydetme hatası:", error);
    }
  };

  // Alan değerini değiştir
  const alanDegeriniDegistir = (alanId, deger) => {
    const yeniDegerler = { ...alanDegerleri, [alanId]: deger };
    setAlanDegerleri(yeniDegerler);
    alanDegerleriniKaydet(yeniDegerler);
  };

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
    // Aktif alan varsa hızlı mod seçilemez
    if (deger && aktifAlanVarMi) {
      Alert.alert(
        "Uyarı",
        "Aktif özel alanlar varken hızlı mod kullanılamaz. Özel alanları kapatın veya ayarlardan devre dışı bırakın.",
        [{ text: "Tamam" }]
      );
      return;
    }

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

    // Özel alanların dolu olup olmadığını kontrol et
    const eksikAlanlar = [];
    ozelAlanlar.forEach((alan) => {
      if (
        alan.aktif &&
        (!alanDegerleri[alan.id] || alanDegerleri[alan.id].trim() === "")
      ) {
        eksikAlanlar.push(alan.isim);
      }
    });

    if (eksikAlanlar.length > 0) {
      Alert.alert(
        "Uyarı",
        `Lütfen şu alanları doldurun: ${eksikAlanlar.join(", ")}`
      );
      return;
    }

    // Yeni ürün oluştur
    const yeni = {
      id: Date.now().toString(),
      barkod: barkod.trim(),
      miktar: hizliMod ? 1 : parseInt(miktar) || 1,
      not: hizliMod ? "" : not.trim(), // Hızlı modda not alanını boş bırak
      ozelAlanlar: { ...alanDegerleri },
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

    // Alanları temizle - miktar hariç
    setBarkod("");
    setNot(""); // Not alanını temizle

    // Özel alanları temizle
    const yeniDegerler = {};
    ozelAlanlar.forEach((alan) => {
      if (alan.aktif) {
        yeniDegerler[alan.id] = "";
      }
    });
    setAlanDegerleri(yeniDegerler);
    alanDegerleriniKaydet(yeniDegerler);

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

  // Tema renklerini kullanarak dinamik stiller oluştur
  const dinamikStiller = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tema.arkaplan,
      padding: 16,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: tema.metin,
      flex: 1,
    },
    subtitle: {
      fontSize: 16,
      color: tema.ikincilMetin,
      textAlign: "center",
      marginTop: 20,
    },
    modeContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 10,
    },
    modeText: {
      fontSize: 14,
      color: tema.metin,
      marginRight: 5,
    },
    inputContainer: {
      marginBottom: 10,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    inputLabel: {
      color: tema.metin,
      fontSize: 14,
      fontWeight: "bold",
      width: 60,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: tema.girdiBorder,
      backgroundColor: tema.girdi,
      color: tema.metin,
      borderRadius: 4,
      padding: 10,
      fontSize: 16,
    },
    halfInputContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    halfInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: tema.girdiBorder,
      backgroundColor: tema.girdi,
      color: tema.metin,
      borderRadius: 4,
      padding: 10,
      fontSize: 16,
    },
    miktarContainer: {
      width: 120, // Miktar alanını daraltıyoruz
      flexDirection: "row",
      alignItems: "center",
    },
    miktarInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: tema.girdiBorder,
      backgroundColor: tema.girdi,
      color: tema.metin,
      borderRadius: 4,
      padding: 10,
      fontSize: 16,
    },
    addBtn: {
      backgroundColor: tema.buton,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 4,
      marginBottom: 10,
    },
    addText: {
      color: tema.butonMetin,
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 8,
    },
    countContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginVertical: 5,
    },
    countText: {
      fontSize: 14,
      fontWeight: "bold",
      color: tema.metin,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 10,
      backgroundColor: tema.kart,
      borderRadius: 4,
      marginBottom: 5,
    },
    text: {
      flex: 1,
      fontSize: 16,
      color: tema.metin,
    },
    separator: {
      height: 1,
      backgroundColor: tema.sinir,
    },
    uyariKutusu: {
      backgroundColor: karanlikTema ? "#332700" : "#fff3cd",
      borderColor: karanlikTema ? "#665200" : "#ffeeba",
      borderWidth: 1,
      borderRadius: 8,
      padding: 10,
      marginBottom: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    uyariMetni: {
      color: karanlikTema ? "#ffda6a" : "#856404",
      fontSize: 12,
      flex: 1,
    },
    tamSurumeGecBtn: {
      backgroundColor: tema.buton,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 4,
      marginLeft: 10,
    },
    tamSurumeGecBtnText: {
      color: tema.butonMetin,
      fontSize: 10,
      fontWeight: "bold",
    },
    limitBilgisi: {
      fontSize: 12,
      color: urunler.length >= 45 ? "#dc3545" : tema.ikincilMetin,
      fontWeight: urunler.length >= 45 ? "bold" : "normal",
    },
    sonlandirBtn: {
      backgroundColor: karanlikTema ? "#6c757d" : "gray",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 4,
      marginTop: 10,
    },
    devamEtBtn: {
      backgroundColor: karanlikTema ? "#1e7e34" : "#28a745",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 4,
      marginTop: 10,
    },
    klavyeAcBtn: {
      backgroundColor: karanlikTema ? "#5a6268" : "#6c757d",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 4,
      marginBottom: 10,
    },
  });

  // Yükleniyor durumu
  if (yukleniyor) {
    return (
      <View
        style={[
          dinamikStiller.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: tema.metin }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={dinamikStiller.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Başlık ve Hızlı Sayım Modu aynı satırda */}
      <View style={dinamikStiller.headerContainer}>
        <Text style={dinamikStiller.title}>{sayimNot}</Text>
        <View style={dinamikStiller.modeContainer}>
          <Text style={dinamikStiller.modeText}>Hızlı Mod:</Text>
          <Switch
            value={hizliMod}
            onValueChange={modTercihiniKaydet}
            trackColor={{
              false: karanlikTema ? "#555" : "#767577",
              true: karanlikTema ? "#3a6ea5" : "#81b0ff",
            }}
            thumbColor={
              hizliMod ? tema.buton : karanlikTema ? "#f4f3f4" : "#f4f3f4"
            }
            disabled={aktifAlanVarMi} // Aktif alan varsa hızlı mod seçilemez
          />
        </View>
      </View>

      {/* Kalan gün uyarısı */}
      {kalanGun > 0 && kalanGun <= 5 && (
        <View style={dinamikStiller.uyariKutusu}>
          <Text style={dinamikStiller.uyariMetni}>
            Deneme sürenizin bitmesine {kalanGun} gün kaldı.
          </Text>
          <TouchableOpacity
            style={dinamikStiller.tamSurumeGecBtn}
            onPress={() => navigation.navigate("Ayarlar")}
          >
            <Text style={dinamikStiller.tamSurumeGecBtnText}>
              Tam Sürüme Geç
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Veri giriş alanları - Yeni sıralama: Barkod -> Özel Alanlar -> Not -> Miktar */}
      <View style={dinamikStiller.inputContainer}>
        {/* Barkod alanı */}
        <View style={dinamikStiller.inputRow}>
          <Text style={dinamikStiller.inputLabel}>Barkod:</Text>
          <TextInput
            ref={barkodInputRef}
            value={barkod}
            onChangeText={setBarkod}
            placeholder="Barkod"
            placeholderTextColor={tema.ikincilMetin}
            style={dinamikStiller.input}
            onSubmitEditing={barkodGirisiniTamamla}
            returnKeyType={hizliMod ? "done" : "next"}
            blurOnSubmit={false}
            autoFocus={false} // Otomatik odaklanmayı kapat
          />
        </View>

        {/* Özel alanlar */}
        {ozelAlanlar.map((alan, index) => {
          if (alan.aktif) {
            return (
              <View key={alan.id} style={dinamikStiller.inputRow}>
                <Text style={dinamikStiller.inputLabel}>{alan.isim}:</Text>
                <TextInput
                  value={alanDegerleri[alan.id] || ""}
                  onChangeText={(text) => alanDegeriniDegistir(alan.id, text)}
                  placeholder={alan.isim}
                  placeholderTextColor={tema.ikincilMetin}
                  style={dinamikStiller.input}
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>
            );
          }
          return null;
        })}

        {/* Not ve Miktar alanları yan yana - Not alanı diğer alanlarla aynı hizada */}
        {!hizliMod && (
          <View style={dinamikStiller.inputRow}>
            <Text style={dinamikStiller.inputLabel}>Not:</Text>
            <View style={{ flex: 1, flexDirection: "row" }}>
              <TextInput
                value={not}
                onChangeText={setNot}
                placeholder="Not (opsiyonel)"
                placeholderTextColor={tema.ikincilMetin}
                style={[dinamikStiller.input, { marginRight: 8 }]}
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <View style={dinamikStiller.miktarContainer}>
                <Text style={[dinamikStiller.inputLabel, { width: 55 }]}>
                  Miktar:
                </Text>
                <TextInput
                  value={miktar}
                  onChangeText={setMiktar}
                  placeholder="Adet"
                  placeholderTextColor={tema.ikincilMetin}
                  keyboardType="numeric"
                  style={dinamikStiller.miktarInput}
                  returnKeyType="done"
                  blurOnSubmit={false}
                />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Klavye açma butonu */}
      {!klavyeOtomatikAcilsin && (
        <TouchableOpacity
          style={dinamikStiller.klavyeAcBtn}
          onPress={klavyeyiAc}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="keyboard"
            size={22}
            color={tema.butonMetin}
          />
          <Text style={dinamikStiller.addText}>Klavyeyi Aç</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={dinamikStiller.addBtn}
        onPress={urunEkle}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="plus" size={22} color={tema.butonMetin} />
        <Text style={dinamikStiller.addText}>
          {hizliMod ? "Hızlı Ekle (Miktar: 1)" : "Ürün Ekle"}
        </Text>
      </TouchableOpacity>

      {/* Ürün sayısı ve limit bilgisi */}
      {urunler.length > 0 && (
        <View style={dinamikStiller.countContainer}>
          <Text style={dinamikStiller.countText}>
            Toplam: {urunler.length} ürün
            {gosterilecekUrunler.length < urunler.length
              ? ` (Son ${gosterilecekUrunler.length} gösteriliyor)`
              : ""}
          </Text>
          <Text
            style={[
              dinamikStiller.limitBilgisi,
              {
                color:
                  urunler.length >= 45
                    ? karanlikTema
                      ? "#ff6b6b"
                      : "#dc3545"
                    : tema.ikincilMetin,
              },
            ]}
          >
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
        renderItem={({ item }) => (
          <UrunSatiri item={item} onSil={urunSil} tema={tema} />
        )}
        ListEmptyComponent={
          <Text style={dinamikStiller.subtitle}>
            Bu sayımda henüz ürün yok.
          </Text>
        }
        ItemSeparatorComponent={() => <View style={dinamikStiller.separator} />}
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
          style={dinamikStiller.sonlandirBtn}
          onPress={sayimiSonlandir}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="lock-check"
            size={22}
            color={tema.butonMetin}
          />
          <Text style={dinamikStiller.addText}>Sayımı Sonlandır</Text>
        </TouchableOpacity>
      )}
      {sayimDurum === "kapandi" && (
        <TouchableOpacity
          style={dinamikStiller.devamEtBtn}
          onPress={sayimaDevamEt}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={22}
            color={tema.butonMetin}
          />
          <Text style={dinamikStiller.addText}>Devam Et</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

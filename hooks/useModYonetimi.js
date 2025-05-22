// e:\edev\stok-sayim\hooks\useModYonetimi.js
import { useState, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, ToastAndroid, Alert } from 'react-native';

export default function useModYonetimi(barkodInputRef, klavyeOtomatikAcilsin) {
  const [hizliMod, setHizliMod] = useState(false);

  useEffect(() => {
    modTercihiniYukle();
  }, []);

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

    // Kullanıcıya bildirim göster
    if (Platform.OS === "android") {
      ToastAndroid.show(
        deger 
          ? "Hızlı moda geçildi. Miktar otomatik 1 olarak ayarlanacak."
          : "Normal moda geçildi. Miktar manuel girilebilir.",
        ToastAndroid.SHORT
      );
    } else {
      Alert.alert(
        "Mod Değişikliği",
        deger 
          ? "Hızlı moda geçildi. Miktar otomatik 1 olarak ayarlanacak."
          : "Normal moda geçildi. Miktar manuel girilebilir."
      );
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
    
    return deger;
  };

  return {
    hizliMod,
    modTercihiniKaydet
  };
}
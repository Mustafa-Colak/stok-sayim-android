import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import styles from "../styles/GirisEkraniStyles";

export default function GirisEkrani({ navigation }) {
  const [dil, setDil] = useState("tr");
  const [kullanici, setKullanici] = useState("");
  const [sifre, setSifre] = useState("");

  const metin = {
    tr: {
      baslik: "Stok Sayım Uygulaması",
      aciklama: "Sayım işlemlerinizi yönetin.",
      kullanici: "Kullanıcı Adı",
      sifre: "Şifre",
      giris: "Giriş Yap",
    },
    en: {
      baslik: "Inventory Count App",
      aciklama: "Manage your inventory counts.",
      kullanici: "Username",
      sifre: "Password",
      giris: "Login",
    },
  };

  const handleGiris = () => {
    navigation.replace("AnaMenu");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{metin[dil].baslik}</Text>
      <Text style={styles.subtitle}>{metin[dil].aciklama}</Text>

      <TextInput
        style={styles.input}
        placeholder={metin[dil].kullanici}
        value={kullanici}
        onChangeText={setKullanici}
      />
      <TextInput
        style={styles.input}
        placeholder={metin[dil].sifre}
        value={sifre}
        onChangeText={setSifre}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleGiris}>
        <Text style={styles.buttonText}>{metin[dil].giris}</Text>
      </TouchableOpacity>

      <View style={styles.langSwitch}>
        <TouchableOpacity onPress={() => setDil("tr")}>
          <Text style={[styles.langBtn, dil === "tr" && styles.selected]}>
            🇹🇷 Türkçe
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDil("en")}>
          <Text style={[styles.langBtn, dil === "en" && styles.selected]}>
            🇬🇧 English
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
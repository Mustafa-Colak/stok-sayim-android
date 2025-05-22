import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTema } from "../contexts/ThemeContext"; // ThemeContext'i import et
import styles from "../styles/GirisEkraniStyles";

export default function GirisEkrani({ navigation }) {
  const { tema, karanlikTema } = useTema(); // ThemeContext'ten tema bilgilerini al
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

  // Tema renklerini kullanarak dinamik stiller oluştur
  const dinamikStiller = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: tema.arkaplan,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 10,
      color: tema.metin,
    },
    subtitle: {
      fontSize: 16,
      marginBottom: 30,
      textAlign: "center",
      color: tema.ikincilMetin,
    },
    input: {
      width: "100%",
      borderWidth: 1,
      borderColor: tema.girdiBorder,
      backgroundColor: tema.girdi,
      color: tema.metin,
      borderRadius: 4,
      padding: 12,
      marginBottom: 15,
      fontSize: 16,
    },
    button: {
      backgroundColor: tema.buton,
      width: "100%",
      padding: 15,
      borderRadius: 4,
      alignItems: "center",
      marginTop: 10,
    },
    buttonText: {
      color: tema.butonMetin,
      fontWeight: "bold",
      fontSize: 16,
    },
    langSwitch: {
      flexDirection: "row",
      marginTop: 30,
    },
    langBtn: {
      marginHorizontal: 10,
      padding: 8,
      color: tema.metin,
    },
    selected: {
      fontWeight: "bold",
      borderBottomWidth: 2,
      borderBottomColor: tema.vurgu,
    },
  });

  return (
    <View style={dinamikStiller.container}>
      <Text style={dinamikStiller.title}>{metin[dil].baslik}</Text>
      <Text style={dinamikStiller.subtitle}>{metin[dil].aciklama}</Text>

      <TextInput
        style={dinamikStiller.input}
        placeholder={metin[dil].kullanici}
        placeholderTextColor={tema.ikincilMetin}
        value={kullanici}
        onChangeText={setKullanici}
      />
      <TextInput
        style={dinamikStiller.input}
        placeholder={metin[dil].sifre}
        placeholderTextColor={tema.ikincilMetin}
        value={sifre}
        onChangeText={setSifre}
        secureTextEntry
      />

      <TouchableOpacity style={dinamikStiller.button} onPress={handleGiris}>
        <Text style={dinamikStiller.buttonText}>{metin[dil].giris}</Text>
      </TouchableOpacity>

      <View style={dinamikStiller.langSwitch}>
        <TouchableOpacity onPress={() => setDil("tr")}>
          <Text style={[dinamikStiller.langBtn, dil === "tr" && dinamikStiller.selected]}>
            🇹🇷 Türkçe
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDil("en")}>
          <Text style={[dinamikStiller.langBtn, dil === "en" && dinamikStiller.selected]}>
            🇬🇧 English
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
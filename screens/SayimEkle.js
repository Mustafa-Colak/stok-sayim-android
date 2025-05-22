import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

export default function SayimEkle({ navigation, route }) {
  const { onEkle } = route.params;
  const [ad, setAd] = useState("");

  const handleKaydet = async () => {
    if (!ad.trim()) {
      Alert.alert("Uyarı", "Sayım adı boş olamaz.");
      return;
    }

    // 📅 _DDMMYY tarih eklentisi (MMDDYY yerine DDMMYY formatında)
    const now = new Date();
    const gun = String(now.getDate()).padStart(2, "0");
    const ay = String(now.getMonth() + 1).padStart(2, "0");
    const yil = String(now.getFullYear()).slice(-2);
    const tarihEki = `_${gun}${ay}${yil}`;

    const sayimAd = ad.trim() + tarihEki;

    const yeniSayim = {
      id: Date.now().toString(),
      ad: sayimAd,
      tarih: now.toISOString().split("T")[0],
    };

    console.log("YENİ SAYIM:", yeniSayim);

    // 🔧 onEkle'yi bekle, sonra geri dön
    await onEkle(yeniSayim);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sayım Adı:</Text>
      <TextInput
        value={ad}
        onChangeText={setAd}
        placeholder="Örn: Haziran"
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleKaydet}>
        <Text style={styles.buttonText}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 18, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18 },
});
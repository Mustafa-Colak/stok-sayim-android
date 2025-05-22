import React, { useLayoutEffect } from "react";
import { View, Text, Button, Alert } from "react-native";

import styles from "../../styles/SayimSilStyles";
import common from "../../styles/CommonStyles"; // ✅ ortak stiller

export default function SayimSil({ navigation, route }) {
  const { sayimId, sayimAd } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Stok Sayım / Sayımı Sil",
    });
  }, [navigation]);

  const handleSil = () => {
    Alert.alert("Silindi", `"${sayimAd}" adlı sayım silindi.`);
    navigation.navigate("SayimListesi");
  };

  return (
    <View style={common.container}>
      <Text style={common.title}>Sayımı Sil</Text>
      <Text style={styles.warning}>
        "{sayimAd}" adlı sayımı silmek istediğinizden emin misiniz?
      </Text>
      <View style={styles.buttons}>
        <Button title="Evet, Sil" color="crimson" onPress={handleSil} />
        <Button title="Vazgeç" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

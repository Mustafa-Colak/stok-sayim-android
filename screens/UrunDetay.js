import React, { useLayoutEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';

import styles from '../styles/UrunDetayStyles';
import common from '../styles/CommonStyles'; // ✅ ortak stiller

export default function UrunDetay({ navigation, route }) {
  const { urunAd, sayimAd } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Stok Sayım / ${sayimAd} / ${urunAd}`,
    });
  }, [navigation, sayimAd, urunAd]);

  const urunuSil = () => {
    Alert.alert("Silindi", `"${urunAd}" adlı ürün silindi.`);
    navigation.goBack();
  };

  return (
    <View style={common.container}>
      <Text style={common.title}>{urunAd}</Text>
      <Text style={common.subtitle}>
        Bu ürünle ilgili detaylar burada gösterilecek.
      </Text>
      <Button title="Ürünü Sil" color="crimson" onPress={urunuSil} />
    </View>
  );
}

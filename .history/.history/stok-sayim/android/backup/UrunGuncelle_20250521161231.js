
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, Button, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import common from '../styles/CommonStyles';

export default function UrunGuncelle({ navigation, route }) {
  const { sayimId, sayimAd, urun } = route.params;
  const STORAGE_KEY = `sayim_${sayimId}`;

  const [barkod, setBarkod] = useState(urun.barkod || '');
  const [ad, setAd] = useState(urun.ad || '');
  const [miktar, setMiktar] = useState(String(urun.miktar || 1));

  const barkodInput = useRef(null);

  useEffect(() => {
    barkodInput.current?.focus();
  }, []);

  const urunGuncelle = async () => {
    if (!barkod.trim()) {
      Alert.alert("Uyarı", "Barkod boş olamaz.");
      return;
    }

    try {
      const veri = await AsyncStorage.getItem(STORAGE_KEY);
      const urunler = veri ? JSON.parse(veri) : [];

      const guncelListe = urunler.map(u => {
        if (u.id === urun.id) {
          return {
            ...u,
            barkod: barkod.trim(),
            ad: ad.trim(),
            miktar: parseInt(miktar) || 1,
          };
        }
        return u;
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(guncelListe));
      navigation.replace('SayimDetay', { sayimId, sayimAd });
    } catch (e) {
      Alert.alert("Hata", "Ürün güncellenemedi.");
    }
  };

  return (
    <View style={common.container}>
      <Text style={common.title}>Ürün Güncelle</Text>

      <TextInput
        ref={barkodInput}
        style={common.input}
        placeholder="Barkod"
        value={barkod}
        onChangeText={setBarkod}
        keyboardType="numeric"
      />

      <TextInput
        style={common.input}
        placeholder="Ürün adı"
        value={ad}
        onChangeText={setAd}
      />

      <TextInput
        style={common.input}
        placeholder="Miktar"
        value={miktar}
        onChangeText={setMiktar}
        keyboardType="numeric"
      />

      <Button title="Güncelle" onPress={urunGuncelle} />
    </View>
  );
}

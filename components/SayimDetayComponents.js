import React from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "../styles/SayimDetayStyles";

// Ürün satırı bileşeni
export const UrunSatiri = React.memo(({ item, onSil }) => (
  <View style={styles.row}>
    <Text style={styles.text}>
      {item.barkod} - {item.miktar} {item.not ? `(${item.not})` : ""}
    </Text>
    <TouchableOpacity onPress={() => onSil(item.id)}>
      <MaterialCommunityIcons name="trash-can-outline" size={22} color="red" />
    </TouchableOpacity>
  </View>
));

// Mod seçici bileşeni
export const ModSecici = ({ hizliMod, onModDegistir }) => (
  <>
    <View style={styles.modeContainer}>
      <Text style={styles.modeText}>Hızlı Sayım Modu:</Text>
      <Switch
        value={hizliMod}
        onValueChange={onModDegistir}
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={hizliMod ? "#007bff" : "#f4f3f4"}
      />
    </View>
    <Text style={styles.modeDescription}>
      {hizliMod
        ? "Hızlı mod: Sadece barkod girin, miktar otomatik 1 olarak eklenir."
        : "Manuel mod: Barkod ve miktar girmeniz gerekir."}
    </Text>
  </>
);

// Sayım durumu butonları
export const SayimDurumuButonlari = ({ sayimDurum, onSonlandir, onDevamEt }) => (
  <>
    {sayimDurum !== "kapandi" && (
      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: "gray", marginTop: 10 }]}
        onPress={onSonlandir}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="lock-check" size={22} color="#fff" />
        <Text style={styles.addText}>Sayımı Sonlandır</Text>
      </TouchableOpacity>
    )}
    {sayimDurum === "kapandi" && (
      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: "#28a745", marginTop: 10 }]}
        onPress={onDevamEt}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="refresh" size={22} color="#fff" />
        <Text style={styles.addText}>Devam Et</Text>
      </TouchableOpacity>
    )}
  </>
);

// Ürün ekleme butonu
export const UrunEkleButonu = ({ onPress, hizliMod }) => (
  <TouchableOpacity
    style={styles.addBtn}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <MaterialCommunityIcons name="plus" size={22} color="#fff" />
    <Text style={styles.addText}>
      {hizliMod ? "Hızlı Ekle (Miktar: 1)" : "Ürün Ekle"}
    </Text>
  </TouchableOpacity>
);

// Ürün sayısı bilgisi
export const UrunSayisiBilgisi = ({ toplamUrun, gosterilecekUrunSayisi }) => (
  toplamUrun > 0 ? (
    <Text style={styles.countText}>
      Toplam: {toplamUrun} ürün
      {gosterilecekUrunSayisi < toplamUrun
        ? ` (Son ${gosterilecekUrunSayisi} gösteriliyor)`
        : ""}
    </Text>
  ) : null
);
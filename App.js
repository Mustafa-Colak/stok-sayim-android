// e:\edev\stok-sayim\App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { ThemeProvider, useTema } from "./contexts/ThemeContext";

// GirisEkrani yerine LoginScreen'i import ediyoruz
import LoginScreen from "./screens/LoginScreen";
import AnaMenu from "./screens/AnaMenu";
import SayimListesi from "./screens/SayimListesi";
import SayimDetay from "./screens/SayimDetay";
import RaporOlustur from "./screens/RaporOlustur";
import YeniSayim from "./screens/YeniSayim";
import Ayarlar from "./screens/Ayarlar";
// Diğer ekranları da import edelim
import RegisterScreen from "./screens/RegisterScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import ProfileScreen from "./screens/ProfileScreen";

const Stack = createStackNavigator();

// UstaHesap logo bileşeni - Her zaman solda
const UstaHesapLogo = () => (
  <Image source={require("./assets/ustahesap-logo.png")} style={styles.logo} />
);

// Geri butonu bileşeni - Sağda
const CustomBackButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.backButton}>
    <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
  </TouchableOpacity>
);

// Ana uygulama bileşeni
const MainApp = () => {
  const { tema } = useTema();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerStyle: { backgroundColor: tema.vurgu }, // Tema rengini kullan
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 22,
          },
          headerTitleAlign: "center", // Başlık yazısı ortada
          headerLeft: () => <UstaHesapLogo />, // Logo her zaman solda
          // Varsayılan geri butonunu kaldırıyoruz
          headerBackVisible: false,
          // Tema renklerini ekranlara geçir
          cardStyle: { backgroundColor: tema.arkaplan },
        })}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: "Giriş",
            // Giriş ekranında geri butonu yok
          }}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={({ navigation }) => ({
            title: "Hesap Oluştur",
            headerRight: () => (
              <CustomBackButton onPress={() => navigation.goBack()} />
            ),
          })}
        />

        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={({ navigation }) => ({
            title: "Şifremi Unuttum",
            headerRight: () => (
              <CustomBackButton onPress={() => navigation.goBack()} />
            ),
          })}
        />

        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={({ navigation }) => ({
            title: "Profil",
            headerRight: () => (
              <CustomBackButton onPress={() => navigation.goBack()} />
            ),
          })}
        />

        <Stack.Screen
          name="AnaMenu"
          component={AnaMenu}
          options={{
            title: "Ana Menü",
            // Ana Menü ekranında geri butonu yok
          }}
        />

        <Stack.Screen
          name="SayimListesi"
          component={SayimListesi}
          options={({ navigation }) => ({
            title: "Sayım Listesi",
            // Geri butonu sağda
            headerRight: () => (
              <CustomBackButton onPress={() => navigation.goBack()} />
            ),
          })}
        />

        <Stack.Screen
          name="SayimDetay"
          component={SayimDetay}
          options={({ navigation }) => ({
            title: "Sayım Detayı", // Değiştirildi: Sabit başlık
            // Sadece geri butonu var, rapor butonu kaldırıldı
            headerRight: () => (
              <CustomBackButton onPress={() => navigation.goBack()} />
            ),
          })}
        />

        <Stack.Screen
          name="RaporOlustur"
          component={RaporOlustur}
          options={({ navigation }) => ({
            title: "Rapor Oluştur",
            // Geri butonu sağda
            headerRight: () => (
              <CustomBackButton onPress={() => navigation.goBack()} />
            ),
          })}
        />

        <Stack.Screen
          name="YeniSayim"
          component={YeniSayim}
          options={({ navigation }) => ({
            title: "Yeni Sayım",
            // Geri butonu sağda
            headerRight: () => (
              <CustomBackButton onPress={() => navigation.goBack()} />
            ),
          })}
        />

        <Stack.Screen
          name="Ayarlar"
          component={Ayarlar}
          options={({ navigation }) => ({
            title: "Ayarlar",
            // Geri butonu sağda
            headerRight: () => (
              <CustomBackButton onPress={() => navigation.goBack()} />
            ),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Ana uygulama
export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 105,
    height: 50,
    resizeMode: "contain",
    marginLeft: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportButton: {
    padding: 8,
    marginRight: 8,
  },
});

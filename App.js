import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // ✅ ikon importu

import GirisEkrani from "./screens/GirisEkrani";
import AnaMenu from "./screens/AnaMenu";
import SayimListesi from "./screens/SayimListesi";
import SayimDetay from "./screens/SayimDetay";
import UrunEkle from "./screens/UrunEkle";
import UrunDetay from "./screens/UrunDetay";
import RaporOlustur from "./screens/RaporOlustur";
import SayimSil from "./screens/SayimSil";
import YeniSayim from "./screens/YeniSayim";
import UrunGuncelle from "./screens/UrunGuncelle";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#007bff" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen name="Giris" component={GirisEkrani} />
        <Stack.Screen name="AnaMenu" component={AnaMenu} />

        <Stack.Screen
          name="SayimListesi"
          component={SayimListesi}
          options={{
            title: "Sayım Listesi",
            headerBackTitleVisible: false,
            headerTitleAlign: "center",
            headerTintColor: "#fff",
            headerBackImage: () => (
              <MaterialCommunityIcons
                name="arrow-left"
                size={32} // ✅ BÜYÜK OK
                color="#fff"
                style={{ marginLeft: 10 }}
              />
            ),
          }}
        />

        <Stack.Screen
          name="SayimDetay"
          component={SayimDetay}
          options={({ route }) => ({
            title: `Stok Sayım / ${route.params?.sayimAd || ""}`,
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "#007bff" },
            headerTitleStyle: { fontWeight: "bold" },
            headerBackImage: () => (
              <MaterialCommunityIcons
                name="arrow-left"
                size={32} // ✅ BÜYÜK OK
                color="#fff"
                style={{ marginLeft: 10 }}
              />
            ),
            headerRight: () => (
              <MaterialCommunityIcons
                name="file-document-outline"
                size={24}
                color="#fff"
                style={{ marginRight: 16 }}
                onPress={() => {
                  // buraya istersen raporla fonksiyonu eklersin
                }}
              />
            ),
          })}
        />

        <Stack.Screen name="UrunEkle" component={UrunEkle} />
        <Stack.Screen name="UrunGuncelle" component={UrunGuncelle} />
        <Stack.Screen name="UrunDetay" component={UrunDetay} />

        <Stack.Screen
          name="RaporOlustur"
          component={RaporOlustur}
          options={{
            title: "Rapor Oluştur",
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "#007bff" },
            headerTitleStyle: { fontWeight: "bold" },
            headerBackImage: () => (
              <MaterialCommunityIcons
                name="arrow-left"
                size={32}
                color="#fff"
                style={{ marginLeft: 10 }}
              />
            ),
          }}
        />

        <Stack.Screen name="SayimSil" component={SayimSil} />
        
        <Stack.Screen
          name="YeniSayim"
          component={YeniSayim}
          options={{
            title: "Yeni Sayım",
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "#007bff" },
            headerTitleStyle: { fontWeight: "bold" },
            headerBackImage: () => (
              <MaterialCommunityIcons
                name="arrow-left"
                size={32}
                color="#fff"
                style={{ marginLeft: 10 }}
              />
            ),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

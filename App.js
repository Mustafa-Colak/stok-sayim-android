// e:\edev\stok-sayim\App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // ✅ ikon importu

import GirisEkrani from "./screens/GirisEkrani";
import AnaMenu from "./screens/AnaMenu";
import SayimListesi from "./screens/SayimListesi";
import SayimDetay from "./screens/SayimDetay";
import RaporOlustur from "./screens/RaporOlustur";
import YeniSayim from "./screens/YeniSayim";

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
            title: "Sayım Listesi", // Bu başlık SayimListesi içinde dinamik olarak ayarlanıyor
            headerBackTitleVisible: false,
            headerTitleAlign: "center",
            // headerTintColor: "#fff", // screenOptions'tan miras alınıyor
            // headerStyle: { backgroundColor: "#007bff" }, // screenOptions'tan miras alınıyor
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

        <Stack.Screen
          name="SayimDetay"
          component={SayimDetay}
          options={({ route, navigation }) => ({
            // navigation eklendi
            title: `Stok Sayım / ${route.params?.sayimNot || ""}`, // sayimAd -> sayimNot
            // headerTintColor: "#fff", // screenOptions'tan miras alınıyor
            // headerStyle: { backgroundColor: "#007bff" }, // screenOptions'tan miras alınıyor
            // headerTitleStyle: { fontWeight: "bold" }, // screenOptions'tan miras alınıyor
            headerBackImage: () => (
              <MaterialCommunityIcons
                name="arrow-left"
                size={32}
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
                  if (route.params?.sayimId && route.params?.sayimNot) {
                    navigation.navigate("RaporOlustur", {
                      sayimId: route.params.sayimId,
                      sayimNot: route.params.sayimNot,
                    });
                  } else {
                    console.warn(
                      "Rapor oluşturmak için sayimId veya sayimNot eksik."
                    );
                    // İsteğe bağlı olarak kullanıcıya bir Alert gösterebilirsiniz.
                    // Alert.alert("Hata", "Rapor oluşturmak için gerekli bilgiler eksik.");
                  }
                }}
              />
            ),
          })}
        />

        <Stack.Screen
          name="RaporOlustur"
          component={RaporOlustur}
          options={{
            // Bu başlık RaporOlustur içinde dinamik olarak ayarlanıyor
            title: "Rapor Oluştur",
            // headerTintColor: "#fff", // screenOptions'tan miras alınıyor
            // headerStyle: { backgroundColor: "#007bff" }, // screenOptions'tan miras alınıyor
            // headerTitleStyle: { fontWeight: "bold" }, // screenOptions'tan miras alınıyor
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

        <Stack.Screen
          name="YeniSayim"
          component={YeniSayim}
          options={{
            title: "Yeni Sayım",
            // headerTintColor: "#fff", // screenOptions'tan miras alınıyor
            // headerStyle: { backgroundColor: "#007bff" }, // screenOptions'tan miras alınıyor
            // headerTitleStyle: { fontWeight: "bold" }, // screenOptions'tan miras alınıyor
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

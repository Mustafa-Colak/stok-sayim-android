import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  lisansGecerliliginiKontrolEt,
  tamSurumeYukselt,
} from "../utils/LisansYonetimi";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lisansKodu, setLisansKodu] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLisansInput, setShowLisansInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Daha önce giriş yapılmış mı kontrol et
    checkExistingLogin();
    // Kaydedilmiş kullanıcı bilgilerini yükle
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedCredentials = await AsyncStorage.getItem("saved_credentials");
      if (savedCredentials) {
        const { email, rememberMe } = JSON.parse(savedCredentials);
        setEmail(email);
        setRememberMe(rememberMe);
      }
    } catch (error) {
      console.error("Kaydedilmiş bilgileri yükleme hatası:", error);
    }
  };

  const saveCredentials = async () => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem(
          "saved_credentials",
          JSON.stringify({ email, rememberMe })
        );
      } else {
        await AsyncStorage.removeItem("saved_credentials");
      }
    } catch (error) {
      console.error("Kullanıcı bilgilerini kaydetme hatası:", error);
    }
  };

  const checkExistingLogin = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("user_data");
      if (userDataString) {
        const userData = JSON.parse(userDataString);

        // Kullanıcı verisi varsa ve oturum süresi dolmamışsa
        if (
          userData &&
          userData.token &&
          new Date(userData.tokenExpiry) > new Date()
        ) {
          // Son giriş zamanını kontrol et
          const lastLoginTime = await AsyncStorage.getItem("last_login_time");

          if (lastLoginTime) {
            const lastLogin = new Date(lastLoginTime);
            const now = new Date();

            // Son girişten bu yana geçen süreyi hesapla (milisaniye cinsinden)
            const timeSinceLastLogin = now - lastLogin;

            // Belirli bir süreden fazla geçmişse (örneğin 1 saat = 3600000 milisaniye)
            const AUTO_LOGIN_TIMEOUT = 1 * 60 * 60 * 1000; // 1 saat

            if (timeSinceLastLogin > AUTO_LOGIN_TIMEOUT) {
              // Süre aşılmış, kullanıcıyı login ekranında tut
              console.log("Oturum süresi doldu, yeniden giriş gerekiyor");
              return;
            }
          }

          // Son giriş zamanını güncelle
          await AsyncStorage.setItem(
            "last_login_time",
            new Date().toISOString()
          );

          // Ana menüye yönlendir
          navigation.replace("AnaMenu");
        }
      }
    } catch (error) {
      console.error("Login kontrolü hatası:", error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "E-posta ve şifre gereklidir.");
      return;
    }

    setLoading(true);

    try {
      // Kullanıcı bilgilerini kaydet (eğer "Beni Hatırla" seçiliyse)
      await saveCredentials();

      // Geliştirme aşamasında her zaman giriş yapılabilir
      // Gerçek API hazır olduğunda bu kısım değiştirilecek

      // Simüle edilmiş bir gecikme (500ms)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Test için her zaman giriş yapılabilir hale getirelim
      const userData = {
        id: "user_" + Math.random().toString(36).substring(7),
        email: email,
        name: email.split("@")[0], // E-posta adresinden basit bir isim oluştur
        token: "simulated_token_" + Math.random().toString(36).substring(7),
        tokenExpiry: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // 7 gün geçerli
      };

      console.log("Giriş başarılı, kullanıcı verileri kaydediliyor:", userData);

      // Kullanıcı bilgilerini kaydet
      await AsyncStorage.setItem("user_data", JSON.stringify(userData));

      // Son giriş zamanını kaydet
      await AsyncStorage.setItem("last_login_time", new Date().toISOString());

      // Lisans durumunu kontrol et
      const lisansDurumu = await lisansGecerliliginiKontrolEt();

      if (lisansDurumu.gecerli) {
        // Lisans geçerliyse ana ekrana yönlendir
        navigation.replace("AnaMenu");
      } else {
        // Lisans geçerli değilse, lisans kodunu göster
        setShowLisansInput(true);
        Alert.alert(
          "Lisans Gerekiyor",
          "Uygulamayı kullanmak için lütfen lisans kodunuzu girin veya ücretsiz deneme sürümünü kullanın.",
          [
            {
              text: "Ücretsiz Deneme",
              onPress: async () => {
                // Son giriş zamanını kaydet
                await AsyncStorage.setItem(
                  "last_login_time",
                  new Date().toISOString()
                );
                // Ücretsiz deneme sürümünü başlat
                navigation.replace("AnaMenu");
              },
            },
            { text: "Tamam" },
          ]
        );
      }
    } catch (error) {
      console.error("Login hatası:", error);
      Alert.alert(
        "Bağlantı Hatası",
        "Şu anda giriş yapılamıyor. Lütfen daha sonra tekrar deneyin veya çevrimdışı kullanın."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLisansAktivasyonu = async () => {
    if (!lisansKodu) {
      Alert.alert("Hata", "Lütfen lisans kodunu girin.");
      return;
    }

    setLoading(true);

    try {
      // Lisans kodunu doğrula
      const sonuc = await tamSurumeYukselt(lisansKodu);

      if (sonuc.basarili) {
        // Son giriş zamanını kaydet
        await AsyncStorage.setItem("last_login_time", new Date().toISOString());

        Alert.alert("Başarılı", "Lisans kodunuz başarıyla aktifleştirildi.");
        navigation.replace("AnaMenu");
      } else {
        Alert.alert("Lisans Hatası", sonuc.mesaj || "Geçersiz lisans kodu.");
      }
    } catch (error) {
      console.error("Lisans aktivasyonu hatası:", error);
      Alert.alert(
        "Bağlantı Hatası",
        "Lisans doğrulanırken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stok Sayım</Text>

      {!showLisansInput ? (
        // Kullanıcı giriş formu
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="E-posta"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Şifre"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialCommunityIcons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#3498db"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.rememberMeContainer}>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: "#767577", true: "#3498db" }}
              thumbColor={rememberMe ? "#fff" : "#f4f3f4"}
            />
            <Text style={styles.rememberMeText}>Beni Hatırla</Text>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>

          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.linkText}>Şifremi Unuttum</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.linkText}>Hesap Oluştur</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.offlineButton}
            onPress={async () => {
              try {
                // Çevrimdışı kullanıcı oluştur
                const offlineUserData = {
                  id: 'offline_user',
                  email: 'offline@example.com',
                  name: 'Çevrimdışı Kullanıcı',
                  token: 'offline_token',
                  tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 gün geçerli
                };
                
                // Kullanıcı bilgilerini kaydet
                await AsyncStorage.setItem('user_data', JSON.stringify(offlineUserData));
                
                // Son giriş zamanını kaydet
                await AsyncStorage.setItem("last_login_time", new Date().toISOString());
                
                // Ana menüye yönlendir
                navigation.replace("AnaMenu");
              } catch (error) {
                console.error("Çevrimdışı kullanım hatası:", error);
                Alert.alert("Hata", "Çevrimdışı kullanım başlatılırken bir hata oluştu.");
              }
            }}
          >
            <Text style={styles.offlineButtonText}>Çevrimdışı Kullan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Lisans aktivasyon formu
        <View style={styles.formContainer}>
          <Text style={styles.infoText}>
            Tam sürüm özelliklerine erişmek için lisans kodunuzu girin:
          </Text>

          <TextInput
            style={styles.input}
            placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
            value={lisansKodu}
            onChangeText={setLisansKodu}
            autoCapitalize="characters"
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLisansAktivasyonu}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Lisansı Etkinleştir</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.offlineButton}
            onPress={async () => {
              try {
                // Çevrimdışı kullanıcı oluştur
                const offlineUserData = {
                  id: 'offline_user',
                  email: 'offline@example.com',
                  name: 'Çevrimdışı Kullanıcı',
                  token: 'offline_token',
                  tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 gün geçerli
                };
                
                // Kullanıcı bilgilerini kaydet
                await AsyncStorage.setItem('user_data', JSON.stringify(offlineUserData));
                
                // Son giriş zamanını kaydet
                await AsyncStorage.setItem("last_login_time", new Date().toISOString());
                
                // Ana menüye yönlendir
                navigation.replace("AnaMenu");
              } catch (error) {
                console.error("Çevrimdışı kullanım hatası:", error);
                Alert.alert("Hata", "Çevrimdışı kullanım başlatılırken bir hata oluştu.");
              }
            }}
          >
            <Text style={styles.offlineButtonText}>Ücretsiz Sürümü Kullan</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#2c3e50",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    height: 50,
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 10,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  rememberMeText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  loginButton: {
    backgroundColor: "#3498db",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  linkText: {
    color: "#3498db",
    fontSize: 14,
  },
  offlineButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#3498db",
  },
  offlineButtonText: {
    color: "#3498db",
    fontSize: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
  },
});
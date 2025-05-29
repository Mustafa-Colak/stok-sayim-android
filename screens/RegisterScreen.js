import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleRegister = async () => {
    // Form doğrulama
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }
    
    setLoading(true);
    
    try {
      // API sunucusu henüz hazır olmadığı için, çevrimdışı kayıt simülasyonu yapıyoruz
      // Gerçek API hazır olduğunda bu kısım kaldırılabilir
      
      // Simüle edilmiş bir gecikme (1 saniye)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Basit bir e-posta doğrulama kontrolü
      if (!email.includes('@')) {
        Alert.alert('Hata', 'Lütfen geçerli bir e-posta adresi girin.');
        setLoading(false);
        return;
      }
      
      // Kullanıcı bilgilerini kaydet
      const userData = {
        id: 'user_' + Date.now(), // Geçici bir ID
        email: email,
        name: name,
        token: 'simulated_token_' + Math.random().toString(36).substring(7),
        tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 gün geçerli
      };
      
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      
      Alert.alert(
        'Kayıt Başarılı',
        'Hesabınız başarıyla oluşturuldu.',
        [{ text: 'Tamam', onPress: () => navigation.replace('AnaMenu') }]
      );
      
      /* 
      // Gerçek API hazır olduğunda kullanılacak kod
      const response = await fetch('https://api.stoksayim.com/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        const userData = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          token: result.token,
          tokenExpiry: result.tokenExpiry,
        };
        
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        
        Alert.alert(
          'Kayıt Başarılı',
          'Hesabınız başarıyla oluşturuldu.',
          [{ text: 'Tamam', onPress: () => navigation.replace('AnaMenu') }]
        );
      } else {
        Alert.alert('Kayıt Başarısız', result.message);
      }
      */
      
    } catch (error) {
      console.error('Kayıt hatası:', error);
      Alert.alert('Bağlantı Hatası', 'Şu anda kayıt işlemi gerçekleştirilemiyor. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hesap Oluştur</Text>
      
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ad Soyad"
          value={name}
          onChangeText={setName}
        />
        
        <TextInput
          style={styles.input}
          placeholder="E-posta"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TextInput
          style={styles.input}
          placeholder="Şifre Tekrar"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={styles.registerButton} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Kayıt Ol</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginLinkText}>Zaten hesabınız var mı? Giriş yapın</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#2c3e50',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#3498db',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#3498db',
    fontSize: 14,
  },
});
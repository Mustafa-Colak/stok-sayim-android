import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
      return;
    }
    
    setLoading(true);
    
    try {
      // API sunucusu henüz hazır olmadığı için, çevrimdışı simülasyon yapıyoruz
      // Gerçek API hazır olduğunda bu kısım kaldırılabilir
      
      // Simüle edilmiş bir gecikme (1 saniye)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Basit bir e-posta doğrulama kontrolü
      if (!email.includes('@')) {
        Alert.alert('Hata', 'Lütfen geçerli bir e-posta adresi girin.');
        setLoading(false);
        return;
      }
      
      // Başarılı olduğunu varsayalım
      setResetSent(true);
      
      /* 
      // Gerçek API hazır olduğunda kullanılacak kod
      const response = await fetch('https://api.stoksayim.com/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setResetSent(true);
      } else {
        Alert.alert('Hata', result.message || 'Şifre sıfırlama işlemi başarısız oldu.');
      }
      */
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      Alert.alert('Bağlantı Hatası', 'Şu anda şifre sıfırlama işlemi gerçekleştirilemiyor. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Şifremi Unuttum</Text>
      
      <View style={styles.formContainer}>
        {!resetSent ? (
          <>
            <Text style={styles.infoText}>
              Şifrenizi sıfırlamak için lütfen hesabınızla ilişkili e-posta adresini girin.
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="E-posta"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.resetButtonText}>Şifremi Sıfırla</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.successText}>
              Şifre sıfırlama talimatları e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.
            </Text>
            
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.backButtonText}>Giriş Ekranına Dön</Text>
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity 
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginLinkText}>Giriş ekranına dön</Text>
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
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
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
  resetButton: {
    backgroundColor: '#3498db',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successText: {
    fontSize: 16,
    color: '#27ae60',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#3498db',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
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
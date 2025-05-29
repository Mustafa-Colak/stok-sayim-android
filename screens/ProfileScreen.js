import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lisansGecerliliginiKontrolEt } from '../utils/LisansYonetimi';

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [lisansData, setLisansData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadUserData();
  }, []);
  
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Kullanıcı verilerini yükle
      const userDataString = await AsyncStorage.getItem('user_data');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserData(userData);
        
        // Lisans durumunu kontrol et
        const lisansDurumu = await lisansGecerliliginiKontrolEt();
        setLisansData({
          gecerli: lisansDurumu.gecerli,
          mesaj: lisansDurumu.mesaj,
          uyari: lisansDurumu.uyari
        });
      }
    } catch (error) {
      console.error('Profil verisi yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      // Kullanıcı oturumunu kapat
      await AsyncStorage.removeItem('user_data');
      
      // Lisans verilerini silme (isteğe bağlı)
      // Lisans verilerini silmek istemiyorsanız bu satırı kaldırabilirsiniz
      // await AsyncStorage.removeItem('lisans_bilgisi');
      
      // Login ekranına yönlendir
      navigation.replace('LoginScreen');
    } catch (error) {
      console.error('Çıkış hatası:', error);
      Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
    }
  };
  
  const handleLisansYonetimi = () => {
    navigation.navigate('LisansYonetimiScreen');
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {userData?.name?.substring(0, 1).toUpperCase() || '?'}
          </Text>
        </View>
        
        <Text style={styles.nameText}>{userData?.name || 'Kullanıcı'}</Text>
        <Text style={styles.emailText}>{userData?.email || 'kullanici@ornek.com'}</Text>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Lisans Bilgileri</Text>
        
        <View style={styles.lisansContainer}>
          <View style={styles.lisansHeader}>
            <Text style={styles.lisansTitle}>Lisans Durumu</Text>
            <View style={[
              styles.statusBadge, 
              {backgroundColor: lisansData?.gecerli ? '#27ae60' : '#e74c3c'}
            ]}>
              <Text style={styles.statusText}>
                {lisansData?.gecerli ? 'Aktif' : 'Pasif'}
              </Text>
            </View>
          </View>
          
          {lisansData?.mesaj && (
            <Text style={styles.lisansMessage}>{lisansData.mesaj}</Text>
          )}
          
          {lisansData?.uyari && (
            <Text style={styles.lisansWarning}>{lisansData.uyari}</Text>
          )}
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleLisansYonetimi}
          >
            <Text style={styles.actionButtonText}>Lisans Yönetimi</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Hesap Ayarları</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ChangePasswordScreen')}
        >
          <Text style={styles.menuItemText}>Şifre Değiştir</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('NotificationSettingsScreen')}
        >
          <Text style={styles.menuItemText}>Bildirim Ayarları</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutMenuItem]}
          onPress={handleLogout}
        >
          <Text style={[styles.menuItemText, styles.logoutText]}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  emailText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  lisansContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
  },
  lisansHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lisansTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lisansMessage: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 10,
  },
  lisansWarning: {
    fontSize: 14,
    color: '#e67e22',
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  logoutMenuItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#e74c3c',
  },
});
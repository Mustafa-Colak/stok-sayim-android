// e:\edev\stok-sayim\contexts\ThemeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

// Tema renkleri
export const temalar = {
  aydinlik: {
    adi: 'aydinlik',
    arkaplan: '#f6f9fc',
    kart: '#ffffff',
    metin: '#333333',
    ikincilMetin: '#666666',
    baslik: '#222222',
    vurgu: '#00a0b0', // UstaHesap turkuaz
    sinir: '#e0e0e0',
    girdi: '#ffffff',
    girdiBorder: '#cccccc',
    buton: '#00a0b0',
    butonMetin: '#ffffff',
    butonIkincil: '#6c757d',
    butonIkincilMetin: '#ffffff',
    butonTehlike: '#dc3545',
    butonTehlikeMetin: '#ffffff',
    butonBasari: '#28a745',
    butonBasariMetin: '#ffffff',
    butonUyari: '#ffc107',
    butonUyariMetin: '#212529',
    tabBar: '#ffffff',
    tabBarAktif: '#00a0b0',
    tabBarInaktif: '#6c757d',
  },
  karanlik: {
    adi: 'karanlik',
    arkaplan: '#121212',
    kart: '#1e1e1e',
    metin: '#e0e0e0',
    ikincilMetin: '#a0a0a0',
    baslik: '#ffffff',
    vurgu: '#00c2d8', // UstaHesap turkuaz (daha parlak)
    sinir: '#333333',
    girdi: '#2c2c2c',
    girdiBorder: '#444444',
    buton: '#00c2d8',
    butonMetin: '#ffffff',
    butonIkincil: '#6c757d',
    butonIkincilMetin: '#ffffff',
    butonTehlike: '#dc3545',
    butonTehlikeMetin: '#ffffff',
    butonBasari: '#28a745',
    butonBasariMetin: '#ffffff',
    butonUyari: '#ffc107',
    butonUyariMetin: '#212529',
    tabBar: '#1e1e1e',
    tabBarAktif: '#00c2d8',
    tabBarInaktif: '#a0a0a0',
  },
};

// Context oluştur
export const ThemeContext = createContext();

// Theme Provider bileşeni
export const ThemeProvider = ({ children }) => {
  const sistemTema = useColorScheme();
  const [tema, setTema] = useState(temalar.aydinlik);
  const [temaAdi, setTemaAdi] = useState('aydinlik');
  const [yuklemeTamamlandi, setYuklemeTamamlandi] = useState(false);

  // Tema tercihini yükle
  useEffect(() => {
    const temaTercihiniYukle = async () => {
      try {
        const kaydedilmisTema = await AsyncStorage.getItem('karanlik_tema');
        
        if (kaydedilmisTema !== null) {
          const karanlikTema = JSON.parse(kaydedilmisTema);
          if (karanlikTema) {
            setTema(temalar.karanlik);
            setTemaAdi('karanlik');
          } else {
            setTema(temalar.aydinlik);
            setTemaAdi('aydinlik');
          }
        } else {
          // Varsayılan olarak sistem temasını kullan
          if (sistemTema === 'dark') {
            setTema(temalar.karanlik);
            setTemaAdi('karanlik');
          } else {
            setTema(temalar.aydinlik);
            setTemaAdi('aydinlik');
          }
        }
        setYuklemeTamamlandi(true);
      } catch (error) {
        console.error('Tema tercihi yüklenirken hata:', error);
        setYuklemeTamamlandi(true);
      }
    };

    temaTercihiniYukle();
  }, [sistemTema]);

  // Tema değiştirme fonksiyonu
  const temaDegistir = async (karanlikTema) => {
    try {
      await AsyncStorage.setItem('karanlik_tema', JSON.stringify(karanlikTema));
      
      if (karanlikTema) {
        setTema(temalar.karanlik);
        setTemaAdi('karanlik');
      } else {
        setTema(temalar.aydinlik);
        setTemaAdi('aydinlik');
      }
    } catch (error) {
      console.error('Tema değiştirilirken hata:', error);
    }
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        tema, 
        temaAdi, 
        karanlikTema: temaAdi === 'karanlik', 
        temaDegistir,
        yuklemeTamamlandi
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Tema hook'u
export const useTema = () => useContext(ThemeContext);
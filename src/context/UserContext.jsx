import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStorageItem('user', { 
    name: 'Mehmon', 
    phone: '', 
    address: '',
    coords: null, // Saqlangan koordinatalar
    avatarUrl: ''
  }));
  
  const [favorites, setFavorites] = useState(() => getStorageItem('favorites', []));

  useEffect(() => {
    // Initialize Telegram Web App
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      try {
        tg.expand();
      } catch (e) {
        console.error('Error expanding TG WebApp', e);
      }

      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser) {
        setUser(prev => ({
          ...prev,
          name: `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
          username: tgUser.username,
          telegramId: tgUser.id,
          languageCode: tgUser.language_code,
          avatarUrl: tgUser.photo_url, 
        }));
      }
      
      // Set header color (Safe check)
      try {
        if (parseFloat(tg.version) >= 6.1) {
          tg.setHeaderColor('#ffffff');
          tg.setBackgroundColor('#f2f2f2');
        }
      } catch (e) {
        console.log('Color setting not supported in this version');
      }
    }
  }, []);

  useEffect(() => {
    setStorageItem('user', user);
  }, [user]);

  useEffect(() => {
    setStorageItem('favorites', favorites);
  }, [favorites]);

  const toggleFavorite = (productId) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const isFavorite = (productId) => favorites.includes(productId);

  // Re-added updateProfile function
  const updateProfile = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  const logout = () => {
    // Clear local storage logic if you want to reset user data
    // setStorageItem('user', null); 
    // setStorageItem('favorites', []);
    
    // Close Telegram Web App
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.close();
    } else {
      // Browser fallback
      window.location.reload();
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      updateProfile,
      favorites,
      toggleFavorite,
      isFavorite,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

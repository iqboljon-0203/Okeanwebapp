import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { supabase } from '../lib/supabase';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStorageItem('user', { 
    name: 'Mehmon', 
    phone: '', 
    address: '',
    avatarUrl: '',
    telegramId: null,
    role: import.meta.env.DEV ? 'courier' : 'user' // Auto-courier in Dev
  }));
  
  const [favorites, setFavorites] = useState(() => getStorageItem('favorites', []));

  useEffect(() => {
    const initUser = async () => {
      console.log("initUser started");
      // Initialize Telegram Web App
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.ready();
        try {
          tg.expand();
          if (parseFloat(tg.version) >= 6.1) {
            tg.setHeaderColor('#ffffff');
            tg.setBackgroundColor('#f2f2f2');
          }
        } catch (e) {
          console.error(e);
        }

        const tgUser = tg.initDataUnsafe?.user;

        if (tgUser) {
          const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ');
          
          // Sync with Supabase (Telegram User)
          try {
            let { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('telegram_id', tgUser.id)
                .maybeSingle();

            let role = 'user';

            if (!existingProfile) {
                const { data: newProfile, error: insertError } = await supabase.from('profiles').insert([{
                    telegram_id: tgUser.id,
                    full_name: fullName,
                    username: tgUser.username,
                    avatar_url: tgUser.photo_url
                }]).select().maybeSingle();
                
                if (newProfile) {
                   existingProfile = newProfile;
                } else if (insertError && insertError.code === '23505') {
                    // Conflict: Profile already exists, fetch it
                    const { data: retryProfile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('telegram_id', tgUser.id)
                        .maybeSingle();
                    existingProfile = retryProfile;
                }
            } else {
                role = existingProfile.role || 'user';
            }

            if (existingProfile) {
                setUser(prev => ({
                ...prev,
                id: existingProfile.id, // Store UUID!
                name: fullName,
                username: tgUser.username,
                telegramId: tgUser.id,
                languageCode: tgUser.language_code,
                avatarUrl: tgUser.photo_url || prev.avatarUrl || '',
                role: role 
                }));
            }

          } catch (err) {
            console.error("Supabase Profile Sync Error:", err);
          }
        } else {
            // BROWSER / GUEST MODE
            // Telegram WebApp ichida emasmiz, demak brauzerda test qilyapmiz 
            // yoki oddiy sayt sifatida ochilgan.
            
            const guestId = getStorageItem('guest_id') || Math.floor(100000000 + Math.random() * 900000000);
            if (!getStorageItem('guest_id')) {
                setStorageItem('guest_id', guestId);
            }

            // Ensure profile exists for Guest
            try {
                let { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('telegram_id', guestId)
                    .maybeSingle();
                
                let role = 'user';
                if (!existingProfile) {
                     const { data: newGuest, error: insertError } = await supabase.from('profiles').insert([{
                        telegram_id: guestId,
                        full_name: 'Mehmon (Browser)',
                        username: 'guest_' + guestId,
                        avatar_url: ''
                    }]).select().maybeSingle();
                    
                    if (newGuest) {
                        existingProfile = newGuest;
                    } else if (insertError && insertError.code === '23505') {
                         // Conflict: Profile already exists, fetch it
                        const { data: retryProfile } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('telegram_id', guestId)
                            .maybeSingle();
                        existingProfile = retryProfile;
                    }
                } else {
                    role = existingProfile.role || 'user';
                }

                if (existingProfile) {
                    setUser(prev => ({
                        ...prev,
                        id: existingProfile.id, // Store UUID
                        name: prev.name === 'Mehmon' ? 'Mehmon (Browser)' : prev.name,
                        telegramId: guestId,
                        role: role
                    }));
                }

            } catch (err) {
                console.error("Guest Profile Sync Error:", err);
            }
        }
        

      } else {
         // Fallback if window.Telegram is totally missing (rare but possible in standard browsers)
          const guestId = getStorageItem('guest_id') || Math.floor(100000000 + Math.random() * 900000000);
          if (!getStorageItem('guest_id')) setStorageItem('guest_id', guestId);
          
          setUser(prev => ({ ...prev, telegramId: guestId }));
      }
    };

    initUser();
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

  const updateProfile = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('guest_id');
    localStorage.removeItem('favorites');
    localStorage.removeItem('dev_forced_role');
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.close();
    } else {
      window.location.replace('/'); // Go to home instead of just reload, though reload is fine too
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

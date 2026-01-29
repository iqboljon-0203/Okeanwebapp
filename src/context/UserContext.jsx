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
  const [isLoading, setIsLoading] = useState(true);
  const initialized = React.useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

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
          console.log("TG User Data detected:", tgUser);
          if (!tgUser.photo_url) console.warn("TG User has no photo_url property. Check privacy settings.");

          const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ');
          
          // Sync with Supabase (Telegram User)
          try {
            let { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('telegram_id', tgUser.id)
                .maybeSingle();

            console.log("DB Existing Profile:", existingProfile);

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
                
                // Check if we need to update avatar or name if changed in Telegram
                const updates = {};
                // Only update avatar from TG if TG *has* a photo
                if (tgUser.photo_url && tgUser.photo_url !== existingProfile.avatar_url) {
                    updates.avatar_url = tgUser.photo_url;
                }
                if (fullName !== existingProfile.full_name) {
                    updates.full_name = fullName;
                }
                if (tgUser.username !== existingProfile.username) {
                    updates.username = tgUser.username;
                }

                if (Object.keys(updates).length > 0) {
                    await supabase.from('profiles')
                        .update(updates)
                        .eq('id', existingProfile.id);
                    
                    // Update local reference
                    existingProfile = { ...existingProfile, ...updates };
                }
            }

            if (existingProfile) {
                console.log("Final Profile Data to State:", existingProfile);
                setUser(prev => ({
                ...prev,
                id: existingProfile.id, // Store UUID!
                name: existingProfile.full_name || fullName,
                username: existingProfile.username || tgUser.username,
                telegramId: tgUser.id,
                languageCode: tgUser.language_code,
                // Prioritize DB avatar (which should be synced with TG if available), then TG, then prev
                avatarUrl: existingProfile.avatar_url || tgUser.photo_url || prev.avatarUrl || '',
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
                        avatarUrl: existingProfile.avatar_url || prev.avatarUrl || '',
                        role: role
                    }));
                }

            } catch (err) {
                console.error("Guest Profile Sync Error:", err);
            }
        }
        
        setIsLoading(false);

      } else {
         // Fallback if window.Telegram is totally missing (rare but possible in standard browsers)
          const guestId = getStorageItem('guest_id') || Math.floor(100000000 + Math.random() * 900000000);
          if (!getStorageItem('guest_id')) setStorageItem('guest_id', guestId);
          
          setUser(prev => ({ ...prev, telegramId: guestId }));
          setIsLoading(false);
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
      isLoading,
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

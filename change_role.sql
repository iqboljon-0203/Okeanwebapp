-- O'z profilingizni topib rolni o'zgartirish uchun quyidagi buyruqlardan foydalaning.
-- Supabase SQL Editor ga kirib, kerakli qatorni ishga tushiring.

-- DIQQAT: 'Sizning_Username' o'rniga o'z telegram usernameingizni yozing 
-- Yoki agar brauzerda (Guest) bo'lsangiz, ism bo'yicha qidiring: "Mehmon (Browser)"

-- 1. ADMIN qilish:
UPDATE profiles 
SET role = 'admin' 
WHERE username = 'IQBOLJON_USERNAME'; -- Usernameingizni shu yerga yozing

-- 2. KURYER (Courier) qilish:
UPDATE profiles 
SET role = 'courier' 
WHERE username = 'IQBOLJON_USERNAME'; -- Usernameingizni shu yerga yozing

-- 3. Oddiy USER ga qaytarish:
UPDATE profiles 
SET role = 'user' 
WHERE username = 'IQBOLJON_USERNAME';

-- Yordamchi: O'z ID raqamingizni topish uchun:
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;

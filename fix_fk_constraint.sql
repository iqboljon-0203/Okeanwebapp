-- Xatolik sababi: 'profiles' jadvali 'auth.users' jadvaliga qattiq bog'langan (Foreign Key). 
-- Telegram foydalanuvchilari 'auth.users' da bo'lmagani uchun bu xato beryapti.

-- YECHIM:

-- 1. Avval Foreign Key cheklovini olib tashlaymiz
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Endi ID ni to'g'irlaymiz (NULL bo'lsa yangi ID beramiz)
UPDATE profiles 
SET id = gen_random_uuid() 
WHERE id IS NULL;

-- 3. ID ustuniga avtomatik UUID berishni yoqamiz
ALTER TABLE profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 4. (Majburiy emas) Agar kelajakda auth.users bilan ishlatsangiz, ularni qo'lda bog'laysiz.
-- Hozircha Telegram Web App uchun bu cheklov kerak emas.

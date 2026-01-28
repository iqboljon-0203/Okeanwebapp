-- BU SKRIPTNI SUPABASE SQL EDITORIDA ISHGA TUSHIRING

-- 1. Muammo: Ba'zi profillarda ID 'null' bo'lib qolgan. Ularga yangi ID beramiz.
UPDATE profiles 
SET id = gen_random_uuid() 
WHERE id IS NULL;

-- 2. Kelajakda bunday bo'lmasligi uchun, ID ustuniga avtomatik UUID berishni sozlaymiz.
ALTER TABLE profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Tekshirish uchun:
SELECT * FROM profiles WHERE telegram_id = 756623259;

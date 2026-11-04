-- Kuryerlar uchun rolni yangilash
UPDATE profiles 
SET role = 'courier' 
WHERE telegram_id IN (7487725350);

-- Adminlar uchun rolni yangilash
UPDATE profiles 
SET role = 'admin' 
WHERE telegram_id IN (1332582307, 8146600957);

-- Agar bitta odam ham admin ham kuryer bo'lishi kerak bo'lsa (Masalan: 224939174)
-- WebApp qoidasiga ko'ra panelga kirish uchun aynan o'sha rol bo'lishi shart. 
-- Hozircha uni Admin qilib belgilaymiz:
UPDATE profiles 
SET role = 'admin' 
WHERE telegram_id IN (224939174);

-- DIQQAT! Bu skript barcha buyurtmalar va mahsulotlarni o'chirib yuboradi.
-- Ma'lumotlarni qayta tiklab bo'lmaydi.

-- 1. Avval bog'liq jadvallarni tozalaymiz (Foreign Key xatoliklari bo'lmasligi uchun)
DELETE FROM order_items;

-- 2. Buyurtmalarni o'chiramiz
DELETE FROM orders;

-- 3. Mahsulotlarni o'chiramiz
DELETE FROM products;

-- 4. Agar kerak bo'lsa, kategoriyalarni ham o'chirish (izohdan olib tashlang)
-- DELETE FROM categories;

-- 5. Agar kerak bo'lsa, foydalanuvchi kuponlarini o'chirish
-- DELETE FROM user_coupons;

-- O'chirilganini tekshirish uchun
SELECT count(*) as orders_count FROM orders;
SELECT count(*) as products_count FROM products;

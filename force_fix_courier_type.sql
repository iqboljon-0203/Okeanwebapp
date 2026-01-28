-- Demak, courier_id ustunida eski Telegram ID raqamlari (masalan, 756623259) qolib ketgan.
-- UUID faqat maxsus formatni (xxxx-xxxx...) qabul qiladi, oddiy raqamni emas.

-- YECHIM:
-- 1. Avval courier_id ustunini bo'shatamiz (NULL qilamiz), chunki eski raqamlar baribir noto'g'ri.
UPDATE orders SET courier_id = NULL;

-- 2. Endi bemalol UUID turiga o'zgartirsak bo'ladi.
ALTER TABLE orders 
ALTER COLUMN courier_id TYPE uuid USING courier_id::text::uuid;

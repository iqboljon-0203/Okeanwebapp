-- Xatolik sababi: 'orders' jadvalidagi 'courier_id' ustuni noto'g'ri formatda.
-- Ehtimol u BIGINT bo'lib qolgan, lekin biz unga UUID (masalan: 79736276-9461-46ad-86a5-c6aaed4cd3bc) yozmoqchimiz.

-- YECHIM: 'orders' jadvalidagi 'courier_id' ustunini UUID turiga o'zgartirish.

-- 1. Avval mavjud ustunni o'zgartiramiz (ichida ma'lumot bo'lsa, tozalab turamiz yoki type cast qilamiz)
-- Agar ichida raqamli IDlar bo'lsa, xato berishi mumkin, shuning uchun avval NULL qilamiz.
-- DIQQAT: Bu buyruq eski courier ID larni tozalab yuboradi (agar ular noto'g'ri formatda bo'lsa).

ALTER TABLE orders 
ALTER COLUMN courier_id TYPE uuid USING courier_id::text::uuid;

-- Agar yuqoridagi ishlamasa (masalan oldin integer bo'lgan bo'lsa), quyidagicha qiling:
-- ALTER TABLE orders DROP COLUMN courier_id;
-- ALTER TABLE orders ADD COLUMN courier_id uuid REFERENCES profiles(id);

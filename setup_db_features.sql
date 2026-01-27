-- 1. Profiles jadvaliga 'points' ustunini qo'shish (agar yo'q bo'lsa)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- 2. User Coupons jadvalini yaratish (Foydalanuvchi kuponlari uchun)
CREATE TABLE IF NOT EXISTS user_coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id BIGINT, -- Telegram ID
    code TEXT NOT NULL,
    discount_amount INTEGER DEFAULT 0,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Ballarni xavfsiz qo'shish uchun funksiya (RPC)
-- Bu funksiya orqali ball qo'shilganda race condition bo'lmaydi
CREATE OR REPLACE FUNCTION increment_points(user_id_param BIGINT, points_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET points = COALESCE(points, 0) + points_to_add
  WHERE telegram_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Ruxsatlar (agar kerak bo'lsa)
GRANT ALL ON TABLE user_coupons TO anon, authenticated, service_role;

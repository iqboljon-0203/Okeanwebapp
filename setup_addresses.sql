-- Addresses Table (Foydalanuvchi manzillari)
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id BIGINT, -- Telegram ID
    name TEXT NOT NULL, -- Uy, Ishxona, va h.k.
    address TEXT NOT NULL, -- Aniq manzil matni
    location_lat DOUBLE PRECISION,
    location_long DOUBLE PRECISION,
    type TEXT DEFAULT 'other', -- home, work, other
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ruxsatlar
GRANT ALL ON TABLE user_addresses TO anon, authenticated, service_role;

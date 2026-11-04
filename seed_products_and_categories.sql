-- ===================================================
-- KATEGORIYALAR VA MAHSULOTLARNI QO'SHISH SKRIPTI
-- Okean Market Webapp (Supabase Storage URLs)
-- ===================================================

-- 1. Kategoriyalar jadvali (mavjud bo'lmasa yaratish)
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Mahsulotlar jadvali (mavjud bo'lmasa yaratish)
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
    price NUMERIC NOT NULL,
    discount_price NUMERIC,
    stock INTEGER DEFAULT 100,
    unit TEXT DEFAULT 'dona',
    step NUMERIC DEFAULT 1,
    image_url TEXT,
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ruxsatlar
GRANT ALL ON TABLE categories TO anon, authenticated, service_role;
GRANT ALL ON TABLE products TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE products_id_seq TO anon, authenticated, service_role;

-- 3. Kategoriyalarni qo'shish / yangilash (Upsert)
INSERT INTO categories (id, name, image_url)
VALUES 
    ('sabzavotlar', 'Sabzavotlar', 'https://tpqaxranwoyxiquihtmh.supabase.co/storage/v1/object/public/product-images/cat_sabzavotlar.jpg'),
    ('mevalar', 'Mevalar', 'https://tpqaxranwoyxiquihtmh.supabase.co/storage/v1/object/public/product-images/cat_mevalar.jpg'),
    ('ichimliklar', 'Ichimliklar', 'https://tpqaxranwoyxiquihtmh.supabase.co/storage/v1/object/public/product-images/cat_ichimliklar.jpg')
ON CONFLICT (id) DO UPDATE 
SET 
    name = EXCLUDED.name,
    image_url = EXCLUDED.image_url;

-- 4. Mahsulotlarni qo'shish / yangilash
INSERT INTO products (name, category_id, price, discount_price, stock, unit, step, image_url, is_popular)
VALUES
    -- =================== SABZAVOTLAR ===================
    ('Piyoz', 'sabzavotlar', 4000, NULL, 150, 'kg', 1, 'https://tpqaxranwoyxiquihtmh.supabase.co/storage/v1/object/public/product-images/prod_piyoz.jpg', TRUE),
    ('Sariq sabzi', 'sabzavotlar', 5000, NULL, 120, 'kg', 1, 'https://tpqaxranwoyxiquihtmh.supabase.co/storage/v1/object/public/product-images/prod_sariq_sabzi.jpg', FALSE),
    ('Bodring', 'sabzavotlar', 18000, 15000, 80, 'kg', 0.5, 'https://tpqaxranwoyxiquihtmh.supabase.co/storage/v1/object/public/product-images/prod_bodring.jpg', TRUE),
    ('Pomidor', 'sabzavotlar', 22000, NULL, 90, 'kg', 0.5, 'https://tpqaxranwoyxiquihtmh.supabase.co/storage/v1/object/public/product-images/prod_pomidor.jpg', TRUE),
    ('Kartoshka', 'sabzavotlar', 6000, NULL, 200, 'kg', 1, 'https://tpqaxranwoyxiquihtmh.supabase.co/storage/v1/object/public/product-images/prod_kartoshka.jpg', TRUE),

    -- =================== MEVALAR ===================
    ('Qulupnay', 'mevalar', 45000, 40000, 40, 'kg', 0.5, 'https://tpqaxranwoyxiquihtmh.supabase.co/storage/v1/object/public/product-images/prod_qulupnay.jpg', TRUE),
    ('Tarvuz', 'mevalar', 8000, NULL, 60, 'kg', 1, 'https://tpqaxranwoyxiquihtmh.supabase.co/storage/v1/object/public/product-images/prod_tarvuz.jpg', TRUE),
    ('Qizil olma', 'mevalar', 16000, NULL, 100, 'kg', 1, 'https://tpqaxranwoyxiquihtmh.supabase.co/storage/v1/object/public/product-images/prod_qizil_olma.jpg', FALSE),
    ('Apelsin', 'mevalar', 28000, 25000, 50, 'kg', 1, 'https://tpqaxranwoyxiquihtmh.supabase.co/storage/v1/object/public/product-images/prod_apelsin.jpg', FALSE),
    ('Banan', 'mevalar', 24000, NULL, 80, 'kg', 1, 'https://tpqaxranwoyxiquihtmh.supabase.co/storage/v1/object/public/product-images/prod_banan.jpg', TRUE),

    -- =================== ICHIMLIKLAR ===================
    ('Coca-Cola 1.5L', 'ichimliklar', 14000, NULL, 100, 'dona', 1, 'https://tpqaxranwoyxiquihtmh.supabase.co/storage/v1/object/public/product-images/prod_coca_cola_1_5l.jpg', TRUE),
    ('Fanta 1.5L', 'ichimliklar', 14000, NULL, 100, 'dona', 1, 'https://tpqaxranwoyxiquihtmh.supabase.co/storage/v1/object/public/product-images/prod_fanta_1_5l.jpg', TRUE),
    ('Pepsi 1.5L', 'ichimliklar', 13500, 12000, 100, 'dona', 1, 'https://tpqaxranwoyxiquihtmh.supabase.co/storage/v1/object/public/product-images/prod_pepsi_1_5l.jpg', TRUE),
    ('Nestle toza suv 1.5L', 'ichimliklar', 5000, NULL, 200, 'dona', 1, 'https://tpqaxranwoyxiquihtmh.supabase.co/storage/v1/object/public/product-images/prod_nestle_suv_1_5l.jpg', FALSE),
    ('Dinay sharbati 1L', 'ichimliklar', 15000, NULL, 75, 'dona', 1, 'https://tpqaxranwoyxiquihtmh.supabase.co/storage/v1/object/public/product-images/prod_dinay_1l.jpg', FALSE)
ON CONFLICT (id) DO NOTHING;

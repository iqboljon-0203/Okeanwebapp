-- Yangi loyihada orders jadvalida kuryer uchun kerakli ustunlar yetishmayapti
-- Shu sababli "Tarixni yuklashda xatolik" beryapti.

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS courier_id uuid,
ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
ADD COLUMN IF NOT EXISTS distance float;

-- Fix for Courier ID type mismatch
-- The app uses Telegram ID (BigInt), but the table was set to UUID.
-- This script changes the column type to BigInt (for Telegram IDs).

-- 1. Drop the foreign key constraint (since it pointed to auth.users UUID)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_courier_id_fkey;

-- 2. Change the column type from UUID to BIGINT
-- "USING NULL" ensures we don't get conversion errors for existing bad data
ALTER TABLE orders ALTER COLUMN courier_id TYPE bigint USING NULL; 

-- Add courier specific columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS courier_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
ADD COLUMN IF NOT EXISTS distance float;

-- Ensure status check includes courier specific statuses if not already present
-- (This depends on how the status check constraint was defined, assuming text for now)

-- Allow couriers to view assigned orders and available orders
-- RLS (Row Level Security) policies should be updated if they exist.
-- Example policy updates (adjust according to your actual RLS setup):

-- CREATE POLICY "Couriers can view available orders" ON orders
-- FOR SELECT TO authenticated
-- USING (status = 'new' AND courier_id IS NULL OR courier_id = auth.uid());

-- CREATE POLICY "Couriers can update their orders" ON orders
-- FOR UPDATE TO authenticated
-- USING (courier_id = auth.uid() OR (status = 'new' AND courier_id IS NULL))
-- WITH CHECK (courier_id = auth.uid());

-- Add 'courier' to allowed roles if you have a role check constraint on profiles
-- ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
-- ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'courier'));

-- =========================================================
-- FIX ALL DATABASE ISSUES AND CREATE TEST USER
-- Run this in Supabase SQL Editor
-- =========================================================

-- 1. Drop existing tables if they have issues
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.allowed_users CASCADE;

-- 2. Create allowed_users table (not allowed_emails as in schema)
CREATE TABLE IF NOT EXISTS allowed_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  street TEXT,
  house_number TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'NL',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE allowed_users IS 'Pre-approved users with complete address information';
COMMENT ON COLUMN allowed_users.email IS 'Email address allowed to register';
COMMENT ON COLUMN allowed_users.first_name IS 'User first name';
COMMENT ON COLUMN allowed_users.last_name IS 'User last name';
COMMENT ON COLUMN allowed_users.street IS 'Street name';
COMMENT ON COLUMN allowed_users.house_number IS 'House number';
COMMENT ON COLUMN allowed_users.postal_code IS 'Postal code (e.g., 1015 CJ)';
COMMENT ON COLUMN allowed_users.city IS 'City name';
COMMENT ON COLUMN allowed_users.country IS 'Country code';
COMMENT ON COLUMN allowed_users.phone IS 'Phone number';

-- 3. Create profiles table with correct structure
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'User profiles linked to Supabase Auth';
COMMENT ON COLUMN profiles.id IS 'Primary key';
COMMENT ON COLUMN profiles.auth_user_id IS 'Supabase Auth user ID';
COMMENT ON COLUMN profiles.email IS 'User email address';
COMMENT ON COLUMN profiles.created_at IS 'Profile creation timestamp';

-- 4. Enable RLS on both tables
ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for allowed_users
DROP POLICY IF EXISTS "allowed user can read self" ON allowed_users;
CREATE POLICY "allowed user can read self" ON allowed_users
  FOR SELECT
  TO authenticated
  USING (email = auth.email());

DROP POLICY IF EXISTS "allowed user can insert self" ON allowed_users;
CREATE POLICY "allowed user can insert self" ON allowed_users
  FOR INSERT
  TO authenticated
  WITH CHECK (email = auth.email());

DROP POLICY IF EXISTS "allowed user can update self" ON allowed_users;
CREATE POLICY "allowed user can update self" ON allowed_users
  FOR UPDATE
  TO authenticated
  USING (email = auth.email())
  WITH CHECK (email = auth.email());

-- 6. Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- 7. Insert test user Jimmy with complete address information
INSERT INTO allowed_users (
  email,
  first_name,
  last_name,
  street,
  house_number,
  postal_code,
  city,
  country,
  phone
) VALUES (
  'jimmy@test.com',
  'Jimmy',
  'Testuser',
  'Keizersgracht',
  '123',
  '1015 CJ',
  'Amsterdam',
  'NL',
  '+31612345678'
) ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  street = EXCLUDED.street,
  house_number = EXCLUDED.house_number,
  postal_code = EXCLUDED.postal_code,
  city = EXCLUDED.city,
  country = EXCLUDED.country,
  phone = EXCLUDED.phone;

-- 8. Insert existing users from auth.users table
INSERT INTO allowed_users (
  email,
  first_name,
  last_name,
  street,
  house_number,
  postal_code,
  city,
  country,
  phone
) VALUES 
(
  'frisoschmidt@gmail.com',
  'Friso',
  'Schmidt',
  'Prinsengracht',
  '456',
  '1016 GV',
  'Amsterdam',
  'NL',
  '+31687654321'
),
(
  'test@example.com',
  'Test',
  'User',
  'Damrak',
  '789',
  '1012 JS',
  'Amsterdam',
  'NL',
  '+31698765432'
) ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  street = EXCLUDED.street,
  house_number = EXCLUDED.house_number,
  postal_code = EXCLUDED.postal_code,
  city = EXCLUDED.city,
  country = EXCLUDED.country,
  phone = EXCLUDED.phone;

-- 9. Create profiles for existing auth users (Jimmy will be added when he registers)
INSERT INTO profiles (auth_user_id, email, created_at)
SELECT 
  id as auth_user_id,
  email,
  NOW() as created_at
FROM auth.users 
WHERE email IN ('frisoschmidt@gmail.com', 'test@example.com')
ON CONFLICT (email) DO NOTHING;

-- 10. Verify the setup
SELECT 'allowed_users table:' as info;
SELECT * FROM allowed_users ORDER BY email;

SELECT 'profiles table:' as info;
SELECT * FROM profiles ORDER BY email;

SELECT 'auth.users table:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY email;

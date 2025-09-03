-- Migration: Rename allowed_emails to allowed_users and add address columns
-- Date: 2025-08-30

-- Rename table and add address columns
ALTER TABLE IF EXISTS allowed_emails RENAME TO allowed_users;

ALTER TABLE allowed_users
  ADD COLUMN IF NOT EXISTS street TEXT,
  ADD COLUMN IF NOT EXISTS house_number TEXT,
  ADD COLUMN IF NOT EXISTS house_number_suffix TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'NL',
  ADD COLUMN IF NOT EXISTS external_ref TEXT;

COMMENT ON TABLE allowed_users IS 'Allowlisted tenants with optional prefilled address data';
COMMENT ON COLUMN allowed_users.street IS 'Street name';
COMMENT ON COLUMN allowed_users.house_number IS 'House number';
COMMENT ON COLUMN allowed_users.house_number_suffix IS 'House number suffix (A, B, etc.)';
COMMENT ON COLUMN allowed_users.postal_code IS 'Postal code (NL format: 1234 AB)';
COMMENT ON COLUMN allowed_users.city IS 'City name';
COMMENT ON COLUMN allowed_users.country IS 'Country code (default: NL)';
COMMENT ON COLUMN allowed_users.external_ref IS 'External reference ID';

-- Create RPC function for signup gate
CREATE OR REPLACE FUNCTION public.auth_is_email_allowed(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM allowed_users
    WHERE lower(email) = lower(p_email)
  );
$$;

GRANT EXECUTE ON FUNCTION public.auth_is_email_allowed(TEXT) TO anon;

-- Update RLS policies
ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can check allowed emails" ON allowed_users;

CREATE POLICY "User can read own allowed row" ON allowed_users
  FOR SELECT USING (
    email IN (
      SELECT email FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

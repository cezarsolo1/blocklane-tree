-- Add frisoschmidt@gmail.com to allowed_users table
-- Run this in Supabase SQL Editor

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
  'frisoschmidt@gmail.com',
  'Friso',
  'Schmidt',
  'Prinsengracht',
  '456',
  '1016 GV',
  'Amsterdam',
  'NL',
  '+31687654321'
) ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  street = EXCLUDED.street,
  house_number = EXCLUDED.house_number,
  postal_code = EXCLUDED.postal_code,
  city = EXCLUDED.city,
  country = EXCLUDED.country,
  phone = EXCLUDED.phone;

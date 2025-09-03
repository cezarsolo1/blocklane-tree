-- Create a test user for development
-- Run this in your Supabase SQL Editor

INSERT INTO allowed_users (email, street, house_number, house_number_suffix, postal_code, city, country)
VALUES (
  'test@example.com',
  'Test Street',
  '123',
  '',
  '1234 AB',
  'Amsterdam',
  'NL'
) ON CONFLICT (email) DO NOTHING;

-- You can also create a user account manually in Supabase Auth
-- Go to Authentication > Users > Add User
-- Email: test@example.com
-- Password: testpassword123
-- Set email as confirmed

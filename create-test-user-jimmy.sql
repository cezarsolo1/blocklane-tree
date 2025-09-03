-- Create test user Jimmy with complete profile and address
-- This script should be run in your Supabase SQL editor

-- 1. Add Jimmy's email to allowed_emails table
INSERT INTO allowed_emails (email) 
VALUES ('jimmy@test.com')
ON CONFLICT (email) DO NOTHING;

-- 2. Create a sample address event for Jimmy (this will be created after user registers)
-- Note: This requires Jimmy to first register through the app to get a profile_id
-- The address event will be created when Jimmy uses the address check feature

-- Sample address data structure for reference:
-- {
--   "street": "Keizersgracht",
--   "number": "123",
--   "postal_code": "1015 CJ",
--   "city": "Amsterdam",
--   "country": "NL"
-- }

-- After Jimmy registers, you can create an address event like this:
-- INSERT INTO address_events (profile_id, wizard_session_id, address)
-- SELECT 
--   p.id,
--   'test-session-jimmy-001',
--   '{"street": "Keizersgracht", "number": "123", "postal_code": "1015 CJ", "city": "Amsterdam", "country": "NL"}'::jsonb
-- FROM profiles p 
-- WHERE p.email = 'jimmy@test.com';

COMMENT ON TABLE allowed_emails IS 'Jimmy test user added - email: jimmy@test.com';

-- Update Jimmy's email to use gmail.com domain
-- Run this in Supabase SQL Editor

UPDATE allowed_users 
SET email = 'jimmy@gmail.com' 
WHERE email = 'jimmy@test.com';

-- Verify the update
SELECT * FROM allowed_users WHERE email = 'jimmy@gmail.com';

-- Fix RLS policy to allow unauthenticated email checking during signup
-- Run this in Supabase SQL Editor

-- Drop the restrictive read policy that requires authentication
DROP POLICY IF EXISTS "allowed user can read self" ON allowed_users;

-- Create a public read policy for email checking during signup
CREATE POLICY "Public can check if email is allowed" ON allowed_users
  FOR SELECT
  TO anon
  USING (true);

-- Verify the new policy
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'allowed_users'
ORDER BY policyname;

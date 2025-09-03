-- Fix RLS policy on allowed_users to allow authenticated users to read their own data
-- Run this in Supabase SQL Editor

-- Drop existing policy
DROP POLICY IF EXISTS "Allow unauthenticated read for email check" ON allowed_users;

-- Create new policy that allows both unauthenticated reads (for signup) 
-- AND authenticated users to read their own data
CREATE POLICY "Allow read access for email validation and own data" ON allowed_users
  FOR SELECT
  USING (
    -- Allow unauthenticated reads (for signup email validation)
    auth.role() = 'anon'
    OR
    -- Allow authenticated users to read their own data
    (auth.role() = 'authenticated' AND email = auth.jwt() ->> 'email')
  );

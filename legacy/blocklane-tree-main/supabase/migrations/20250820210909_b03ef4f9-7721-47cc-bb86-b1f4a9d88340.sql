-- Fix vendor token system security issue
-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "No direct access to vendor tokens" ON public.vendor_tokens;

-- Create proper RLS policies for vendor_tokens
-- PMs can create and manage vendor tokens
CREATE POLICY "PMs can manage vendor tokens" 
ON public.vendor_tokens 
FOR ALL 
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'PM'
);

-- Create a security definer function to validate vendor tokens
-- This allows secure token validation without exposing the vendor_tokens table
CREATE OR REPLACE FUNCTION public.validate_vendor_token(token_uuid uuid)
RETURNS TABLE(ticket_id uuid, is_valid boolean)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    vt.ticket_id,
    (vt.expires_at > now()) as is_valid
  FROM public.vendor_tokens vt
  WHERE vt.token = token_uuid
  LIMIT 1;
$$;

-- Create a security definer function to get ticket details with valid token
-- This allows vendors to access ticket information using a valid token
CREATE OR REPLACE FUNCTION public.get_ticket_by_token(token_uuid uuid)
RETURNS TABLE(
  id uuid,
  street_address text,
  city text,
  postal_code text,
  contact_name text,
  contact_email text,
  contact_phone text,
  description text,
  leaf_type text,
  decision_path jsonb,
  photo_urls jsonb,
  status text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    t.id,
    t.street_address,
    t.city,
    t.postal_code,
    t.contact_name,
    t.contact_email,
    t.contact_phone,
    t.description,
    t.leaf_type,
    t.decision_path,
    t.photo_urls,
    t.status,
    t.created_at
  FROM public.tickets t
  JOIN public.vendor_tokens vt ON t.id = vt.ticket_id
  WHERE vt.token = token_uuid 
    AND vt.expires_at > now()
  LIMIT 1;
$$;

-- Create function to create vendor tokens (for PMs)
CREATE OR REPLACE FUNCTION public.create_vendor_token(target_ticket_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO public.vendor_tokens (ticket_id)
  VALUES (target_ticket_id)
  RETURNING token;
$$;

-- Create function to clean up expired tokens (system maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH deleted AS (
    DELETE FROM public.vendor_tokens 
    WHERE expires_at < now()
    RETURNING 1
  )
  SELECT COUNT(*)::integer FROM deleted;
$$;
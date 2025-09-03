-- Fix function search path security warnings
-- Update all functions to have immutable search_path for security

-- Fix validate_vendor_token function
CREATE OR REPLACE FUNCTION public.validate_vendor_token(token_uuid uuid)
RETURNS TABLE(ticket_id uuid, is_valid boolean)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT 
    vt.ticket_id,
    (vt.expires_at > now()) as is_valid
  FROM public.vendor_tokens vt
  WHERE vt.token = token_uuid
  LIMIT 1;
$$;

-- Fix get_ticket_by_token function
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
SET search_path = ''
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

-- Fix create_vendor_token function
CREATE OR REPLACE FUNCTION public.create_vendor_token(target_ticket_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  INSERT INTO public.vendor_tokens (ticket_id)
  VALUES (target_ticket_id)
  RETURNING token;
$$;

-- Fix cleanup_expired_tokens function
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH deleted AS (
    DELETE FROM public.vendor_tokens 
    WHERE expires_at < now()
    RETURNING 1
  )
  SELECT COUNT(*)::integer FROM deleted;
$$;
-- Update database functions to use the renamed photo_paths column

-- Update get_ticket_by_token function
CREATE OR REPLACE FUNCTION public.get_ticket_by_token(token_uuid uuid)
RETURNS TABLE(id uuid, street_address text, city text, postal_code text, contact_name text, contact_email text, contact_phone text, description text, leaf_type text, decision_path jsonb, photo_paths jsonb, status text, created_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
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
    t.photo_paths,
    t.status,
    t.created_at
  FROM public.tickets t
  JOIN public.vendor_tokens vt ON t.id = vt.ticket_id
  WHERE vt.token = token_uuid 
    AND vt.expires_at > now()
  LIMIT 1;
$$;
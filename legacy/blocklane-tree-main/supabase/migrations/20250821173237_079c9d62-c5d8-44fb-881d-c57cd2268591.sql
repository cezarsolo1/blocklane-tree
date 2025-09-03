-- Fix security warning: set search_path for function
CREATE OR REPLACE FUNCTION public.normalize_building_key(street text, postal text, city text)
RETURNS text 
LANGUAGE sql 
IMMUTABLE 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT regexp_replace(lower(coalesce(postal,'') || ' ' || coalesce(street,'') || ' ' || coalesce(city,'')),
                        '[^a-z0-9]+', ' ', 'g')
$$;
-- Add building_key columns if missing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS building_key text;
ALTER TABLE public.tickets  ADD COLUMN IF NOT EXISTS building_key text;

-- Helper to normalize: postal + street + city -> lowercase, alnum+spaces
CREATE OR REPLACE FUNCTION public.normalize_building_key(street text, postal text, city text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT regexp_replace(lower(coalesce(postal,'') || ' ' || coalesce(street,'') || ' ' || coalesce(city,'')),
                        '[^a-z0-9]+', ' ', 'g')
$$;

-- Backfill existing tickets
UPDATE public.tickets
SET building_key = public.normalize_building_key(street_address, postal_code, city)
WHERE building_key IS NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_building_key ON public.tickets (building_key);
CREATE INDEX IF NOT EXISTS idx_profiles_building_key ON public.profiles (building_key);
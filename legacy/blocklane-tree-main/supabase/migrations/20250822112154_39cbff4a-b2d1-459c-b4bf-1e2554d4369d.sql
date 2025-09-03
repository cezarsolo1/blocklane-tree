-- Add new columns for AUTO_SEND appointment scheduling
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS occupant_name text,
ADD COLUMN IF NOT EXISTS occupant_phone text, 
ADD COLUMN IF NOT EXISTS occupant_email text,
ADD COLUMN IF NOT EXISTS notes_for_contractor text,
ADD COLUMN IF NOT EXISTS availability_slots jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS consent_personal_data boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_marketing boolean DEFAULT false;
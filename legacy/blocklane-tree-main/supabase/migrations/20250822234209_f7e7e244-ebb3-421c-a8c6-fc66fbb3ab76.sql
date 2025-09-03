-- Rename consent_marketing to consent_terms to better reflect its purpose
ALTER TABLE public.tickets RENAME COLUMN consent_marketing TO consent_terms;

-- Add any missing columns that might be needed for AUTO_SEND flow
-- (checking if we need additional columns for the new flow structure)

-- Update column comments for clarity
COMMENT ON COLUMN public.tickets.consent_terms IS 'User consent to terms and conditions';
COMMENT ON COLUMN public.tickets.consent_personal_data IS 'User consent for personal data processing';
COMMENT ON COLUMN public.tickets.access_permission IS 'Permission to enter property when tenant is not available';
COMMENT ON COLUMN public.tickets.availability_slots IS 'Available time slots for appointment scheduling';
COMMENT ON COLUMN public.tickets.notes_for_contractor IS 'Additional instructions and notes for the contractor';
COMMENT ON COLUMN public.tickets.has_pets IS 'Whether the property has pets';
COMMENT ON COLUMN public.tickets.pet_details IS 'Details about pets if present';
COMMENT ON COLUMN public.tickets.has_alarm IS 'Whether the property has an alarm system';
COMMENT ON COLUMN public.tickets.alarm_details IS 'Details about alarm system if present';
COMMENT ON COLUMN public.tickets.access_method IS 'Method for contractor to access the property';
COMMENT ON COLUMN public.tickets.intercom_details IS 'Details for intercom access';
COMMENT ON COLUMN public.tickets.key_box_details IS 'Details for key box access';
COMMENT ON COLUMN public.tickets.neighbor_details IS 'Details for neighbor-assisted access';
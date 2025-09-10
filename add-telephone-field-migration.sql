-- Add telephone field to address-related tables
-- Migration: Add telephone support to address system

-- Add telephone field to tenant_addresses table
ALTER TABLE tenant_addresses 
ADD COLUMN telephone TEXT;

-- Add telephone field to address_change_requests table  
ALTER TABLE address_change_requests 
ADD COLUMN proposed_telephone TEXT;

-- Update any existing RLS policies if needed (they should still work with the new column)

-- Add comment for documentation
COMMENT ON COLUMN tenant_addresses.telephone IS 'Tenant telephone number for contact purposes';
COMMENT ON COLUMN address_change_requests.proposed_telephone IS 'Proposed telephone number in address change request';

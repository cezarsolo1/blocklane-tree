-- Implement new address data model following policy:
-- 1. allowed_users = access control only
-- 2. tenant_addresses = canonical address source of truth  
-- 3. address_change_requests = tenant proposals/audit trail

-- 1. Create canonical tenant addresses table
CREATE TABLE IF NOT EXISTS tenant_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  street TEXT NOT NULL,
  house_number TEXT NOT NULL,
  house_number_suffix TEXT,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT DEFAULT 'NL',
  is_current BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE tenant_addresses IS 'Canonical tenant address data - single source of truth';
COMMENT ON COLUMN tenant_addresses.profile_id IS 'Reference to user profile';
COMMENT ON COLUMN tenant_addresses.is_current IS 'Whether this is the current active address';

-- 2. Create address change requests table for tenant proposals
CREATE TABLE IF NOT EXISTS address_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_address_id UUID REFERENCES tenant_addresses(id),
  proposed_street TEXT NOT NULL,
  proposed_house_number TEXT NOT NULL,
  proposed_house_number_suffix TEXT,
  proposed_postal_code TEXT NOT NULL,
  proposed_city TEXT NOT NULL,
  proposed_country TEXT DEFAULT 'NL',
  tenant_note TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_id UUID REFERENCES profiles(id),
  reviewer_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

COMMENT ON TABLE address_change_requests IS 'Tenant address change proposals requiring approval';
COMMENT ON COLUMN address_change_requests.current_address_id IS 'Reference to current canonical address';
COMMENT ON COLUMN address_change_requests.tenant_note IS 'Tenant explanation for address change';
COMMENT ON COLUMN address_change_requests.status IS 'Request status: pending/approved/rejected';
COMMENT ON COLUMN address_change_requests.reviewer_id IS 'Staff member who reviewed the request';

-- 3. Migrate existing data from allowed_users to tenant_addresses
INSERT INTO tenant_addresses (profile_id, street, house_number, postal_code, city, country)
SELECT 
  p.id as profile_id,
  au.street,
  au.house_number,
  au.postal_code,
  au.city,
  au.country
FROM allowed_users au
JOIN profiles p ON p.email = au.email
WHERE au.street IS NOT NULL AND au.house_number IS NOT NULL
ON CONFLICT DO NOTHING;

-- 4. Remove address fields from allowed_users (keep only access control fields)
ALTER TABLE allowed_users DROP COLUMN IF EXISTS street;
ALTER TABLE allowed_users DROP COLUMN IF EXISTS house_number;
ALTER TABLE allowed_users DROP COLUMN IF EXISTS postal_code;
ALTER TABLE allowed_users DROP COLUMN IF EXISTS city;
ALTER TABLE allowed_users DROP COLUMN IF EXISTS country;
ALTER TABLE allowed_users DROP COLUMN IF EXISTS phone;

-- 5. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_addresses_profile_id ON tenant_addresses(profile_id);
CREATE INDEX IF NOT EXISTS idx_tenant_addresses_current ON tenant_addresses(profile_id, is_current);
CREATE INDEX IF NOT EXISTS idx_address_change_requests_profile_id ON address_change_requests(profile_id);
CREATE INDEX IF NOT EXISTS idx_address_change_requests_status ON address_change_requests(status);

-- 6. Enable RLS on new tables
ALTER TABLE tenant_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE address_change_requests ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for tenant_addresses
CREATE POLICY "Users can view own addresses" ON tenant_addresses
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

-- 8. RLS Policies for address_change_requests  
CREATE POLICY "Users can view own change requests" ON address_change_requests
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own change requests" ON address_change_requests
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

-- 9. Update allowed_users to only have access control fields
COMMENT ON TABLE allowed_users IS 'Access control only - who can register and their basic info';

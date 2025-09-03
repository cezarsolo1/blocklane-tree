-- Blocklane Tenant Intake Database Schema
-- Based on spec section 4 - Data Model

-- Enums
CREATE TYPE leaf_type AS ENUM ('end_no_ticket', 'start_ticket');
COMMENT ON TYPE leaf_type IS 'Type of leaf node in decision tree';

CREATE TYPE ticket_status AS ENUM ('draft', 'submitted', 'cancelled');
COMMENT ON TYPE ticket_status IS 'Current status of a maintenance ticket';

CREATE TYPE leaf_reason AS ENUM (
  'emergency',
  'tenant_responsibility', 
  'video_resolved',
  'other_non_ticket',
  'video_not_resolved',
  'standard_wizard',
  'safety_issue',
  'other_ticket'
);
COMMENT ON TYPE leaf_reason IS 'Reason for leaf node outcome';

CREATE TYPE media_kind AS ENUM ('image', 'video');
COMMENT ON TYPE media_kind IS 'Type of media asset';

CREATE TYPE lang_code AS ENUM ('nl', 'en');
COMMENT ON TYPE lang_code IS 'Language code for localization';

-- Tables

-- User profiles linked to Supabase Auth
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE profiles IS 'User profiles linked to Supabase Auth';
COMMENT ON COLUMN profiles.id IS 'Primary key';
COMMENT ON COLUMN profiles.auth_user_id IS 'Supabase Auth user ID';
COMMENT ON COLUMN profiles.email IS 'User email address';
COMMENT ON COLUMN profiles.created_at IS 'Profile creation timestamp';

-- Address events for wizard sessions
CREATE TABLE address_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wizard_session_id TEXT NOT NULL,
  address JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE address_events IS 'Address events logged during wizard sessions';
COMMENT ON COLUMN address_events.id IS 'Primary key';
COMMENT ON COLUMN address_events.profile_id IS 'Reference to user profile';
COMMENT ON COLUMN address_events.wizard_session_id IS 'Wizard session identifier';
COMMENT ON COLUMN address_events.address IS 'Address data as JSON (street, number, postal_code, city)';
COMMENT ON COLUMN address_events.created_at IS 'Event creation timestamp';

-- Maintenance tickets
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status ticket_status NOT NULL DEFAULT 'draft',
  tree_id TEXT NOT NULL,
  tree_version INTEGER NOT NULL,
  leaf_node_id TEXT NOT NULL,
  leaf_type leaf_type NOT NULL,
  leaf_reason leaf_reason NOT NULL,
  description TEXT,
  phone_raw TEXT,
  phone_e164 TEXT,
  email TEXT,
  contact_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);
COMMENT ON TABLE tickets IS 'Maintenance tickets created from decision tree';
COMMENT ON COLUMN tickets.id IS 'Primary key';
COMMENT ON COLUMN tickets.profile_id IS 'Reference to user profile';
COMMENT ON COLUMN tickets.status IS 'Current ticket status';
COMMENT ON COLUMN tickets.tree_id IS 'Decision tree identifier';
COMMENT ON COLUMN tickets.tree_version IS 'Decision tree version number';
COMMENT ON COLUMN tickets.leaf_node_id IS 'Leaf node ID from decision tree';
COMMENT ON COLUMN tickets.leaf_type IS 'Type of leaf node';
COMMENT ON COLUMN tickets.leaf_reason IS 'Reason for leaf outcome';
COMMENT ON COLUMN tickets.description IS 'User description of the issue (min 10 chars)';
COMMENT ON COLUMN tickets.phone_raw IS 'Phone number as entered by user';
COMMENT ON COLUMN tickets.phone_e164 IS 'Phone number in E.164 format (+31...)';
COMMENT ON COLUMN tickets.email IS 'Contact email address';
COMMENT ON COLUMN tickets.contact_name IS 'Contact person name';
COMMENT ON COLUMN tickets.created_at IS 'Ticket creation timestamp';
COMMENT ON COLUMN tickets.submitted_at IS 'Ticket submission timestamp';

-- Ticket answers for additional questions
CREATE TABLE ticket_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE ticket_answers IS 'Additional answers for ticket questions';
COMMENT ON COLUMN ticket_answers.id IS 'Primary key';
COMMENT ON COLUMN ticket_answers.ticket_id IS 'Reference to ticket';
COMMENT ON COLUMN ticket_answers.key IS 'Question key (e.g., entry_permission, pets_present)';
COMMENT ON COLUMN ticket_answers.value IS 'Answer value as JSON';
COMMENT ON COLUMN ticket_answers.created_at IS 'Answer creation timestamp';

-- Media assets (photos/videos)
CREATE TABLE media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  kind media_kind NOT NULL,
  mime TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  needs_conversion BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE media_assets IS 'Media files attached to tickets';
COMMENT ON COLUMN media_assets.id IS 'Primary key';
COMMENT ON COLUMN media_assets.ticket_id IS 'Reference to ticket';
COMMENT ON COLUMN media_assets.kind IS 'Type of media (image/video)';
COMMENT ON COLUMN media_assets.mime IS 'MIME type (e.g., image/jpeg, image/heic)';
COMMENT ON COLUMN media_assets.size_bytes IS 'File size in bytes';
COMMENT ON COLUMN media_assets.storage_path IS 'Storage bucket path';
COMMENT ON COLUMN media_assets.needs_conversion IS 'Whether file needs conversion (e.g., HEIC to WEBP)';
COMMENT ON COLUMN media_assets.created_at IS 'Asset creation timestamp';

-- Webhook outbox for external integrations
CREATE TABLE webhooks_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  attempt INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE webhooks_outbox IS 'Outbox for webhook delivery to external systems';
COMMENT ON COLUMN webhooks_outbox.id IS 'Primary key';
COMMENT ON COLUMN webhooks_outbox.ticket_id IS 'Reference to ticket';
COMMENT ON COLUMN webhooks_outbox.payload IS 'Webhook payload as JSON';
COMMENT ON COLUMN webhooks_outbox.attempt IS 'Number of delivery attempts';
COMMENT ON COLUMN webhooks_outbox.last_error IS 'Last error message if delivery failed';
COMMENT ON COLUMN webhooks_outbox.created_at IS 'Outbox entry creation timestamp';

-- Allowed emails for registration gate
CREATE TABLE allowed_emails (
  email TEXT PRIMARY KEY
);
COMMENT ON TABLE allowed_emails IS 'Pre-registration email allowlist';
COMMENT ON COLUMN allowed_emails.email IS 'Email address allowed to register';

-- Indexes for performance
CREATE INDEX idx_tickets_profile_id ON tickets(profile_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_media_assets_ticket_id ON media_assets(ticket_id);
CREATE INDEX idx_ticket_answers_ticket_id ON ticket_answers(ticket_id);
CREATE INDEX idx_address_events_profile_id ON address_events(profile_id);
CREATE INDEX idx_address_events_session_id ON address_events(wizard_session_id);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE address_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowed_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = auth_user_id);

-- Tickets: users can only see their own tickets
CREATE POLICY "Users can view own tickets" ON tickets
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own tickets" ON tickets
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own tickets" ON tickets
  FOR UPDATE USING (
    profile_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

-- Ticket answers: users can only see answers for their own tickets
CREATE POLICY "Users can view own ticket answers" ON ticket_answers
  FOR SELECT USING (
    ticket_id IN (
      SELECT id FROM tickets WHERE profile_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert own ticket answers" ON ticket_answers
  FOR INSERT WITH CHECK (
    ticket_id IN (
      SELECT id FROM tickets WHERE profile_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own ticket answers" ON ticket_answers
  FOR UPDATE USING (
    ticket_id IN (
      SELECT id FROM tickets WHERE profile_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Media assets: users can only see assets for their own tickets
CREATE POLICY "Users can view own media assets" ON media_assets
  FOR SELECT USING (
    ticket_id IN (
      SELECT id FROM tickets WHERE profile_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert own media assets" ON media_assets
  FOR INSERT WITH CHECK (
    ticket_id IN (
      SELECT id FROM tickets WHERE profile_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own media assets" ON media_assets
  FOR UPDATE USING (
    ticket_id IN (
      SELECT id FROM tickets WHERE profile_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Address events: users can only see their own address events
CREATE POLICY "Users can view own address events" ON address_events
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own address events" ON address_events
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

-- Webhooks outbox: users can only see webhooks for their own tickets
CREATE POLICY "Users can view own webhooks" ON webhooks_outbox
  FOR SELECT USING (
    ticket_id IN (
      SELECT id FROM tickets WHERE profile_id IN (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Allowed emails: public read access for registration check
CREATE POLICY "Public can check allowed emails" ON allowed_emails
  FOR SELECT USING (true);

-- Create step_events table for logging user interactions with different steps
-- This enables backend branching by leaf_reason with proper analytics

CREATE TABLE IF NOT EXISTS step_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    step TEXT NOT NULL,
    leaf_reason TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    form_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_step_events_user_id ON step_events(user_id);
CREATE INDEX IF NOT EXISTS idx_step_events_leaf_reason ON step_events(leaf_reason);
CREATE INDEX IF NOT EXISTS idx_step_events_step ON step_events(step);
CREATE INDEX IF NOT EXISTS idx_step_events_timestamp ON step_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_step_events_created_at ON step_events(created_at);

-- Enable RLS
ALTER TABLE step_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own step events"
    ON step_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own step events"
    ON step_events FOR SELECT
    USING (auth.uid() = user_id);

-- Admin policy for analytics (service role only)
CREATE POLICY "Service role can view all step events"
    ON step_events FOR SELECT
    USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON step_events TO authenticated;
GRANT ALL ON step_events TO service_role;

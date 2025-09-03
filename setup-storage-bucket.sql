-- Create Supabase Storage bucket for media assets
-- Run this in Supabase SQL Editor

-- Create the media-assets bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-assets', 'media-assets', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the storage bucket
-- Users can only upload to their own ticket folders
CREATE POLICY "Users can upload to own ticket folders"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media-assets' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT t.id::text 
    FROM tickets t 
    JOIN profiles p ON p.id = t.profile_id 
    WHERE p.auth_user_id = auth.uid()
    AND t.status = 'draft'
  )
);

-- Users can view media from their own tickets
CREATE POLICY "Users can view own ticket media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'media-assets' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT t.id::text 
    FROM tickets t 
    JOIN profiles p ON p.id = t.profile_id 
    WHERE p.auth_user_id = auth.uid()
  )
);

-- Service role can manage all objects (for Edge Functions)
CREATE POLICY "Service role full access"
ON storage.objects FOR ALL
USING (bucket_id = 'media-assets')
WITH CHECK (bucket_id = 'media-assets');

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

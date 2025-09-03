-- Create RLS policies for ticket-photos storage bucket
-- Allow users to upload their own photos
CREATE POLICY "Users can upload their own photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'ticket-photos' 
  AND auth.uid() IS NOT NULL
);

-- Allow users to view their own photos  
CREATE POLICY "Users can view their own photos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'ticket-photos' 
  AND auth.uid() IS NOT NULL
);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'ticket-photos' 
  AND auth.uid() IS NOT NULL
);

-- Allow users to update their own photos (for metadata updates)
CREATE POLICY "Users can update their own photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'ticket-photos' 
  AND auth.uid() IS NOT NULL
) 
WITH CHECK (
  bucket_id = 'ticket-photos' 
  AND auth.uid() IS NOT NULL
);
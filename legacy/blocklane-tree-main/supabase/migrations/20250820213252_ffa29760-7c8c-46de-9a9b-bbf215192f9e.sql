-- Create RLS policies for ticket-photos storage bucket

-- Allow users to upload photos to their own folder
CREATE POLICY "Users can upload their own photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'ticket-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own photos
CREATE POLICY "Users can view their own photos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'ticket-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own photos (for removing photos in UI)
CREATE POLICY "Users can delete their own photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'ticket-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
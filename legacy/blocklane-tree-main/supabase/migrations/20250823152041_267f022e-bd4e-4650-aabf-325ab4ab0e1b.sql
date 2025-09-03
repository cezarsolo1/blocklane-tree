-- Make the ticket-photos bucket public so we can store public URLs
UPDATE storage.buckets 
SET public = true 
WHERE id = 'ticket-photos';
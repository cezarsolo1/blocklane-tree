-- Rename photo_urls column to photo_paths to better reflect that we store storage paths
ALTER TABLE public.tickets RENAME COLUMN photo_urls TO photo_paths;
/*
  # Create photos bucket and policies

  1. Storage
    - Create 'photos' bucket for profile pictures
    - Enable RLS
    - Add policies for authenticated users to:
      - Upload their own photos
      - Read their own photos
      - Delete their own photos

  2. Security
    - Enable RLS on storage bucket
    - Policies ensure users can only access their own files
    - File names must include user ID for ownership verification
*/

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('photos', 'photos')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for uploading photos
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for reading photos
CREATE POLICY "Users can read their own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for deleting photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
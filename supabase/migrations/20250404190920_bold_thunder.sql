/*
  # Create storage policies for resumes bucket

  1. Storage Policies
    - Create 'resumes' bucket if it doesn't exist
    - Enable RLS on the bucket
    - Add policies for:
      - Authenticated users can upload their own resumes
      - Authenticated users can read their own resumes
      - Authenticated users can update their own resumes
      - Authenticated users can delete their own resumes

  2. Security
    - Enable RLS on storage bucket
    - Policies ensure users can only access their own files
    - File names must include user ID for ownership verification
*/

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('resumes', 'resumes')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for uploading files
CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for reading files
CREATE POLICY "Users can read their own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for updating files
CREATE POLICY "Users can update their own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for deleting files
CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
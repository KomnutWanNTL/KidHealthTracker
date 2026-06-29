-- M12.2-3: Create avatars bucket + RLS policies
-- Run this in Supabase SQL Editor (dev project first, then prod)

-- Create bucket (if not exists via Dashboard, this creates it)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- RLS: INSERT — user can upload to own folder only
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: SELECT — anyone can read (public bucket)
CREATE POLICY "Anyone can read avatars"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars');

-- RLS: UPDATE — user can update own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: DELETE — user can delete own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

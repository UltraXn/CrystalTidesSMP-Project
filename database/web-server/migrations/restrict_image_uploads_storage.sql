-- RESTRICT IMAGE UPLOAD BUCKETS (C1)
-- Closes the arbitrary-file-upload vector on the buckets used by the web app.
--
-- Attack prevented: any authenticated user calling the Supabase Storage API
-- directly (bypassing the web UI) to upload HTML/SVG/EXE with a spoofed
-- Content-Type, then serving it publicly (phishing / malware hosting).
--
-- After this migration:
--   1. Clients can still READ public files (URLs keep working).
--   2. Clients can NO LONGER write to these buckets (anon/authenticated).
--   3. All uploads go through POST /api/uploads/image (backend, service role),
--      which validates magic bytes, size, bucket and role.
--
-- NOTE: service_role bypasses RLS, so the backend keeps working.
-- Run this in the Supabase SQL editor. It is idempotent.

-- 1. Drop every EXISTING client-side policy on these buckets, whatever its
--    name (they were created manually in the dashboard over time). This also
--    replaces the older staff-write policies on 'medals' — staff uploads now
--    go through the backend too (role enforced there).
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND (
                coalesce(qual, '') || ' ' || coalesce(with_check, '')
                ~ '(forum-uploads|avatars|content|admin-assets|medals)'
          )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

-- 2. Recreate READ-ONLY access (public buckets serve files via public URLs;
--    this keeps listing/reading working for everyone, including guests).
CREATE POLICY "Public Read Images" ON storage.objects
    FOR SELECT
    USING (bucket_id IN ('forum-uploads', 'avatars', 'content', 'admin-assets', 'medals'));

-- 3. NO insert/update/delete policies are created for anon/authenticated.
--    RLS default-deny now blocks all client-side writes.

-- 4. Defense in depth at bucket level: even if a write policy were recreated
--    by mistake, the bucket itself rejects non-image content types and
--    oversized files.
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/webp', 'image/png', 'image/jpeg', 'image/gif', 'image/avif'],
    file_size_limit = 5242880  -- 5 MB
WHERE id IN ('forum-uploads', 'content', 'admin-assets');

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/webp', 'image/png', 'image/jpeg', 'image/gif', 'image/avif'],
    file_size_limit = 2097152  -- 2 MB (avatars, medals)
WHERE id IN ('avatars', 'medals');

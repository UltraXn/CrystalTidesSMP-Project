-- Migration: Restrict Storage Policies to Staff Roles
-- Description: Updates storage policies for medals bucket to only allow staff roles
-- Author: Antigravity
-- Date: 2026-01-17

-- Drop existing open policies
DROP POLICY IF EXISTS "Staff Upload" ON storage.objects;
DROP POLICY IF EXISTS "Staff Update" ON storage.objects;
DROP POLICY IF EXISTS "Staff Delete" ON storage.objects;

-- Create restricted INSERT policy
CREATE POLICY "Staff Upload" ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'medals' 
    AND auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('developer', 'moderator', 'admin', 'killu', 'neroferno')
    )
);

-- Create restricted UPDATE policy
CREATE POLICY "Staff Update" ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'medals'
    AND auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('developer', 'moderator', 'admin', 'killu', 'neroferno')
    )
);

-- Create restricted DELETE policy
CREATE POLICY "Staff Delete" ON storage.objects
FOR DELETE
USING (
    bucket_id = 'medals'
    AND auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('developer', 'moderator', 'admin', 'killu', 'neroferno')
    )
);

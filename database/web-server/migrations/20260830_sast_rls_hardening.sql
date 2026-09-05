-- ==============================================================================
-- MIGRATION: 20260830_sast_rls_hardening.sql
-- PURPOSE: Hardens Row Level Security (RLS) policies identified in SAST Security Audit
-- INVARIANTS: Idempotent, non-destructive, zero-downtime compatible
-- ==============================================================================

-- 1. KARMA VOTES HARDENING
-- Restrict viewing of karma votes to vote owner or staff (prevents user tracking)
ALTER TABLE IF EXISTS public.karma_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Karma" ON public.karma_votes;
DROP POLICY IF EXISTS "Restricted Read Karma" ON public.karma_votes;

CREATE POLICY "Restricted Read Karma"
ON public.karma_votes
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'moderator', 'developer', 'killu', 'neroferno')
    )
);

-- 2. PROFILE COMMENTS HARDENING
-- Ensure comments are manageable only by author, profile recipient, or staff
ALTER TABLE IF EXISTS public.profile_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access" ON public.profile_comments;
DROP POLICY IF EXISTS "Authenticated Read Comments" ON public.profile_comments;

CREATE POLICY "Authenticated Read Comments"
ON public.profile_comments
FOR SELECT
TO authenticated
USING (
    author_id = auth.uid()
    OR profile_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'moderator', 'developer', 'killu', 'neroferno')
    )
);

DROP POLICY IF EXISTS "Comment Owner Delete" ON public.profile_comments;

CREATE POLICY "Comment Owner Delete"
ON public.profile_comments
FOR DELETE
TO authenticated
USING (
    author_id = auth.uid()
    OR profile_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'moderator', 'developer', 'killu', 'neroferno')
    )
);

-- 3. STAFF NOTES HARDENING
-- Restrict staff notes exclusively to authenticated staff roles
ALTER TABLE IF EXISTS public.staff_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access" ON public.staff_notes;
DROP POLICY IF EXISTS "Staff Only Read Notes" ON public.staff_notes;
DROP POLICY IF EXISTS "Staff Only Insert Notes" ON public.staff_notes;
DROP POLICY IF EXISTS "Staff Only Modify Notes" ON public.staff_notes;

CREATE POLICY "Staff Only Read Notes"
ON public.staff_notes
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'moderator', 'developer', 'killu', 'neroferno')
    )
);

CREATE POLICY "Staff Only Insert Notes"
ON public.staff_notes
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'moderator', 'developer', 'killu', 'neroferno')
    )
);

CREATE POLICY "Staff Only Modify Notes"
ON public.staff_notes
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'moderator', 'developer', 'killu', 'neroferno')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'moderator', 'developer', 'killu', 'neroferno')
    )
);

-- 4. WIKI ARTICLES HARDENING
-- Ensure published articles are readable by anyone, but drafts and mutations require staff
ALTER TABLE IF EXISTS public.wiki_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access" ON public.wiki_articles;
DROP POLICY IF EXISTS "Published Read Access" ON public.wiki_articles;

CREATE POLICY "Published Read Access"
ON public.wiki_articles
FOR SELECT
USING (
    is_published = true
    OR (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'moderator', 'developer', 'killu', 'neroferno')
        )
    )
);

-- 5. STORAGE OBJECTS (MEDALS & ADMIN ASSETS)
-- Ensure storage bucket updates enforce strict WITH CHECK constraints
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
        DROP POLICY IF EXISTS "Staff Update Medals" ON storage.objects;
        DROP POLICY IF EXISTS "Staff Delete Medals" ON storage.objects;

        CREATE POLICY "Staff Update Medals" ON storage.objects
        FOR UPDATE
        TO authenticated
        USING (
            bucket_id = 'medals'
            AND EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid()
                AND role IN ('developer', 'moderator', 'admin', 'killu', 'neroferno')
            )
        )
        WITH CHECK (
            bucket_id = 'medals'
            AND EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid()
                AND role IN ('developer', 'moderator', 'admin', 'killu', 'neroferno')
            )
        );

        CREATE POLICY "Staff Delete Medals" ON storage.objects
        FOR DELETE
        TO authenticated
        USING (
            bucket_id = 'medals'
            AND EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid()
                AND role IN ('developer', 'moderator', 'admin', 'killu', 'neroferno')
            )
        );
    END IF;
END $$;

-- 6. MOD KNOWLEDGE BASE (RAG)
ALTER TABLE IF EXISTS public.mod_knowledge_base ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Knowledge Base" ON public.mod_knowledge_base;
DROP POLICY IF EXISTS "Staff Manage Knowledge Base" ON public.mod_knowledge_base;

CREATE POLICY "Public Read Knowledge Base"
ON public.mod_knowledge_base
FOR SELECT
USING (true);

CREATE POLICY "Staff Manage Knowledge Base"
ON public.mod_knowledge_base
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'moderator', 'developer', 'killu', 'neroferno')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'moderator', 'developer', 'killu', 'neroferno')
    )
);


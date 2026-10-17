-- Migration: one like per user and newspaper edition
-- Date: 2026-10-17
--
-- POST /api/ai/newspaper/:id/like was public and did read-then-write on
-- likes_count: anyone could inflate it and concurrent likes were lost.
-- The like is now recorded per user and the counter only moves when the
-- insert really happened, in one statement.

CREATE TABLE IF NOT EXISTS public.ai_newspaper_likes (
    edition_id BIGINT NOT NULL REFERENCES public.ai_newspaper_editions (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (edition_id, user_id)
);

-- RLS on and no policies: only the service role (web-server) can touch it.
ALTER TABLE public.ai_newspaper_likes ENABLE ROW LEVEL SECURITY;

-- Returns no row when the edition does not exist.
CREATE OR REPLACE FUNCTION public.like_newspaper_edition(p_edition_id BIGINT, p_user_id UUID)
RETURNS TABLE (liked BOOLEAN, likes_count INT)
LANGUAGE sql
SET search_path = public
AS $$
    WITH inserted AS (
        INSERT INTO ai_newspaper_likes (edition_id, user_id)
        SELECT e.id, p_user_id
        FROM ai_newspaper_editions e
        WHERE e.id = p_edition_id
        ON CONFLICT DO NOTHING
        RETURNING edition_id
    ),
    bumped AS (
        UPDATE ai_newspaper_editions e
        SET likes_count = COALESCE(e.likes_count, 0) + 1
        FROM inserted i
        WHERE e.id = i.edition_id
        RETURNING e.likes_count
    )
    SELECT TRUE, b.likes_count FROM bumped b
    UNION ALL
    SELECT FALSE, COALESCE(e.likes_count, 0)
    FROM ai_newspaper_editions e
    WHERE e.id = p_edition_id AND NOT EXISTS (SELECT 1 FROM bumped);
$$;

REVOKE ALL ON FUNCTION public.like_newspaper_edition(BIGINT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.like_newspaper_edition(BIGINT, UUID) TO service_role;

-- Migration: real likes for news articles
-- Date: 2026-10-18
--
-- Implements atomic, authenticated likes for news articles via RPC,
-- recording one like per user in public.news_likes and bumping likes_count on public.news.

CREATE TABLE IF NOT EXISTS public.news_likes (
    news_id BIGINT NOT NULL REFERENCES public.news (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (news_id, user_id)
);

-- RLS enabled and zero policies: accessible only by the service_role (web-server).
ALTER TABLE public.news_likes ENABLE ROW LEVEL SECURITY;

-- Persistent likes counter on public.news
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS likes_count INT NOT NULL DEFAULT 0;

-- Atomic like RPC: increments counter only on genuine new like insertion
CREATE OR REPLACE FUNCTION public.like_news_article(p_news_id BIGINT, p_user_id UUID)
RETURNS TABLE (liked BOOLEAN, likes_count INT)
LANGUAGE sql
SET search_path = public
AS $$
    WITH inserted AS (
        INSERT INTO news_likes (news_id, user_id)
        SELECT n.id, p_user_id
        FROM news n
        WHERE n.id = p_news_id
        ON CONFLICT DO NOTHING
        RETURNING news_id
    ),
    bumped AS (
        UPDATE news n
        SET likes_count = COALESCE(n.likes_count, 0) + 1
        FROM inserted i
        WHERE n.id = i.news_id
        RETURNING n.likes_count
    )
    SELECT TRUE, b.likes_count FROM bumped b
    UNION ALL
    SELECT FALSE, COALESCE(n.likes_count, 0)
    FROM news n
    WHERE n.id = p_news_id AND NOT EXISTS (SELECT 1 FROM bumped);
$$;

REVOKE ALL ON FUNCTION public.like_news_article(BIGINT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.like_news_article(BIGINT, UUID) TO service_role;

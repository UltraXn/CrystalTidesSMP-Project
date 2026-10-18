-- Migration: one streak row per user
-- Date: 2026-10-17
--
-- POST /api/roadmap/claim inserts the first streak row and relies on a unique
-- violation (23505) to reject a concurrent duplicate claim. Creates the unique
-- index only when user_id is not already unique (e.g. the primary key).
-- Fails loudly if duplicate rows already exist; clean those up first:
--   SELECT user_id, count(*) FROM public.user_daily_streaks GROUP BY user_id HAVING count(*) > 1;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY (i.indkey)
        WHERE i.indrelid = 'public.user_daily_streaks'::regclass
          AND i.indisunique
          AND i.indnatts = 1
          AND a.attname = 'user_id'
    ) THEN
        CREATE UNIQUE INDEX user_daily_streaks_user_id_key
            ON public.user_daily_streaks (user_id);
    END IF;
END $$;

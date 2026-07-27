-- KARMA VOTES
-- Fixes: F-07 race condition (read-modify-write on auth user_metadata) and
-- unbounded growth of the `voters` array inside the auth user record.
--
-- The votes table is the source of truth. The composite PK makes duplicate
-- votes impossible at the database level (atomic, race-safe), and reputation
-- is derived as COUNT(*) instead of trusting a mutable counter.

CREATE TABLE IF NOT EXISTS public.karma_votes (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, voter_id)
);

ALTER TABLE public.karma_votes ENABLE ROW LEVEL SECURITY;

-- No public policies: all access goes through the backend (service role),
-- which enforces self-vote prevention and one-vote-per-user rules.
DROP POLICY IF EXISTS "Public Read Karma" ON public.karma_votes;

-- Everyone can read karma counts (they are displayed on public profiles),
-- but nobody can write directly from the client.
CREATE POLICY "Public Read Karma" ON public.karma_votes
    FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_karma_votes_user_id ON public.karma_votes (user_id);

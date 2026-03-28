-- Migration to fix poll voting security
-- Create poll_votes table to track user votes and prevent double-voting

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id BIGINT NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    option_id BIGINT NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(poll_id, user_id)
);

-- 2. Enable RLS
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- 3. Policies
DROP POLICY IF EXISTS "Users can view own votes" ON public.poll_votes;
CREATE POLICY "Users can view own votes" ON public.poll_votes
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own votes" ON public.poll_votes;
CREATE POLICY "Users can insert own votes" ON public.poll_votes
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 4. Trigger to update poll_options counts
CREATE OR REPLACE FUNCTION public.handle_poll_vote()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate that the option belongs to the poll at the DB level
    IF NOT EXISTS (
        SELECT 1 FROM public.poll_options 
        WHERE id = NEW.option_id AND poll_id = NEW.poll_id
    ) THEN
        RAISE EXCEPTION 'La opción elegida no pertenece a esta encuesta';
    END IF;

    UPDATE public.poll_options
    SET votes = votes + 1
    WHERE id = NEW.option_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Cleanup existing trigger if exists
DROP TRIGGER IF EXISTS on_poll_vote ON public.poll_votes;

CREATE TRIGGER on_poll_vote
    AFTER INSERT ON public.poll_votes
    FOR EACH ROW EXECUTE FUNCTION public.handle_poll_vote();

-- 5. Hardening poll_options
-- Remove "Vote Access" (manual update) policy
DROP POLICY IF EXISTS "Vote Access" ON public.poll_options;

-- Ensure users can still see options (already exists as "Public Read Access" in apply_global_rls.sql)

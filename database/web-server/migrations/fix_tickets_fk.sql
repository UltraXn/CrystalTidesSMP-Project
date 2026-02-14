-- Fix Ticket Foreign Key relation to allow implicit joins with profiles
-- This ensures 'tickets.user_id' references 'public.profiles(id)' instead of just 'auth.users(id)'
-- PostgREST requires this valid FK to allow .select('*, profiles(*)')

DO $$ 
BEGIN
    -- Check if tickets table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tickets') THEN
        
        -- Try to drop constraint if it points to auth.users (likely named tickets_user_id_fkey or similar)
        -- We just forcefully add the correct one. If duplicate exists, we might need to drop by specific name.
        -- We will assume standard naming or just add a new one if needed, but replacing is safer.
        -- For safety, let's just ADD it. PostgREST can use any valid FK.
        
        BEGIN
            ALTER TABLE public.tickets
            ADD CONSTRAINT tickets_user_id_profiles_fkey
            FOREIGN KEY (user_id) REFERENCES public.profiles(id)
            ON DELETE CASCADE;
        EXCEPTION
            WHEN duplicate_object THEN
                NULL; -- Constraint already exists
        END;

    END IF;
END $$;

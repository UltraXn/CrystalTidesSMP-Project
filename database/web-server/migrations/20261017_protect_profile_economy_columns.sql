-- Migration: extend client-side write protection on public.profiles
-- Date: 2026-10-17
--
-- The policy "Users can update own profile" (security_hardening.sql) lets any
-- authenticated user UPDATE their own row through the Supabase API. The previous
-- trigger only blocked `role` and `money`, so a user could set their own
-- `gacha_balance`, medals, reputation or prestige from the browser.
--
-- Changes:
--   * Protects every server-owned column. Columns are read through jsonb, so a
--     name that does not exist in this deployment is simply ignored.
--   * Checks `current_user` instead of the JWT claim: client requests run as
--     anon/authenticated, while the web-server (service_role), the SQL editor
--     (postgres) and trusted SECURITY DEFINER functions keep full access.

CREATE OR REPLACE FUNCTION public.protect_profile_critical_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    protected_columns text[] := ARRAY[
        'role',
        'money',
        'gacha_balance',
        'medals',
        'reputation',
        'prestige_constructor',
        'prestige_luchador',
        'prestige_mercader',
        'prestige_constancia',
        'prestige_explorador'
    ];
    col text;
    new_row jsonb := to_jsonb(NEW);
    old_row jsonb := to_jsonb(OLD);
BEGIN
    IF current_user NOT IN ('anon', 'authenticated') THEN
        RETURN NEW;
    END IF;

    FOREACH col IN ARRAY protected_columns LOOP
        IF (new_row -> col) IS DISTINCT FROM (old_row -> col) THEN
            RAISE EXCEPTION 'Column "%" can only be changed by the server', col
                USING ERRCODE = '42501';
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_update_protect ON public.profiles;

CREATE TRIGGER on_profile_update_protect
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_critical_columns();

-- Verify (as an authenticated user, e.g. from the browser console):
--   await supabase.from('profiles').update({ gacha_balance: 999999 }).eq('id', myUserId)
--   -> error 42501 "Column "gacha_balance" can only be changed by the server"

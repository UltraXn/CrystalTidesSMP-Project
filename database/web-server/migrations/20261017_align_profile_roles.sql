-- Migration: align profiles.role with the roles the platform actually assigns
-- Date: 2026-10-17
--
-- `profiles.role` is the only role source the web-server trusts. The admin panel
-- offers helper, staff, founder and donor, and the server knows owner/killuwu,
-- but add_developer_role.sql only allowed user/moderator/admin/developer/
-- killu/neroferno. Keep this list in sync with USER_ROLES in
-- packages/shared/src/schemas/user.ts.
--
-- Apply BEFORE deploying the web-server that writes roles to profiles.

-- Inspect current values first; anything outside the list makes VALIDATE fail:
--   SELECT role, count(*) FROM public.profiles GROUP BY role ORDER BY 2 DESC;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check CHECK (
        role IN (
            'user', 'donor', 'founder', 'helper', 'staff', 'mod', 'moderator',
            'developer', 'admin', 'killu', 'killuwu', 'neroferno', 'owner'
        )
    ) NOT VALID;

ALTER TABLE public.profiles VALIDATE CONSTRAINT profiles_role_check;

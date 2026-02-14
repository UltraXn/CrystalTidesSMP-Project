-- Migration: Add Developer Role Support
-- Description: Adds 'developer' and 'moderator' roles to the profiles table constraint
-- Author: Antigravity
-- Date: 2026-01-17

-- Drop existing constraint if it exists
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint with expanded role hierarchy
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'moderator', 'admin', 'developer', 'killu', 'neroferno'));

-- Add documentation comment
COMMENT ON COLUMN public.profiles.role IS 
'Role hierarchy: user < moderator < admin < developer < killu/neroferno (co-owners). Developer has gamification and content management access.';

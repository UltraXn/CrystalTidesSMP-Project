-- Add 'category' column to tickets table
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';

-- Verify 'priority' and 'description' also exist just in case
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';

ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS description TEXT;

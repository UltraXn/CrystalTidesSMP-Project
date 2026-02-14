-- Add translation columns to server_rules
ALTER TABLE public.server_rules ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE public.server_rules ADD COLUMN IF NOT EXISTS content_en TEXT;

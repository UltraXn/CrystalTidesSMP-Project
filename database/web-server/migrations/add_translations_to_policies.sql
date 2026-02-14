-- Add translation columns to site_policies
ALTER TABLE public.site_policies ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE public.site_policies ADD COLUMN IF NOT EXISTS content_en TEXT;

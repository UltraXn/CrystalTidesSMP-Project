-- Add description and metadata JSONB columns to wiki_articles for 3D boss configs and extra entity metadata
ALTER TABLE public.wiki_articles ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.wiki_articles ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

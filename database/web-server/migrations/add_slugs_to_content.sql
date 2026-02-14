-- Add slug column to news
ALTER TABLE news ADD COLUMN IF NOT EXISTS slug TEXT;

-- Add slug column to forum_threads
ALTER TABLE forum_threads ADD COLUMN IF NOT EXISTS slug TEXT;

-- Update News Slugs
-- 1. Remove non-alphanumeric (except spaces)
-- 2. Replace spaces with dashes
-- 3. Lowercase
UPDATE news 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\\s]', '', 'g'), '\\s+', '-', 'g'))
WHERE slug IS NULL;

-- Update Forum Threads Slugs
UPDATE forum_threads 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\\s]', '', 'g'), '\\s+', '-', 'g'))
WHERE slug IS NULL;

-- Create Unique Indexes
-- Using valid_slug function logic in application is better, but here we enforce it at DB level
-- Note: If there are duplicate titles, this index creation might fail.
-- In a real production scenario, we would use a collision resolution script.
-- For this environment, we assume titles are distinct enough or we act on failure.
CREATE UNIQUE INDEX IF NOT EXISTS news_slug_unique ON news (slug);
CREATE UNIQUE INDEX IF NOT EXISTS forum_threads_slug_unique ON forum_threads (slug);

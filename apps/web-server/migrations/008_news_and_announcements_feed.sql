-- 008_news_and_announcements_feed.sql
-- Sistema Headless de Noticias, Anuncios y Banners para Launcher y Web

CREATE TABLE IF NOT EXISTS news_feed_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'ANNOUNCEMENT', -- 'EVENT', 'UPDATE', 'CHANGELOG', 'MAINTENANCE', 'COMMUNITY'
    tag_label VARCHAR(50) NOT NULL DEFAULT 'NUEVO',
    tag_color VARCHAR(20) DEFAULT '#2DD4BF', -- Crystal Cyan
    summary TEXT NOT NULL,
    content_markdown TEXT,
    banner_image_url TEXT,
    thumbnail_url TEXT,
    action_label VARCHAR(50) DEFAULT 'LEER MÁS',
    action_url TEXT,
    is_featured BOOLEAN DEFAULT false, -- Banner principal del Launcher
    is_pinned BOOLEAN DEFAULT false,
    priority INT DEFAULT 0, -- Mayor número = mayor relevancia
    is_published BOOLEAN DEFAULT true,
    author_name VARCHAR(100) DEFAULT 'Staff CrystalTides',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Índices para consultas de alto rendimiento en el Launcher
CREATE INDEX IF NOT EXISTS idx_news_feed_published_featured ON news_feed_items(is_published, is_featured, priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_feed_category ON news_feed_items(category);
CREATE INDEX IF NOT EXISTS idx_news_feed_slug ON news_feed_items(slug);

-- RLS (Row Level Security) Invariants
ALTER TABLE news_feed_items ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública para elementos publicados
CREATE POLICY "Allow public read published news"
    ON news_feed_items
    FOR SELECT
    USING (is_published = true);

-- Política de gestión total para Administradores y Service Role
CREATE POLICY "Allow admin and service role manage news"
    ON news_feed_items
    FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'admin' 
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        OR auth.role() = 'service_role'
    );

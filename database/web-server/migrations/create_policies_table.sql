-- Create Site Policies Table
CREATE TABLE IF NOT EXISTS site_policies (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    slug VARCHAR(50) UNIQUE NOT NULL, -- 'privacy', 'tos'
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE site_policies ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public Read Access" ON site_policies
    FOR SELECT USING (true);

CREATE POLICY "Admin All Access" ON site_policies
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'neroferno', 'killu', 'killuwu', 'developer')
        )
    );

-- Insert default values if not exists
INSERT INTO site_policies (slug, title, content)
VALUES 
('privacy', 'Política de Privacidad', 'Contenido inicial de la política de privacidad...'),
('tos', 'Términos de Servicio', 'Contenido inicial de los términos de servicio...')
ON CONFLICT (slug) DO NOTHING;

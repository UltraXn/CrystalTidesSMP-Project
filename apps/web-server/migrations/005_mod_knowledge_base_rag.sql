-- 1. Habilitar extensión vectorial pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Tabla Base de Conocimiento de Mods para RAG
CREATE TABLE IF NOT EXISTS mod_knowledge_base (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    mod_id VARCHAR(50) NOT NULL,
    entity_type VARCHAR(30) NOT NULL, -- 'boss', 'miniboss', 'item', 'recipe', 'boss_mechanic', 'lore'
    entity_name TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    embedding VECTOR(3072),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Control de Mods Procesados (Delta Incremental)
CREATE TABLE IF NOT EXISTS processed_mods_manifest (
    mod_file VARCHAR(255) PRIMARY KEY,
    file_hash VARCHAR(64) NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Índice Full-Text Search (FTS) en Español
CREATE INDEX IF NOT EXISTS idx_mod_knowledge_fts 
ON mod_knowledge_base 
USING gin(to_tsvector('spanish', entity_name || ' ' || COALESCE(metadata->>'description', '') || ' ' || COALESCE(metadata->>'drops', '')));

-- 5. Función RPC para Búsqueda Coseno vectorial (pgvector)
CREATE OR REPLACE FUNCTION match_mod_knowledge (
  query_embedding VECTOR(3072),
  match_threshold FLOAT DEFAULT 0.4,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id BIGINT,
  mod_id VARCHAR(50),
  entity_type VARCHAR(30),
  entity_name TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mk.id,
    mk.mod_id,
    mk.entity_type,
    mk.entity_name,
    mk.metadata,
    (1 - (mk.embedding <=> query_embedding))::FLOAT AS similarity
  FROM mod_knowledge_base mk
  WHERE 1 - (mk.embedding <=> query_embedding) > match_threshold
  ORDER BY mk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

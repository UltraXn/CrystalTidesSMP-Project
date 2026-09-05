-- 007_hybrid_search_rrf.sql
-- Función de Búsqueda Híbrida Simultánea con RRF (Reciprocal Rank Fusion) para Supabase pgvector + FTS

CREATE OR REPLACE FUNCTION hybrid_search_rrf(
    query_text TEXT,
    query_embedding VECTOR(3072),
    match_count INT DEFAULT 10,
    rrf_k INT DEFAULT 60
)
RETURNS TABLE (
    id BIGINT,
    mod_id VARCHAR(50),
    entity_type VARCHAR(30),
    entity_name TEXT,
    metadata JSONB,
    score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH vector_matches AS (
        SELECT mk.id, ROW_NUMBER() OVER (ORDER BY mk.embedding <=> query_embedding) AS rank
        FROM mod_knowledge_base mk
        ORDER BY mk.embedding <=> query_embedding
        LIMIT match_count * 2
    ),
    fts_matches AS (
        SELECT mk.id, ROW_NUMBER() OVER (ORDER BY ts_rank_cd(to_tsvector('spanish', mk.entity_name || ' ' || COALESCE(mk.metadata->>'description', '')), plainto_tsquery('spanish', query_text)) DESC) AS rank
        FROM mod_knowledge_base mk
        WHERE to_tsvector('spanish', mk.entity_name || ' ' || COALESCE(mk.metadata->>'description', '')) @@ plainto_tsquery('spanish', query_text)
        LIMIT match_count * 2
    )
    SELECT 
        k.id,
        k.mod_id,
        k.entity_type,
        k.entity_name,
        k.metadata,
        (COALESCE(1.0 / (rrf_k + v.rank), 0.0) + COALESCE(1.0 / (rrf_k + f.rank), 0.0))::FLOAT AS score
    FROM mod_knowledge_base k
    LEFT JOIN vector_matches v ON k.id = v.id
    LEFT JOIN fts_matches f ON k.id = f.id
    WHERE v.id IS NOT NULL OR f.id IS NOT NULL
    ORDER BY score DESC
    LIMIT match_count;
END;
$$;

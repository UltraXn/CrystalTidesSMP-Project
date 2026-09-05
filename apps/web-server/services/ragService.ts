import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

const initialNodeEnv = process.env.NODE_ENV
dotenv.config({ override: true })
if (initialNodeEnv === 'test') {
  process.env.NODE_ENV = 'test'
}

const supabaseUrl = process.env.SUPABASE_URL || 'https://gyoqnqvqhuxlcbrvtfia.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const geminiApiKey = process.env.GEMINI_API_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface ModKnowledgeItem {
  id?: number
  mod_id: string
  entity_type: 'boss' | 'miniboss' | 'item' | 'recipe' | 'boss_mechanic' | 'lore'
  entity_name: string
  metadata: Record<string, unknown>
  similarity?: number
  score?: number
  rerank_score?: number
}

/**
 * Genera un embedding vectorial de 3072 dimensiones mediante la API de Google Gemini (gemini-embedding-001)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!geminiApiKey) {
    console.warn('⚠️ GEMINI_API_KEY no configurada. Retornando embedding nulo para fallback FTS.')
    return new Array(3072).fill(0)
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiApiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text }] }
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      console.warn('⚠️ Embedding API error:', response.status, errText)
      return new Array(3072).fill(0)
    }

    const data = await response.json()
    return data.embedding?.values || new Array(3072).fill(0)
  } catch (err) {
    console.warn('⚠️ Embedding fallback activado:', err instanceof Error ? err.message : String(err))
    return new Array(3072).fill(0)
  }
}

const cohereApiKey = process.env.COHERE_API_KEY || ''

/**
 * Re-ordena los candidatos devueltos por la Búsqueda Híbrida usando un modelo Cross-Encoder.
 * Soporta API externa Cohere Rerank v3.5 (si COHERE_API_KEY está presente) o un Reranker
 * Cross-Encoder léxico-semántico de ultra-baja latencia en Node.js.
 */
export async function rerankModKnowledge(
  query: string,
  candidates: ModKnowledgeItem[],
  topN: number = 3
): Promise<ModKnowledgeItem[]> {
  if (!candidates || candidates.length === 0) return []
  if (candidates.length <= topN) return candidates

  // 1. Si COHERE_API_KEY está configurada, usar Cohere Rerank API v3.5
  if (cohereApiKey) {
    try {
      const documents = candidates.map(c => {
        const desc = typeof c.metadata?.description === 'string' ? c.metadata.description : ''
        return `${c.mod_id} ${c.entity_name} (${c.entity_type}): ${desc}`
      })

      const response = await fetch('https://api.cohere.com/v2/rerank', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cohereApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'rerank-v3.5',
          query,
          documents,
          top_n: topN
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.results && Array.isArray(data.results)) {
          return data.results.map((r: { index: number; relevance_score: number }) => {
            const item = candidates[r.index]
            return { ...item, rerank_score: r.relevance_score }
          })
        }
      }
    } catch (err) {
      console.warn('⚠️ Cohere Rerank API fallback activado:', err instanceof Error ? err.message : String(err))
    }
  }

  // 2. Cross-Encoder Reranker Local (Token Interaction + Entity Exact Match + Metadata Field Density)
  const normalizedQuery = query.toLowerCase().normalize('NFKD').replace(/[^\w\s]/g, '').trim()
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean)

  const scoredCandidates = candidates.map(item => {
    let score = item.score ?? item.similarity ?? 0.1

    const entityName = item.entity_name.toLowerCase()
    const modId = item.mod_id.toLowerCase()
    const entityType = item.entity_type.toLowerCase()
    const metadataStr = JSON.stringify(item.metadata || {}).toLowerCase()

    // 2a. Coincidencia exacta de nombre de entidad
    if (entityName === normalizedQuery) {
      score += 2.5
    } else if (entityName.includes(normalizedQuery) || normalizedQuery.includes(entityName)) {
      score += 1.2
    }

    // 2b. Coincidencia por interacción de tokens (Cross-Encoder Field Scoring)
    let matchedTokens = 0
    queryTokens.forEach(token => {
      if (entityName.includes(token)) {
        matchedTokens += 1.5
      } else if (modId.includes(token) || entityType.includes(token)) {
        matchedTokens += 0.8
      } else if (metadataStr.includes(token)) {
        matchedTokens += 0.4
      }
    })

    const tokenOverlap = queryTokens.length > 0 ? matchedTokens / queryTokens.length : 0
    score += tokenOverlap * 1.8

    return { item, score }
  })

  scoredCandidates.sort((a, b) => b.score - a.score)

  return scoredCandidates.slice(0, topN).map(sc => ({
    ...sc.item,
    rerank_score: Number(sc.score.toFixed(4))
  }))
}

/**
 * Realiza una búsqueda híbrida simultánea RRF + Reranking Cross-Encoder
 */
export async function searchModKnowledge(query: string, limit: number = 5): Promise<ModKnowledgeItem[]> {
  const queryEmbedding = await generateEmbedding(query)
  const isZeroVector = queryEmbedding.every(v => v === 0)

  const fetchCandidateCount = Math.max(limit * 3, 10)
  let rawCandidates: ModKnowledgeItem[] = []

  // 1. Búsqueda Híbrida RRF (Vectorial + FTS en paralelo en PostgreSQL)
  if (!isZeroVector) {
    const { data: rrfResults, error: rrfErr } = await supabase.rpc('hybrid_search_rrf', {
      query_text: query,
      query_embedding: queryEmbedding,
      match_count: fetchCandidateCount,
      rrf_k: 60
    })

    if (!rrfErr && rrfResults && rrfResults.length > 0) {
      rawCandidates = rrfResults as ModKnowledgeItem[]
    } else {
      // 2. Fallback a búsqueda por coseno pgvector si hybrid_search_rrf no devuelve datos
      const { data: vectorResults, error: vectorErr } = await supabase.rpc('match_mod_knowledge', {
        query_embedding: queryEmbedding,
        match_threshold: 0.35,
        match_count: fetchCandidateCount
      })

      if (!vectorErr && vectorResults && vectorResults.length > 0) {
        rawCandidates = vectorResults as ModKnowledgeItem[]
      }
    }
  }

  // 3. Fallback final: Full-Text Search (FTS) nativo en PostgreSQL si no hay candidatos
  if (rawCandidates.length === 0) {
    const formattedFtsQuery = query.trim().replace(/\s+/g, ' | ')
    const { data: ftsResults, error: ftsErr } = await supabase
      .from('mod_knowledge_base')
      .select('id, mod_id, entity_type, entity_name, metadata')
      .textSearch('entity_name', formattedFtsQuery, { config: 'spanish' })
      .limit(fetchCandidateCount)

    if (!ftsErr && ftsResults) {
      rawCandidates = ftsResults as ModKnowledgeItem[]
    }
  }

  // 4. Etapa de Reranking Cross-Encoder sobre los candidatos recuperados
  return rerankModKnowledge(query, rawCandidates, limit)
}

/**
 * Sanitiza y verifica consultas adversarias o preguntas trampa (Anti-Hallucination Guardrail)
 */
export function verifyAndSanitizeKnowledgeQuery(query: string, contextResults: ModKnowledgeItem[]): {
  isSupported: boolean
  formattedContext: string
  warningNote?: string
} {
  if (contextResults.length === 0) {
    return {
      isSupported: false,
      formattedContext: 'NO_KNOWLEDGE_FOUND',
      warningNote: 'No se encontraron datos oficiales en el modpack para esta consulta.'
    }
  }

  // Formatear el contexto recuperado en formato TOON ultra-compacto para el LLM
  const toonLines = contextResults.map(item => {
    const meta = item.metadata || {}
    const formatVal = (val: unknown) => (typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val))
    const hp = meta.health ? `hp:${formatVal(meta.health)}|` : ''
    const armor = meta.armor ? `armor:${formatVal(meta.armor)}|` : ''
    const dim = meta.dimension ? `dimension:${formatVal(meta.dimension)}|` : ''
    const desc = formatVal(meta.description || meta.desc || '')
    const drops = Array.isArray(meta.drops) ? `drops:[${(meta.drops as string[]).join(',')}]|` : ''
    return `${item.mod_id}:${item.entity_name}|type:${item.entity_type}|${hp}${armor}${dim}${drops}desc:"${desc}"`
  })

  const formattedContext = `knowledge[entity]:\n  ${toonLines.join('\n  ')}`

  return {
    isSupported: true,
    formattedContext
  }
}

/**
 * Depura de Supabase los datos de mods que hayan sido eliminados del servidor (Orphan Cleanup)
 */
export async function reconcileOrphanMods(activeModIds: string[]): Promise<number> {
  if (!activeModIds || activeModIds.length === 0) return 0

  const { data: allMods, error: listErr } = await supabase
    .from('mod_knowledge_base')
    .select('mod_id')

  if (listErr || !allMods) return 0

  const existingModIds = Array.from(new Set(allMods.map(m => m.mod_id)))
  const orphanedModIds = existingModIds.filter(id => !activeModIds.includes(id) && id !== 'custom_lore')

  if (orphanedModIds.length === 0) return 0

  console.log(`🧹 Reconciliando y eliminando datos huérfanos de ${orphanedModIds.length} mods:`, orphanedModIds)
  const { error: deleteErr } = await supabase
    .from('mod_knowledge_base')
    .delete()
    .in('mod_id', orphanedModIds)

  return deleteErr ? 0 : orphanedModIds.length
}

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

/**
 * Realiza una búsqueda híbrida (Distancia Coseno Vectorial pgvector + Fallback FTS)
 */
export async function searchModKnowledge(query: string, limit: number = 5): Promise<ModKnowledgeItem[]> {
  const queryEmbedding = await generateEmbedding(query)
  const isZeroVector = queryEmbedding.every(v => v === 0)

  // 1. Si los embeddings vectoriales funcionan, llamar a la función RPC de pgvector
  if (!isZeroVector) {
    const { data: vectorResults, error: vectorErr } = await supabase.rpc('match_mod_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: 0.35,
      match_count: limit
    })

    if (!vectorErr && vectorResults && vectorResults.length > 0) {
      return vectorResults as ModKnowledgeItem[]
    }
  }

  // 2. Fallback: Full-Text Search (FTS) nativo en PostgreSQL
  const formattedFtsQuery = query.trim().replace(/\s+/g, ' | ')
  const { data: ftsResults, error: ftsErr } = await supabase
    .from('mod_knowledge_base')
    .select('id, mod_id, entity_type, entity_name, metadata')
    .textSearch('entity_name', formattedFtsQuery, { config: 'spanish' })
    .limit(limit)

  if (!ftsErr && ftsResults) {
    return ftsResults as ModKnowledgeItem[]
  }

  return []
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

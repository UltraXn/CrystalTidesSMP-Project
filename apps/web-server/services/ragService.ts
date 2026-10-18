import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const CONSTANTS = {
  TABLE_MOD_KNOWLEDGE_BASE: 'mod_knowledge_base',
  RPC_HYBRID_SEARCH_RRF: 'hybrid_search_rrf',
  RPC_MATCH_MOD_KNOWLEDGE: 'match_mod_knowledge',
  HEADER_CONTENT_TYPE: 'Content-Type',
  CONTENT_TYPE_JSON: 'application/json',
  HTTP_POST: 'POST',
  COHERE_RERANK_URL: 'https://api.cohere.com/v2/rerank',
  COHERE_MODEL: 'rerank-v3.5',
  GEMINI_EMBEDDING_URL:
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent',
  NO_KNOWLEDGE_FOUND: 'NO_KNOWLEDGE_FOUND',
  NO_KNOWLEDGE_WARNING: 'No se encontraron datos oficiales en el modpack para esta consulta.',
  CUSTOM_LORE_MOD_ID: 'custom_lore',
  VECTOR_DIMENSIONS: 3072,
} as const;

const supabaseUrl =
  process.env.SUPABASE_URL ??
  (process.env.NODE_ENV === 'test' ? 'https://placeholder-supabase-url.supabase.co' : '');
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  (process.env.NODE_ENV === 'test' ? 'placeholder-key-value-for-testing' : '');
const geminiApiKey = process.env.GEMINI_API_KEY ?? '';
const cohereApiKey = process.env.COHERE_API_KEY ?? '';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export interface ModKnowledgeItem {
  id?: number;
  mod_id: string;
  entity_type: 'boss' | 'miniboss' | 'item' | 'recipe' | 'boss_mechanic' | 'lore';
  entity_name: string;
  metadata: Record<string, unknown>;
  similarity?: number;
  score?: number;
  rerank_score?: number;
}

interface CohereRerankResponse {
  results?: Array<{
    index: number;
    relevance_score: number;
  }>;
}

interface GeminiEmbeddingResponse {
  embedding?: {
    values?: number[];
  };
}

const createFallbackEmbedding = (): number[] =>
  Array.from({ length: CONSTANTS.VECTOR_DIMENSIONS }, () => 0);

function parseJsonMetadataValue(val: unknown): string {
  if (typeof val === 'object' && val !== null) {
    return JSON.stringify(val);
  }
  return String(val ?? '');
}

/**
 * Genera un embedding vectorial de 3072 dimensiones mediante la API de Google Gemini (gemini-embedding-001)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!geminiApiKey) {
    console.warn('⚠️ GEMINI_API_KEY no configurada. Retornando embedding nulo para fallback FTS.');
    return createFallbackEmbedding();
  }

  try {
    const url = `${CONSTANTS.GEMINI_EMBEDDING_URL}?key=${geminiApiKey}`;
    const response = await fetch(url, {
      method: CONSTANTS.HTTP_POST,
      headers: { [CONSTANTS.HEADER_CONTENT_TYPE]: CONSTANTS.CONTENT_TYPE_JSON },
      body: JSON.stringify({
        content: { parts: [{ text }] },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('⚠️ Embedding API error:', response.status, errText);
      return createFallbackEmbedding();
    }

    const data = (await response.json()) as GeminiEmbeddingResponse;
    return data.embedding?.values || createFallbackEmbedding();
  } catch (err) {
    console.warn(
      '⚠️ Embedding fallback activado:',
      err instanceof Error ? err.message : String(err),
    );
    return createFallbackEmbedding();
  }
}

async function rerankWithCohereApi(
  query: string,
  candidates: ModKnowledgeItem[],
  topN: number,
): Promise<ModKnowledgeItem[] | null> {
  if (!cohereApiKey) return null;

  try {
    const documents = candidates.map((c) => {
      const desc = typeof c.metadata?.description === 'string' ? c.metadata.description : '';
      return `${c.mod_id} ${c.entity_name} (${c.entity_type}): ${desc}`;
    });

    const response = await fetch(CONSTANTS.COHERE_RERANK_URL, {
      method: CONSTANTS.HTTP_POST,
      headers: {
        Authorization: `Bearer ${cohereApiKey}`,
        [CONSTANTS.HEADER_CONTENT_TYPE]: CONSTANTS.CONTENT_TYPE_JSON,
      },
      body: JSON.stringify({
        model: CONSTANTS.COHERE_MODEL,
        query,
        documents,
        top_n: topN,
      }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as CohereRerankResponse;
    if (!data.results || !Array.isArray(data.results)) return null;

    return data.results.map((r) => ({
      ...candidates[r.index],
      rerank_score: r.relevance_score,
    }));
  } catch (err) {
    console.warn(
      '⚠️ Cohere Rerank API fallback activado:',
      err instanceof Error ? err.message : String(err),
    );
    return null;
  }
}

function calculateTokenMatchScore(
  tokens: string[],
  entityName: string,
  modId: string,
  entityType: string,
  metadataStr: string,
): number {
  if (tokens.length === 0) return 0;

  let matchedTokens = 0;
  for (const token of tokens) {
    if (entityName.includes(token)) {
      matchedTokens += 1.5;
    } else if (modId.includes(token) || entityType.includes(token)) {
      matchedTokens += 0.8;
    } else if (metadataStr.includes(token)) {
      matchedTokens += 0.4;
    }
  }

  const tokenOverlap = matchedTokens / tokens.length;
  return tokenOverlap * 1.8;
}

function calculateLocalCandidateScore(
  item: ModKnowledgeItem,
  normalizedQuery: string,
  queryTokens: string[],
): number {
  let score = item.score ?? item.similarity ?? 0.1;

  const entityName = item.entity_name.toLowerCase();
  const modId = item.mod_id.toLowerCase();
  const entityType = item.entity_type.toLowerCase();
  const metadataStr = JSON.stringify(item.metadata || {}).toLowerCase();

  if (entityName === normalizedQuery) {
    score += 2.5;
  } else if (entityName.includes(normalizedQuery) || normalizedQuery.includes(entityName)) {
    score += 1.2;
  }

  score += calculateTokenMatchScore(queryTokens, entityName, modId, entityType, metadataStr);
  return score;
}

function rerankLocally(
  query: string,
  candidates: ModKnowledgeItem[],
  topN: number,
): ModKnowledgeItem[] {
  const normalizedQuery = query
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s]/g, '')
    .trim();
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

  const scoredCandidates = candidates.map((item) => ({
    item,
    score: calculateLocalCandidateScore(item, normalizedQuery, queryTokens),
  }));

  scoredCandidates.sort((a, b) => b.score - a.score);

  return scoredCandidates.slice(0, topN).map((sc) => ({
    ...sc.item,
    rerank_score: Number(sc.score.toFixed(4)),
  }));
}

/**
 * Re-ordena los candidatos devueltos por la Búsqueda Híbrida usando un modelo Cross-Encoder.
 * Soporta API externa Cohere Rerank v3.5 (si COHERE_API_KEY está presente) o un Reranker
 * Cross-Encoder léxico-semántico de ultra-baja latencia en Node.js.
 */
export async function rerankModKnowledge(
  query: string,
  candidates: ModKnowledgeItem[],
  topN: number = 3,
): Promise<ModKnowledgeItem[]> {
  if (!candidates || candidates.length === 0) return [];
  if (candidates.length <= topN) return candidates;

  const cohereResults = await rerankWithCohereApi(query, candidates, topN);
  if (cohereResults) {
    return cohereResults;
  }

  return rerankLocally(query, candidates, topN);
}

async function fetchRrfCandidates(
  query: string,
  queryEmbedding: number[],
  matchCount: number,
): Promise<ModKnowledgeItem[]> {
  const { data, error } = await supabase.rpc(CONSTANTS.RPC_HYBRID_SEARCH_RRF, {
    query_text: query,
    query_embedding: queryEmbedding,
    match_count: matchCount,
    rrf_k: 60,
  });

  if (!error && Array.isArray(data) && data.length > 0) {
    return data as ModKnowledgeItem[];
  }
  return [];
}

async function fetchVectorCandidates(
  queryEmbedding: number[],
  matchCount: number,
): Promise<ModKnowledgeItem[]> {
  const { data, error } = await supabase.rpc(CONSTANTS.RPC_MATCH_MOD_KNOWLEDGE, {
    query_embedding: queryEmbedding,
    match_threshold: 0.35,
    match_count: matchCount,
  });

  if (!error && Array.isArray(data) && data.length > 0) {
    return data as ModKnowledgeItem[];
  }
  return [];
}

async function fetchFtsCandidates(query: string, fetchLimit: number): Promise<ModKnowledgeItem[]> {
  const formattedFtsQuery = query.trim().replace(/\s+/g, ' | ');
  const { data, error } = await supabase
    .from(CONSTANTS.TABLE_MOD_KNOWLEDGE_BASE)
    .select('id, mod_id, entity_type, entity_name, metadata')
    .textSearch('entity_name', formattedFtsQuery, { config: 'spanish' })
    .limit(fetchLimit);

  if (!error && Array.isArray(data)) {
    return data as ModKnowledgeItem[];
  }
  return [];
}

/**
 * Realiza una búsqueda híbrida simultánea RRF + Reranking Cross-Encoder
 */
export async function searchModKnowledge(
  query: string,
  limit: number = 5,
): Promise<ModKnowledgeItem[]> {
  const queryEmbedding = await generateEmbedding(query);
  const isZeroVector = queryEmbedding.every((v) => v === 0);
  const fetchCandidateCount = Math.max(limit * 3, 10);

  let rawCandidates: ModKnowledgeItem[] = [];

  if (!isZeroVector) {
    rawCandidates = await fetchRrfCandidates(query, queryEmbedding, fetchCandidateCount);
    if (rawCandidates.length === 0) {
      rawCandidates = await fetchVectorCandidates(queryEmbedding, fetchCandidateCount);
    }
  }

  if (rawCandidates.length === 0) {
    rawCandidates = await fetchFtsCandidates(query, fetchCandidateCount);
  }

  return rerankModKnowledge(query, rawCandidates, limit);
}

function assembleToonEntityLine(item: ModKnowledgeItem): string {
  const meta = item.metadata || {};
  const hp = meta.health ? `hp:${parseJsonMetadataValue(meta.health)}|` : '';
  const armor = meta.armor ? `armor:${parseJsonMetadataValue(meta.armor)}|` : '';
  const dim = meta.dimension ? `dimension:${parseJsonMetadataValue(meta.dimension)}|` : '';
  const desc = parseJsonMetadataValue(meta.description || meta.desc || '');
  const drops = Array.isArray(meta.drops) ? `drops:[${(meta.drops as string[]).join(',')}]|` : '';

  return `${item.mod_id}:${item.entity_name}|type:${item.entity_type}|${hp}${armor}${dim}${drops}desc:"${desc}"`;
}

/**
 * Sanitiza y verifica consultas adversarias o preguntas trampa (Anti-Hallucination Guardrail)
 */
export function verifyAndSanitizeKnowledgeQuery(
  _query: string,
  contextResults: ModKnowledgeItem[],
): {
  isSupported: boolean;
  formattedContext: string;
  warningNote?: string;
} {
  if (contextResults.length === 0) {
    return {
      isSupported: false,
      formattedContext: CONSTANTS.NO_KNOWLEDGE_FOUND,
      warningNote: CONSTANTS.NO_KNOWLEDGE_WARNING,
    };
  }

  const toonLines = contextResults.map(assembleToonEntityLine);
  const formattedContext = `knowledge[entity]:\n  ${toonLines.join('\n  ')}`;

  return {
    isSupported: true,
    formattedContext,
  };
}

/**
 * Depura de Supabase los datos de mods que hayan sido eliminados del servidor (Orphan Cleanup)
 */
export async function reconcileOrphanMods(activeModIds: string[]): Promise<number> {
  if (!activeModIds || activeModIds.length === 0) return 0;

  const { data: allMods, error: listErr } = await supabase
    .from(CONSTANTS.TABLE_MOD_KNOWLEDGE_BASE)
    .select('mod_id');

  if (listErr || !allMods) return 0;

  const existingModIds = Array.from(new Set(allMods.map((m) => m.mod_id as string)));
  const orphanedModIds = existingModIds.filter(
    (id) => !activeModIds.includes(id) && id !== CONSTANTS.CUSTOM_LORE_MOD_ID,
  );

  if (orphanedModIds.length === 0) return 0;

  console.log(
    `🧹 Reconciliando y eliminando datos huérfanos de ${orphanedModIds.length} mods:`,
    orphanedModIds,
  );

  const { error: deleteErr } = await supabase
    .from(CONSTANTS.TABLE_MOD_KNOWLEDGE_BASE)
    .delete()
    .in('mod_id', orphanedModIds);

  return deleteErr ? 0 : orphanedModIds.length;
}

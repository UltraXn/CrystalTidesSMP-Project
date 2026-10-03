import type { Request, Response } from 'express';
import crypto from 'node:crypto';
import { supabase, generateEmbedding, reconcileOrphanMods } from '../services/ragService.js';

// ============================================================================
// CONSTANTS & TABLE IDENTIFIERS
// ============================================================================

export const TABLE_PROCESSED_MANIFEST = 'processed_mods_manifest';
export const TABLE_MOD_KNOWLEDGE = 'mod_knowledge_base';
export const MANIFEST_FILE_LATEST = 'kubejs_push_latest';
export const ENTITY_TYPE_BOSS = 'boss' as const;
export const ENTITY_TYPE_MOB = 'mob' as const;
export const DEFAULT_MOD_PREFIX = 'custom';
export const STATUS_SKIPPED = 'skipped' as const;
export const STATUS_SUCCESS = 'success' as const;

const RAG_INGEST_SECRET =
  process.env.RAG_INGEST_SECRET ||
  (process.env.NODE_ENV === 'test' ? 'CrystalRAGSecretKey2026' : undefined);

let memoryChecksumCache: string | null = null;

// ============================================================================
// STRICT TYPE DEFINITIONS
// ============================================================================

export type EntityType = typeof ENTITY_TYPE_BOSS | typeof ENTITY_TYPE_MOB;

export interface RagEntityInput {
  id: string;
  name?: string;
  mod?: string;
  is_boss?: boolean;
  health?: number | string;
  armor?: number | string;
  dimension?: string;
  description?: string;
  desc?: string;
  drops?: string[];
  [key: string]: unknown;
}

export interface RagItemInput {
  id: string;
  name?: string;
  mod?: string;
  [key: string]: unknown;
}

export interface RagIngestBody {
  exported_at?: string;
  active_mods?: string[];
  entities?: RagEntityInput[];
  items?: RagItemInput[];
  checksum?: string;
}

export interface ProcessedManifestRecord {
  mod_file: string;
  file_hash: string;
  processed_at?: string;
}

export interface ModKnowledgeInsertRow {
  mod_id: string;
  entity_type: EntityType;
  entity_name: string;
  metadata: RagEntityInput;
  embedding: number[];
}

export interface VectorMatchResult {
  id?: number;
  mod_id: string;
  entity_type: string;
  entity_name: string;
  metadata: Record<string, unknown>;
  similarity?: number;
  score?: number;
  rerank_score?: number;
}

export interface VectorSearchResponsePayload {
  query: string;
  total_found: number;
  is_supported: boolean;
  context: string;
  results: VectorMatchResult[];
}

export interface RagIngestSuccessResponse {
  status: typeof STATUS_SUCCESS;
  message: string;
  inserted_count: number;
  timestamp: string;
}

export interface RagIngestSkippedResponse {
  status: typeof STATUS_SKIPPED;
  message: string;
  timestamp: string;
}

export interface RagIngestErrorResponse {
  error: string;
  details?: string;
}

type AuthValidationResult =
  | { isValid: true }
  | { isValid: false; statusCode: 500 | 401; errorMessage: string };

// ============================================================================
// EMBEDDING QUERY BUILDERS & RECORD TRANSFORMERS
// ============================================================================

/**
 * Genera el texto semántico optimizado para generar embeddings de entidades
 */
export function buildEntityEmbeddingText(entity: RagEntityInput): string {
  const namePart = entity.name || '';
  const modPart = entity.mod || '';
  return `${entity.id} ${namePart} ${modPart}`;
}

/**
 * Normaliza y construye la consulta textual para búsquedas vectoriales
 */
export function buildSearchEmbeddingQuery(query: string): string {
  return query.trim();
}

/**
 * Transforma una entidad en un registro tipado listo para inserción en mod_knowledge_base
 */
export function buildKnowledgeRecord(
  entity: RagEntityInput,
  embedding: number[],
): ModKnowledgeInsertRow {
  const colonIndex = entity.id.indexOf(':');
  const fallbackMod = colonIndex > 0 ? entity.id.slice(0, colonIndex) : DEFAULT_MOD_PREFIX;
  const modId = entity.mod || fallbackMod;
  const entityType: EntityType = entity.is_boss ? ENTITY_TYPE_BOSS : ENTITY_TYPE_MOB;
  const entityName = entity.name || entity.id;

  return {
    mod_id: modId,
    entity_type: entityType,
    entity_name: entityName,
    metadata: entity,
    embedding,
  };
}

// ============================================================================
// PURE UTILITY & CHECKSUM HELPERS
// ============================================================================

/**
 * Calcula el hash SHA-256 del contenido de entidades e ítems si no fue provisto
 */
export function computePayloadChecksum(
  payload: { entities?: RagEntityInput[]; items?: RagItemInput[] },
  explicitChecksum?: string,
): string {
  if (explicitChecksum) {
    return explicitChecksum;
  }
  const payloadString = JSON.stringify({ entities: payload.entities, items: payload.items });
  return crypto.createHash('sha256').update(payloadString).digest('hex');
}

/**
 * Valida la cabecera de autenticación contra el secreto configurado en el servidor
 */
function validateIngestAuth(req: Request): AuthValidationResult {
  if (!RAG_INGEST_SECRET) {
    return {
      isValid: false,
      statusCode: 500,
      errorMessage: 'RAG_INGEST_SECRET no está configurado en el servidor.',
    };
  }

  const authHeader = req.headers['x-rag-secret'] || req.headers['authorization'];
  const isDirectMatch = authHeader === RAG_INGEST_SECRET;
  const isBearerMatch = authHeader === `Bearer ${RAG_INGEST_SECRET}`;

  if (!isDirectMatch && !isBearerMatch) {
    return {
      isValid: false,
      statusCode: 401,
      errorMessage: 'No autorizado. Se requiere x-rag-secret válido.',
    };
  }

  return { isValid: true };
}

/**
 * Verifica si el checksum coincide con la memoria caché o la base de datos
 */
async function isChecksumUnchanged(computedChecksum: string): Promise<boolean> {
  if (memoryChecksumCache === computedChecksum) {
    return true;
  }

  const { data: existingManifest } = await supabase
    .from(TABLE_PROCESSED_MANIFEST)
    .select('file_hash')
    .eq('mod_file', MANIFEST_FILE_LATEST)
    .single();

  const isMatchInDb = Boolean(existingManifest && existingManifest.file_hash === computedChecksum);
  if (isMatchInDb) {
    memoryChecksumCache = computedChecksum;
    return true;
  }

  return false;
}

/**
 * Itera e inserta entidades generando embeddings vectoriales
 */
async function ingestEntities(entities: RagEntityInput[]): Promise<number> {
  let insertedCount = 0;
  for (const entity of entities) {
    const textToEmbed = buildEntityEmbeddingText(entity);
    const embedding = await generateEmbedding(textToEmbed);
    const record = buildKnowledgeRecord(entity, embedding);

    const { error } = await supabase.from(TABLE_MOD_KNOWLEDGE).insert(record);
    if (!error) {
      insertedCount++;
    }
  }
  return insertedCount;
}

/**
 * Actualiza la memoria local y el registro persistente de checksums
 */
async function updateManifestChecksum(computedChecksum: string): Promise<void> {
  memoryChecksumCache = computedChecksum;
  await supabase.from(TABLE_PROCESSED_MANIFEST).upsert({
    mod_file: MANIFEST_FILE_LATEST,
    file_hash: computedChecksum,
    processed_at: new Date().toISOString(),
  });
}

// Helpers para testing / inspección de caché
export function getMemoryChecksumCache(): string | null {
  return memoryChecksumCache;
}

export function resetMemoryChecksumCache(): void {
  memoryChecksumCache = null;
}

// ============================================================================
// CONTROLLER HANDLER
// ============================================================================

/**
 * Endpoint POST /api/rag/ingest para recibir el push automático de KubeJS en formato TOON/JSON
 */
export async function handleRagIngestPush(req: Request, res: Response): Promise<void> {
  try {
    const auth = validateIngestAuth(req);
    if (!auth.isValid) {
      res.status(auth.statusCode).json({ error: auth.errorMessage });
      return;
    }

    const body = req.body as RagIngestBody;
    const { active_mods, entities, items, checksum } = body;

    // 1. Verificación de Checksum de Cambios (10ms 200 OK si no hay cambios)
    const computedChecksum = computePayloadChecksum({ entities, items }, checksum);
    const isUnchanged = await isChecksumUnchanged(computedChecksum);

    if (isUnchanged) {
      res.status(200).json({
        status: STATUS_SKIPPED,
        message: '✅ Sin cambios detectados en el modpack. Proceso omitido (0 costo de tokens).',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // 2. Reconciliación y depuración de mods eliminados
    if (Array.isArray(active_mods)) {
      await reconcileOrphanMods(active_mods);
    }

    // 3. Procesar e insertar entidades nuevas con embeddings
    let insertedCount = 0;
    if (Array.isArray(entities)) {
      insertedCount = await ingestEntities(entities);
    }

    // 4. Actualizar memoria y manifiesto de checksum
    await updateManifestChecksum(computedChecksum);

    res.status(200).json({
      status: STATUS_SUCCESS,
      message: `✅ Ingesta completada. Insertados ${insertedCount} elementos nuevos.`,
      inserted_count: insertedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('❌ Error en handleRagIngestPush:', errorMsg);
    res.status(500).json({ error: 'Error interno en la ingesta RAG.', details: errorMsg });
  }
}

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

const HASH_ALGORITHM = 'sha256';
const HASH_ENCODING = 'hex';
const HEADER_X_RAG_SECRET = 'x-rag-secret';
const HEADER_AUTHORIZATION = 'authorization';
const BEARER_PREFIX = 'Bearer ';

const INGEST_MESSAGES = {
  AUTH_SECRET_MISSING: 'RAG_INGEST_SECRET no está configurado en el servidor.',
  AUTH_UNAUTHORIZED: 'No autorizado. Se requiere x-rag-secret válido.',
  SKIPPED_NO_CHANGES:
    '✅ Sin cambios detectados en el modpack. Proceso omitido (0 costo de tokens).',
  INGESTION_ERROR: 'Error interno en la ingesta RAG.',
  buildSuccessMessage: (count: number): string =>
    `✅ Ingesta completada. Insertados ${count} elementos nuevos.`,
} as const;

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

export interface VectorMatchResult<TMetadata = Record<string, unknown>> {
  id?: number;
  mod_id: string;
  entity_type: string;
  entity_name: string;
  metadata: TMetadata;
  similarity?: number;
  score?: number;
  rerank_score?: number;
}

export interface VectorSearchResponsePayload<TMetadata = Record<string, unknown>> {
  query: string;
  total_found: number;
  is_supported: boolean;
  context: string;
  results: VectorMatchResult<TMetadata>[];
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
  return `${entity.id} ${namePart} ${modPart}`.trim();
}

/**
 * Genera el texto semántico optimizado para generar embeddings de ítems
 */
export function buildItemEmbeddingText(item: RagItemInput): string {
  const namePart = item.name || '';
  const modPart = item.mod || '';
  return `${item.id} ${namePart} ${modPart}`.trim();
}

/**
 * Normaliza y construye la consulta textual para búsquedas vectoriales
 */
export function buildSearchEmbeddingQuery(query: string): string {
  return query.trim();
}

/**
 * Extrae el mod_id fallback a partir del prefijo en entity.id
 */
function resolveModId(entity: RagEntityInput): string {
  if (entity.mod) {
    return entity.mod;
  }
  const colonIndex = entity.id.indexOf(':');
  return colonIndex > 0 ? entity.id.slice(0, colonIndex) : DEFAULT_MOD_PREFIX;
}

/**
 * Transforma una entidad en un registro tipado listo para inserción en mod_knowledge_base
 */
export function buildKnowledgeRecord(
  entity: RagEntityInput,
  embedding: number[],
): ModKnowledgeInsertRow {
  const modId = resolveModId(entity);
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

const getIsoTimestamp = (): string => new Date().toISOString();

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
  return crypto.createHash(HASH_ALGORITHM).update(payloadString).digest(HASH_ENCODING);
}

/**
 * Valida la cabecera de autenticación contra el secreto configurado en el servidor
 */
function validateIngestAuth(req: Request): AuthValidationResult {
  if (!RAG_INGEST_SECRET) {
    return {
      isValid: false,
      statusCode: 500,
      errorMessage: INGEST_MESSAGES.AUTH_SECRET_MISSING,
    };
  }

  const authHeader = req.headers[HEADER_X_RAG_SECRET] || req.headers[HEADER_AUTHORIZATION];
  const isDirectMatch = authHeader === RAG_INGEST_SECRET;
  const isBearerMatch = authHeader === `${BEARER_PREFIX}${RAG_INGEST_SECRET}`;

  if (!isDirectMatch && !isBearerMatch) {
    return {
      isValid: false,
      statusCode: 401,
      errorMessage: INGEST_MESSAGES.AUTH_UNAUTHORIZED,
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
  const manifestRecord: ProcessedManifestRecord = {
    mod_file: MANIFEST_FILE_LATEST,
    file_hash: computedChecksum,
    processed_at: getIsoTimestamp(),
  };

  await supabase.from(TABLE_PROCESSED_MANIFEST).upsert(manifestRecord);
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

    const computedChecksum = computePayloadChecksum({ entities, items }, checksum);
    const isUnchanged = await isChecksumUnchanged(computedChecksum);

    if (isUnchanged) {
      const skippedResponse: RagIngestSkippedResponse = {
        status: STATUS_SKIPPED,
        message: INGEST_MESSAGES.SKIPPED_NO_CHANGES,
        timestamp: getIsoTimestamp(),
      };
      res.status(200).json(skippedResponse);
      return;
    }

    if (Array.isArray(active_mods)) {
      await reconcileOrphanMods(active_mods);
    }

    let insertedCount = 0;
    if (Array.isArray(entities)) {
      insertedCount = await ingestEntities(entities);
    }

    await updateManifestChecksum(computedChecksum);

    const successResponse: RagIngestSuccessResponse = {
      status: STATUS_SUCCESS,
      message: INGEST_MESSAGES.buildSuccessMessage(insertedCount),
      inserted_count: insertedCount,
      timestamp: getIsoTimestamp(),
    };
    res.status(200).json(successResponse);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('❌ Error en handleRagIngestPush:', errorMsg);
    const errorResponse: RagIngestErrorResponse = {
      error: INGEST_MESSAGES.INGESTION_ERROR,
      details: errorMsg,
    };
    res.status(500).json(errorResponse);
  }
}

import { Request, Response } from 'express'
import { supabase, generateEmbedding, reconcileOrphanMods } from '../services/ragService.js'
import crypto from 'node:crypto'

const RAG_INGEST_SECRET = process.env.RAG_INGEST_SECRET || (process.env.NODE_ENV === 'test' ? 'CrystalRAGSecretKey2026' : undefined);
let memoryChecksumCache: string | null = null;

/**
 * Endpoint POST /api/rag/ingest para recibir el push automático de KubeJS en formato TOON/JSON
 */
export async function handleRagIngestPush(req: Request, res: Response): Promise<void> {
  try {
    if (!RAG_INGEST_SECRET) {
      res.status(500).json({ error: 'RAG_INGEST_SECRET no está configurado en el servidor.' });
      return;
    }

    const authHeader = req.headers['x-rag-secret'] || req.headers['authorization'];
    if (authHeader !== RAG_INGEST_SECRET && authHeader !== `Bearer ${RAG_INGEST_SECRET}`) {
      res.status(401).json({ error: 'No autorizado. Se requiere x-rag-secret válido.' });
      return;
    }

    const { active_mods, entities, items, checksum } = req.body

    // 1. Verificación de Checksum de Cambios (10ms 200 OK si no hay cambios)
    const payloadString = JSON.stringify({ entities, items })
    const computedChecksum = checksum || crypto.createHash('sha256').update(payloadString).digest('hex')

    const { data: existingManifest } = await supabase
      .from('processed_mods_manifest')
      .select('file_hash')
      .eq('mod_file', 'kubejs_push_latest')
      .single()

    const isMatchInDb = existingManifest && existingManifest.file_hash === computedChecksum
    const isMatchInMem = memoryChecksumCache === computedChecksum

    if (isMatchInDb || isMatchInMem) {
      res.status(200).json({
        status: 'skipped',
        message: '✅ Sin cambios detectados en el modpack. Proceso omitido (0 costo de tokens).',
        timestamp: new Date().toISOString()
      })
      return
    }

    // 2. Reconciliación y depuración de mods eliminados
    if (Array.isArray(active_mods)) {
      await reconcileOrphanMods(active_mods)
    }

    let insertedCount = 0

    // 3. Procesar e insertar entidades nuevas con embeddings
    if (Array.isArray(entities)) {
      for (const entity of entities) {
        const textToEmbed = `${entity.id} ${entity.name || ''} ${entity.mod || ''}`
        const embedding = await generateEmbedding(textToEmbed)

        const { error } = await supabase.from('mod_knowledge_base').insert({
          mod_id: entity.mod || entity.id.split(':')[0] || 'custom',
          entity_type: entity.is_boss ? 'boss' : 'mob',
          entity_name: entity.name || entity.id,
          metadata: entity,
          embedding
        })

        if (!error) insertedCount++
      }
    }

    // 4. Actualizar memoria y manifiesto de checksum
    memoryChecksumCache = computedChecksum
    await supabase.from('processed_mods_manifest').upsert({
      mod_file: 'kubejs_push_latest',
      file_hash: computedChecksum,
      processed_at: new Date().toISOString()
    })

    res.status(200).json({
      status: 'success',
      message: `✅ Ingesta completada. Insertados ${insertedCount} elementos nuevos.`,
      inserted_count: insertedCount,
      timestamp: new Date().toISOString()
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('❌ Error en handleRagIngestPush:', errorMsg)
    res.status(500).json({ error: 'Error interno en la ingesta RAG.', details: errorMsg })
  }
}

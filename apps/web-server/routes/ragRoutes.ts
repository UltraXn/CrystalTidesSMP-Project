import { Router } from 'express'
import { handleRagIngestPush } from '../controllers/ragController.js'
import { searchModKnowledge, verifyAndSanitizeKnowledgeQuery } from '../services/ragService.js'

const router = Router()

// Endpoint para push automático de KubeJS
router.post('/ingest', handleRagIngestPush)

// Endpoint de prueba de búsqueda RAG
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q as string) || ''
    if (!q) {
      res.status(400).json({ error: 'Falta el parámetro de consulta ?q=' })
      return
    }

    const results = await searchModKnowledge(q, 5)
    const sanitized = verifyAndSanitizeKnowledgeQuery(q, results)

    res.json({
      query: q,
      total_found: results.length,
      is_supported: sanitized.isSupported,
      context: sanitized.formattedContext,
      results
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    res.status(500).json({ error: 'Error en la búsqueda RAG', details: errorMsg })
  }
})

export default router

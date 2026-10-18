import { Router } from 'express';
import { z, ZodError } from 'zod';
import { handleRagIngestPush } from '../controllers/ragController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { sensitiveActionLimiter } from '../middleware/rateLimitMiddleware.js';
import { searchModKnowledge, verifyAndSanitizeKnowledgeQuery } from '../services/ragService.js';
import { checkRole, STAFF_ROLES } from '../utils/roleUtils.js';

const router = Router();

// Each query costs an embeddings call: require it and bound its length.
const searchQuerySchema = z.object({ q: z.string().trim().min(1).max(200) });
const SEARCH_QUERY_ERROR = 'El parámetro ?q= es obligatorio (1-200 caracteres)';

// Endpoint para push automático de KubeJS
router.post('/ingest', sensitiveActionLimiter, handleRagIngestPush);

// Endpoint de prueba de búsqueda RAG (solo staff): cada consulta calcula embeddings
router.get(
  '/search',
  authenticateToken,
  sensitiveActionLimiter,
  checkRole(STAFF_ROLES),
  async (req, res) => {
    try {
      const { q } = searchQuerySchema.parse(req.query);

      const results = await searchModKnowledge(q, 5);
      const sanitized = verifyAndSanitizeKnowledgeQuery(q, results);

      res.json({
        query: q,
        total_found: results.length,
        is_supported: sanitized.isSupported,
        context: sanitized.formattedContext,
        results,
      });
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        res.status(400).json({ error: SEARCH_QUERY_ERROR });
        return;
      }
      // El detalle solo va al log: puede incluir datos internos del proveedor
      console.error(
        '[RAG] Error en la búsqueda:',
        err instanceof Error ? err.message : String(err),
      );
      res.status(500).json({ error: 'Error en la búsqueda RAG' });
    }
  },
);

export default router;

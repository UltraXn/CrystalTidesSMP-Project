import { Router } from 'express'
import {
  getLatestNewspaper,
  getNewspaperArchive,
  likeNewspaperEdition,
  triggerNewspaperGeneration,
  getDailyQuests,
  triggerQuestsGeneration,
  triggerFullPipeline,
  triggerBossPollGeneration
} from '../controllers/aiController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { checkRole, ADMIN_ROLES } from '../utils/roleUtils.js'

const router = Router()

// Rutas Públicas (Web / Launcher / In-game Bridge)
router.get('/newspaper/latest', getLatestNewspaper)
router.get('/newspaper/archive', getNewspaperArchive)
router.post('/newspaper/:id/like', likeNewspaperEdition)
router.get('/quests/daily', getDailyQuests)

// Rutas de Administración / Trigger Manual (Protegidas)
router.post('/generate-newspaper', authenticateToken, checkRole(ADMIN_ROLES), triggerNewspaperGeneration)
router.post('/generate-quests', authenticateToken, checkRole(ADMIN_ROLES), triggerQuestsGeneration)
router.post('/generate-boss-poll', authenticateToken, checkRole(ADMIN_ROLES), triggerBossPollGeneration)
router.post('/trigger-pipeline', authenticateToken, checkRole(ADMIN_ROLES), triggerFullPipeline)

export default router


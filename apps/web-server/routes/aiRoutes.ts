import { Router } from 'express'
import {
  getLatestNewspaper,
  getNewspaperArchive,
  likeNewspaperEdition,
  triggerNewspaperGeneration,
  getDailyQuests,
  triggerQuestsGeneration,
  triggerFullPipeline
} from '../controllers/aiController.js'

const router = Router()

// Rutas Públicas (Web / Launcher / In-game Bridge)
router.get('/newspaper/latest', getLatestNewspaper)
router.get('/newspaper/archive', getNewspaperArchive)
router.post('/newspaper/:id/like', likeNewspaperEdition)
router.get('/quests/daily', getDailyQuests)

// Rutas de Administración / Trigger Manual
router.post('/generate-newspaper', triggerNewspaperGeneration)
router.post('/generate-quests', triggerQuestsGeneration)
router.post('/trigger-pipeline', triggerFullPipeline)

export default router

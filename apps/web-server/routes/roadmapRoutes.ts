import { Router } from 'express';
import {
  getRoadmapConfig,
  getUserStreakStatus,
  claimDailyReward,
  updateRoadmapAdminConfig,
} from '../controllers/roadmapController.js';
import {
  authenticateToken,
  optionalAuthenticateToken,
  require2FA,
} from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES } from '../utils/roleUtils.js';
import { validate } from '../middleware/validateResource.js';
import { updateRoadmapConfigSchema } from '../schemas/roadmapSchemas.js';

const router = Router();

// Public / User Routes
router.get('/config', getRoadmapConfig);
router.get('/streak', optionalAuthenticateToken, getUserStreakStatus);
router.post('/claim', authenticateToken, claimDailyReward);

// Admin Management Route: rewards feed the gacha economy, so it needs admin + 2FA.
router.put(
  '/admin/config',
  authenticateToken,
  checkRole(ADMIN_ROLES),
  require2FA,
  validate(updateRoadmapConfigSchema),
  updateRoadmapAdminConfig,
);

export default router;

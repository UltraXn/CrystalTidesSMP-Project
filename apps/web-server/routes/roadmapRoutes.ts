import { Router } from 'express';
import {
    getRoadmapConfig,
    getUserStreakStatus,
    claimDailyReward,
    updateRoadmapAdminConfig
} from '../controllers/roadmapController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Public / User Routes
router.get('/config', getRoadmapConfig);
router.get('/streak', getUserStreakStatus);
router.post('/claim', authenticateToken, claimDailyReward);

// Admin Management Route
router.put('/admin/config', authenticateToken, updateRoadmapAdminConfig);

export default router;

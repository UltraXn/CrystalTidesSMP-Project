import express from 'express';
import * as minecraftController from '../controllers/minecraftController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/minecraft/status
router.get('/status', minecraftController.getStatus);
router.get('/skin/:username', minecraftController.getSkin);

// Minecraft Account Linking (Requires authentication)
router.post('/link/init', authenticateToken, minecraftController.initWebLink);
router.get('/link/check', authenticateToken, minecraftController.checkLinkStatus);
router.post('/link', authenticateToken, minecraftController.verifyLinkCode);
router.post('/link/unlink', authenticateToken, minecraftController.unlinkAccount);

export default router;

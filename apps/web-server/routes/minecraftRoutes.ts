import express from 'express';
import * as minecraftController from '../controllers/minecraftController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateResource.js';
import { verifyLinkCodeSchema, getSkinSchema } from '../schemas/minecraftSchemas.js';

const router = express.Router();

// GET /api/minecraft/status
router.get('/status', minecraftController.getStatus);
router.get('/skin/:username', validate(getSkinSchema), minecraftController.getSkin);

// Minecraft Account Linking (Requires authentication)
router.post('/link/init', authenticateToken, minecraftController.initWebLink);
router.get('/link/check', authenticateToken, minecraftController.checkLinkStatus);
router.post('/link', authenticateToken, validate(verifyLinkCodeSchema), minecraftController.verifyLinkCode);
router.post('/link/unlink', authenticateToken, minecraftController.unlinkAccount);
router.post('/link/unlink-discord', authenticateToken, minecraftController.unlinkDiscord);

export default router;

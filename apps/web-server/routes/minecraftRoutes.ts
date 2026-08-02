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

// Microsoft OAuth proxy routes for Web Client
router.post('/link/ms-device-code', authenticateToken, minecraftController.requestMsDeviceCode);
router.post('/link/ms-poll', authenticateToken, minecraftController.pollMsDeviceToken);
router.post('/link/ms-callback', authenticateToken, minecraftController.exchangeMsAuthCode);

export default router;

import express from 'express';
import * as minecraftController from '../controllers/minecraftController.js';

const router = express.Router();

// GET /api/minecraft/status
router.get('/status', minecraftController.getStatus);
router.get('/skin/:username', minecraftController.getSkin);

// POST /api/minecraft/link
router.post('/link', minecraftController.verifyLinkCode);
router.post('/link/init', minecraftController.initWebLink);
router.get('/link/check', minecraftController.checkLinkStatus);

export default router;

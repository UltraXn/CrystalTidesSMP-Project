import express from 'express';
import * as gachaController from '../controllers/gachaController.js';
import { authenticateToken, require2FA } from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES } from '../utils/roleUtils.js';
import { validate } from '../middleware/validateResource.js';
import { rollGachaSchema, gachaHistorySchema, gachaStatusSchema, addFundsSchema } from '../schemas/gachaSchemas.js';

const router = express.Router();

router.get('/tiers', gachaController.getTiers);

router.post('/roll', authenticateToken, validate(rollGachaSchema), gachaController.roll);

router.post('/add-funds', authenticateToken, checkRole(ADMIN_ROLES), require2FA, validate(addFundsSchema), gachaController.addFunds);

router.get('/history/:userId', authenticateToken, validate(gachaHistorySchema), gachaController.getHistory);

router.get('/status/:userId', authenticateToken, validate(gachaStatusSchema), gachaController.getStatus);

export default router;

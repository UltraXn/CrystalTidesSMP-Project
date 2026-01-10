import express from 'express';
import * as settingsController from '../controllers/settingsController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES } from '../utils/roleUtils.js';

const router = express.Router();

import { validate } from '../middleware/validateResource.js';
import { updateSettingSchema } from '../schemas/settingsSchemas.js';

// Get settings: uses optional auth to decide if we show full list or public whitelist
router.get('/', optionalAuthenticateToken, settingsController.getSettings);
router.get('/:key', optionalAuthenticateToken, settingsController.getSetting);

// Protected routes: Update settings require admin privileges
router.put('/:key', authenticateToken, checkRole(ADMIN_ROLES), validate(updateSettingSchema), settingsController.updateSetting);

export default router;

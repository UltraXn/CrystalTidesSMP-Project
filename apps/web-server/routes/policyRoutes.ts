import express from 'express';
import * as policyController from '../controllers/policyController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, ADMIN_ROLES } from '../utils/roleUtils.js';

const router = express.Router();

import { validate } from '../middleware/validateResource.js';
import { policySchemas } from '../schemas/policySchemas.js';

// Get settings: uses optional auth to decide if we show full list or public whitelist
router.get('/', policyController.getPolicies);
router.get('/:slug', policyController.getPolicy);

// Admin routes
router.put('/:slug', 
    authenticateToken, 
    checkRole(ADMIN_ROLES), 
    validate(policySchemas.updatePolicy),
    policyController.updatePolicy
);

export default router;

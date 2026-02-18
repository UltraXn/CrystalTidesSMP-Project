import express from 'express';
import * as logController from '../controllers/logController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { ADMIN_ROLES, checkRole } from '../utils/roleUtils.js';

const router = express.Router();

router.get('/', authenticateToken, checkRole(ADMIN_ROLES), logController.getLogs);
router.post('/', authenticateToken, checkRole(ADMIN_ROLES), logController.createLog);

// Public endpoint to report security events (failed login, suspicious activity, etc.)
router.post('/security/report', logController.reportSecurityAlert);

export default router;

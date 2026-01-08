import express from 'express';
import * as authController from '../controllers/authController.js';

import * as twoFactorController from '../controllers/twoFactorController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authController.getMe); 
router.post('/unlink', authenticateToken, authController.unlinkIdentity); 

// 2FA Routes
router.get('/2fa/status', authenticateToken, twoFactorController.get2FAStatus);
router.post('/2fa/setup', authenticateToken, twoFactorController.setup2FA);
router.post('/2fa/enable', authenticateToken, twoFactorController.enable2FA);
router.post('/2fa/disable', authenticateToken, twoFactorController.disable2FA);
router.post('/2fa/verify', authenticateToken, twoFactorController.verify2FA);

export default router;

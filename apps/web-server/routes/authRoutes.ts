import express from 'express';
import * as twoFactorController from '../controllers/twoFactorController.js';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { sensitiveActionLimiter } from '../middleware/rateLimitMiddleware.js';
import { validate } from '../middleware/validateResource.js';
import { checkFormHoneypot } from '../middleware/honeypotMiddleware.js';
import { verify2FASchema, enable2FASchema, registerSchema } from '../schemas/authSchemas.js';

const router = express.Router();

// Public registration route (Rate limited by sensitiveActionLimiter on /api/auth in app.ts)
router.post('/register', checkFormHoneypot('confirm_email'), validate(registerSchema), authController.registerUser);

// Protected 2FA routes (require valid Supabase session token)
router.use(authenticateToken);

router.get('/2fa/status', twoFactorController.get2FAStatus);
router.post('/2fa/setup', sensitiveActionLimiter, twoFactorController.setup2FA);
router.post('/2fa/enable', sensitiveActionLimiter, validate(enable2FASchema), twoFactorController.enable2FA);
router.post('/2fa/disable', sensitiveActionLimiter, twoFactorController.disable2FA);
router.post('/2fa/verify', sensitiveActionLimiter, validate(verify2FASchema), twoFactorController.verify2FA);
router.post('/2fa/logout', twoFactorController.clear2FA);

export default router;


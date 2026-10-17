import { Router } from 'express';
import * as twoFactorController from '../controllers/twoFactorController.js';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { sensitiveActionLimiter } from '../middleware/rateLimitMiddleware.js';
import { validate } from '../middleware/validateResource.js';
import { checkFormHoneypot } from '../middleware/honeypotMiddleware.js';
import {
  verify2FASchema,
  enable2FASchema,
  disable2FASchema,
  registerSchema,
} from '../schemas/authSchemas.js';

const AUTH_ROUTES = {
  REGISTER: '/register',
  TWO_FACTOR_STATUS: '/2fa/status',
  TWO_FACTOR_SETUP: '/2fa/setup',
  TWO_FACTOR_ENABLE: '/2fa/enable',
  TWO_FACTOR_DISABLE: '/2fa/disable',
  TWO_FACTOR_VERIFY: '/2fa/verify',
  TWO_FACTOR_LOGOUT: '/2fa/logout',
} as const;

const HONEYPOT_FIELD = 'confirm_email';

const router = Router();

// Public registration route
router.post(
  AUTH_ROUTES.REGISTER,
  sensitiveActionLimiter,
  checkFormHoneypot(HONEYPOT_FIELD),
  validate(registerSchema),
  authController.registerUser,
);

// Protected 2FA routes (require valid Supabase session token)
router.use(authenticateToken);

router.get(AUTH_ROUTES.TWO_FACTOR_STATUS, twoFactorController.get2FAStatus);
router.post(AUTH_ROUTES.TWO_FACTOR_SETUP, sensitiveActionLimiter, twoFactorController.setup2FA);
router.post(
  AUTH_ROUTES.TWO_FACTOR_ENABLE,
  sensitiveActionLimiter,
  validate(enable2FASchema),
  twoFactorController.enable2FA,
);
router.post(
  AUTH_ROUTES.TWO_FACTOR_DISABLE,
  sensitiveActionLimiter,
  validate(disable2FASchema),
  twoFactorController.disable2FA,
);
router.post(
  AUTH_ROUTES.TWO_FACTOR_VERIFY,
  sensitiveActionLimiter,
  validate(verify2FASchema),
  twoFactorController.verify2FA,
);
router.post(AUTH_ROUTES.TWO_FACTOR_LOGOUT, twoFactorController.clear2FA);

export default router;

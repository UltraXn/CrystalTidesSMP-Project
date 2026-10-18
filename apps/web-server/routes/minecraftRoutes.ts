import { Router } from 'express';
import * as minecraftController from '../controllers/minecraftController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateResource.js';
import { verifyLinkCodeSchema, getSkinSchema } from '@crystaltides/shared';

const MINECRAFT_ROUTES = {
  STATUS: '/status',
  SKIN_BY_USERNAME: '/skin/:username',
  LINK: '/link',
  LINK_INIT: '/link/init',
  LINK_CHECK: '/link/check',
  LINK_UNLINK: '/link/unlink',
  LINK_UNLINK_DISCORD: '/link/unlink-discord',
  MS_DEVICE_CODE: '/link/ms-device-code',
  MS_POLL: '/link/ms-poll',
  MS_CALLBACK: '/link/ms-callback',
} as const;

const router: Router = Router();

// Public Minecraft endpoints
router.get(MINECRAFT_ROUTES.STATUS, minecraftController.getStatus);
router.get(MINECRAFT_ROUTES.SKIN_BY_USERNAME, validate(getSkinSchema), minecraftController.getSkin);

// Minecraft Account Linking (Requires authentication)
router.post(MINECRAFT_ROUTES.LINK_INIT, authenticateToken, minecraftController.initWebLink);
router.get(MINECRAFT_ROUTES.LINK_CHECK, authenticateToken, minecraftController.checkLinkStatus);
router.post(
  MINECRAFT_ROUTES.LINK,
  authenticateToken,
  validate(verifyLinkCodeSchema),
  minecraftController.verifyLinkCode,
);
router.post(MINECRAFT_ROUTES.LINK_UNLINK, authenticateToken, minecraftController.unlinkAccount);
router.post(
  MINECRAFT_ROUTES.LINK_UNLINK_DISCORD,
  authenticateToken,
  minecraftController.unlinkDiscord,
);

// Microsoft OAuth proxy routes for Web Client (Requires authentication)
router.post(
  MINECRAFT_ROUTES.MS_DEVICE_CODE,
  authenticateToken,
  minecraftController.requestMsDeviceCode,
);
router.post(MINECRAFT_ROUTES.MS_POLL, authenticateToken, minecraftController.pollMsDeviceToken);
router.post(
  MINECRAFT_ROUTES.MS_CALLBACK,
  authenticateToken,
  minecraftController.exchangeMsAuthCode,
);

export default router;

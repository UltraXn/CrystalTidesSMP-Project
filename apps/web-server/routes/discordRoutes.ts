import { Router } from 'express';
import { linkAccount } from '../controllers/discordController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateResource.js';
import { linkDiscordSchema } from '../schemas/discordSchemas.js';

const router = Router();

// POST /api/discord/link
router.post('/link', authenticateToken, validate(linkDiscordSchema), linkAccount);

export default router;

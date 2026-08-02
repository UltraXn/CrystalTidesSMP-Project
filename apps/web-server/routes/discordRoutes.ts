import { Router } from 'express';
import { linkAccount, getDiscordAnnouncements } from '../controllers/discordController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateResource.js';
import { linkDiscordSchema } from '../schemas/discordSchemas.js';

const router = Router();

// POST /api/discord/link
router.post('/link', authenticateToken, validate(linkDiscordSchema), linkAccount);

// GET /api/discord/announcements (Public endpoint for live Discord announcements)
router.get('/announcements', getDiscordAnnouncements);

export default router;

import express from 'express';
import crypto from 'crypto';
import { handleKofiWebhook } from '../controllers/webhookController.js';
import { sendError } from '../utils/responseHandler.js';
import { logSecurityFailure } from '../services/auditService.js';
import { webhookLimiter } from '../middleware/rateLimitMiddleware.js';
import { validate } from '../middleware/validateResource.js';
import { minecraftWebhookSchema } from '../schemas/webhookSchemas.js';

const router = express.Router();

/** Timing-safe secret comparison (avoids leaking via response time). */
const safeSecretEqual = (provided: unknown, expected: string): boolean => {
    if (typeof provided !== 'string' || !expected) return false;
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
};

router.post('/kofi', webhookLimiter, handleKofiWebhook);
router.post('/minecraft', webhookLimiter, validate(minecraftWebhookSchema), (req, res) => {
    // Basic placeholder for MC events
    const { event, player, username, details, secret } = req.body;
    const playerName = player || username;

    // Security check (Mandatory: verify secret from plugin via body or header)
    const expectedSecret = process.env.MC_WEBHOOK_SECRET;
    const providedSecret = secret || (req.headers['x-mc-secret'] as string);
    if (!expectedSecret || !safeSecretEqual(providedSecret, expectedSecret)) {
        console.warn(`[MC Webhook] Unauthorized attempt: ${req.ip}`);
        logSecurityFailure(req, 'Unauthorized: Invalid or missing secret', false).catch(err => console.error('Failed to log security event:', err));
        return sendError(res, 'Unauthorized: Invalid or missing secret', 'AUTH_ERROR', 401);
    }

    console.log(`[MC Webhook] Event: ${event} | Player: ${playerName}`);
    
    // Notify Discord (async)
    import('../services/discordService.js').then(s => s.notifyMinecraftEvent(event, playerName, details));

    res.json({ success: true });
});

export default router;


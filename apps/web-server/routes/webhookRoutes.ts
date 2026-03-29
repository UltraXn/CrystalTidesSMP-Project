import express from 'express';
import { handleKofiWebhook } from '../controllers/webhookController.js';
import { sendError } from '../utils/responseHandler.js';

const router = express.Router();

router.post('/kofi', handleKofiWebhook);
router.post('/minecraft', (req, res) => {
    // Basic placeholder for MC events
    const { event, player, details, secret } = req.body;
    
    // Security check (Mandatory: verify secret from plugin)
    const expectedSecret = process.env.MC_WEBHOOK_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
        console.warn(`[MC Webhook] Unauthorized attempt: ${req.ip}`);
        return sendError(res, 'Unauthorized: Invalid or missing secret', 'AUTH_ERROR', 401, undefined, req);
    }

    console.log(`[MC Webhook] Event: ${event} | Player: ${player}`);
    
    // Notify Discord (async)
    import('../services/discordService.js').then(s => s.notifyMinecraftEvent(event, player, details));

    res.json({ success: true });
});

export default router;

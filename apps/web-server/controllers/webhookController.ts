import supabase from '../config/supabaseClient.js';
import { Request, Response } from 'express';
import crypto from 'crypto';
import { kofiWebhookSchema } from '../schemas/donationSchemas.js';

export const handleKofiWebhook = async (req: Request, res: Response) => {
    try {
        // Handle payload: webhooks often send data as x-www-form-urlencoded with a 'data' field containing JSON string
        // But Ko-Fi documentation says "A field named 'data' contains the payment infomation as a JSON string."
        let rawPayload = req.body;

        if (req.body.data && typeof req.body.data === 'string') {
            try {
                rawPayload = JSON.parse(req.body.data);
            } catch (e) {
                console.error('Error parsing Ko-Fi JSON string:', e);
                return res.status(400).send('Invalid JSON format');
            }
        }

        // 1. Mandatory verification checks
        const VERIFICATION_TOKEN = process.env.KOFI_VERIFICATION_TOKEN;

        if (!VERIFICATION_TOKEN) {
            console.error('CRITICAL: KOFI_VERIFICATION_TOKEN is not set!');
            return res.status(500).send('Server Configuration Error');
        }

        // Timing-safe comparison: don't leak token contents via response time
        const providedToken = Buffer.from(String(rawPayload.verification_token || ''));
        const expectedToken = Buffer.from(VERIFICATION_TOKEN);
        const tokenValid = providedToken.length === expectedToken.length
            && crypto.timingSafeEqual(providedToken, expectedToken);

        if (!tokenValid) {
            console.warn('Invalid Ko-Fi verification token attempt');
            return res.status(403).send('Invalid token');
        }

        // 2. Validate payload schema before processing
        const parseResult = kofiWebhookSchema.safeParse(rawPayload);
        if (!parseResult.success) {
            console.warn('Invalid Ko-Fi payload schema:', parseResult.error.flatten());
            return res.status(400).send('Invalid payload');
        }

        const payload = parseResult.data;

        console.log(`Ko-Fi Payload received: message_id=${payload.message_id}, amount=${payload.amount} ${payload.currency}`);

        // Insert into Supabase
        const { error } = await supabase
            .from('donations')
            .upsert({ // upsert uses message_id as unique key to prevent duplicates
                message_id: payload.message_id,
                created_at: payload.timestamp || new Date().toISOString(),
                type: payload.type,
                from_name: payload.from_name || 'Anónimo',
                message: payload.message,
                amount: payload.amount,
                currency: payload.currency,
                url: payload.url,
                is_public: payload.is_public !== false // Default true unless specified false
            }, { onConflict: 'message_id' })
            .select();

        if (error) {
            console.error('Error saving query to Supabase:', error);
            // Return 500 so Ko-Fi retries later? Or 200 to discard?
            // Usually 500 for DB errors.
            return res.status(500).json({ error: 'Database error' });
        }

        console.log(`Donation saved: ${payload.amount} ${payload.currency} from ${payload.from_name}`);

        // 4. Notify Discord (Optional but highly recommended)
        try {
            const { sendDonationAlert } = await import('../services/discordService.js');
            await sendDonationAlert({
                from_name: payload.from_name || 'Anónimo',
                amount: String(payload.amount),
                currency: payload.currency,
                message: payload.message
            });
        } catch (discordErr) {
            console.error('Failed to send Discord alert, but donation was saved:', discordErr);
        }

        res.status(200).send('Donation recorded');

    } catch (err) {
        console.error('Webhook Unexpected Error:', err);
        res.status(500).send('Server Error');
    }
};

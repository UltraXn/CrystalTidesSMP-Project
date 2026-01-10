import supabase from '../config/supabaseClient.js';
import { Request, Response } from 'express';

export const handleKofiWebhook = async (req: Request, res: Response) => {
    try {
        // Handle payload: webhooks often send data as x-www-form-urlencoded with a 'data' field containing JSON string
        // But Ko-Fi documentation says "A field named 'data' contains the payment infomation as a JSON string."
        let payload = req.body;

        if (req.body.data && typeof req.body.data === 'string') {
            try {
                payload = JSON.parse(req.body.data);
            } catch (e) {
                console.error('Error parsing Ko-Fi JSON string:', e);
                return res.status(400).send('Invalid JSON format');
            }
        }

        console.log('Ko-Fi Payload received:', payload);

        // 1. Mandatory verification checks
        const VERIFICATION_TOKEN = process.env.KOFI_VERIFICATION_TOKEN;
        
        if (!VERIFICATION_TOKEN) {
            console.error('CRITICAL: KOFI_VERIFICATION_TOKEN is not set!');
            return res.status(500).send('Server Configuration Error');
        }

        if (payload.verification_token !== VERIFICATION_TOKEN) {
            console.warn('Invalid Ko-Fi verification token attempt');
            return res.status(403).send('Invalid token');
        }

        // 2. Check essential fields
        if (!payload.message_id) {
            console.warn('Payload missing message_id');
            // Ko-Fi expects 200 OK even if we ignore it, to stop retrying.
            return res.status(200).send('Ignored');
        }

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
        res.status(200).send('Donation recorded');

    } catch (err) {
        console.error('Webhook Unexpected Error:', err);
        res.status(500).send('Server Error');
    }
};

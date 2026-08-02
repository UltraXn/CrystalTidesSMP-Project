import { z } from 'zod';

/** POST /api/webhooks/minecraft */
export const minecraftWebhookSchema = z.object({
    body: z.object({
        event: z.string().min(1, 'Event type is required').max(100),
        player: z.string().min(1, 'Player name is required').max(50),
        details: z.any().optional(),
        secret: z.string().min(1, 'Secret is required'),
    }),
});

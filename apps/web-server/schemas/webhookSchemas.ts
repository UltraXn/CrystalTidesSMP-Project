import { z } from 'zod';

/** POST /api/webhooks/minecraft */
export const minecraftWebhookSchema = z.object({
    body: z.object({
        event: z.string().min(1, 'Event type is required').max(100),
        player: z.string().min(1).max(50).optional(),
        username: z.string().min(1).max(50).optional(),
        details: z.any().optional(),
        secret: z.string().max(256).optional(),
    }).refine((data) => Boolean(data.player || data.username), {
        message: 'Player or username is required',
        path: ['player'],
    }),
});

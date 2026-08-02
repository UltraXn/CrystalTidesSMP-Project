import { z } from 'zod';

export const verifyLinkCodeSchema = z.object({
    body: z.object({
        code: z.string().length(6, 'Pin must be exactly 6 characters').regex(/^\d+$/, 'Pin must be numeric'),
        userId: z.string().uuid().optional(), // We use req.user.id anyway, but for schema consistency
    }),
});

export const getSkinSchema = z.object({
    params: z.object({
        username: z.string().min(3).max(16).regex(/^\w+$/, 'Invalid Minecraft username'),
    }),
});

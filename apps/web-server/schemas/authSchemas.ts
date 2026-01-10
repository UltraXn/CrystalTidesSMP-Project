import { z } from 'zod';

export const verify2FASchema = z.object({
    body: z.object({
        token: z.string().length(6, "The token must be 6 digits long").regex(/^\d+$/, "The token must contain only digits")
    })
});

export const enable2FASchema = z.object({
    body: z.object({
        token: z.string().length(6, "The token must be 6 digits long").regex(/^\d+$/, "The token must contain only digits"),
        secret: z.string().min(16, "Secret is invalid")
    })
});

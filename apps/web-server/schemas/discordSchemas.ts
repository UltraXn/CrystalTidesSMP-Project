import { z } from 'zod';

export const linkDiscordSchema = z.object({
    body: z.object({
        code: z.string().min(1, "El código es requerido")
    })
});

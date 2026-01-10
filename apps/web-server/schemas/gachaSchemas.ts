import { z } from 'zod';

export const rollGachaSchema = z.object({
    body: z.object({
        userId: z.string().uuid("ID de usuario inválido")
    })
});

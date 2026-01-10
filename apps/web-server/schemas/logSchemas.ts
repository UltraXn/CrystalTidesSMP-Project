import { z } from 'zod';

export const createLogSchema = z.object({
    body: z.object({
        source: z.enum(['web', 'game', 'security']),
        action: z.string(),
        details: z.string().optional(),
        username: z.string().optional()
    })
});

export const reportSecuritySchema = z.object({
    body: z.object({
        email: z.string().email("Email inválido").optional().or(z.literal('')),
        details: z.string().min(5, "Proporcione más detalles")
    })
});

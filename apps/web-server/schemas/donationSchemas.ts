import { z } from 'zod';

export const createDonationSchema = z.object({
    body: z.object({
        donor_name: z.string().min(1, "El nombre no puede estar vacío"),
        amount: z.number().positive("El monto debe ser positivo"),
        currency: z.string().length(3, "La moneda debe tener 3 caracteres (ej. USD)"),
        source: z.string(),
        message: z.string().optional(),
        status: z.enum(['pending', 'completed', 'cancelled', 'refunded']).optional()
    })
});

export const updateDonationSchema = z.object({
    params: z.object({
        id: z.string()
    }),
    body: z.object({
        donor_name: z.string().min(1).optional(),
        amount: z.number().positive().optional(),
        currency: z.string().length(3).optional(),
        source: z.string().optional(),
        message: z.string().optional(),
        status: z.enum(['pending', 'completed', 'cancelled', 'refunded']).optional()
    })
});

export const kofiWebhookSchema = z.object({
    message_id: z.string().min(1, 'message_id is required'),
    timestamp: z.string().datetime().optional().or(z.literal('')),
    type: z.string().optional(),
    from_name: z.string().max(200).optional(),
    message: z.string().max(2000).optional().or(z.literal('')),
    amount: z.union([z.string(), z.number()]),
    currency: z.string().length(3),
    url: z.string().url().optional().or(z.literal('')),
    is_public: z.boolean().optional(),
    verification_token: z.string().min(1)
});

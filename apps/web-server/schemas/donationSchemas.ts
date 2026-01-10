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

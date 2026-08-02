import { z } from 'zod';

export const rollGachaSchema = z.object({
    body: z.object({
        userId: z.string().uuid("ID de usuario inválido").optional(),
        tierId: z.string().optional(),
        quantity: z.number().int().min(1).max(10).optional(),
        testResult: z.string().optional(),
        forceDeduction: z.boolean().optional(),
    })
});

export const gachaHistorySchema = z.object({
    params: z.object({
        userId: z.string().uuid("ID de usuario inválido")
    })
});

export const gachaStatusSchema = z.object({
    params: z.object({
        userId: z.string().uuid("ID de usuario inválido")
    })
});

export const addFundsSchema = z.object({
    body: z.object({
        amount: z.number().int().positive("La cantidad debe ser positiva")
    })
});

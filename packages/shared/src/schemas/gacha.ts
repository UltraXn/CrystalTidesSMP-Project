import { z } from 'zod';

export const rollGachaPayloadSchema = z.object({
  userId: z.string().uuid('ID de usuario inválido').optional(),
  tierId: z.string().optional(),
  quantity: z.number().int().min(1).max(10).optional(),
  testResult: z.string().optional(),
  forceDeduction: z.boolean().optional(),
});

export const addFundsPayloadSchema = z.object({
  amount: z.number().int().positive('La cantidad debe ser positiva'),
});

// Express route wrapper schemas
export const rollGachaSchema = z.object({
  body: rollGachaPayloadSchema,
});

export const gachaHistorySchema = z.object({
  params: z.object({
    userId: z.string().uuid('ID de usuario inválido'),
  }),
});

export const gachaStatusSchema = z.object({
  params: z.object({
    userId: z.string().uuid('ID de usuario inválido'),
  }),
});

export const addFundsSchema = z.object({
  body: addFundsPayloadSchema,
});

export type RollGachaPayload = z.infer<typeof rollGachaPayloadSchema>;
export type AddFundsPayload = z.infer<typeof addFundsPayloadSchema>;

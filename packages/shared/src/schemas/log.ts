import { z } from 'zod';

export const createLogPayloadSchema = z.object({
  source: z.enum(['web', 'game', 'security']),
  action: z.string(),
  details: z.string().optional(),
  username: z.string().optional(),
});

export const reportSecurityPayloadSchema = z.object({
  email: z.string().email().optional().or(z.literal('')),
  details: z.string().min(5, 'Proporcione más detalles'),
});

// Express route wrapper schemas
export const createLogSchema = z.object({
  body: createLogPayloadSchema,
});

export const reportSecuritySchema = z.object({
  body: reportSecurityPayloadSchema,
});

export type CreateLogPayload = z.infer<typeof createLogPayloadSchema>;
export type ReportSecurityPayload = z.infer<typeof reportSecurityPayloadSchema>;

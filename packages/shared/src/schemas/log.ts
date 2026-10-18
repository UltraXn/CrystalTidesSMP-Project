import { z } from 'zod';

export const createLogPayloadSchema = z.object({
  source: z.enum(['web', 'game', 'security']),
  action: z.string(),
  details: z.string().optional(),
  username: z.string().optional(),
});

// Public endpoint: every field is bounded so anonymous callers cannot bloat system_logs.
export const reportSecurityPayloadSchema = z.object({
  email: z.string().max(254).email().optional().or(z.literal('')),
  details: z.string().min(5, 'Proporcione más detalles').max(500, 'Detalles demasiado largos'),
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

import { z } from 'zod';

export const createRulePayloadSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  title: z.string().min(3, 'Title too short'),
  content: z.string().min(10, 'Content too short'),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().int().optional(),
});

export const updateRulePayloadSchema = z.object({
  category: z.string().optional(),
  title: z.string().min(3).optional(),
  content: z.string().min(10).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().int().optional(),
});

// Express route wrapper schemas
export const ruleSchema = z.object({
  body: createRulePayloadSchema,
});

export const updateRuleSchema = z.object({
  body: updateRulePayloadSchema,
});

export type CreateRulePayload = z.infer<typeof createRulePayloadSchema>;
export type UpdateRulePayload = z.infer<typeof updateRulePayloadSchema>;

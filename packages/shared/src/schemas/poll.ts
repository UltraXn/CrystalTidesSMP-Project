import { z } from 'zod';

export const createPollPayloadSchema = z.object({
  question: z.string().min(5, 'Question too short').max(255),
  description: z.string().max(500).optional(),
  options: z
    .array(
      z.object({
        text: z.string().min(1, 'Option text cannot be empty'),
      }),
    )
    .min(2, 'At least two options are required'),
  expires_at: z.string().datetime().optional(),
});

export const votePollPayloadSchema = z.object({
  pollId: z.union([z.string(), z.number()]),
  optionId: z.union([z.string(), z.number()]),
});

export const updatePollPayloadSchema = z.object({
  question: z.string().min(5).max(255).optional(),
  description: z.string().max(500).optional(),
  active: z.boolean().optional(),
});

// Express route wrapper schemas
export const createPollSchema = z.object({
  body: createPollPayloadSchema,
});

export const votePollSchema = z.object({
  body: votePollPayloadSchema,
});

export const updatePollSchema = z.object({
  body: updatePollPayloadSchema,
});

export type CreatePollPayload = z.infer<typeof createPollPayloadSchema>;
export type VotePollPayload = z.infer<typeof votePollPayloadSchema>;
export type UpdatePollPayload = z.infer<typeof updatePollPayloadSchema>;

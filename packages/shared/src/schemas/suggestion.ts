import { z } from 'zod';

export const suggestionTypeSchema = z.enum([
  'General',
  'Bug',
  'Mod',
  'Complaint',
  'Poll',
  'other',
  'server',
  'web',
  'discord',
]);

export const createSuggestionPayloadSchema = z.object({
  nickname: z.string().min(3, 'Nickname required (min 3 chars)').max(50),
  type: z.union([suggestionTypeSchema, z.string()]).optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message too long (max 2000 chars)'),
});

export const updateSuggestionStatusPayloadSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'implemented']),
});

// Express route wrapper schemas
export const createSuggestionSchema = z.object({
  body: createSuggestionPayloadSchema,
});

export const updateSuggestionStatusSchema = z.object({
  body: updateSuggestionStatusPayloadSchema,
});

// Inferred TypeScript types
export type CreateSuggestionPayload = z.infer<typeof createSuggestionPayloadSchema>;
export type CreateSuggestionFormValues = CreateSuggestionPayload;
export type UpdateSuggestionStatusPayload = z.infer<typeof updateSuggestionStatusPayloadSchema>;
export type SuggestionType = z.infer<typeof suggestionTypeSchema>;

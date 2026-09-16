import { z } from 'zod';

export const createNotePayloadSchema = z.object({
  text: z.string().min(1, 'Note text is required').max(1000, 'Note too long (max 1000 chars)'),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{3,8}$|^rgba?\([0-9.,\s%]+\)$/, 'Invalid color format')
    .optional(),
  rotation: z.number().min(-15).max(15).optional(),
});

// Express route wrapper schema
export const createNoteSchema = z.object({
  body: createNotePayloadSchema,
});

export type CreateNotePayload = z.infer<typeof createNotePayloadSchema>;

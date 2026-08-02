import { z } from 'zod';

/** POST /api/staff/notes */
export const createNoteSchema = z.object({
    body: z.object({
        text: z.string().min(1, 'Note text is required').max(1000, 'Note too long (max 1000 chars)'),
        color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color').optional(),
        rotation: z.number().min(-15).max(15).optional(),
    }),
});

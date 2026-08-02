import { z } from 'zod';

/** POST /api/profile-comments/:profileId */
export const postCommentSchema = z.object({
    params: z.object({
        profileId: z.string().uuid('Invalid profile ID format'),
    }),
    body: z.object({
        content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment too long (max 500 chars)'),
    }),
});

/** GET /api/profile-comments/:profileId */
export const getCommentsSchema = z.object({
    params: z.object({
        profileId: z.string().uuid('Invalid profile ID format'),
    }),
});

/** DELETE /api/profile-comments/:id */
export const deleteCommentSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, 'Invalid comment ID'),
    }),
});

import { z } from 'zod';

export const postCommentPayloadSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment too long (max 500 chars)'),
});

// Express route wrapper schemas
export const postCommentSchema = z.object({
  params: z.object({
    profileId: z.string().uuid('Invalid profile ID format'),
  }),
  body: postCommentPayloadSchema,
});

export const getCommentsSchema = z.object({
  params: z.object({
    profileId: z.string().uuid('Invalid profile ID format'),
  }),
});

export const deleteCommentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid comment ID'),
  }),
});

export type PostCommentPayload = z.infer<typeof postCommentPayloadSchema>;

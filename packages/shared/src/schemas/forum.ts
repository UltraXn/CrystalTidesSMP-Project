import { z } from 'zod';

export const pollDataSchema = z
  .object({
    enabled: z.boolean(),
    question: z.string().max(300).optional(),
    options: z.array(z.string().max(100)).max(10).optional(),
    discord_link: z.string().url().max(500).nullable().optional(),
    closes_at: z.string().datetime({ offset: true }).optional(),
  })
  .nullable()
  .optional();

export const createThreadPayloadSchema = z.object({
  category_id: z.number().int().positive(),
  title: z.string().min(3, 'Title too short').max(150, 'Title too long'),
  content: z.string().min(1, 'Content required').max(10000, 'Content too long'),
  poll_data: pollDataSchema,
});

export const createPostPayloadSchema = z.object({
  content: z.string().min(1, 'Content required').max(10000, 'Content too long'),
});

export const updateThreadPayloadSchema = z.object({
  title: z.string().min(3).max(150).optional(),
  content: z.string().min(1).max(10000).optional(),
  category_id: z.number().int().positive().optional(),
});

export const updatePostPayloadSchema = z.object({
  content: z.string().min(1).max(10000),
});

// Express route wrapper schemas
export const createThreadSchema = z.object({
  body: createThreadPayloadSchema,
});

export const createPostSchema = z.object({
  body: createPostPayloadSchema,
  params: z.object({
    id: z.string().min(1).max(200),
  }),
});

export const updateThreadSchema = z.object({
  body: updateThreadPayloadSchema,
  params: z.object({
    id: z.string().min(1).max(200),
  }),
});

export const updatePostSchema = z.object({
  body: updatePostPayloadSchema,
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid post id'),
  }),
});

export type PollData = z.infer<typeof pollDataSchema>;
export type CreateThreadPayload = z.infer<typeof createThreadPayloadSchema>;
export type CreatePostPayload = z.infer<typeof createPostPayloadSchema>;
export type UpdateThreadPayload = z.infer<typeof updateThreadPayloadSchema>;
export type UpdatePostPayload = z.infer<typeof updatePostPayloadSchema>;

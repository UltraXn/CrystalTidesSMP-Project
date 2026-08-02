import { z } from 'zod';

/**
 * Forum input validation (F-05).
 * Bounds every user-controlled string to prevent DB bloat / abuse.
 * Unknown keys (e.g. legacy `user_data` sent by old clients) are stripped
 * by Zod and ignored — identity always comes from req.user server-side.
 */

const pollDataSchema = z.object({
    enabled: z.boolean(),
    question: z.string().max(300).optional(),
    options: z.array(z.string().max(100)).max(10).optional(),
    discord_link: z.string().url().max(500).nullable().optional(),
    closes_at: z.string().datetime({ offset: true }).optional(),
}).nullable().optional();

export const createThreadSchema = z.object({
    body: z.object({
        category_id: z.number().int().positive(),
        title: z.string().min(3, "Title too short").max(150, "Title too long"),
        content: z.string().min(1, "Content required").max(10000, "Content too long"),
        poll_data: pollDataSchema,
    }),
});

export const createPostSchema = z.object({
    body: z.object({
        content: z.string().min(1, "Content required").max(10000, "Content too long"),
    }),
    params: z.object({
        id: z.string().min(1).max(200),
    }),
});

export const updateThreadSchema = z.object({
    body: z.object({
        title: z.string().min(3).max(150).optional(),
        content: z.string().min(1).max(10000).optional(),
        category_id: z.number().int().positive().optional(),
    }),
    params: z.object({
        id: z.string().min(1).max(200),
    }),
});

export const updatePostSchema = z.object({
    body: z.object({
        content: z.string().min(1).max(10000),
    }),
    params: z.object({
        id: z.string().regex(/^\d+$/, "Invalid post id"),
    }),
});

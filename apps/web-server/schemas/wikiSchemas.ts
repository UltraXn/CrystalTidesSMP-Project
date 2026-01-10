import { z } from 'zod';

export const createWikiArticleSchema = z.object({
    body: z.object({
        title: z.string().min(5, "Title too short").max(200),
        content: z.string().min(10, "Content too short"),
        category: z.string().min(1, "Category is required"),
        slug: z.string().min(3).regex(/^[a-z0-0-]+$/, "Must be a valid slug (lowercase, numbers, dashes)").optional(),
    }),
});

export const updateWikiArticleSchema = z.object({
    body: z.object({
        title: z.string().min(5).max(200).optional(),
        content: z.string().min(10).optional(),
        category: z.string().optional(),
        slug: z.string().min(3).regex(/^[a-z0-0-]+$/).optional(),
    }),
});

import { z } from 'zod';

export const createNewsSchema = z.object({
    body: z.object({
        title: z.string().min(5, "Title too short").max(200),
        content: z.string().min(10, "Content too short"),
        category: z.string().optional(),
        image_url: z.string().url("Invalid URL").optional(),
    }),
});

export const updateNewsSchema = z.object({
    body: z.object({
        title: z.string().min(5).max(200).optional(),
        content: z.string().min(10).optional(),
        category: z.string().optional(),
        image_url: z.string().url().optional(),
    }),
});

export const createCommentSchema = z.object({
    body: z.object({
        content: z.string().min(1, "Comment cannot be empty").max(500),
    }),
});
export const updateCommentSchema = z.object({
    body: z.object({
        content: z.string().min(1, "Comment cannot be empty").max(500),
    }),
});

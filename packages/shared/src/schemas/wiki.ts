import { z } from 'zod';

export const createWikiArticlePayloadSchema = z.object({
  title: z.string().min(3, 'Title too short').max(200),
  content: z.string().min(3, 'Content too short'),
  category: z.string().min(1, 'Category is required'),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, 'Must be a valid slug (lowercase, numbers, dashes)')
    .optional(),
});

export const updateWikiArticlePayloadSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(3).optional(),
  category: z.string().optional(),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
});

// Express route wrapper schemas
export const createWikiArticleSchema = z.object({
  body: createWikiArticlePayloadSchema,
});

export const updateWikiArticleSchema = z.object({
  body: updateWikiArticlePayloadSchema,
});

export type CreateWikiArticlePayload = z.infer<typeof createWikiArticlePayloadSchema>;
export type UpdateWikiArticlePayload = z.infer<typeof updateWikiArticlePayloadSchema>;

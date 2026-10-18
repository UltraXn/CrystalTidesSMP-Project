import { z } from 'zod';

export const newsFormPayloadSchema = z.object({
  id: z.number().optional(), // For updates
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  title_en: z.string().optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  content_en: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['Draft', 'Published']).default('Draft'),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  image_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  author_id: z.string().optional(),
  username: z.string().optional(),
  user_id: z.string().optional(),
});

export const createNewsPayloadSchema = z.object({
  title: z.string().min(5, 'Title too short').max(200),
  title_en: z.string().optional(),
  content: z.string().min(10, 'Content too short'),
  content_en: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['Draft', 'Published']).optional(),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  image_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  author_id: z.string().optional(),
  username: z.string().optional(),
  user_id: z.string().optional(),
});

export const updateNewsPayloadSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  title_en: z.string().optional(),
  content: z.string().min(10).optional(),
  content_en: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['Draft', 'Published']).optional(),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  image_url: z.string().url().optional().or(z.literal('')),
  author_id: z.string().optional(),
  username: z.string().optional(),
  user_id: z.string().optional(),
});

export const createCommentPayloadSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(500),
});

export const updateCommentPayloadSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(500),
});

// Express route wrapper schemas
export const createNewsSchema = z.object({
  body: createNewsPayloadSchema,
});

export const updateNewsSchema = z.object({
  body: updateNewsPayloadSchema,
});

export const createCommentSchema = z.object({
  body: createCommentPayloadSchema,
});

export const updateCommentSchema = z.object({
  body: updateCommentPayloadSchema,
});

// Form-compatible aliases for web-client and external consumers
export const newsFormSchema = newsFormPayloadSchema;
export const newsPayloadSchema = newsFormPayloadSchema;
export const newsSchema = newsFormPayloadSchema;

// Inferred TypeScript types
export type NewsFormPayload = z.infer<typeof newsFormPayloadSchema>;
export type NewsFormValues = NewsFormPayload;
export type NewsFormData = NewsFormValues;
export type CreateNewsPayload = z.infer<typeof createNewsPayloadSchema>;
export type UpdateNewsPayload = z.infer<typeof updateNewsPayloadSchema>;
export type CreateCommentPayload = z.infer<typeof createCommentPayloadSchema>;
export type UpdateCommentPayload = z.infer<typeof updateCommentPayloadSchema>;

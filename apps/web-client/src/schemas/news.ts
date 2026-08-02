import { z } from 'zod';

export const newsSchema = z.object({
    id: z.number().optional(), // For updates
    title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title too long"),
    title_en: z.string().optional(),
    content: z.string().min(10, "Content must be at least 10 characters"),
    content_en: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    status: z.enum(["Draft", "Published"]),
    image: z.url("Must be a valid URL").optional().or(z.literal('')),
    author_id: z.string().optional(),
    username: z.string().optional(),
    user_id: z.string().optional(),
});

export type NewsFormValues = z.infer<typeof newsSchema>;

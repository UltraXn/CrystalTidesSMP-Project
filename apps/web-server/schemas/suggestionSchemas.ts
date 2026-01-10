import { z } from 'zod';

export const createSuggestionSchema = z.object({
    body: z.object({
        nickname: z.string().min(3).max(50),
        message: z.string().min(10).max(1000),
        type: z.string().optional()
    }),
});
export const updateSuggestionStatusSchema = z.object({
    body: z.object({
        status: z.enum(['pending', 'approved', 'rejected', 'implemented'])
    })
});

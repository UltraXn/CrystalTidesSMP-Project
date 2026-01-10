import { z } from 'zod';

export const ruleSchema = z.object({
    body: z.object({
        category: z.string().min(1, "Category is required"),
        title: z.string().min(3, "Title too short"),
        content: z.string().min(10, "Content too short"),
        icon: z.string().optional(),
        color: z.string().optional(),
        order: z.number().int().optional()
    })
});

export const updateRuleSchema = z.object({
    body: z.object({
        category: z.string().optional(),
        title: z.string().min(3).optional(),
        content: z.string().min(10).optional(),
        icon: z.string().optional(),
        color: z.string().optional(),
        order: z.number().int().optional()
    })
});

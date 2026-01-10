import { z } from 'zod';

export const createPollSchema = z.object({
    body: z.object({
        question: z.string().min(5, "Question too short").max(255),
        description: z.string().max(500).optional(),
        options: z.array(z.object({
            text: z.string().min(1, "Option text cannot be empty"),
        })).min(2, "At least two options are required"),
        expires_at: z.string().datetime().optional()
    })
});

export const votePollSchema = z.object({
    body: z.object({
        pollId: z.union([z.string(), z.number()]),
        optionId: z.union([z.string(), z.number()])
    })
});

export const updatePollSchema = z.object({
    body: z.object({
        question: z.string().min(5).max(255).optional(),
        description: z.string().max(500).optional(),
        active: z.boolean().optional()
    })
});

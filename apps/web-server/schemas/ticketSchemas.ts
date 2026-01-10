import { z } from 'zod';

export const createTicketSchema = z.object({
    body: z.object({
        title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title too long"),
        description: z.string().min(20, "Please provide more detail (min 20 chars)").max(2000),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        category: z.enum(['general', 'bug', 'report', 'billing', 'other']).optional()
    }),
});

export const addTicketMessageSchema = z.object({
    body: z.object({
        message: z.string().min(1, "Message cannot be empty").max(1000),
    }),
});

export const updateTicketStatusSchema = z.object({
    body: z.object({
        status: z.enum(['open', 'closed', 'in_progress']),
    }),
});
export const banUserSchema = z.object({
    body: z.object({
        userId: z.string().uuid("Invalid User ID"),
        reason: z.string().min(5, "Reason too short").max(500),
    }),
});

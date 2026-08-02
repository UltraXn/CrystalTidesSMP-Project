import { z } from 'zod';

export const createTicketSchema = z.object({
    body: z.object({
        title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title too long"),
        description: z.string().min(20, "Please provide more detail (min 20 chars)").max(2000),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
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
        status: z.enum(['open', 'closed', 'pending', 'resolved']),
    }),
});
export const banUserSchema = z.object({
    body: z.object({
        username: z.string().regex(/^[A-Za-z0-9_]{3,16}$/, "Invalid Minecraft username"),
        // No command separators or control chars allowed (defense in depth with controller sanitize)
        reason: z.string().min(5, "Reason too short").max(500)
            // eslint-disable-next-line no-control-regex -- intentionally rejecting control chars
            .regex(/^[^;&|`\\\r\n\x00-\x1F]*$/, "Reason contains forbidden characters"),
    }),
});

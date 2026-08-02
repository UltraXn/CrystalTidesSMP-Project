import { z } from 'zod';

/** POST /api/staff/tasks */
export const createTaskSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
        priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
        type: z.enum(['General', 'Bug', 'Feature', 'Design', 'Content', 'DevOps']).optional(),
        assignee: z.string().max(100).optional(),
        column_id: z.string().max(50).optional(),
        date: z.string().max(50).optional(),
        due_date: z.string().nullable().optional(),
        end_date: z.string().nullable().optional(),
    }),
});

/** PUT /api/staff/tasks/:id */
export const updateTaskSchema = z.object({
    params: z.object({
        id: z.string().min(1),
    }),
    body: z.object({
        title: z.string().min(1).max(200).optional(),
        priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
        type: z.enum(['General', 'Bug', 'Feature', 'Design', 'Content', 'DevOps']).optional(),
        assignee: z.string().max(100).optional(),
        column_id: z.string().max(50).optional(),
        date: z.string().max(50).optional(),
        due_date: z.string().nullable().optional(),
        end_date: z.string().nullable().optional(),
    }).refine(obj => Object.keys(obj).length > 0, { message: 'At least one field must be provided' }),
});

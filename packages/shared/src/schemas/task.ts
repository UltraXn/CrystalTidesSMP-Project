import { z } from 'zod';

export const taskPrioritySchema = z.enum(['Low', 'Medium', 'High', 'Urgent']);
export const taskTypeSchema = z.enum(['General', 'Bug', 'Feature', 'Design', 'Content', 'DevOps']);

export const createTaskPayloadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  priority: taskPrioritySchema.optional(),
  type: taskTypeSchema.optional(),
  assignee: z.string().max(100).optional(),
  column_id: z.string().max(50).optional(),
  date: z.string().max(50).optional(),
  due_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
});

export const updateTaskPayloadSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    priority: taskPrioritySchema.optional(),
    type: taskTypeSchema.optional(),
    assignee: z.string().max(100).optional(),
    column_id: z.string().max(50).optional(),
    date: z.string().max(50).optional(),
    due_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: 'At least one field must be provided' });

// Express route wrapper schemas
export const createTaskSchema = z.object({
  body: createTaskPayloadSchema,
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: updateTaskPayloadSchema,
});

export type TaskPriorityType = z.infer<typeof taskPrioritySchema>;
export type TaskType = z.infer<typeof taskTypeSchema>;
export type CreateTaskPayload = z.infer<typeof createTaskPayloadSchema>;
export type UpdateTaskPayload = z.infer<typeof updateTaskPayloadSchema>;

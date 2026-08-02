import { z } from 'zod';

export const createEventSchema = z.object({
    body: z.object({
        title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
        description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
        start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, "Formato de fecha de inicio inválido"),
        end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, "Formato de fecha de fin inválido").optional(),
        location: z.string().optional(),
        image_url: z.url().optional(),
        max_participants: z.number().int().positive().optional()
    })
});

export const updateEventSchema = z.object({
    params: z.object({
        id: z.string()
    }),
    body: z.object({
        title: z.string().min(3).optional(),
        description: z.string().min(10).optional(),
        start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).optional(),
        end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).optional(),
        location: z.string().optional(),
        image_url: z.url().optional(),
        max_participants: z.number().int().positive().optional()
    })
});

export const registerEventSchema = z.object({
    params: z.object({
        id: z.string()
    })
});

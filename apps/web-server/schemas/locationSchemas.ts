import { z } from 'zod';

/** POST /api/locations */
export const createLocationSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
        description: z.string().min(1, 'Description is required').max(500),
        long_description: z.string().min(1, 'Long description is required').max(5000),
        coords: z.string().max(100).optional(),
        image_url: z.string().url('Invalid image URL').nullable().optional(),
        is_coming_soon: z.boolean().optional(),
        authors: z.array(z.string().max(50)).optional(),
        sort_order: z.number().int().min(0).optional(),
    }),
});

/** PUT /api/locations/:id */
export const updateLocationSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, 'Invalid location ID'),
    }),
    body: z.object({
        title: z.string().min(1).max(100).optional(),
        description: z.string().min(1).max(500).optional(),
        long_description: z.string().min(1).max(5000).optional(),
        coords: z.string().max(100).optional(),
        image_url: z.string().url().nullable().optional(),
        is_coming_soon: z.boolean().optional(),
        authors: z.array(z.string().max(50)).optional(),
        sort_order: z.number().int().min(0).optional(),
    }).refine(obj => Object.keys(obj).length > 0, { message: 'At least one field must be provided' }),
});

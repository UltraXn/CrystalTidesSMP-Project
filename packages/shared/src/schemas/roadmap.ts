import { z } from 'zod';

export const ROADMAP_MAX_DAYS = 30;

export const roadmapDayConfigSchema = z.object({
  // Some deployments key the table by a surrogate id; keep it so upserts update in place.
  id: z.union([z.number().int().positive(), z.string().uuid()]).optional(),
  day: z.number().int().min(1).max(ROADMAP_MAX_DAYS),
  title: z.string().trim().min(1).max(100),
  reward_type: z.enum(['killucoins', 'gacha_spin', 'achievement']),
  reward_value: z.number().int().min(0).max(10_000),
  multiplier: z.number().positive().max(100).nullable().optional(),
  is_jackpot: z.boolean().nullable().optional(),
});

export const updateRoadmapConfigPayloadSchema = z.object({
  days: z
    .array(roadmapDayConfigSchema)
    .min(1)
    .max(ROADMAP_MAX_DAYS)
    .refine((days) => new Set(days.map((d) => d.day)).size === days.length, {
      message: 'Each day can only appear once',
    }),
});

export const updateRoadmapConfigSchema = z.object({
  body: updateRoadmapConfigPayloadSchema,
});

export type RoadmapDayConfigPayload = z.infer<typeof roadmapDayConfigSchema>;
export type UpdateRoadmapConfigPayload = z.infer<typeof updateRoadmapConfigPayloadSchema>;

import { z } from 'zod';

export const verifyLinkCodePayloadSchema = z.object({
  code: z
    .string()
    .length(6, 'Pin must be exactly 6 characters')
    .regex(/^\d+$/, 'Pin must be numeric'),
  userId: z.string().uuid().optional(),
});

export const getSkinParamsSchema = z.object({
  username: z.string().min(3).max(16).regex(/^\w+$/, 'Invalid Minecraft username'),
});

// Express route wrapper schemas
export const verifyLinkCodeSchema = z.object({
  body: verifyLinkCodePayloadSchema,
});

export const getSkinSchema = z.object({
  params: getSkinParamsSchema,
});

export type VerifyLinkCodePayload = z.infer<typeof verifyLinkCodePayloadSchema>;
export type GetSkinParams = z.infer<typeof getSkinParamsSchema>;

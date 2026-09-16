import { z } from 'zod';

export const linkDiscordPayloadSchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
});

export const linkDiscordSchema = z.object({
  body: linkDiscordPayloadSchema,
});

export type LinkDiscordPayload = z.infer<typeof linkDiscordPayloadSchema>;

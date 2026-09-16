import { z } from 'zod';

export const queueCommandPayloadSchema = z.object({
  command: z
    .string()
    .min(1, 'Command cannot be empty')
    .max(500, 'Command too long (max 500 chars)')
    // eslint-disable-next-line no-control-regex -- reject control characters
    .regex(/^[^\x00-\x08\x0E-\x1F]*$/, 'Command contains forbidden control characters'),
});

export const queueCommandSchema = z.object({
  body: queueCommandPayloadSchema,
});

export type QueueCommandPayload = z.infer<typeof queueCommandPayloadSchema>;

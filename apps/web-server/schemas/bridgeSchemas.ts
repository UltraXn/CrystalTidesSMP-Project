import { z } from 'zod';

/**
 * POST /api/bridge/queue
 * Validates the command string before it reaches the whitelisting logic.
 * Defence-in-depth: the controller already normalizes and restricts commands,
 * but this catches completely empty or oversized payloads early.
 */
export const queueCommandSchema = z.object({
    body: z.object({
        command: z.string()
            .min(1, 'Command cannot be empty')
            .max(500, 'Command too long (max 500 chars)')
            // eslint-disable-next-line no-control-regex -- reject control characters
            .regex(/^[^\x00-\x08\x0E-\x1F]*$/, 'Command contains forbidden control characters'),
    }),
});

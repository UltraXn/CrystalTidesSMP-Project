import { z } from 'zod';

export const updateSettingPayloadSchema = z.object({
  value: z.any(),
});

export const updateSettingSchema = z.object({
  body: updateSettingPayloadSchema,
});

export type UpdateSettingPayload = z.infer<typeof updateSettingPayloadSchema>;

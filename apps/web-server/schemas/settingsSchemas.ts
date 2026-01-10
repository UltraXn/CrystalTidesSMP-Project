import { z } from 'zod';

export const updateSettingSchema = z.object({
    body: z.object({
        value: z.union([z.string(), z.number(), z.boolean(), z.record(z.any()), z.array(z.any())])
    })
});

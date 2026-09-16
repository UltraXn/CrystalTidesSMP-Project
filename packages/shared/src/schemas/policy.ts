import { z } from 'zod';

export const updatePolicyPayloadSchema = z.object({
  title: z.string().min(1, 'Spanish title is required'),
  content: z.string().min(1, 'Spanish content is required'),
  title_en: z.string().optional(),
  content_en: z.string().optional(),
});

export const policySchemas = {
  updatePolicy: z.object({
    body: updatePolicyPayloadSchema,
  }),
};

export type UpdatePolicyPayload = z.infer<typeof updatePolicyPayloadSchema>;

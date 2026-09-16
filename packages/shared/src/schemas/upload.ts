import { z } from 'zod';

export const uploadImagePayloadSchema = z.object({
  bucket: z.string().min(1, 'Bucket name is required').max(50, 'Bucket name too long'),
  folder: z
    .string()
    .max(100, 'Folder path too long')
    .regex(/^[a-zA-Z0-9_\-/]*$/, 'Folder contains invalid characters')
    .optional(),
});

export const uploadImageSchema = z.object({
  body: uploadImagePayloadSchema,
});

export type UploadImagePayload = z.infer<typeof uploadImagePayloadSchema>;

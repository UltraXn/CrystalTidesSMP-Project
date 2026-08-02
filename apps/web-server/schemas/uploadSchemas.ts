import { z } from 'zod';

/** POST /api/uploads/image – validates the text fields (bucket, folder).
 *  The file itself is validated by multer (size/mimetype) and the service (magic bytes). */
export const uploadImageSchema = z.object({
    body: z.object({
        bucket: z.string().min(1, 'Bucket name is required').max(50, 'Bucket name too long'),
        folder: z.string().max(100, 'Folder path too long')
            .regex(/^[a-zA-Z0-9_\-/]*$/, 'Folder contains invalid characters')
            .optional(),
    }),
});

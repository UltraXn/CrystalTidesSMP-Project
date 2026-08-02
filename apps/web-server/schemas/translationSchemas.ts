import { z } from 'zod';

export const translateSchema = z.object({
    body: z.object({
        // Hard cap to prevent Gemini API quota exhaustion
        text: z.string().min(1, "Text is required").max(2000, "Text too long (max 2000 chars)"),
        targetLang: z.string().regex(/^[a-z]{2}(-[a-zA-Z]{2})?$/, "Invalid language code").optional(),
    }),
});

import { z } from 'zod';

export const DonationSchema = z.object({
    id: z.number(),
    amount: z.number(),
    currency: z.string(),
    from_name: z.string(),
    message: z.string(),
    is_public: z.boolean(),
    buyer_email: z.string().optional(),
    created_at: z.string(),
});

export type Donation = z.infer<typeof DonationSchema>;

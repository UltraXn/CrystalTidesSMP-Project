import { z } from 'zod';

const donationNameSchema = z.string().trim().min(1, 'Donor name is required');
const currencySchema = z.string().trim().length(3, 'Currency must have 3 characters (e.g. USD)');
const statusSchema = z.enum(['pending', 'completed', 'cancelled', 'refunded']);

export const createDonationSchema = z.object({
    body: z
        .object({
            from_name: donationNameSchema.optional(),
            donor_name: donationNameSchema.optional(),
            amount: z.coerce.number().positive('Amount must be positive'),
            currency: currencySchema.optional(),
            message: z.string().optional(),
            is_public: z.boolean().optional(),
            buyer_email: z.string().email().optional().or(z.literal('')),
            email: z.string().email().optional().or(z.literal('')),
            type: z.string().optional(),
            source: z.string().optional(),
            status: statusSchema.optional()
        })
        .refine((body) => Boolean(body.from_name || body.donor_name), {
            message: 'Donor name is required',
            path: ['from_name']
        })
});

export const updateDonationSchema = z.object({
    params: z.object({
        id: z.string()
    }),
    body: z.object({
        from_name: donationNameSchema.optional(),
        donor_name: donationNameSchema.optional(),
        amount: z.coerce.number().positive().optional(),
        currency: currencySchema.optional(),
        type: z.string().optional(),
        source: z.string().optional(),
        message: z.string().optional(),
        is_public: z.boolean().optional(),
        buyer_email: z.string().email().optional().or(z.literal('')),
        email: z.string().email().optional().or(z.literal('')),
        status: statusSchema.optional()
    })
});

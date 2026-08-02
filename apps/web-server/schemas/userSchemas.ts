import { z } from 'zod';


export const updateUserMetadataSchema = z.object({
    body: z.object({
        metadata: z.object({
            medals: z.array(z.number()).optional(),
            achievements: z.array(z.union([z.string(), z.number()])).optional(),
        })
    })
});

export const updateUserRoleSchema = z.object({
    body: z.object({
        role: z.string().min(1, "Role is required")
    })
});

export const voteKarmaSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid target user ID")
    })
});

export const profileSchema = z.object({
    params: z.object({
        username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_\-\s]+$/, 'Invalid username format').optional(),
    }),
});

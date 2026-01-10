import { z } from 'zod';

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "Invalid email address" }),
        password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
    }),
});

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "Invalid email address" }),
        password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
        username: z.string().min(3, { message: "Username must be at least 3 characters long" }).max(20),
        minecraft_nick: z.string().optional(),
    }),
});

export const updateUserSchema = z.object({
    body: z.object({
        full_name: z.string().optional(),
        username: z.string().min(3).max(20).optional(),
        minecraft_nick: z.string().optional(),
        bio: z.string().max(500).optional(),
        avatar_preference: z.enum(['minecraft', 'discord']).optional(),
        profile_banner_url: z.string().url().optional().or(z.literal('')),
        social_discord: z.string().optional(),
        social_twitter: z.string().url().optional().or(z.literal('')),
        social_twitch: z.string().url().optional().or(z.literal('')),
        social_youtube: z.string().url().optional().or(z.literal('')),
        social_kofi: z.string().url().optional().or(z.literal('')),
        public_stats: z.boolean().optional(),
    }),
});

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

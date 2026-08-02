import { z } from 'zod';

export const loginSchema = z.object({
    email: z.email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

export const registerSchema = z.object({
    email: z.email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
    username: z.string().min(3, { message: "Username must be at least 3 characters long" }).max(20, "Username too long"),
    minecraft_nick: z.string().optional(),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export const updateUserSchema = z.object({
    full_name: z.string().optional(),
    username: z.string().min(3).max(20).optional(),
    minecraft_nick: z.string().optional(),
    bio: z.string().max(500).optional(),
    social_discord: z.string().optional(),
    social_twitter: z.string().optional(),
    social_twitch: z.string().optional(),
    social_youtube: z.string().optional(),
    social_kofi: z.string().optional(),
    avatar_preference: z.enum(['minecraft', 'social']).optional(),
    profile_banner_url: z.string().optional(),
    status_message: z.string().max(100).optional(),
    notify_events: z.boolean().optional(),
    notify_mentions: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

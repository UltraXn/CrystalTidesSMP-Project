import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        email: z.string().regex(/^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/, "Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password too long"),
        username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username too long").regex(/^\w+$/, "Username can only contain letters, numbers and underscores"),
        website: z.string().optional(), // Honeypot field for bot detection
        confirm_email: z.string().optional(), // Form honeypot field for bot detection
        turnstileToken: z.string().optional() // Cloudflare Turnstile token
    })
});

export const verify2FASchema = z.object({
    body: z.object({
        token: z.string().length(6, "The token must be 6 digits long").regex(/^\d+$/, "The token must contain only digits")
    })
});

export const enable2FASchema = z.object({
    body: z.object({
        token: z.string().length(6, "The token must be 6 digits long").regex(/^\d+$/, "The token must contain only digits"),
        secret: z.string().min(16, "Secret is invalid")
    })
});


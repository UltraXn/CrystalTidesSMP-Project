import { Request, Response } from 'express';
import supabase from '../config/supabaseClient.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

/**
 * Public User Registration
 * Protected by sensitiveActionLimiter in app.ts and Honeypot field verification.
 */
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { email, password, username, website, turnstileToken } = req.body;

        // Honeypot defense against automated bot scripts
        if (website && typeof website === 'string' && website.trim() !== '') {
            return sendSuccess(res, { message: 'User registered successfully' }, 'Registration successful');
        }

        // Verify Cloudflare Turnstile token if TURNSTILE_SECRET_KEY is configured
        if (process.env.TURNSTILE_SECRET_KEY && process.env.NODE_ENV !== 'test') {
            if (!turnstileToken) {
                return sendError(res, 'Antibot verification token missing', 'CAPTCHA_REQUIRED', 400);
            }

            const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    secret: process.env.TURNSTILE_SECRET_KEY,
                    response: turnstileToken,
                    remoteip: req.ip || ''
                })
            });

            const outcome = (await verifyRes.json()) as { success: boolean };
            if (!outcome.success) {
                return sendError(res, 'Antibot verification failed', 'CAPTCHA_FAILED', 400);
            }
        }

        // Create user via Supabase Admin API
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            user_metadata: { username },
            email_confirm: true
        });

        if (error) {
            return sendError(res, error.message, 'REGISTRATION_FAILED', 400);
        }

        return sendSuccess(res, { userId: data.user?.id }, 'User registered successfully');
    } catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Registration failed', 'SERVER_ERROR', 500);
    }
};


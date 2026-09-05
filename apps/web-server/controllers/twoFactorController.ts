import { Request, Response } from 'express';
import { z } from 'zod';
import * as twoFactorService from '../services/twoFactorService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import supabase from '../config/supabaseClient.js';

const Enable2FASchema = z.object({
    token: z.string().min(6, 'Token must be at least 6 digits').max(8),
    secret: z.string().min(16, 'Invalid secret length').max(64)
});

const Verify2FASchema = z.object({
    token: z.string().min(6, 'Token must be at least 6 digits').max(8)
});

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email?: string;
        username: string;
        role: string;
    };
}

// Setup - Generate Secret & QR (Protected by AuthenticateToken)
export const setup2FA = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthenticatedRequest).user;
        if (!user) return sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);

        const { otpauth_url, base32 } = twoFactorService.generateSecret(user.email || 'user');
        const qrCode = await twoFactorService.generateQRCode(otpauth_url!);

        // Return secret (base32) so frontend can use it if QR fails, and current state
        return sendSuccess(res, { secret: base32, qrCode }, '2FA Setup initiated');
    } catch (error) {
         return sendError(res, error instanceof Error ? error.message : 'Setup failed');
    }
};

// Enable - Verify token & Save Secret (Protected by AuthenticateToken)
export const enable2FA = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthenticatedRequest).user;
        if (!user) return sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
        
        const parseResult = Enable2FASchema.safeParse(req.body);
        if (!parseResult.success) {
            return sendError(res, parseResult.error.issues[0]?.message || 'Invalid 2FA data', 'VALIDATION_ERROR', 400);
        }

        const { token, secret } = parseResult.data;

        const verified = twoFactorService.verifyToken(token, secret);
        if (!verified) return sendError(res, 'Invalid Token', 'INVALID_TOKEN', 400);

        await twoFactorService.updateUser2FARecord(user.id, secret, true);
        
        return sendSuccess(res, { enabled: true }, '2FA Enabled Successfully');
    } catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Enable failed');
    }
};

// Disable (Protected by AuthenticateToken)
export const disable2FA = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthenticatedRequest).user;
        if (!user) return sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);
       
        await twoFactorService.updateUser2FARecord(user.id, null, false);
        return sendSuccess(res, { enabled: false }, '2FA Disabled');
    } catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Disable failed');
    }
};

// Verify - For Admin Access (Protected by AuthenticateToken)
export const verify2FA = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthenticatedRequest).user;
        if (!user) return sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);

        const parseResult = Verify2FASchema.safeParse(req.body);
        if (!parseResult.success) {
            return sendError(res, parseResult.error.issues[0]?.message || 'Invalid token format', 'VALIDATION_ERROR', 400);
        }

        const { token } = parseResult.data; // TOTP code

        // Fetch user's stored secret from Supabase Admin (app_metadata)
        const { data: { user: fullUser }, error } = await supabase.auth.admin.getUserById(user.id);

        if (error || !fullUser) return sendError(res, 'User fetch failed', 'SERVER_ERROR', 500);

        const secret = fullUser.app_metadata?.two_factor_secret;
        const enabled = fullUser.app_metadata?.two_factor_enabled;

        if (!enabled || !secret) {
            return sendError(res, '2FA is not enabled for this account', '2FA_NOT_ENABLED', 403);
        }

        const verified = twoFactorService.verifyToken(token, secret);
        if (!verified) return sendError(res, 'Invalid 2FA Code', 'INVALID_TOKEN', 400);

        // Success -> Generate Admin Token
        const adminToken = twoFactorService.signAdminToken(user.id, user.role);

        // Security: Store 2FA verification session in HttpOnly + Signed cookie (inaccessible to JS / XSS + HMAC tampering protection)
        res.cookie('admin_2fa_token', adminToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
            signed: true
        });

        return sendSuccess(res, { adminToken }, 'Verified');
    } catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Verification failed');
    }
};

// Clear 2FA Session Cookie
export const clear2FA = async (req: Request, res: Response) => {
    res.clearCookie('admin_2fa_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        signed: true
    });
    return sendSuccess(res, null, '2FA Session cleared');
};

// Check Status - Returns if 2FA is enabled
export const get2FAStatus = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthenticatedRequest).user;
        if (!user) return sendError(res, 'User not authenticated', 'UNAUTHORIZED', 401);

        const { data: { user: fullUser }, error } = await supabase.auth.admin.getUserById(user.id);
        if (error || !fullUser) throw error;

        return sendSuccess(res, { 
            enabled: !!fullUser.app_metadata?.two_factor_enabled 
        }, 'Status fetched');
    } catch (error) {
        return sendError(res, error instanceof Error ? error.message : 'Status check failed');
    }
};

import { Request, Response, NextFunction } from 'express';
import supabase from '../config/supabaseClient.js';
import { sendError } from '../utils/responseHandler.js';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return sendError(res, 'No authentication token provided', 'AUTH_ERROR', 401, undefined, req);

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('Auth error:', error);
            return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401, error, req);
        }

        // Fetch profile to get real username
        const { data: profile } = await supabase
            .from('profiles')
            .select('username, role, avatar_url')
            .eq('id', user.id)
            .single();

        // Map Supabase user to req.user for consistency
        req.user = {
            id: user.id,
            email: user.email,
            username: profile?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
            role: profile?.role || user.user_metadata?.role || 'user',
            avatar_url: profile?.avatar_url || '',
            app_metadata: user.app_metadata
        };

        next();
    } catch (err) {
        console.error('Unexpected auth error:', err);
        return sendError(res, 'Auth failed', 'AUTH_UNEXPECTED', 403, err, req);
    }
};

export const require2FA = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return sendError(res, 'Authentication required', 'AUTH_REQUIRED', 401, null, req);

    // 2FA Check
    const is2FAEnabled = user.app_metadata?.two_factor_enabled;
    if (is2FAEnabled) {
        const adminToken = req.headers['x-admin-token'] as string;
        
        if (!adminToken) {
             return sendError(res, '2FA Verification Required', '2FA_REQUIRED', 403, null, req);
        }

        const twoFactorService = await import('../services/twoFactorService.js');
        
        const payload = twoFactorService.verifyAdminToken(adminToken);
        if (!payload || payload.sub !== user.id) {
             return sendError(res, 'Invalid or Expired 2FA Session', '2FA_REQUIRED', 403, null, req);
        }
    }

    next();
};

/**
 * Optional authentication: Populates req.user if a valid token is present,
 * but DOES NOT fail if the token is missing or invalid.
 */
export const optionalAuthenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (!error && user) {
            // Fetch profile for real role/username
            const { data: profile } = await supabase
                .from('profiles')
                .select('username, role, avatar_url')
                .eq('id', user.id)
                .single();

            req.user = {
                id: user.id,
                email: user.email,
                username: profile?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
                role: profile?.role || user.user_metadata?.role || 'user',
                avatar_url: profile?.avatar_url || '',
                app_metadata: user.app_metadata
            };
        }
        next();
    } catch {
        // Silently continue for optional auth
        next();
    }
};

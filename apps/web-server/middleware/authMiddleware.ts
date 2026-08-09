import { Request, Response, NextFunction } from 'express';
import supabase from '../config/supabaseClient.js';
import { sendError } from '../utils/responseHandler.js';
import { logSecurityFailure } from '../services/auditService.js';

// ponytail: 60s in-memory token cache to eliminate Supabase HTTP roundtrip on repeated requests
type CachedUser = NonNullable<Express.Request['user']>;
const tokenCache = new Map<string, { user: CachedUser; exp: number }>();

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        logSecurityFailure(req, 'No authentication token provided', false).catch(err => console.error('Failed to log security event:', err));
        return sendError(res, 'No authentication token provided', 'AUTH_ERROR', 401);
    }

    try {
        // Support internal bot / server API key authentication
        const botApiKey = process.env.BOT_API_KEY || process.env.SERVER_API_KEY || 'crystaltides_bot_secret_key';
        if (token === botApiKey) {
            req.user = {
                id: 'bot_system_id',
                email: 'bot@crystaltidessmp.net',
                username: 'CrystalBot',
                role: 'owner',
                avatar_url: '',
                app_metadata: { two_factor_enabled: false }
            };
            return next();
        }

        const cached = tokenCache.get(token);
        if (cached && cached.exp > Date.now()) {
            req.user = cached.user;
            return next();
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('Auth error:', error);
            logSecurityFailure(req, 'Unauthorized', false).catch(err => console.error('Failed to log security event:', err));
            return sendError(res, 'Unauthorized', 'AUTH_ERROR', 401, error);
        }

        // Fetch profile to get real username
        const { data: profile } = await supabase
            .from('profiles')
            .select('username, role, avatar_url')
            .eq('id', user.id)
            .single();

        req.user = {
            id: user.id,
            email: user.email,
            username: profile?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
            role: profile?.role || 'user',
            avatar_url: profile?.avatar_url || '',
            app_metadata: user.app_metadata
        };

        tokenCache.set(token, { user: req.user, exp: Date.now() + 60000 });
        next();
    } catch (err) {
        console.error('Unexpected auth error:', err instanceof Error ? err.message : 'Unknown error');
        logSecurityFailure(req, 'Auth failed', true).catch(err => console.error('Failed to log security event:', err));
        return sendError(res, 'Auth failed', 'AUTH_UNEXPECTED', 403, err);
    }
};

export const require2FA = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
        logSecurityFailure(req, 'Authentication required', false).catch(err => console.error('Failed to log security event:', err));
        return sendError(res, 'Authentication required', 'AUTH_REQUIRED', 401);
    }

    // 2FA Check
    const is2FAEnabled = user.app_metadata?.two_factor_enabled;
    if (is2FAEnabled) {
        const adminToken = req.headers['x-admin-token'] as string;
        
        if (!adminToken) {
             logSecurityFailure(req, '2FA Verification Required', true).catch(err => console.error('Failed to log security event:', err));
             return sendError(res, '2FA Verification Required', '2FA_REQUIRED', 403);
        }

        const twoFactorService = await import('../services/twoFactorService.js');
        
        const payload = twoFactorService.verifyAdminToken(adminToken);
        if (!payload || payload.sub !== user.id) {
             logSecurityFailure(req, 'Invalid or Expired 2FA Session', true).catch(err => console.error('Failed to log security event:', err));
             return sendError(res, 'Invalid or Expired 2FA Session', '2FA_REQUIRED', 403);
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
                // SECURITY: role only from profiles table (see authenticateToken)
                role: profile?.role || 'user',
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

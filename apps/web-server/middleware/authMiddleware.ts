import { Request, Response, NextFunction } from 'express';
import supabase from '../config/supabaseClient.js';
import redis from '../config/redis.js';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('Auth error:', error);
            return res.sendStatus(403);
        }

        // Fetch profile to get real username
        const { data: profile } = await supabase
            .from('profiles')
            .select('username, role')
            .eq('id', user.id)
            .single();

        // Map Supabase user to req.user for consistency
        req.user = {
            id: user.id,
            email: user.email,
            username: profile?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
            role: profile?.role || user.user_metadata?.role || 'user',
            app_metadata: user.app_metadata
        };

        next();
    } catch (err) {
        console.error('Unexpected auth error:', err);
        res.status(403).json({ error: 'Auth failed' });
    }
};

export const require2FA = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    // 2FA Check
    const is2FAEnabled = user.app_metadata?.two_factor_enabled;
    if (is2FAEnabled) {
        const adminToken = req.headers['x-admin-token'] as string;
        
        if (!adminToken) {
             return res.status(403).json({ error: '2FA Verification Required', code: '2FA_REQUIRED' });
        }

        const twoFactorService = await import('../services/twoFactorService.js');
        
        const payload = twoFactorService.verifyAdminToken(adminToken);
        if (!payload || payload.sub !== user.id) {
             return res.status(403).json({ error: 'Invalid or Expired 2FA Session', code: '2FA_REQUIRED' });
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
            req.user = {
                id: user.id,
                email: user.email,
                username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
                role: user.user_metadata?.role || 'user'
            };
        }
        next();
    } catch {
        // Silently continue for optional auth
        next();
    }
};

import { NextFunction, Request, Response } from 'express';

// Centralized role definitions based on project requirements
// Note: These are fallbacks/constants for the server. Real levels should match app_roles table.
export const ADMIN_ROLES = ['admin', 'neroferno', 'killu', 'developer'];
export const STAFF_ROLES = [...ADMIN_ROLES, 'moderator', 'mod', 'helper', 'staff'];

/**
 * Middleware to check if the user has specific roles.
 * @param allowedRoles List of roles allowed to access the route.
 */
export const checkRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !allowedRoles.map(r => r.toLowerCase()).includes(req.user.role.toLowerCase())) {
             return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

/**
 * Middleware to check if user is at least Staff (level >= 1)
 */
export const requireStaff = (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role?.toLowerCase() || 'user';
    if (STAFF_ROLES.includes(role)) {
        return next();
    }
    return res.status(403).json({ error: 'Staff access required' });
};

/**
 * Helper for single role checks
 */
export const isAdmin = (role: string): boolean => {
    if (!role) return false;
    const level = ROLE_PRIORITY[role.toLowerCase()] || 0;
    return level >= 80;
};

export const isStaff = (role: string): boolean => {
    if (!role) return false;
    const level = ROLE_PRIORITY[role.toLowerCase()] || 0;
    return level >= 20;
};

export const ROLE_PRIORITY: Record<string, number> = {
    'neroferno': 100,
    'killu': 95,
    'developer': 90,
    'admin': 80,
    'moderator': 50,
    'mod': 50,
    'helper': 30,
    'staff': 20,
    'founder': 10,
    'donor': 5,
    'user': 0
};

export const getRolePriority = (role?: string): number => {
    if (!role) return 0;
    return ROLE_PRIORITY[role.toLowerCase()] || 0;
};


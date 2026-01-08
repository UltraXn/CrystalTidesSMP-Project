import { NextFunction, Request, Response } from 'express';

// Centralized role definitions based on project requirements
export const ADMIN_ROLES = ['admin', 'neroferno', 'killu', 'killuwu', 'developer'];
export const STAFF_ROLES = [...ADMIN_ROLES, 'moderator', 'mod', 'helper'];

/**
 * Middleware to check if the user has specific roles.
 * @param allowedRoles List of roles allowed to access the route.
 */
export const checkRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !allowedRoles.includes(req.user.role.toLowerCase())) {
             return res.status(403).json({ error: 'Insufficent permissions' });
        }
        next();
    };
};

/**
 * Helper for single role checks
 */
export const isAdmin = (role: string) => ADMIN_ROLES.includes(role);
export const isStaff = (role: string) => STAFF_ROLES.includes(role);

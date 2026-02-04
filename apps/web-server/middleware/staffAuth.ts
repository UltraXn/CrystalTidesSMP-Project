/**
 * Staff Role Authorization Middleware
 * 
 * Provides middleware functions to restrict access to staff-only routes.
 * Staff roles include: developer, moderator, admin, killu, neroferno
 * 
 * Usage in routes:
 * ```typescript
 * import { requireStaffRole } from '../middleware/staffAuth';
 * router.put('/settings/:key', requireAuth, requireStaffRole, controller.update);
 * ```
 */

import { Request, Response, NextFunction } from 'express';

// Staff role hierarchy (lowest to highest)
const STAFF_ROLES = ['developer', 'moderator', 'admin', 'killu', 'neroferno'] as const;
type StaffRole = typeof STAFF_ROLES[number];

/**
 * Middleware to require staff role for route access
 * Assumes req.user is populated by previous auth middleware
 */
export const requireStaffRole = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user; // Type assertion since we don't have full Request type
    
    if (!user) {
        return res.status(401).json({ 
            success: false,
            error: 'Authentication required' 
        });
    }

    const userRole = user.role as string;
    
    if (!STAFF_ROLES.includes(userRole as StaffRole)) {
        return res.status(403).json({ 
            success: false,
            error: 'Insufficient permissions. Staff role required.',
            required_roles: STAFF_ROLES
        });
    }

    next();
};

/**
 * Middleware to require specific minimum role level
 * @param minRole - Minimum required role (e.g., 'developer')
 */
export const requireMinRole = (minRole: StaffRole) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                error: 'Authentication required' 
            });
        }

        const userRole = user.role as string;
        const minRoleIndex = STAFF_ROLES.indexOf(minRole);
        const userRoleIndex = STAFF_ROLES.indexOf(userRole as StaffRole);

        if (userRoleIndex === -1 || userRoleIndex < minRoleIndex) {
            return res.status(403).json({ 
                success: false,
                error: `Insufficient permissions. Minimum role: ${minRole}`,
                user_role: userRole,
                required_role: minRole
            });
        }

        next();
    };
};

/**
 * Check if user has staff role (utility function)
 */
export const isStaff = (role: string): boolean => {
    return STAFF_ROLES.includes(role as StaffRole);
};

/**
 * Get role hierarchy level (higher number = higher privilege)
 */
export const getRoleLevel = (role: string): number => {
    const index = STAFF_ROLES.indexOf(role as StaffRole);
    return index === -1 ? -1 : index;
};

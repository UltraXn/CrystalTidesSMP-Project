/**
 * Role-Based Access Control Hooks and Components
 * 
 * React hooks and components for managing role-based permissions.
 * Core utilities are in rolePermissionsCore.ts to support Fast Refresh.
 */

import { useAuth } from '../context/AuthContext';
import {
    ROLES,
    STAFF_ROLES,
    PERMISSIONS,
    type Role,
    type Permission,
    getRoleLevel,
    isStaffRole,
    hasMinRole,
    hasAnyRole
} from './rolePermissionsCore';

// Re-export types and constants for convenience
export { ROLES, STAFF_ROLES, PERMISSIONS };
export type { Role, Permission };

/**
 * Hook to check if current user has staff access
 */
export const useIsStaff = (): boolean => {
    const { user } = useAuth();
    return user ? isStaffRole((user.role || '') as Role) : false;
};

/**
 * Hook to check if current user has minimum role level
 */
export const useHasMinRole = (minRole: Role): boolean => {
    const { user } = useAuth();
    return user ? hasMinRole((user.role || '') as Role, minRole) : false;
};

/**
 * Hook to check if current user has any of the specified roles
 */
export const useHasAnyRole = (allowedRoles: Role[]): boolean => {
    const { user } = useAuth();
    return user ? hasAnyRole((user.role || '') as Role, allowedRoles) : false;
};

/**
 * Hook to get current user's role level
 */
export const useRoleLevel = (): number => {
    const { user } = useAuth();
    return user ? getRoleLevel((user.role || '') as Role) : -1;
};

/**
 * Hook to check if user has a specific permission
 */
export const useHasPermission = (permission: Permission): boolean => {
    const { user } = useAuth();
    if (!user) return false;
    
const allowedRoles = PERMISSIONS[permission];
    return hasAnyRole((user.role || '') as Role, allowedRoles as readonly Role[]);
};




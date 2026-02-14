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
    isStaffRole
} from './rolePermissionsCore';

// Re-export types and constants for convenience
export { ROLES, STAFF_ROLES, PERMISSIONS };
export type { Role, Permission };

// Add Context Import
import { usePermissionsContext } from '../context/PermissionsContext';

// ... (exports remain the same)

/**
 * Hook to check if current user has staff access
 */
export const useIsStaff = (): boolean => {
    const { user } = useAuth();
    return user ? isStaffRole((user.user_metadata?.role || '') as Role) : false;
};

/**
 * Hook to check if current user has minimum role level
 */
export const useHasMinRole = (minRole: Role): boolean => {
    const { user } = useAuth();
    const { roleLevels } = usePermissionsContext();

    if (!user) return false;

    // Normalize user role to lowercase
    const userRole = (user.user_metadata?.role || '').toLowerCase();
    
    // Dynamic Level or Fallback
    const dynamicUserLevel = roleLevels[userRole];
    const userLevel = dynamicUserLevel !== undefined ? dynamicUserLevel : getRoleLevel(userRole);

    const dynamicMinLevel = roleLevels[minRole.toLowerCase()];
    const targetLevel = dynamicMinLevel !== undefined ? dynamicMinLevel : getRoleLevel(minRole);

    return userLevel >= targetLevel;
};

/**
 * Hook to check if current user has any of the specified roles
 */
export const useHasAnyRole = (allowedRoles: Role[]): boolean => {
    const { user } = useAuth();
    if (!user) return false;
    
    // Normalize user role and allowed roles for comparison
    const userRole = (user.user_metadata?.role || '').toLowerCase();
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
    return normalizedAllowed.includes(userRole);
};

/**
 * Hook to get current user's role level
 */
export const useRoleLevel = (): number => {
    const { user } = useAuth();
    const { roleLevels } = usePermissionsContext();

    if (!user) return -1;
    
    const userRole = (user.user_metadata?.role || '').toLowerCase();
    const dynamicLevel = roleLevels[userRole];
    
    return dynamicLevel !== undefined ? dynamicLevel : getRoleLevel(userRole);
};

/**
 * Hook to check if user has a specific permission
 */
export const useHasPermission = (permission: Permission): boolean => {
    const { user } = useAuth();
    const { permissionRequirements, roleLevels } = usePermissionsContext();

    if (!user) return false;
    
    const userRole = (user.user_metadata?.role || '').toLowerCase();

    // 1. Determine User Level (Dynamic -> Fallback)
    const dynamicUserLevel = roleLevels[userRole];
    const userLevel = dynamicUserLevel !== undefined ? dynamicUserLevel : getRoleLevel(userRole);

    // 2. Determine Required Level
    let minLevel = 999;
    
    // Check Dynamic Permission Map first
    if (permissionRequirements[permission] !== undefined) {
        minLevel = permissionRequirements[permission];
    } else {
        // Fallback to PERMISSIONS array from core
        const allowedRoles = PERMISSIONS[permission] as readonly Role[];
        if (allowedRoles) {
            const validLevels = allowedRoles.map(r => {
                const normalizedR = r.toLowerCase();
                const l = roleLevels[normalizedR];
                return l !== undefined ? l : getRoleLevel(normalizedR);
            }).filter(l => l >= 0);
            
            if (validLevels.length > 0) {
                minLevel = Math.min(...validLevels);
            }
        }
    }

    return userLevel >= minLevel;
};




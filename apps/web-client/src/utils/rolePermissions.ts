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
    hasAnyRole
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
    const { roleLevels } = usePermissionsContext(); // Get dynamic levels

    if (!user) return false;

    const userRole = (user.user_metadata?.role || '') as Role;
    
    // Dynamic Level or Fallback
    const dynamicUserLevel = roleLevels[userRole];
    const userLevel = dynamicUserLevel !== undefined ? dynamicUserLevel : getRoleLevel(userRole);

    const dynamicMinLevel = roleLevels[minRole];
    const targetLevel = dynamicMinLevel !== undefined ? dynamicMinLevel : getRoleLevel(minRole);

    return userLevel >= targetLevel;
};

/**
 * Hook to check if current user has any of the specified roles
 */
export const useHasAnyRole = (allowedRoles: Role[]): boolean => {
    const { user } = useAuth();
    return user ? hasAnyRole((user.user_metadata?.role || '') as Role, allowedRoles) : false;
};

/**
 * Hook to get current user's role level
 */
export const useRoleLevel = (): number => {
    const { user } = useAuth();
    const { roleLevels } = usePermissionsContext();

    if (!user) return -1;
    
    const userRole = (user.user_metadata?.role || '') as Role;
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
    
    const userRole = (user.user_metadata?.role || '') as Role;

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
            // Calculate min level based on the hardcoded allowed roles
            // We use the *current* role levels (dynamic or static) to check the allowed roles
            const validLevels = allowedRoles.map(r => {
                const l = roleLevels[r];
                return l !== undefined ? l : getRoleLevel(r);
            }).filter(l => l >= 0);
            
            if (validLevels.length > 0) {
                minLevel = Math.min(...validLevels);
            }
        }
    }

    return userLevel >= minLevel;
};




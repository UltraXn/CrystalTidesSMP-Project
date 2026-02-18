import { useAuth } from '../context/AuthContext';
import {
    ROLES,
    STAFF_ROLES,
    PERMISSIONS,
    type Role,
    type Permission,
    getRoleLevel,
} from './rolePermissionsCore';

export { ROLES, STAFF_ROLES, PERMISSIONS };
export type { Role, Permission };

import { usePermissionsContext } from '../context/PermissionsContext';

export const useHasMinRole = (minRole: Role): boolean => {
    const { user } = useAuth();
    const { roleLevels } = usePermissionsContext();

    if (!user) return false;

    const userRole = (user.user_metadata?.role || '').toLowerCase();
    
    const dynamicUserLevel = roleLevels[userRole];
    const userLevel = dynamicUserLevel !== undefined ? dynamicUserLevel : getRoleLevel(userRole);

    const dynamicMinLevel = roleLevels[minRole.toLowerCase()];
    const targetLevel = dynamicMinLevel !== undefined ? dynamicMinLevel : getRoleLevel(minRole);

    return userLevel >= targetLevel;
};

export const useHasPermission = (permission: Permission): boolean => {
    const { user } = useAuth();
    const { permissionRequirements, roleLevels } = usePermissionsContext();

    if (!user) return false;
    
    const userRole = (user.user_metadata?.role || '').toLowerCase();

    const dynamicUserLevel = roleLevels[userRole];
    const userLevel = dynamicUserLevel !== undefined ? dynamicUserLevel : getRoleLevel(userRole);

    let minLevel = 999;
    
    if (permissionRequirements[permission] !== undefined) {
        minLevel = permissionRequirements[permission];
    } else {
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

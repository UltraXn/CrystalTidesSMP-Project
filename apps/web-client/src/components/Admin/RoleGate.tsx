import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
    type Role, 
    type Permission, 
    PERMISSIONS, 
    hasAnyRole, 
    hasMinRole,
    getRoleLevel
} from '../../utils/rolePermissionsCore';

interface RoleGateProps {
    children: React.ReactNode;
    minRole?: Role;
    allowedRoles?: Role[];
    permission?: Permission;
    fallback?: React.ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({ 
    children, 
    minRole, 
    allowedRoles, 
    permission,
    fallback = null 
}) => {
    const { user } = useAuth();
    
    if (!user) return <>{fallback}</>;
    
    let hasAccess = false;
    const userRole = (user.user_metadata?.role || '') as Role;
    
    if (permission) {
        // HIERARCHICAL CHECK for Permissions
        const allowedRoles = PERMISSIONS[permission] as readonly Role[];
        const validLevels = allowedRoles.map(r => getRoleLevel(r)).filter(l => l >= 0);
        const minLevel = validLevels.length > 0 ? Math.min(...validLevels) : 999;
        
        const userLevel = getRoleLevel(userRole);
        hasAccess = userLevel >= minLevel;
    } else if (minRole) {
        hasAccess = hasMinRole(userRole, minRole);
    } else if (allowedRoles) {
        hasAccess = hasAnyRole(userRole, allowedRoles);
    }
    
    return hasAccess ? <>{children}</> : <>{fallback}</>;
};

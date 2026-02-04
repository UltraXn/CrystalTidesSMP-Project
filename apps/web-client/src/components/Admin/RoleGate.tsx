import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
    type Role, 
    type Permission, 
    PERMISSIONS, 
    hasAnyRole, 
    hasMinRole 
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
    const userRole = (user.role || '') as Role;
    
    if (permission) {
        hasAccess = hasAnyRole(userRole, PERMISSIONS[permission] as readonly Role[]);
    } else if (minRole) {
        hasAccess = hasMinRole(userRole, minRole);
    } else if (allowedRoles) {
        hasAccess = hasAnyRole(userRole, allowedRoles);
    }
    
    return hasAccess ? <>{children}</> : <>{fallback}</>;
};

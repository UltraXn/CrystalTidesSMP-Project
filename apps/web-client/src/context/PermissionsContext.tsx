/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';

interface PermissionsContextType {
    roleLevels: Record<string, number>;
    permissionRequirements: Record<string, number>;
    loading: boolean;
    error: string | null;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [roleLevels, setRoleLevels] = useState<Record<string, number>>({});
    const [permissionRequirements, setPermissionRequirements] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                setLoading(true);
                
                // Fetch Roles
                const { data: rolesData, error: rolesError } = await supabase
                    .from('app_roles')
                    .select('role_name, level');
                
                if (rolesError) throw rolesError;

                // Fetch Permissions
                const { data: permsData, error: permsError } = await supabase
                    .from('app_permissions')
                    .select('permission_key, min_role_level');

                if (permsError) throw permsError;

                // Process Roles (normalize to lowercase for consistent matching)
                const newRoleLevels: Record<string, number> = {};
                rolesData?.forEach((r: { role_name: string; level: number }) => {
                    newRoleLevels[r.role_name.toLowerCase()] = r.level;
                });

                // Process Permissions
                const newPermRequirements: Record<string, number> = {};
                permsData?.forEach((p: { permission_key: string; min_role_level: number }) => {
                    newPermRequirements[p.permission_key] = p.min_role_level;
                });

                setRoleLevels(newRoleLevels);
                setPermissionRequirements(newPermRequirements);
            } catch (err: unknown) {
                console.error('Failed to load permissions:', err);
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        };

        fetchPermissions();
    }, []);

    const value = useMemo(() => ({
        roleLevels,
        permissionRequirements,
        loading,
        error
    }), [roleLevels, permissionRequirements, loading, error]);

    return (
        <PermissionsContext.Provider value={value}>
            {children}
        </PermissionsContext.Provider>
    );
};

export const usePermissionsContext = () => {
    const context = useContext(PermissionsContext);
    // If context is undefined (not wrapped), we return empty objects allowing hooks to fallback
    if (context === undefined) {
        return { roleLevels: {}, permissionRequirements: {}, loading: false, error: null };
    }
    return context;
};

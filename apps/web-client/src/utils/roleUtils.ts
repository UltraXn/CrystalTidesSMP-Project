import { User } from '@supabase/supabase-js';

// Centralized role definitions based on project requirements
const ADMIN_ROLES = ['admin', 'neroferno', 'killu', 'developer', 'staff'];
const STAFF_ROLES = [...ADMIN_ROLES, 'moderator', 'mod', 'helper'];

/**
 * Extracts a role from a Supabase user object from multiple possible locations.
 * @param user The Supabase user object
 */
export const getUserRole = (user: User | null): string | null => {
    if (!user) return null;

    // Check app_metadata (preferred location for RBAC)
    if (user.app_metadata?.role && typeof user.app_metadata.role === 'string') {
        return user.app_metadata.role;
    }

    // Check user_metadata
    if (user.user_metadata?.role && typeof user.user_metadata.role === 'string') {
        return user.user_metadata.role;
    }

    // Check top-level role (if the object was extended or transformed)
    // We safely check for existence without using 'any'
    if ('role' in user && typeof (user as { role?: string }).role === 'string') {
        const topRole = (user as { role?: string }).role;
        // Skip default Supabase roles like 'authenticated' or 'anon'
        if (topRole && !['authenticated', 'anon', 'service_role'].includes(topRole)) {
            return topRole;
        }
    }

    return null;
};

/**
 * Checks if a user has one of the admin roles.
 * @param user The Supabase user object
 */
export const isAdmin = (user: User | null): boolean => {
    const role = getUserRole(user);
    return !!(role && ADMIN_ROLES.includes(role.toLowerCase()));
};

/**
 * Checks if a user has one of the staff roles.
 * @param user The Supabase user object
 */
export const isStaff = (user: User | null): boolean => {
    const role = getUserRole(user);
    return !!(role && STAFF_ROLES.includes(role.toLowerCase()));
};

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

    // Check app_metadata (authoritative, tamper-proof location for RBAC managed by server)
    if (user.app_metadata?.role && typeof user.app_metadata.role === 'string') {
        return user.app_metadata.role;
    }

    // Check user_metadata ONLY for non-privileged roles (e.g. cosmetic / custom roles).
    // Security Invariant: Privileged roles (admin/staff/helper/etc.) in user_metadata are strictly rejected
    // to prevent client-side privilege escalation via supabase.auth.updateUser({ data: { role: 'admin' } }).
    if (user.user_metadata?.role && typeof user.user_metadata.role === 'string') {
        const userMetaRole = user.user_metadata.role.toLowerCase();
        if (!STAFF_ROLES.includes(userMetaRole)) {
            return user.user_metadata.role;
        }
    }

    // Check top-level role (if the object was extended or transformed by trusted server response)
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
 * Security Invariant: Only authoritative app_metadata or trusted server-side roles are accepted.
 * @param user The Supabase user object
 */
export const isAdmin = (user: User | null): boolean => {
    const role = getUserRole(user);
    if (!role) return false;
    // Ensure the role came from app_metadata or trusted top-level, never untrusted user_metadata
    const appRole = user?.app_metadata?.role;
    const topRole = (user as { role?: string })?.role;
    const isAuthoritative = (appRole && appRole === role) || (topRole && topRole === role);
    return !!(isAuthoritative && ADMIN_ROLES.includes(role.toLowerCase()));
};

/**
 * Checks if a user has one of the staff roles.
 * Security Invariant: Only authoritative app_metadata or trusted server-side roles are accepted.
 * @param user The Supabase user object
 */
export const isStaff = (user: User | null): boolean => {
    const role = getUserRole(user);
    if (!role) return false;
    // Ensure the role came from app_metadata or trusted top-level, never untrusted user_metadata
    const appRole = user?.app_metadata?.role;
    const topRole = (user as { role?: string })?.role;
    const isAuthoritative = (appRole && appRole === role) || (topRole && topRole === role);
    return !!(isAuthoritative && STAFF_ROLES.includes(role.toLowerCase()));
};

import { User } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_ROLES: ReadonlySet<string> = new Set(['authenticated', 'anon', 'service_role']);

// Centralized role definitions based on project requirements
const ADMIN_ROLES: ReadonlySet<string> = new Set(['admin', 'neroferno', 'killu', 'developer', 'staff']);
const STAFF_EXTRA_ROLES = ['moderator', 'mod', 'helper'] as const;
const STAFF_ROLES: ReadonlySet<string> = new Set([...ADMIN_ROLES, ...STAFF_EXTRA_ROLES]);

/**
 * Extracts the role defined in app_metadata (tamper-proof RBAC managed by server).
 */
const getAppMetadataRole = (user: User): string | null => {
    const role: unknown = user.app_metadata?.role;
    return typeof role === 'string' ? role : null;
};

/**
 * Extracts non-privileged roles from user_metadata.
 * Rejects privileged roles to prevent client-side privilege escalation.
 */
const getUserMetadataRole = (user: User): string | null => {
    const role: unknown = user.user_metadata?.role;
    if (typeof role === 'string' && !STAFF_ROLES.has(role.toLowerCase())) {
        return role;
    }
    return null;
};

/**
 * Extracts top-level role if extended by a trusted server response,
 * ignoring default Supabase system roles.
 */
const getTopLevelRole = (user: User): string | null => {
    const role: unknown = user.role;
    if (typeof role === 'string' && !DEFAULT_SUPABASE_ROLES.has(role)) {
        return role;
    }
    return null;
};

/**
 * Validates whether a user's role comes from an authoritative location and matches the role set.
 */
const hasAuthoritativeRole = (user: User | null, roleSet: ReadonlySet<string>): boolean => {
    if (!user) {
        return false;
    }

    const role = getUserRole(user);
    if (!role) {
        return false;
    }

    const appRole: unknown = user.app_metadata?.role;
    const topRole: unknown = user.role;
    const isAuthoritative =
        (typeof appRole === 'string' && appRole === role) ||
        (typeof topRole === 'string' && topRole === role);

    return isAuthoritative && roleSet.has(role.toLowerCase());
};

/**
 * Extracts a role from a Supabase user object from multiple possible locations.
 * @param user The Supabase user object
 */
export const getUserRole = (user: User | null): string | null => {
    if (!user) {
        return null;
    }

    return getAppMetadataRole(user) ?? getUserMetadataRole(user) ?? getTopLevelRole(user);
};

/**
 * Checks if a user has one of the admin roles.
 * Security Invariant: Only authoritative app_metadata or trusted server-side roles are accepted.
 * @param user The Supabase user object
 */
export const isAdmin = (user: User | null): boolean => {
    return hasAuthoritativeRole(user, ADMIN_ROLES);
};

/**
 * Checks if a user has one of the staff roles.
 * Security Invariant: Only authoritative app_metadata or trusted server-side roles are accepted.
 * @param user The Supabase user object
 */
export const isStaff = (user: User | null): boolean => {
    return hasAuthoritativeRole(user, STAFF_ROLES);
};
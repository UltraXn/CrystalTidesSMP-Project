import { User } from '@supabase/supabase-js';

const ADMIN_ROLES = ['admin', 'neroferno', 'killu', 'developer', 'staff'];

export const getUserRole = (user: User | null): string | null => {
    if (!user) return null;

    if (user.app_metadata?.role && typeof user.app_metadata.role === 'string') {
        return user.app_metadata.role;
    }

    if (user.user_metadata?.role && typeof user.user_metadata.role === 'string') {
        return user.user_metadata.role;
    }

    if ('role' in user && typeof (user as { role?: string }).role === 'string') {
        const topRole = (user as { role?: string }).role;
        if (topRole && !['authenticated', 'anon', 'service_role'].includes(topRole)) {
            return topRole;
        }
    }

    return null;
};

export const isAdmin = (user: User | null): boolean => {
    const role = getUserRole(user);
    return !!(role && ADMIN_ROLES.includes(role.toLowerCase()));
};

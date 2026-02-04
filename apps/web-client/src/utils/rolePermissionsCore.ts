/**
 * Role-Based Access Control Constants and Utilities
 * 
 * Core role definitions, hierarchy, and permission mappings.
 * Separated from components to support Fast Refresh.
 */

// Role hierarchy (matches backend staffAuth.ts)
export const ROLES = {
    USER: 'user',
    MODERATOR: 'moderator',
    ADMIN: 'admin',
    DEVELOPER: 'developer',
    KILLU: 'killu',
    NEROFERNO: 'neroferno'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Staff roles (administrative access)
export const STAFF_ROLES: Role[] = [
    ROLES.MODERATOR,
    ROLES.ADMIN,
    ROLES.DEVELOPER,
    ROLES.KILLU,
    ROLES.NEROFERNO
];

// Role hierarchy levels (higher = more privileges)
const ROLE_LEVELS: Record<Role, number> = {
    [ROLES.USER]: 0,
    [ROLES.MODERATOR]: 1,
    [ROLES.ADMIN]: 2,
    [ROLES.DEVELOPER]: 3,
    [ROLES.KILLU]: 4,
    [ROLES.NEROFERNO]: 5
};

/**
 * Get the privilege level of a role
 */
export const getRoleLevel = (role: string): number => {
    return ROLE_LEVELS[role as Role] ?? -1;
};

/**
 * Check if a role is a staff role
 */
export const isStaffRole = (role: string): boolean => {
    return STAFF_ROLES.includes(role as Role);
};

/**
 * Check if user has minimum required role level
 */
export const hasMinRole = (userRole: string, minRole: Role): boolean => {
    const userLevel = getRoleLevel(userRole);
    const minLevel = getRoleLevel(minRole);
    return userLevel >= minLevel;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (userRole: string, allowedRoles: readonly Role[]): boolean => {
    return allowedRoles.includes(userRole as Role);
};

/**
 * Permission definitions for admin panel sections
 */
export const PERMISSIONS = {
    // Dashboard
    VIEW_DASHBOARD: [ROLES.MODERATOR, ROLES.ADMIN, ROLES.DEVELOPER, ROLES.KILLU, ROLES.NEROFERNO],
    
    // Users Management
    VIEW_USERS: [ROLES.MODERATOR, ROLES.ADMIN, ROLES.DEVELOPER, ROLES.KILLU, ROLES.NEROFERNO],
    EDIT_USER_ROLE: [ROLES.ADMIN, ROLES.KILLU, ROLES.NEROFERNO],
    EDIT_USER_METADATA: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.KILLU, ROLES.NEROFERNO],
    
    // Content Management
    MANAGE_NEWS: [ROLES.MODERATOR, ROLES.ADMIN, ROLES.DEVELOPER, ROLES.KILLU, ROLES.NEROFERNO],
    MANAGE_WIKI: [ROLES.MODERATOR, ROLES.ADMIN, ROLES.DEVELOPER, ROLES.KILLU, ROLES.NEROFERNO],
    MANAGE_EVENTS: [ROLES.MODERATOR, ROLES.ADMIN, ROLES.DEVELOPER, ROLES.KILLU, ROLES.NEROFERNO],
    
    // Gamification
    MANAGE_GAMIFICATION: [ROLES.DEVELOPER, ROLES.KILLU, ROLES.NEROFERNO],
    
    // Community
    MANAGE_TICKETS: [ROLES.MODERATOR, ROLES.ADMIN, ROLES.DEVELOPER, ROLES.KILLU, ROLES.NEROFERNO],
    MANAGE_SUGGESTIONS: [ROLES.MODERATOR, ROLES.ADMIN, ROLES.DEVELOPER, ROLES.KILLU, ROLES.NEROFERNO],
    MANAGE_POLLS: [ROLES.MODERATOR, ROLES.ADMIN, ROLES.DEVELOPER, ROLES.KILLU, ROLES.NEROFERNO],
    
    // Financial
    MANAGE_DONATIONS: [ROLES.ADMIN, ROLES.KILLU, ROLES.NEROFERNO],
    VIEW_DONORS: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.KILLU, ROLES.NEROFERNO],
    
    // Staff Management
    MANAGE_STAFF_CARDS: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.KILLU, ROLES.NEROFERNO],
    MANAGE_STAFF_TASKS: [ROLES.MODERATOR, ROLES.ADMIN, ROLES.DEVELOPER, ROLES.KILLU, ROLES.NEROFERNO],
    
    // Site Configuration
    MANAGE_SITE_CONFIG: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.KILLU, ROLES.NEROFERNO],
    MANAGE_MAINTENANCE: [ROLES.ADMIN, ROLES.KILLU, ROLES.NEROFERNO],
    
    // Audit & Logs
    VIEW_AUDIT_LOG: [ROLES.ADMIN, ROLES.KILLU, ROLES.NEROFERNO],
    VIEW_SYSTEM_LOGS: [ROLES.DEVELOPER, ROLES.KILLU, ROLES.NEROFERNO],
    VIEW_CONSOLE: [ROLES.NEROFERNO, ROLES.KILLU, ROLES.DEVELOPER, ROLES.ADMIN],
} as const;

export type Permission = keyof typeof PERMISSIONS;

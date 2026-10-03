export const ROLES = {
    USER: 'user',
    HELPER: 'helper',
    MODERATOR: 'moderator',
    ADMIN: 'admin',
    FOUNDER: 'founder',
    DEVELOPER: 'developer',
    KILLU: 'killu',
    NEROFERNO: 'neroferno',
    DONOR: 'donor',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const STAFF_ROLES: readonly string[] = [
    ROLES.HELPER,
    ROLES.MODERATOR,
    ROLES.ADMIN,
    ROLES.DEVELOPER,
    ROLES.KILLU,
    ROLES.NEROFERNO,
    ROLES.FOUNDER,
];

const STAFF_ROLE_SET = new Set<string>(STAFF_ROLES);

const DEFAULT_ROLE_LEVEL = -1;

const ROLE_LEVELS: Readonly<Record<string, number>> = {
    [ROLES.USER]: 0,
    [ROLES.HELPER]: 1,
    [ROLES.MODERATOR]: 2,
    [ROLES.ADMIN]: 3,
    [ROLES.FOUNDER]: 4,
    [ROLES.DEVELOPER]: 4,
    [ROLES.KILLU]: 5,
    [ROLES.NEROFERNO]: 6,
};

export const getRoleLevel = (role: string): number => {
    if (!role) {
        return DEFAULT_ROLE_LEVEL;
    }
    return ROLE_LEVELS[role.toLowerCase()] ?? DEFAULT_ROLE_LEVEL;
};

export const isStaffRole = (role: string): boolean => {
    if (!role) {
        return false;
    }
    return STAFF_ROLE_SET.has(role.toLowerCase());
};
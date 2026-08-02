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

export const STAFF_ROLES: readonly string[] = [
    ROLES.HELPER,
    ROLES.MODERATOR,
    ROLES.ADMIN,
    ROLES.DEVELOPER,
    ROLES.KILLU,
    ROLES.NEROFERNO,
    ROLES.FOUNDER,
];

const ROLE_LEVELS: Record<string, number> = {
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
    if (!role) return -1;
    const normalized = role.toLowerCase();
    return ROLE_LEVELS[normalized] !== undefined ? ROLE_LEVELS[normalized] : -1;
};

export const isStaffRole = (role: string): boolean => {
    if (!role) return false;
    const normalized = role.toLowerCase();
    return STAFF_ROLES.includes(normalized);
};

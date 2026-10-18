import { STAFF_ROLES as SHARED_STAFF_ROLES } from '@crystaltides/shared';

export const ROLES = {
  USER: 'user',
  DONOR: 'donor',
  FOUNDER: 'founder',
  HELPER: 'helper',
  STAFF: 'staff',
  MOD: 'mod',
  MODERATOR: 'moderator',
  DEVELOPER: 'developer',
  ADMIN: 'admin',
  KILLU: 'killu',
  KILLUWU: 'killuwu',
  NEROFERNO: 'neroferno',
  OWNER: 'owner',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const STAFF_ROLES: readonly string[] = SHARED_STAFF_ROLES ?? [
  ROLES.ADMIN,
  ROLES.NEROFERNO,
  ROLES.KILLU,
  ROLES.KILLUWU,
  ROLES.DEVELOPER,
  ROLES.OWNER,
  ROLES.STAFF,
  ROLES.MODERATOR,
  ROLES.MOD,
  ROLES.HELPER,
];

const STAFF_ROLE_SET = new Set<string>(STAFF_ROLES.map((r) => r.toLowerCase()));

const DEFAULT_ROLE_LEVEL = -1;

const ROLE_LEVELS: Readonly<Record<string, number>> = {
  [ROLES.USER]: 0,
  [ROLES.DONOR]: 1,
  [ROLES.FOUNDER]: 2,
  [ROLES.STAFF]: 3,
  [ROLES.HELPER]: 4,
  [ROLES.MOD]: 5,
  [ROLES.MODERATOR]: 5,
  [ROLES.ADMIN]: 6,
  [ROLES.DEVELOPER]: 7,
  [ROLES.KILLU]: 8,
  [ROLES.KILLUWU]: 8,
  [ROLES.NEROFERNO]: 9,
  [ROLES.OWNER]: 10,
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

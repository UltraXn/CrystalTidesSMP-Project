import {
  ADMIN_ROLES as SHARED_ADMIN_ROLES,
  STAFF_ROLES as SHARED_STAFF_ROLES,
} from '@crystaltides/shared';
import type { TrustedProfile } from '../context/AuthContext';

export const ADMIN_ROLES: ReadonlySet<string> = new Set(
  (SHARED_ADMIN_ROLES ?? ['admin', 'neroferno', 'killu', 'killuwu', 'developer', 'owner']).map(
    (r) => r.toLowerCase(),
  ),
);

export const STAFF_ROLES: ReadonlySet<string> = new Set(
  (SHARED_STAFF_ROLES ?? [...ADMIN_ROLES, 'staff', 'moderator', 'mod', 'helper']).map((r) =>
    r.toLowerCase(),
  ),
);

/**
 * Checks if a role string qualifies as an admin role.
 */
export const isAdminRole = (role?: string | null): boolean => {
  if (!role || typeof role !== 'string') return false;
  return ADMIN_ROLES.has(role.toLowerCase());
};

/**
 * Checks if a role string qualifies as a staff role.
 */
export const isStaffRole = (role?: string | null): boolean => {
  if (!role || typeof role !== 'string') return false;
  return STAFF_ROLES.has(role.toLowerCase());
};

type RoleBearer = TrustedProfile | { role?: string | null } | string | null | undefined;

/**
 * Extracts a trusted role string from a role bearer (profile or raw role string).
 * Security Invariant: user_metadata is never consulted here.
 */
export const getUserRole = (target: RoleBearer): string | null => {
  if (!target) return null;
  if (typeof target === 'string') return target.toLowerCase();
  if (typeof target.role === 'string') return target.role.toLowerCase();
  return null;
};

/**
 * Checks if a profile, role string, or role-bearer has admin privileges.
 */
export const isAdmin = (target: RoleBearer): boolean => {
  const role = getUserRole(target);
  return isAdminRole(role);
};

/**
 * Checks if a profile, role string, or role-bearer has staff privileges.
 */
export const isStaff = (target: RoleBearer): boolean => {
  const role = getUserRole(target);
  return isStaffRole(role);
};

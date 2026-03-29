import { describe, it, expect } from 'vitest';
import { ROLES, getRoleLevel, isStaffRole, STAFF_ROLES } from './rolePermissionsCore';

describe('rolePermissionsCore', () => {
    describe('getRoleLevel', () => {
        it('should return correct level for basic roles', () => {
            expect(getRoleLevel(ROLES.USER)).toBe(0);
            expect(getRoleLevel(ROLES.HELPER)).toBe(1);
            expect(getRoleLevel(ROLES.ADMIN)).toBe(3);
        });

        it('should return correct level for founder/developer roles', () => {
            expect(getRoleLevel(ROLES.FOUNDER)).toBe(4);
            expect(getRoleLevel(ROLES.DEVELOPER)).toBe(4);
        });

        it('should return higher levels for specialized roles', () => {
            expect(getRoleLevel(ROLES.KILLU)).toBe(5);
            expect(getRoleLevel(ROLES.NEROFERNO)).toBe(6);
        });

        it('should handle case insensitivity', () => {
            expect(getRoleLevel('ADMIN')).toBe(3);
            expect(getRoleLevel('User')).toBe(0);
            expect(getRoleLevel('mOdErAtOr')).toBe(2);
        });

        it('should return -1 for unknown roles', () => {
            expect(getRoleLevel('unknown')).toBe(-1);
            expect(getRoleLevel('')).toBe(-1);
        });
    });

    describe('isStaffRole', () => {
        it('should return true for staff roles', () => {
            expect(isStaffRole(ROLES.HELPER)).toBe(true);
            expect(isStaffRole(ROLES.MODERATOR)).toBe(true);
            expect(isStaffRole(ROLES.ADMIN)).toBe(true);
            expect(isStaffRole(ROLES.DEVELOPER)).toBe(true);
        });

        it('should return false for non-staff roles', () => {
            expect(isStaffRole(ROLES.USER)).toBe(false);
            expect(isStaffRole(ROLES.DONOR)).toBe(false);
        });

        it('should return false for unknown strings', () => {
            expect(isStaffRole('random_string')).toBe(false);
        });

        it('should contain all expected staff members', () => {
            expect(STAFF_ROLES).toContain(ROLES.HELPER);
            expect(STAFF_ROLES).toContain(ROLES.MODERATOR);
            expect(STAFF_ROLES).toContain(ROLES.ADMIN);
            expect(STAFF_ROLES).toContain(ROLES.DEVELOPER);
            expect(STAFF_ROLES).toContain(ROLES.KILLU);
            expect(STAFF_ROLES).toContain(ROLES.NEROFERNO);
        });
    });
});

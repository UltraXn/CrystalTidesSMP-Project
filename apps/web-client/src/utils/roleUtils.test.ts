import { describe, it, expect } from 'vitest';
import { getUserRole, isAdmin, isStaff } from './roleUtils';
import { User } from '@supabase/supabase-js';

describe('roleUtils', () => {
    describe('getUserRole', () => {
        it('should return null if user is null', () => {
            expect(getUserRole(null)).toBeNull();
        });

        it('should extract role from app_metadata', () => {
            const user = { app_metadata: { role: 'admin' } } as unknown as User;
            expect(getUserRole(user)).toBe('admin');
        });

        it('should extract role from user_metadata if app_metadata is missing', () => {
            const user = { app_metadata: {}, user_metadata: { role: 'moderator' } } as unknown as User;
            expect(getUserRole(user)).toBe('moderator');
        });

        it('should extract role from top-level property if metadata is missing', () => {
            const user = { app_metadata: {}, user_metadata: {}, role: 'staff' } as unknown as User;
            expect(getUserRole(user)).toBe('staff');
        });

        it('should ignore default Supabase roles at top-level', () => {
            const user = { app_metadata: {}, user_metadata: {}, role: 'authenticated' } as unknown as User;
            expect(getUserRole(user)).toBeNull();
        });

        it('should return null if no role is found', () => {
            const user = { app_metadata: {}, user_metadata: {} } as unknown as User;
            expect(getUserRole(user)).toBeNull();
        });
    });

    describe('isAdmin', () => {
        it('should return true for admin roles', () => {
            const user = { app_metadata: { role: 'admin' } } as unknown as User;
            expect(isAdmin(user)).toBe(true);
        });

        it('should return true for developer role', () => {
            const user = { app_metadata: { role: 'developer' } } as unknown as User;
            expect(isAdmin(user)).toBe(true);
        });

        it('should return false for non-admin roles', () => {
            const user = { app_metadata: { role: 'moderator' } } as unknown as User;
            expect(isAdmin(user)).toBe(false);
        });

        it('should return false if user is null', () => {
            expect(isAdmin(null)).toBe(false);
        });
    });

    describe('isStaff', () => {
        it('should return true for admin roles', () => {
            const user = { app_metadata: { role: 'admin' } } as unknown as User;
            expect(isStaff(user)).toBe(true);
        });

        it('should return true for staff role', () => {
            const user = { app_metadata: { role: 'staff' } } as unknown as User;
            expect(isStaff(user)).toBe(true);
        });

        it('should return true for moderator role', () => {
            const user = { app_metadata: { role: 'moderator' } } as unknown as User;
            expect(isStaff(user)).toBe(true);
        });

        it('should return false for regular users', () => {
            const user = { app_metadata: { role: 'user' } } as unknown as User;
            expect(isStaff(user)).toBe(false);
        });
    });
});

import { describe, it, expect } from 'vitest';
import { getUserRole, isAdmin, isStaff, isAdminRole, isStaffRole } from '../../utils/roleUtils';
import type { TrustedProfile } from '../../context/AuthContext';

describe('roleUtils', () => {
  describe('isAdminRole', () => {
    it('returns true for admin-level roles', () => {
      expect(isAdminRole('admin')).toBe(true);
      expect(isAdminRole('owner')).toBe(true);
      expect(isAdminRole('killu')).toBe(true);
      expect(isAdminRole('killuwu')).toBe(true);
      expect(isAdminRole('developer')).toBe(true);
      expect(isAdminRole('neroferno')).toBe(true);
      expect(isAdminRole('ADMIN')).toBe(true);
      expect(isAdminRole('OWNER')).toBe(true);
    });

    it('returns false for non-admin roles', () => {
      expect(isAdminRole('user')).toBe(false);
      expect(isAdminRole('moderator')).toBe(false);
      expect(isAdminRole('mod')).toBe(false);
      expect(isAdminRole('helper')).toBe(false);
      expect(isAdminRole('donor')).toBe(false);
      expect(isAdminRole(null)).toBe(false);
      expect(isAdminRole(undefined)).toBe(false);
      expect(isAdminRole('')).toBe(false);
    });
  });

  describe('isStaffRole', () => {
    it('returns true for all staff and admin roles', () => {
      expect(isStaffRole('admin')).toBe(true);
      expect(isStaffRole('owner')).toBe(true);
      expect(isStaffRole('moderator')).toBe(true);
      expect(isStaffRole('mod')).toBe(true);
      expect(isStaffRole('helper')).toBe(true);
      expect(isStaffRole('staff')).toBe(true);
      expect(isStaffRole('developer')).toBe(true);
      expect(isStaffRole('MODERATOR')).toBe(true);
    });

    it('returns false for regular users and unknown roles', () => {
      expect(isStaffRole('user')).toBe(false);
      expect(isStaffRole('donor')).toBe(false);
      expect(isStaffRole('guest')).toBe(false);
      expect(isStaffRole(null)).toBe(false);
      expect(isStaffRole(undefined)).toBe(false);
      expect(isStaffRole('')).toBe(false);
    });
  });

  describe('getUserRole', () => {
    it('extracts role from a trusted profile object', () => {
      const profile: TrustedProfile = {
        role: 'moderator',
        username: 'TestMod',
        avatar_url: null,
      };
      expect(getUserRole(profile)).toBe('moderator');
    });

    it('extracts role from a raw role string', () => {
      expect(getUserRole('Admin')).toBe('admin');
      expect(getUserRole('Owner')).toBe('owner');
    });

    it('returns null if target is null, undefined, or empty', () => {
      expect(getUserRole(null)).toBeNull();
      expect(getUserRole(undefined)).toBeNull();
      expect(getUserRole({ role: null })).toBeNull();
    });

    it('never reads from user_metadata (anti-privilege-escalation)', () => {
      const spoofedObj = {
        user_metadata: { role: 'admin' },
      } as unknown as TrustedProfile;
      expect(getUserRole(spoofedObj)).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('returns true for admin and owner profiles', () => {
      expect(isAdmin({ role: 'admin' })).toBe(true);
      expect(isAdmin({ role: 'owner' })).toBe(true);
      expect(isAdmin({ role: 'killuwu' })).toBe(true);
    });

    it('returns false for user with user_metadata.role = admin and profile.role = user', () => {
      const spoofedProfile = {
        role: 'user',
        user_metadata: { role: 'admin' },
      };
      expect(isAdmin(spoofedProfile)).toBe(false);
    });

    it('returns false for moderator and helper', () => {
      expect(isAdmin({ role: 'moderator' })).toBe(false);
      expect(isAdmin({ role: 'helper' })).toBe(false);
    });

    it('returns false for null or undefined', () => {
      expect(isAdmin(null)).toBe(false);
      expect(isAdmin(undefined)).toBe(false);
    });
  });

  describe('isStaff', () => {
    it('returns true for moderator, helper, and owner profiles', () => {
      expect(isStaff({ role: 'moderator' })).toBe(true);
      expect(isStaff({ role: 'mod' })).toBe(true);
      expect(isStaff({ role: 'helper' })).toBe(true);
      expect(isStaff({ role: 'owner' })).toBe(true);
      expect(isStaff({ role: 'admin' })).toBe(true);
    });

    it('returns false for normal users even if metadata claims staff', () => {
      const spoofedProfile = {
        role: 'user',
        user_metadata: { role: 'staff' },
      };
      expect(isStaff(spoofedProfile)).toBe(false);
    });

    it('returns false for null or undefined', () => {
      expect(isStaff(null)).toBe(false);
      expect(isStaff(undefined)).toBe(false);
    });
  });
});

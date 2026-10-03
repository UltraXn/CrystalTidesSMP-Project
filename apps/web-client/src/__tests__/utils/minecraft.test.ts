import { describe, it, expect } from 'vitest';
import {
  isValidMinecraftNick,
  normalizeMinecraftUuid,
  formatMinecraftAvatarUrl,
} from '@crystaltides/shared';

describe('Minecraft Domain Validator & Helpers (TDD)', () => {
  describe('isValidMinecraftNick', () => {
    it('accepts valid alphanumeric and underscore nicknames (3 to 16 chars)', () => {
      expect(isValidMinecraftNick('Nero_')).toBe(true);
      expect(isValidMinecraftNick('Player123')).toBe(true);
      expect(isValidMinecraftNick('abc')).toBe(true); // Minimum 3 chars
      expect(isValidMinecraftNick('1234567890123456')).toBe(true); // Maximum 16 chars
    });

    it('rejects nicks shorter than 3 or longer than 16 chars', () => {
      expect(isValidMinecraftNick('ab')).toBe(false);
      expect(isValidMinecraftNick('toolongnicknamehere123')).toBe(false);
    });

    it('rejects nicks with invalid characters, spaces, or non-string inputs', () => {
      expect(isValidMinecraftNick('Nero Fernando')).toBe(false);
      expect(isValidMinecraftNick('Player!@#')).toBe(false);
      expect(isValidMinecraftNick('user.name')).toBe(false);
      expect(isValidMinecraftNick(null)).toBe(false);
      expect(isValidMinecraftNick(undefined)).toBe(false);
      expect(isValidMinecraftNick(12345)).toBe(false);
    });
  });

  describe('normalizeMinecraftUuid', () => {
    it('formats unhyphenated 32-char UUID into standard 8-4-4-4-12 canonical format', () => {
      const raw32 = '069a79f444e94726a5befca90e38aaf5';
      const expected = '069a79f4-44e9-4726-a5be-fca90e38aaf5';
      expect(normalizeMinecraftUuid(raw32)).toBe(expected);
    });

    it('normalizes uppercase canonical UUID to lowercase', () => {
      const upper36 = '069A79F4-44E9-4726-A5BE-FCA90E38AAF5';
      const expected = '069a79f4-44e9-4726-a5be-fca90e38aaf5';
      expect(normalizeMinecraftUuid(upper36)).toBe(expected);
    });

    it('returns null for malformed UUID inputs', () => {
      expect(normalizeMinecraftUuid('invalid-uuid-too-short')).toBeNull();
      expect(normalizeMinecraftUuid('069a79f4-44e9-4726-a5be-fca90e38aaf5-extra')).toBeNull();
      expect(normalizeMinecraftUuid('zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz')).toBeNull();
      expect(normalizeMinecraftUuid(null)).toBeNull();
      expect(normalizeMinecraftUuid(12345)).toBeNull();
    });
  });

  describe('formatMinecraftAvatarUrl', () => {
    it('generates Crafatar avatar URL with default size 64', () => {
      const uuid = '069a79f4-44e9-4726-a5be-fca90e38aaf5';
      expect(formatMinecraftAvatarUrl(uuid)).toBe(
        'https://crafatar.com/avatars/069a79f4-44e9-4726-a5be-fca90e38aaf5?size=64&overlay',
      );
    });

    it('accepts custom size parameter', () => {
      const nick = 'Nero';
      expect(formatMinecraftAvatarUrl(nick, 128)).toBe(
        'https://crafatar.com/avatars/Nero?size=128&overlay',
      );
    });

    it('falls back to default placeholder if input is empty or invalid', () => {
      expect(formatMinecraftAvatarUrl('')).toBe('/images/ui/logo.webp');
      expect(formatMinecraftAvatarUrl('   ')).toBe('/images/ui/logo.webp');
    });
  });
});

import { describe, it, expect } from 'vitest';
import { parseThreadDetail } from '@crystaltides/shared';

describe('parseThreadDetail (TDD)', () => {
  it('returns null for null, undefined, or non-object payloads', () => {
    expect(parseThreadDetail(null, 'topic')).toBeNull();
    expect(parseThreadDetail(undefined, 'topic')).toBeNull();
    expect(parseThreadDetail('invalid-string', 'topic')).toBeNull();
  });

  describe('Topic Mode', () => {
    it('correctly maps all fields for a standard topic', () => {
      const raw = {
        id: 101,
        title: 'Guía para nuevos jugadores',
        content: 'Bienvenidos a CrystalTides SMP...',
        author_name: 'Nero',
        user_id: 'usr-abc-123',
        author_avatar: 'https://cdn.crystaltides.net/nero.png',
        author_role: 'admin',
        created_at: '2026-03-15T14:30:00.000Z',
        category_id: 1,
        views: 150,
        pinned: true,
        locked: false,
      };

      const result = parseThreadDetail(raw, 'topic');
      expect(result).not.toBeNull();
      expect(result?.id).toBe(101);
      expect(result?.title).toBe('Guía para nuevos jugadores');
      expect(result?.author).toBe('Nero');
      expect(result?.author_id).toBe('usr-abc-123');
      expect(result?.author_avatar).toBe('https://cdn.crystaltides.net/nero.png');
      expect(result?.author_role).toBe('admin');
      expect(result?.tag).toBe('Anuncios');
      expect(result?.image).toBeNull();
      expect(result?.views).toBe(150);
      expect(result?.pinned).toBe(true);
      expect(result?.locked).toBe(false);
    });

    it('falls back safely when optional author details and category are missing', () => {
      const raw = {
        id: 102,
        title: 'Duda con el spawn',
        content: '¿Dónde consigo comida?',
        created_at: '2026-03-15T14:30:00.000Z',
        category_id: 999, // Unmapped category
      };

      const result = parseThreadDetail(raw, 'topic');
      expect(result).not.toBeNull();
      expect(result?.author).toBe('Anónimo');
      expect(result?.author_avatar).toBe('/images/ui/logo.webp');
      expect(result?.author_role).toBe('user');
      expect(result?.tag).toBe('General');
    });
  });

  describe('News Mode', () => {
    it('enforces official server authorship and preserves news banner image', () => {
      const raw = {
        id: 'news-5',
        title: 'Actualización 2.0 Lanzada',
        content: 'Nuevas dungeons y mecánicas...',
        category: 'Actualizaciones',
        image: 'https://cdn.crystaltides.net/update-banner.webp',
        author_id: 'staff-sys',
        created_at: '2026-03-15T14:30:00.000Z',
      };

      const result = parseThreadDetail(raw, 'news');
      expect(result).not.toBeNull();
      expect(result?.author).toBe('CrystalTidesSMP');
      expect(result?.author_role).toBe('staff');
      expect(result?.author_avatar).toBe('/images/ui/logo.webp');
      expect(result?.tag).toBe('Actualizaciones');
      expect(result?.image).toBe('https://cdn.crystaltides.net/update-banner.webp');
    });
  });

  describe('Resilience and Data Sanitization', () => {
    it('gracefully handles missing or invalid dates without producing "Invalid Date"', () => {
      const raw = {
        id: 103,
        title: 'Hilo con fecha corrupta',
        content: 'Texto...',
        created_at: 'not-a-valid-date',
      };

      const result = parseThreadDetail(raw, 'topic');
      expect(result).not.toBeNull();
      expect(result?.date).not.toBe('Invalid Date');
      expect(result?.longDate).not.toContain('Invalid Date');
      expect(typeof result?.date).toBe('string');
      expect(typeof result?.longDate).toBe('string');
    });

    it('sanitizes views counter and boolean flags', () => {
      const raw = {
        id: 104,
        title: 'Counters',
        content: 'Counters test',
        views: -10, // Invalid negative view count
        pinned: 1, // Truthy number coerced to boolean
        locked: null, // Null coerced to boolean
        created_at: '2026-03-15T14:30:00.000Z',
      };

      const result = parseThreadDetail(raw, 'topic');
      expect(result).not.toBeNull();
      expect(result?.views).toBe(0);
      expect(result?.pinned).toBe(true);
      expect(result?.locked).toBe(false);
    });
  });
});

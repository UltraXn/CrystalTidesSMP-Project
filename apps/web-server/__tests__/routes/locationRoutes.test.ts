import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import * as locationService from '../../services/locationService.js';
import supabase from '../../config/supabaseClient.js';

describe('Location Routes (/api/locations)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/locations', () => {
    it('returns 200 and list of locations', async () => {
      // Arrange
      vi.spyOn(locationService, 'getAllLocations').mockResolvedValueOnce([
        {
          id: 1,
          title: 'Gran Biblioteca de Cristal',
          description: 'Repositorio abisal',
          long_description: 'Descripción detallada de la biblioteca',
          coords: '100, 64, -250',
          image_url: 'https://example.com/library.png',
          is_coming_soon: false,
          authors: ['NachoDev'],
          sort_order: 1,
          created_at: '2026-09-01T00:00:00Z',
          updated_at: '2026-09-01T00:00:00Z',
        },
      ]);

      // Act
      const res = await request(app).get('/api/locations');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Gran Biblioteca de Cristal');
    });
  });

  describe('POST /api/locations', () => {
    it('rejects unauthenticated requests with 401', async () => {
      // Act
      const res = await request(app)
        .post('/api/locations')
        .send({ title: 'Fortaleza', description: 'Desc', long_description: 'Long' });

      // Assert
      expect(res.status).toBe(401);
    });

    it('rejects authenticated users without staff role with 403', async () => {
      // Arrange: mock standard user
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
        data: {
          user: {
            id: 'regular-user-id',
            email: 'user@test.com',
            user_metadata: {},
            app_metadata: {},
          } as unknown as import('@supabase/supabase-js').User,
        },
        error: null,
      });

      vi.spyOn(supabase, 'from').mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({
          data: { username: 'RegularUser', role: 'user' },
          error: null,
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      // Act
      const res = await request(app)
        .post('/api/locations')
        .set('Authorization', 'Bearer regular-token-123')
        .send({
          title: 'Fortaleza Oscura',
          description: 'Bastión subterráneo',
          long_description: 'Descripción completa',
          coords: '200, 40, -500',
        });

      // Assert
      expect(res.status).toBe(403);
    });

    it('successfully creates location when authorized as admin', async () => {
      // Arrange: mock admin user
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
        data: {
          user: {
            id: 'admin-user-id',
            email: 'admin@crystaltides.net',
            user_metadata: {},
            app_metadata: {},
          } as unknown as import('@supabase/supabase-js').User,
        },
        error: null,
      });

      vi.spyOn(supabase, 'from').mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({
          data: { username: 'AdminMaster', role: 'admin' },
          error: null,
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      vi.spyOn(locationService, 'createLocation').mockResolvedValueOnce({
        id: 2,
        title: 'Fortaleza Oscura',
        description: 'Bastión subterráneo',
        long_description: 'Descripción completa de la fortaleza',
        coords: '200, 40, -500',
        image_url: null,
        is_coming_soon: false,
        authors: ['AdminMaster'],
        sort_order: 2,
        created_at: '2026-09-05T00:00:00Z',
        updated_at: '2026-09-05T00:00:00Z',
      });

      // Act
      const res = await request(app)
        .post('/api/locations')
        .set('Authorization', 'Bearer admin-token-456')
        .send({
          title: 'Fortaleza Oscura',
          description: 'Bastión subterráneo',
          long_description: 'Descripción completa de la fortaleza',
          coords: '200, 40, -500',
        });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Fortaleza Oscura');
    });
  });
});

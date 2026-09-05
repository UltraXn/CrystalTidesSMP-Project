import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import supabase from '../../config/supabaseClient.js';
import type { UserResponse } from '@supabase/supabase-js';

describe('News Routes (/api/news)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/news', () => {
    it('returns 200 and mapped news list with reply counts', async () => {
      // Arrange
      const mockNews = [
        {
          id: 1,
          title: 'Apertura de la Temporada Abisal',
          slug: 'apertura-temporada-abisal',
          content: 'Bienvenidos a la nueva era con biomas sumergidos y mazmorras.',
          category: 'ANNOUNCEMENT',
          created_at: '2026-09-01T00:00:00Z',
          comments: [{ count: 7 }],
        },
      ];

      vi.spyOn(supabase, 'from').mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockNews,
            error: null,
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      // Act
      const res = await request(app).get('/api/news');

      // Assert
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('Apertura de la Temporada Abisal');
      expect(res.body[0].replies).toBe(7);
    });
  });

  describe('GET /api/news/:id', () => {
    it('returns 200 and news item details when found', async () => {
      // Arrange
      const mockItem = {
        id: '12',
        title: 'Actualización 1.20.1',
        slug: 'actualizacion-1201',
        content: 'Detalles de la versión 1.20.1 en CrystalTides.',
        views: 15,
        author_id: 'admin-uuid',
      };

      vi.spyOn(supabase, 'from')
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockItem,
                error: null,
              }),
            }),
          }),
        } as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        } as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { username: 'UltraXn', role: 'admin' },
                error: null,
              }),
            }),
          }),
        } as unknown as ReturnType<typeof supabase.from>);

      // Act
      const res = await request(app).get('/api/news/12');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Actualización 1.20.1');
      expect(res.body.views).toBe(16);
      expect(res.body.author_data_fresh?.username).toBe('UltraXn');
    });

    it('returns 500/404 when news item cannot be found', async () => {
      // Arrange
      vi.spyOn(supabase, 'from').mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Record not found'),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      // Act
      const res = await request(app).get('/api/news/9999');

      // Assert
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /api/news (Admin only)', () => {
    it('returns 401 when unauthenticated', async () => {
      // Act
      const res = await request(app).post('/api/news').send({
        title: 'Noticia Sin Autenticar',
        content: 'Contenido largo para pasar validación',
      });

      // Assert
      expect(res.status).toBe(401);
    });

    it('returns 403 when user is authenticated but not an admin', async () => {
      // Arrange
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
        data: {
          user: {
            id: 'regular-user-id',
            email: 'player@crystaltides.net',
            user_metadata: { role: 'user' },
            app_metadata: { role: 'user' },
            aud: 'authenticated',
            created_at: '2026-01-01T00:00:00Z',
          },
        },
        error: null,
      } as unknown as UserResponse);

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
        .post('/api/news')
        .set('Authorization', 'Bearer user-token')
        .send({
          title: 'Intento de Noticia',
          content: 'Este usuario no tiene rango suficiente.',
        });

      // Assert
      expect(res.status).toBe(403);
    });

    it('returns 400 when body fails validation (title too short)', async () => {
      // Arrange
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
        data: {
          user: {
            id: 'admin-user-id',
            email: 'admin@crystaltides.net',
            user_metadata: { role: 'admin' },
            app_metadata: { role: 'admin' },
            aud: 'authenticated',
            created_at: '2026-01-01T00:00:00Z',
          },
        },
        error: null,
      } as unknown as UserResponse);

      vi.spyOn(supabase, 'from').mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({
          data: { username: 'AdminMaster', role: 'admin' },
          error: null,
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      // Act
      const res = await request(app)
        .post('/api/news')
        .set('Authorization', 'Bearer admin-token')
        .send({
          title: 'ABC', // too short (< 5)
          content: 'Contenido suficientemente largo',
        });

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
    });

    it('successfully creates news when authorized as admin', async () => {
      // Arrange
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
        data: {
          user: {
            id: 'admin-user-id',
            email: 'admin@crystaltides.net',
            user_metadata: { role: 'admin' },
            app_metadata: { role: 'admin' },
            aud: 'authenticated',
            created_at: '2026-01-01T00:00:00Z',
          },
        },
        error: null,
      } as unknown as UserResponse);

      vi.spyOn(supabase, 'from')
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValueOnce({
            data: { username: 'AdminMaster', role: 'admin' },
            error: null,
          }),
        } as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: [{ id: 10, title: 'Gran Evento Abisal', slug: 'gran-evento-abisal' }],
              error: null,
            }),
          }),
        } as unknown as ReturnType<typeof supabase.from>);

      // Act
      const res = await request(app)
        .post('/api/news')
        .set('Authorization', 'Bearer admin-token-create')
        .send({
          title: 'Gran Evento Abisal',
          content: 'Detalles sobre el nuevo evento que comenzara este fin de semana.',
          title_en: 'Abyssal Event',
          content_en: 'Details about the event',
        });

      // Assert
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Gran Evento Abisal');
    });
  });
});

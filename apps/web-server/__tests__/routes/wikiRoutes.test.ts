import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import * as wikiService from '../../services/wikiService.js';
import supabase from '../../config/supabaseClient.js';

describe('Wiki Routes (/api/wiki)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/wiki', () => {
    it('returns 200 and list of wiki articles', async () => {
      // Arrange
      vi.spyOn(wikiService, 'getAllArticles').mockResolvedValueOnce([
        {
          id: 1,
          title: 'Guía de Inicio',
          slug: 'guia-inicio',
          category: 'general',
          content: 'Bienvenido a CrystalTides SMP',
          created_at: '2026-09-01T00:00:00Z',
          updated_at: '2026-09-01T00:00:00Z',
        },
      ]);

      // Act
      const res = await request(app).get('/api/wiki');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].slug).toBe('guia-inicio');
    });
  });

  describe('GET /api/wiki/:slug', () => {
    it('returns 200 and article when slug exists', async () => {
      // Arrange
      vi.spyOn(wikiService, 'getArticleBySlug').mockResolvedValueOnce({
        id: 2,
        title: 'Sistema de Bounties',
        slug: 'sistema-bounties',
        category: 'gameplay',
        content: 'Detalles de los jefes y multiplicadores',
        created_at: '2026-09-02T00:00:00Z',
        updated_at: '2026-09-02T00:00:00Z',
      });

      // Act
      const res = await request(app).get('/api/wiki/sistema-bounties');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Sistema de Bounties');
    });

    it('returns 404 when slug does not exist', async () => {
      // Arrange
      vi.spyOn(wikiService, 'getArticleBySlug').mockResolvedValueOnce(null);

      // Act
      const res = await request(app).get('/api/wiki/slug-inexistente');

      // Assert
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toEqual(
        expect.objectContaining({
          code: 'NOT_FOUND',
          message: 'Article not found',
        })
      );
    });
  });

  describe('POST /api/wiki', () => {
    it('rejects unauthenticated requests with 401', async () => {
      // Act
      const res = await request(app)
        .post('/api/wiki')
        .send({
          title: 'Encantamientos Arcanos',
          slug: 'encantamientos-arcanos',
          category: 'lore',
          content: 'Descripción de encantamientos',
        });

      // Assert
      expect(res.status).toBe(401);
    });

    it('creates article when authenticated with staff permissions', async () => {
      // Arrange
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
        data: {
          user: {
            id: 'staff-editor-id',
            email: 'editor@crystaltides.net',
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
          data: { username: 'WikiEditor', role: 'admin' },
          error: null,
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      vi.spyOn(wikiService, 'createArticle').mockResolvedValueOnce({
        id: 15,
        title: 'Encantamientos Arcanos',
        slug: 'encantamientos-arcanos',
        category: 'lore',
        content: 'Descripción de encantamientos',
        author_id: 'staff-editor-id',
        created_at: '2026-09-05T00:00:00Z',
        updated_at: '2026-09-05T00:00:00Z',
      });

      // Act
      const res = await request(app)
        .post('/api/wiki')
        .set('Authorization', 'Bearer editor-token-789')
        .send({
          title: 'Encantamientos Arcanos',
          slug: 'encantamientos-arcanos',
          category: 'lore',
          content: 'Descripción de encantamientos',
        });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(15);
    });
  });
});

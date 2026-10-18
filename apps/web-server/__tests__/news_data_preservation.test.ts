import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import express from 'express';
import request from 'supertest';
import { validate } from '../middleware/validateResource.js';
import { createNewsSchema, updateNewsSchema } from '@crystaltides/shared';

describe('News Data Preservation through validateResource', () => {
  describe('createNewsSchema preservation', () => {
    it('preserves image, image_url, status, title_en, content_en, author_id, username, and user_id in req.body', () => {
      const payload = {
        title: 'Nueva Actualización 1.20',
        content: 'Detalles completos sobre la nueva actualización del servidor.',
        category: 'Updates',
        image: 'https://crystaltides.com/images/news-hero.png',
        image_url: 'https://crystaltides.com/images/news-thumb.png',
        status: 'Published' as const,
        title_en: 'New 1.20 Update Details',
        content_en: 'Full details about the new server update and features.',
        author_id: 'auth0|123456789',
        username: 'admin_master',
        user_id: 'usr_789456123',
      };

      const req = {
        body: { ...payload },
        query: {},
        params: {},
      } as unknown as Request;

      const res = {
        locals: {},
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      const next = vi.fn() as unknown as NextFunction;

      const middleware = validate(createNewsSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();

      // Verify every field is genuinely preserved without stripping
      expect(req.body.title).toBe(payload.title);
      expect(req.body.content).toBe(payload.content);
      expect(req.body.category).toBe(payload.category);
      expect(req.body.image).toBe(payload.image);
      expect(req.body.image_url).toBe(payload.image_url);
      expect(req.body.status).toBe(payload.status);
      expect(req.body.title_en).toBe(payload.title_en);
      expect(req.body.content_en).toBe(payload.content_en);
      expect(req.body.author_id).toBe(payload.author_id);
      expect(req.body.username).toBe(payload.username);
      expect(req.body.user_id).toBe(payload.user_id);
    });

    it('allows image to be an empty string without throwing validation error', () => {
      const payload = {
        title: 'Noticia sin imagen previa',
        content: 'Esta noticia tiene imagen vacía por omisión del usuario.',
        image: '',
        image_url: '',
        status: 'Draft' as const,
      };

      const req = {
        body: { ...payload },
        query: {},
        params: {},
      } as unknown as Request;

      const res = {
        locals: {},
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      const next = vi.fn() as unknown as NextFunction;

      validate(createNewsSchema)(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.body.image).toBe('');
      expect(req.body.image_url).toBe('');
      expect(req.body.status).toBe('Draft');
    });

    it('rejects invalid status enum with 400', () => {
      const payload = {
        title: 'Noticia Invalida',
        content: 'Contenido valido y suficientemente largo.',
        status: 'Archived', // Invalid enum
      };

      const req = {
        body: { ...payload },
        query: {},
        params: {},
      } as unknown as Request;

      const res = {
        locals: {},
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      const next = vi.fn() as unknown as NextFunction;

      validate(createNewsSchema)(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateNewsSchema preservation', () => {
    it('preserves all updated fields in req.body', () => {
      const payload = {
        title: 'Título Corregido de Noticia',
        content: 'Contenido corregido y extendido con más información.',
        category: 'Patches',
        image: 'https://crystaltides.com/images/news-hero-v2.png',
        image_url: 'https://crystaltides.com/images/news-thumb-v2.png',
        status: 'Draft' as const,
        title_en: 'Corrected News Title',
        content_en: 'Extended and corrected content with more info.',
        author_id: 'auth0|999999999',
        username: 'editor_lead',
        user_id: 'usr_000111222',
      };

      const req = {
        body: { ...payload },
        query: {},
        params: { id: '42' },
      } as unknown as Request;

      const res = {
        locals: {},
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      const next = vi.fn() as unknown as NextFunction;

      const middleware = validate(updateNewsSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();

      // Verify every field is preserved
      expect(req.body.title).toBe(payload.title);
      expect(req.body.content).toBe(payload.content);
      expect(req.body.category).toBe(payload.category);
      expect(req.body.image).toBe(payload.image);
      expect(req.body.image_url).toBe(payload.image_url);
      expect(req.body.status).toBe(payload.status);
      expect(req.body.title_en).toBe(payload.title_en);
      expect(req.body.content_en).toBe(payload.content_en);
      expect(req.body.author_id).toBe(payload.author_id);
      expect(req.body.username).toBe(payload.username);
      expect(req.body.user_id).toBe(payload.user_id);
    });
  });

  describe('End-to-End Express route integration', () => {
    it('preserves full news payload through an Express endpoint with validateResource', async () => {
      const app = express();
      app.use(express.json());

      let capturedBody: Record<string, unknown> | null = null;

      app.post('/test/news', validate(createNewsSchema), (req, res) => {
        capturedBody = req.body;
        res.status(201).json({ success: true, data: req.body });
      });

      const fullPayload = {
        title: 'Lanzamiento Oficial Temporada 3',
        content:
          'Estamos muy emocionados de anunciar el lanzamiento oficial de la nueva temporada.',
        category: 'Announcements',
        image: 'https://cdn.crystaltides.com/news/season3.webp',
        image_url: 'https://cdn.crystaltides.com/news/season3_thumb.webp',
        status: 'Published',
        title_en: 'Official Season 3 Launch',
        content_en: 'We are very excited to announce the official launch of the new season.',
        author_id: 'staff-uuid-1',
        username: 'FounderNacho',
        user_id: 'user-uuid-root',
      };

      const response = await request(app).post('/test/news').send(fullPayload).expect(201);

      expect(response.body.success).toBe(true);
      expect(capturedBody).not.toBeNull();
      expect(capturedBody).toMatchObject(fullPayload);
    });
  });
});

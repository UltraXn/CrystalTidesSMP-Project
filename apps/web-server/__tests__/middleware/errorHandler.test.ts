import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import type { Request, Response } from 'express';
import app from '../../app.js';
import { errorHandler } from '../../middleware/errorHandler.js';

describe('Global Error & 404 Handlers', () => {
  it('returns 400 JSON (not Express default HTML) when receiving malformed JSON', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"badJson": true, unquoted_key: }');

    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'JSON inválido',
      },
    });
  });

  it('returns 404 JSON for unmapped routes', async () => {
    const res = await request(app).get('/api/non-existent-route-xyz');

    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toContain('Ruta no encontrada');
  });

  it('hides internal error code with INTERNAL_ERROR and logs unhandled 5xx', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const err = Object.assign(new Error('Database connection failed'), {
      code: 'ECONNREFUSED',
      statusCode: 500,
    });

    const req = { method: 'GET', path: '/api/test' } as Request;
    const res = {
      headersSent: false,
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith('[Unhandled]', 'GET', '/api/test', err);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INTERNAL_ERROR',
        }),
      }),
    );
  });

  it('normalizes invalid status codes to 500 and sets INTERNAL_ERROR', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const err = Object.assign(new Error('Corrupted status error'), {
      statusCode: 999,
      code: 'PGRST116',
    });

    const req = { method: 'POST', path: '/api/data' } as Request;
    const res = {
      headersSent: false,
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith('[Unhandled]', 'POST', '/api/data', err);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INTERNAL_ERROR',
        }),
      }),
    );
  });
});

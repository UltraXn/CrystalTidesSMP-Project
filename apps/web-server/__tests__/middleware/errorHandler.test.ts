import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

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
});

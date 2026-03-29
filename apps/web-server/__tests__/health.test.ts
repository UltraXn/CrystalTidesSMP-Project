import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('API Health Check', () => {
  it('should return 200 and welcome message for GET /', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Welcome to CrystalTides API');
    expect(response.body).toHaveProperty('version');
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/v1/non-existent');
    expect(response.status).toBe(404);
  });
});

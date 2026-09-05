import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { apiLimiter, sensitiveActionLimiter } from '../../middleware/rateLimitMiddleware.js';

describe('rateLimitMiddleware', () => {
  it('applies standard rate limiting headers to requests', async () => {
    // Arrange
    const testApp = express();
    testApp.use('/test-rate-limit', apiLimiter, (_req, res) => {
      res.json({ ok: true });
    });

    // Act
    const res = await request(testApp).get('/test-rate-limit');

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(res.headers['ratelimit-limit']).toBeDefined();
    expect(res.headers['ratelimit-remaining']).toBeDefined();
  });

  it('exposes sensitiveActionLimiter configured with lower thresholds', async () => {
    // Arrange
    const testApp = express();
    testApp.use('/test-sensitive', sensitiveActionLimiter, (_req, res) => {
      res.json({ secret: 'authorized' });
    });

    // Act
    const res = await request(testApp).get('/test-sensitive');

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.secret).toBe('authorized');
    expect(Number(res.headers['ratelimit-limit'])).toBeLessThanOrEqual(10);
  });
});

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('System Routes (/api/system)', () => {
  it('GET /api/system/health returns 200 and status ok', async () => {
    // Act
    const res = await request(app).get('/api/system/health');

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /api/system/ready returns 200 and status ready', async () => {
    // Act
    const res = await request(app).get('/api/system/ready');

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ready' });
  });

  it('GET /api/system/status returns 200 with system status data', async () => {
    // Act
    const res = await request(app).get('/api/system/status');

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });
});

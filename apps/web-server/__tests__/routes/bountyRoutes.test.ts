import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('Bounty Routes (/api/bounties)', () => {
  it('GET /api/bounties/active returns 200 with active Flash Bounty details', async () => {
    // Act
    const res = await request(app).get('/api/bounties/active');

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.bounty).toBeDefined();
    expect(res.body.bounty.bossName).toBeDefined();
    expect(typeof res.body.bounty.remainingSeconds).toBe('number');
  });

  it('POST /api/bounties/trigger updates active bounty and returns 200', async () => {
    // Act
    const res = await request(app).post('/api/bounties/trigger').send({
      bossName: 'Ender Dragon Rex',
      multiplier: '3.0x KC',
      durationMinutes: 45,
    });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.bounty.bossName).toBe('Ender Dragon Rex');
    expect(res.body.bounty.multiplier).toBe('3.0x KC');
  });
});

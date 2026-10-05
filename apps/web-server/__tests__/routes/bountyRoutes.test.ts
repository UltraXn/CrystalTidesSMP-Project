import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import supabase from '../../config/supabaseClient.js';

describe('Bounty Routes (/api/bounties)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('POST /api/bounties/trigger rejects unauthenticated requests with 401', async () => {
    const res = await request(app).post('/api/bounties/trigger').send({
      bossName: 'Ender Dragon Rex',
    });

    expect(res.status).toBe(401);
  });

  it('POST /api/bounties/trigger updates active bounty and returns 200 when authenticated as admin', async () => {
    vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
      data: {
        user: {
          id: 'admin-bounty-id',
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
        data: { username: 'BountyAdmin', role: 'admin' },
        error: null,
      }),
    } as unknown as ReturnType<typeof supabase.from>);

    // Act
    const res = await request(app)
      .post('/api/bounties/trigger')
      .set('Authorization', 'Bearer admin-token')
      .send({
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

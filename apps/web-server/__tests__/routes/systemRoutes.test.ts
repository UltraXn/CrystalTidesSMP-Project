import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import pool from '../../config/database.js';
import supabase from '../../config/supabaseClient.js';
import { FakeSupabase } from '../helpers/fakeSupabase.js';

describe('System Routes (/api/system)', () => {
  let db: FakeSupabase;

  beforeEach(() => {
    vi.restoreAllMocks();
    db = new FakeSupabase({
      profiles: [{ id: 'test-profile-id', username: 'SystemUser', role: 'user' }],
    });
    vi.spyOn(supabase, 'from').mockImplementation(db.from as unknown as typeof supabase.from);
  });

  it('GET /api/system/health returns 200 and status ok', async () => {
    const res = await request(app).get('/api/system/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /api/system/ready returns 200 and status ready when dependencies are healthy', async () => {
    vi.spyOn(pool, 'query').mockResolvedValueOnce([[], []] as never);

    const res = await request(app).get('/api/system/ready');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.checks).toEqual({ mysql: 'ok', supabase: 'ok' });
  });

  it('GET /api/system/ready returns 200 when MySQL is down (non-critical dependency)', async () => {
    vi.spyOn(pool, 'query').mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const res = await request(app).get('/api/system/ready');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('degraded');
    expect(res.body.checks.mysql).toBe('down');
    expect(res.body.checks.supabase).toBe('ok');
  });

  it('GET /api/system/ready returns 503 when Supabase ping fails', async () => {
    vi.spyOn(supabase, 'from').mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection error', code: 'PGRST000' },
      }),
    } as never);

    const res = await request(app).get('/api/system/ready');

    expect(res.status).toBe(503);
    expect(res.body.status).toBe('unavailable');
    expect(res.body.checks.supabase).toBe('down');
  });

  it('GET /api/system/status returns 200 with system status data', async () => {
    const res = await request(app).get('/api/system/status');

    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body.success).toBe(true);
  });
});

/* eslint-disable sonarjs/no-hardcoded-ip -- fixture addresses (TEST-NET and Cloudflare edges) */
import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import supabase from '../../config/supabaseClient.js';
import { FakeSupabase } from '../helpers/fakeSupabase.js';

const REPORT_LIMIT = 20;

// supertest connects from loopback; with `trust proxy` = 1 the X-Forwarded-For
// entry plays the Cloudflare edge that reached Cloud Run.
const viaCloudflare = (clientIp: string) => ({
  'X-Forwarded-For': '172.67.10.10',
  'CF-Connecting-IP': clientIp,
});

const report = (clientIp: string, body: object) =>
  request(app).post('/api/logs/security/report').set(viaCloudflare(clientIp)).send(body);

const useFakeDb = () => {
  const db = new FakeSupabase();
  vi.spyOn(supabase, 'from').mockImplementation(db.from as unknown as typeof supabase.from);
  return db;
};

describe('POST /api/logs/security/report', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('accepts anonymous reports and logs the real client IP', async () => {
    const db = useFakeDb();
    const res = await report('203.0.113.40', {
      email: 'victim@example.test',
      details: 'Invalid login credentials',
    });

    expect(res.status).toBe(200);
    const [log] = db.rows('system_logs');
    expect(log).toMatchObject({ action: 'LOGIN_FAIL', source: 'security' });
    expect(String(log.details)).toContain('IP: 203.0.113.40');
  });

  it('rejects oversized details instead of storing them', async () => {
    const db = useFakeDb();
    const res = await report('203.0.113.41', { details: 'x'.repeat(501) });

    expect(res.status).toBe(400);
    expect(db.rows('system_logs')).toHaveLength(0);
  });

  it('throttles reports per client IP', async () => {
    useFakeDb();
    const statuses: number[] = [];
    for (let attempt = 0; attempt <= REPORT_LIMIT; attempt++) {
      const res = await report('203.0.113.42', { details: 'Invalid login credentials' });
      statuses.push(res.status);
    }

    expect(statuses.slice(0, REPORT_LIMIT).every((status) => status === 200)).toBe(true);
    expect(statuses[REPORT_LIMIT]).toBe(429);
  });

  it('keeps every other log route behind staff authentication', async () => {
    const res = await request(app).get('/api/logs');

    expect(res.status).toBe(401);
  });
});

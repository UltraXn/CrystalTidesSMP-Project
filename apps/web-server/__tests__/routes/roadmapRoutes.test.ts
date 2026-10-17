import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import type { Request, Response } from 'express';
import type { User } from '@supabase/supabase-js';
import app from '../../app.js';
import supabase from '../../config/supabaseClient.js';
import * as gachaBalanceService from '../../services/gachaBalanceService.js';
import { signAdminToken } from '../../services/twoFactorService.js';
import { claimDailyReward } from '../../controllers/roadmapController.js';
import { FakeSupabase } from '../helpers/fakeSupabase.js';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const ADMIN_ID = '22222222-2222-4222-8222-222222222222';
const HOUR_MS = 60 * 60 * 1000;

const VALID_DAY = {
  day: 1,
  title: 'Día 1: Bienvenida',
  reward_type: 'killucoins',
  reward_value: 25,
  multiplier: 1,
};

let db: FakeSupabase;
let tokenCounter = 0;

// The auth middleware caches users per token for 60s, so every request gets its own token.
const nextToken = () => `roadmap-test-token-${++tokenCounter}`;

function authenticateAs(id: string, appMetadata: Record<string, unknown> = {}) {
  vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
    data: {
      user: {
        id,
        email: `${id}@test.dev`,
        user_metadata: {},
        app_metadata: appMetadata,
      } as unknown as User,
    },
    error: null,
  });
}

function mockResponse() {
  const res = { statusCode: 200, body: undefined as unknown };
  const api = {
    status(code: number) {
      res.statusCode = code;
      return api;
    },
    json(payload: unknown) {
      res.body = payload;
      return api;
    },
  };
  return { res, api: api as unknown as Response };
}

function claimAs(userId: string) {
  const { res, api } = mockResponse();
  const req = { user: { id: userId, role: 'user' }, query: {}, body: {} } as unknown as Request;
  return claimDailyReward(req, api).then(() => res);
}

beforeEach(() => {
  vi.restoreAllMocks();
  db = new FakeSupabase(
    {
      profiles: [
        { id: USER_ID, username: 'Player', role: 'user' },
        { id: ADMIN_ID, username: 'AdminUser', role: 'admin' },
      ],
    },
    { uniqueKeys: { user_daily_streaks: 'user_id', monthly_roadmap_config: 'day' } },
  );
  vi.spyOn(supabase, 'from').mockImplementation(db.from as unknown as typeof supabase.from);
  vi.spyOn(gachaBalanceService, 'refundGachaBalance').mockResolvedValue(undefined);
  vi.spyOn(gachaBalanceService, 'getGachaBalance').mockResolvedValue(500);
});

describe('PUT /api/roadmap/admin/config', () => {
  it('rejects anonymous requests', async () => {
    const res = await request(app)
      .put('/api/roadmap/admin/config')
      .send({ days: [VALID_DAY] });

    expect(res.status).toBe(401);
    expect(db.rows('monthly_roadmap_config')).toHaveLength(0);
  });

  it('rejects regular users even with a valid session', async () => {
    authenticateAs(USER_ID);

    const res = await request(app)
      .put('/api/roadmap/admin/config')
      .set('Authorization', `Bearer ${nextToken()}`)
      .send({ days: [{ ...VALID_DAY, reward_value: 10_000, multiplier: 100 }] });

    expect(res.status).toBe(403);
    expect(db.rows('monthly_roadmap_config')).toHaveLength(0);
  });

  it('rejects admins that have not enrolled 2FA', async () => {
    authenticateAs(ADMIN_ID);

    const res = await request(app)
      .put('/api/roadmap/admin/config')
      .set('Authorization', `Bearer ${nextToken()}`)
      .send({ days: [VALID_DAY] });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('2FA_REQUIRED');
  });

  it('rejects rewards outside the allowed range', async () => {
    authenticateAs(ADMIN_ID, { two_factor_enabled: true });

    const res = await request(app)
      .put('/api/roadmap/admin/config')
      .set('Authorization', `Bearer ${nextToken()}`)
      .set('x-admin-token', signAdminToken(ADMIN_ID, 'admin'))
      .send({ days: [{ ...VALID_DAY, reward_value: 999_999 }] });

    expect(res.status).toBe(400);
    expect(db.rows('monthly_roadmap_config')).toHaveLength(0);
  });

  it('persists a valid config for a 2FA-verified admin and strips unknown columns', async () => {
    authenticateAs(ADMIN_ID, { two_factor_enabled: true });

    const res = await request(app)
      .put('/api/roadmap/admin/config')
      .set('Authorization', `Bearer ${nextToken()}`)
      .set('x-admin-token', signAdminToken(ADMIN_ID, 'admin'))
      .send({ days: [{ ...VALID_DAY, created_at: '2026-01-01T00:00:00Z', injected: true }] });

    expect(res.status).toBe(200);
    expect(db.rows('monthly_roadmap_config')).toEqual([VALID_DAY]);
  });

  it('reports a failure instead of success when the database rejects the write', async () => {
    authenticateAs(ADMIN_ID, { two_factor_enabled: true });
    db.failWrites('monthly_roadmap_config');

    const res = await request(app)
      .put('/api/roadmap/admin/config')
      .set('Authorization', `Bearer ${nextToken()}`)
      .set('x-admin-token', signAdminToken(ADMIN_ID, 'admin'))
      .send({ days: [VALID_DAY] });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('claimDailyReward', () => {
  const seedStreak = (overrides: Record<string, unknown> = {}) => {
    db.rows('user_daily_streaks').push({
      user_id: USER_ID,
      current_streak: 3,
      streak_shields: 3,
      prestige_level: 0,
      total_claims: 3,
      last_claim_at: new Date(Date.now() - 25 * HOUR_MS).toISOString(),
      ...overrides,
    });
  };

  it('credits the reward exactly once when two claims race', async () => {
    seedStreak();

    const results = await Promise.all([claimAs(USER_ID), claimAs(USER_ID)]);

    expect(results.map((r) => r.statusCode).sort()).toEqual([200, 409]);
    expect(gachaBalanceService.refundGachaBalance).toHaveBeenCalledTimes(1);
    expect(db.rows('user_daily_streaks')[0].total_claims).toBe(4);
  });

  it('credits a first-ever claim exactly once under concurrency', async () => {
    const results = await Promise.all([claimAs(USER_ID), claimAs(USER_ID)]);

    expect(results.map((r) => r.statusCode).sort()).toEqual([200, 409]);
    expect(gachaBalanceService.refundGachaBalance).toHaveBeenCalledTimes(1);
    expect(db.rows('user_daily_streaks')).toHaveLength(1);
  });

  it('keeps the cooldown between claims', async () => {
    seedStreak({ last_claim_at: new Date(Date.now() - HOUR_MS).toISOString() });

    const result = await claimAs(USER_ID);

    expect(result.statusCode).toBe(400);
    expect(gachaBalanceService.refundGachaBalance).not.toHaveBeenCalled();
  });

  it('rolls the claim back when the reward cannot be credited', async () => {
    seedStreak();
    const before = { ...db.rows('user_daily_streaks')[0] };
    vi.mocked(gachaBalanceService.refundGachaBalance).mockRejectedValueOnce(new Error('db down'));

    const result = await claimAs(USER_ID);

    expect(result.statusCode).toBe(500);
    expect(db.rows('user_daily_streaks')[0]).toEqual(before);
  });
});

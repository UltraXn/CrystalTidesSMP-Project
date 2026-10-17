import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import speakeasy from 'speakeasy';
import crypto from 'node:crypto';
import type { User } from '@supabase/supabase-js';
import app from '../../app.js';
import supabase from '../../config/supabaseClient.js';
import { FakeSupabase } from '../helpers/fakeSupabase.js';

const STEP_SECONDS = 30;

let db: FakeSupabase;
let tokenCounter = 0;

// Each test uses its own user: the per-user code-attempt budget is module-level state.
const newUserId = () => crypto.randomUUID();
const nextToken = () => `2fa-test-token-${++tokenCounter}`;

/** TOTP for `offset` steps after the current one (deterministic around step boundaries). */
const codeAt = (secret: string, offset = 0) => {
  const step = Math.floor(Date.now() / 1000 / STEP_SECONDS) + offset;
  return speakeasy.totp({ secret, encoding: 'base32', time: step * STEP_SECONDS });
};

function authenticateAs(id: string) {
  vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
    data: {
      user: { id, email: `${id}@test.dev`, user_metadata: {}, app_metadata: {} } as unknown as User,
    },
    error: null,
  });
}

const post = (path: string, body: Record<string, unknown> = {}) =>
  request(app)
    .post(`/api/auth/2fa/${path}`)
    .set('Authorization', `Bearer ${nextToken()}`)
    .send(body);

async function enrol(userId: string): Promise<string> {
  authenticateAs(userId);
  const setup = await post('setup');
  const secret = setup.body.data.secret as string;
  const enabled = await post('enable', { token: codeAt(secret) });
  expect(enabled.status).toBe(200);
  return secret;
}

beforeEach(() => {
  vi.restoreAllMocks();
  db = new FakeSupabase({}, { uniqueKeys: { user_totp_secrets: 'user_id' } });
  vi.spyOn(supabase, 'from').mockImplementation(db.from as unknown as typeof supabase.from);
  vi.spyOn(supabase.auth.admin, 'updateUserById').mockResolvedValue({
    data: { user: {} as User },
    error: null,
  });
});

describe('2FA enrolment', () => {
  it('keeps the setup secret server-side and encrypted, never in app_metadata', async () => {
    const userId = newUserId();
    authenticateAs(userId);

    const res = await post('setup');

    expect(res.status).toBe(200);
    const secret = res.body.data.secret as string;
    const [row] = db.rows('user_totp_secrets');
    expect(row.user_id).toBe(userId);
    expect(row.pending_secret_ciphertext).toEqual(expect.any(String));
    expect(String(row.pending_secret_ciphertext)).not.toContain(secret);
    expect(supabase.auth.admin.updateUserById).not.toHaveBeenCalled();
  });

  it('enables only the server-generated secret and ignores one supplied by the client', async () => {
    const userId = newUserId();
    authenticateAs(userId);
    const secret = (await post('setup')).body.data.secret as string;
    const attackerSecret = speakeasy.generateSecret().base32;

    const hijack = await post('enable', { token: codeAt(attackerSecret), secret: attackerSecret });
    const legit = await post('enable', { token: codeAt(secret) });

    expect(hijack.status).toBe(400);
    expect(legit.status).toBe(200);
    const [row] = db.rows('user_totp_secrets');
    expect(row.secret_ciphertext).toEqual(expect.any(String));
    expect(row.pending_secret_ciphertext).toBeNull();
    expect(supabase.auth.admin.updateUserById).toHaveBeenCalledWith(userId, {
      app_metadata: { two_factor_enabled: true, two_factor_secret: null },
    });
  });

  it('refuses to start a new setup while a factor is active', async () => {
    await enrol(newUserId());

    const res = await post('setup');

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('2FA_ALREADY_ENABLED');
  });

  it('fails closed with 503 when the encryption key is not configured', async () => {
    authenticateAs(newUserId());
    const original = process.env.TOTP_ENCRYPTION_KEY;
    process.env.TOTP_ENCRYPTION_KEY = '';

    try {
      const res = await post('setup');
      expect(res.status).toBe(503);
      expect(db.rows('user_totp_secrets')).toHaveLength(0);
    } finally {
      process.env.TOTP_ENCRYPTION_KEY = original;
    }
  });
});

describe('2FA disable', () => {
  it('requires a code, rejects wrong ones and only then removes the factor', async () => {
    const userId = newUserId();
    const secret = await enrol(userId);

    const missing = await post('disable');
    const wrong = await post('disable', { token: '000000' });
    const valid = await post('disable', { token: codeAt(secret, 1) });

    expect(missing.status).toBe(400);
    expect(wrong.status).toBe(400);
    expect(valid.status).toBe(200);
    expect(db.rows('user_totp_secrets')).toHaveLength(0);
    expect(supabase.auth.admin.updateUserById).toHaveBeenLastCalledWith(userId, {
      app_metadata: { two_factor_enabled: false, two_factor_secret: null },
    });
  });
});

describe('2FA verify (admin session)', () => {
  it('issues an admin token once per code and rejects replays', async () => {
    const secret = await enrol(newUserId());
    const code = codeAt(secret, 1);

    const first = await post('verify', { token: code });
    const replay = await post('verify', { token: code });

    expect(first.status).toBe(200);
    expect(first.body.data.adminToken).toEqual(expect.any(String));
    expect(replay.status).toBe(400);
  });

  it('caps code attempts per user', async () => {
    await enrol(newUserId());

    const statuses: number[] = [];
    for (let attempt = 0; attempt < 5; attempt++) {
      statuses.push((await post('verify', { token: '000000' })).status);
    }

    // enable() already spent one attempt of the 5-per-15-minutes budget.
    expect(statuses.slice(0, 4)).toEqual([400, 400, 400, 400]);
    expect(statuses[4]).toBe(429);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import type { User } from '@supabase/supabase-js';
import app from '../../app.js';
import supabase from '../../config/supabaseClient.js';
import { signAdminToken } from '../../services/twoFactorService.js';
import { FakeSupabase } from '../helpers/fakeSupabase.js';

const ADMIN_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TARGET_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const CO_OWNER_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const PLAIN_USER_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

let db: FakeSupabase;
let tokenCounter = 0;
const nextToken = () => `role-test-token-${++tokenCounter}`;

const authUser = (
  id: string,
  userMetadata: Record<string, unknown> = {},
  appMetadata: Record<string, unknown> = {},
) =>
  ({
    id,
    email: `${id}@test.dev`,
    user_metadata: userMetadata,
    app_metadata: appMetadata,
    created_at: '2026-01-01T00:00:00Z',
  }) as unknown as User;

// The target wrote a top role, inflated reputation and a fake rank into user_metadata.
const SELF_PROMOTED_METADATA = { username: 'Target', role: 'neroferno', reputation: 9999 };

const patchRole = (id: string, role: string) =>
  request(app)
    .patch(`/api/users/${id}/role`)
    .set('Authorization', `Bearer ${nextToken()}`)
    .set('x-admin-token', signAdminToken(ADMIN_ID, 'admin'))
    .send({ role });

beforeEach(() => {
  vi.restoreAllMocks();
  db = new FakeSupabase({
    profiles: [
      { id: ADMIN_ID, username: 'Admin', role: 'admin' },
      { id: TARGET_ID, username: 'Target', role: 'user' },
      { id: CO_OWNER_ID, username: 'CoOwner', role: 'killu' },
      { id: PLAIN_USER_ID, username: 'Plain', role: 'user' },
    ],
  });
  vi.spyOn(supabase, 'from').mockImplementation(db.from as unknown as typeof supabase.from);
  vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
    data: { user: authUser(ADMIN_ID, {}, { two_factor_enabled: true }) },
    error: null,
  });
  vi.spyOn(supabase.auth.admin, 'getUserById').mockImplementation(async (id: string) => ({
    data: { user: authUser(id, id === TARGET_ID ? SELF_PROMOTED_METADATA : {}) },
    error: null,
  }));
  vi.spyOn(supabase.auth.admin, 'updateUserById').mockResolvedValue({
    data: { user: {} as User },
    error: null,
  });
});

describe('PATCH /api/users/:id/role', () => {
  it('writes profiles.role even if the target claims a higher role in user_metadata', async () => {
    const res = await patchRole(TARGET_ID, 'helper');

    expect(res.status).toBe(200);
    expect(db.rows('profiles').find((p) => p.id === TARGET_ID)?.role).toBe('helper');
    expect(supabase.auth.admin.updateUserById).toHaveBeenCalledWith(TARGET_ID, {
      user_metadata: { role: 'helper' },
      app_metadata: { role: 'helper' },
    });
  });

  it('protects users whose real role outranks the requester', async () => {
    const res = await patchRole(CO_OWNER_ID, 'user');

    expect(res.status).toBe(403);
    expect(db.rows('profiles').find((p) => p.id === CO_OWNER_ID)?.role).toBe('killu');
  });

  it('does not let an admin hand out owner-level roles', async () => {
    const res = await patchRole(PLAIN_USER_ID, 'owner');

    expect(res.status).toBe(403);
    expect(db.rows('profiles').find((p) => p.id === PLAIN_USER_ID)?.role).toBe('user');
  });

  it('rejects roles outside the known set', async () => {
    const res = await patchRole(TARGET_ID, 'superadmin');

    expect(res.status).toBe(400);
  });
});

describe('GET /api/users/profile/:username', () => {
  it('reports role and reputation from trusted sources, not from user_metadata', async () => {
    vi.spyOn(supabase.auth.admin, 'listUsers').mockResolvedValue({
      data: { users: [authUser(TARGET_ID, SELF_PROMOTED_METADATA)], aud: 'authenticated' },
      error: null,
    } as unknown as Awaited<ReturnType<typeof supabase.auth.admin.listUsers>>);
    db.rows('karma_votes').push(
      { user_id: TARGET_ID, voter_id: 'voter-1' },
      { user_id: TARGET_ID, voter_id: 'voter-2' },
    );

    const res = await request(app).get('/api/users/profile/Target');

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('user');
    expect(res.body.data.reputation).toBe(2);
  });
});

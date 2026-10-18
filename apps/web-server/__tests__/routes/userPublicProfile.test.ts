import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import type { User } from '@supabase/supabase-js';
import app from '../../app.js';
import supabase from '../../config/supabaseClient.js';
import pool from '../../config/database.js';
import { FakeSupabase } from '../helpers/fakeSupabase.js';

const USER_55_ID = '55555555-5555-4555-8555-555555555555';
const USER_MC_ID = '66666666-6666-4666-8666-666666666666';

const mockUser = (id: string, metadata: Record<string, unknown> = {}): User =>
  ({
    id,
    email: `${id}@test.dev`,
    user_metadata: metadata,
    app_metadata: {},
    created_at: '2026-01-01T00:00:00Z',
  }) as unknown as User;

describe('User Public Profile (Phase 2 - Fix 15: 50+ users & linked accounts)', () => {
  let db: FakeSupabase;

  beforeEach(() => {
    vi.restoreAllMocks();
    db = new FakeSupabase({
      profiles: [
        { id: USER_55_ID, username: 'PlayerFiftyFive', role: 'developer' },
        { id: USER_MC_ID, username: 'MCGamer', role: 'user' },
      ],
      karma_votes: [
        { user_id: USER_55_ID, voter_id: 'voter-1' },
        { user_id: USER_55_ID, voter_id: 'voter-2' },
        { user_id: USER_55_ID, voter_id: 'voter-3' },
      ],
    });

    vi.spyOn(supabase, 'from').mockImplementation(db.from as unknown as typeof supabase.from);
    vi.spyOn(supabase.auth.admin, 'getUserById').mockImplementation(async (id: string) => {
      if (id === USER_55_ID) {
        return {
          data: {
            user: mockUser(USER_55_ID, {
              username: 'PlayerFiftyFive',
              minecraft_nick: 'Player55InGame',
            }),
          },
          error: null,
        };
      }
      if (id === USER_MC_ID) {
        return {
          data: {
            user: mockUser(USER_MC_ID, {
              username: 'MCGamer',
              minecraft_nick: 'MCGamer_Pro',
            }),
          },
          error: null,
        };
      }
      return {
        data: { user: null },
        error: {
          name: 'AuthError',
          message: 'User not found',
          status: 404,
          code: 'user_not_found',
          __isAuthError: true,
        } as unknown as import('@supabase/supabase-js').AuthError,
      };
    });
  });

  it('resolves public profile for user 51+ via indexed profile lookup with 200 OK', async () => {
    const res = await request(app).get('/api/users/profile/PlayerFiftyFive');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(USER_55_ID);
    expect(res.body.data.role).toBe('developer');
    expect(res.body.data.reputation).toBe(3);
  });

  it('resolves public profile via linked Minecraft account lookup', async () => {
    vi.spyOn(pool, 'execute').mockImplementation(async (sql: unknown) => {
      const sqlStr = String(sql);
      if (sqlStr.includes('FROM linked_accounts WHERE minecraft_uuid')) {
        return [[{ web_user_id: USER_MC_ID }], []] as never;
      }
      return [[], []] as never;
    });

    const res = await request(app).get('/api/users/profile/uuid-of-mcgamer');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(USER_MC_ID);
    expect(res.body.data.username).toBe('MCGamer_Pro');
  });

  it('returns 404 when profile does not exist', async () => {
    const res = await request(app).get('/api/users/profile/NonExistentGhostUser');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

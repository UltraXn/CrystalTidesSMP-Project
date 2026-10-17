import crypto from 'node:crypto';
import { vi } from 'vitest';
import type { User } from '@supabase/supabase-js';
import supabase from '../../config/supabaseClient.js';
import { signAdminToken } from '../../services/twoFactorService.js';
import { FakeSupabase } from './fakeSupabase.js';

interface SignInOptions {
  username?: string;
  id?: string;
}

/**
 * Authenticates supertest requests as a user whose profiles.role is `role`,
 * with 2FA enrolled and a valid admin session. Writes through the shared
 * Supabase client (system_logs included) land in the returned fake db.
 * Restore with vi.restoreAllMocks().
 */
export function signInAs(role: string, { username = `${role}-user`, id }: SignInOptions = {}) {
  const userId = id ?? crypto.randomUUID();
  const user = {
    id: userId,
    email: `${username}@example.test`,
    app_metadata: { two_factor_enabled: true },
    user_metadata: {},
  } as unknown as User;

  vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
    data: { user },
    error: null,
  } as Awaited<ReturnType<typeof supabase.auth.getUser>>);

  const db = new FakeSupabase({ profiles: [{ id: userId, username, role, avatar_url: '' }] });
  vi.spyOn(supabase, 'from').mockImplementation(db.from as unknown as typeof supabase.from);

  // A fresh bearer per sign-in: authenticateToken caches users by token.
  const headers = {
    Authorization: `Bearer test-session-${crypto.randomUUID()}`,
    'x-admin-token': signAdminToken(userId, role),
  };
  return { headers, db, userId };
}

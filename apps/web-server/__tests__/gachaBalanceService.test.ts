import { describe, it, expect, vi, beforeEach } from 'vitest';
import pool from '../config/database.js';
import supabase from '../config/supabaseClient.js';
import { FakeSupabase } from './helpers/fakeSupabase.js';
import { refundGachaBalance } from '../services/gachaBalanceService.js';

describe('refundGachaBalance (P2 Followups - Item 3: explicit failure on CAS exhaustion)', () => {
  let db: FakeSupabase;

  beforeEach(() => {
    vi.restoreAllMocks();
    db = new FakeSupabase({
      profiles: [{ id: 'user-1', gacha_balance: 50 }],
    });

    vi.spyOn(supabase, 'from').mockImplementation(db.from as unknown as typeof supabase.from);
    // Simulate MySQL absent or failing so it falls back to Supabase CAS
    vi.spyOn(pool, 'execute').mockResolvedValue([[], []] as never);
  });

  it('increments balance by exact amount when compare-and-swap succeeds', async () => {
    await refundGachaBalance('user-1', 25);

    const rows = db.rows('profiles') as { id: string; gacha_balance: number }[];
    expect(rows[0].gacha_balance).toBe(75);
  });

  it('throws Error(BALANCE_CREDIT_FAILED) and logs error when CAS retries exhaust', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Force write failure on profiles table so CAS updates never apply
    db.failWrites('profiles');

    await expect(refundGachaBalance('user-1', 25)).rejects.toThrow('BALANCE_CREDIT_FAILED');

    expect(consoleSpy).toHaveBeenCalledWith(
      '[GachaBalance] Failed to credit balance after retries:',
      { userId: 'user-1', amount: 25 },
    );
  });
});

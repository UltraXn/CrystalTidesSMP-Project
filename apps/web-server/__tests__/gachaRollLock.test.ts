import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import pool from '../config/database.js';
import supabase from '../config/supabaseClient.js';
import * as balanceService from '../services/gachaBalanceService.js';
import * as commandService from '../services/commandService.js';
import { rollGacha, MAX_ROLLS_IN_FLIGHT } from '../services/gachaService.js';
import { FakeSupabase } from './helpers/fakeSupabase.js';

const outcomes = (results: PromiseSettledResult<unknown>[]) => ({
  fulfilled: results.filter((r) => r.status === 'fulfilled').length,
  inProgress: results.filter(
    (r) => r.status === 'rejected' && (r.reason as Error).message === 'ROLL_IN_PROGRESS',
  ).length,
});

describe('rollGacha per-user lock', () => {
  let heldLocks: Set<string>;
  let getConnection: ReturnType<typeof vi.spyOn>;
  let releasedConnections: number;
  let deduct: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    heldLocks = new Set();
    releasedConnections = 0;

    // MySQL named-lock semantics: one holder per name, shared by every connection.
    const query = async (sql: string, params: string[]) => {
      const [name] = params;
      if (sql.includes('RELEASE_LOCK')) {
        heldLocks.delete(name);
        return [[{ released: 1 }], []];
      }
      const acquired = heldLocks.has(name) ? 0 : 1;
      if (acquired) heldLocks.add(name);
      return [[{ acquired }], []];
    };
    getConnection = vi.spyOn(pool, 'getConnection').mockImplementation((async () => ({
      query,
      release: () => {
        releasedConnections += 1;
      },
    })) as never);

    const db = new FakeSupabase({ gacha_history: [] });
    vi.spyOn(supabase, 'from').mockImplementation(db.from as unknown as typeof supabase.from);

    vi.spyOn(balanceService, 'getLinkedMinecraftNick').mockResolvedValue('Steve');
    vi.spyOn(balanceService, 'getGachaBalance').mockResolvedValue(1000);
    vi.spyOn(balanceService, 'getUnlockedTiers').mockResolvedValue([]);
    deduct = vi.spyOn(balanceService, 'deductGachaBalance').mockResolvedValue(900);
    vi.spyOn(commandService, 'queueCommands').mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('gives away a single free roll when ten requests arrive at once', async () => {
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () => rollGacha('user-1', 'bronze', 1)),
    );

    expect(outcomes(results)).toEqual({ fulfilled: 1, inProgress: 9 });
    expect(deduct).not.toHaveBeenCalled();
  });

  it('does not make different users wait for each other', async () => {
    const results = await Promise.allSettled([
      rollGacha('user-1', 'bronze', 1),
      rollGacha('user-2', 'bronze', 1),
    ]);

    expect(outcomes(results)).toEqual({ fulfilled: 2, inProgress: 0 });
  });

  it('releases the lock and the connection when the roll fails', async () => {
    vi.spyOn(balanceService, 'getLinkedMinecraftNick').mockResolvedValueOnce(null);

    await expect(rollGacha('user-1', 'bronze', 1)).rejects.toThrow('ACCOUNT_NOT_LINKED');
    expect(heldLocks.size).toBe(0);
    expect(releasedConnections).toBe(1);

    await expect(rollGacha('user-1', 'bronze', 1)).resolves.toBeDefined();
  });

  it('refuses new rolls without taking a connection once too many are in flight', async () => {
    let finishRolls = () => {};
    const gate = new Promise<string>((resolve) => {
      finishRolls = () => resolve('Steve');
    });
    vi.spyOn(balanceService, 'getLinkedMinecraftNick').mockReturnValue(gate);

    const inFlight = Array.from({ length: MAX_ROLLS_IN_FLIGHT }, (_, i) =>
      rollGacha(`busy-${i}`, 'bronze', 1),
    );
    await vi.waitFor(() => expect(heldLocks.size).toBe(MAX_ROLLS_IN_FLIGHT));

    await expect(rollGacha('one-too-many', 'bronze', 1)).rejects.toThrow('ROLL_IN_PROGRESS');
    expect(getConnection).toHaveBeenCalledTimes(MAX_ROLLS_IN_FLIGHT);

    finishRolls();
    await Promise.all(inFlight);
    expect(heldLocks.size).toBe(0);
  });
});

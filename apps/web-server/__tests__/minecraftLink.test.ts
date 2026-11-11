import crypto from 'node:crypto';
import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import pool from '../config/database.js';
import supabase from '../config/supabaseClient.js';
import {
  planMinecraftLink,
  syncMinecraftLink,
  type LinkRow,
} from '../controllers/minecraftController.js';
import { FakeSupabase } from './helpers/fakeSupabase.js';
import { signInAs } from './helpers/signInAs.js';

const USER = 'web-user-a';
const OTHER_USER = 'web-user-b';
const UUID_X = '11111111-1111-1111-1111-111111111111';
const UUID_Y = '22222222-2222-2222-2222-222222222222';

const row = (overrides: Partial<LinkRow>): LinkRow => ({
  minecraft_uuid: null,
  web_user_id: null,
  discord_id: null,
  discord_tag: null,
  gacha_balance: 0,
  ...overrides,
});

const sqlOf = (plan: ReturnType<typeof planMinecraftLink>) => plan.map((s) => s.sql);

const INSERT_LINK =
  'INSERT INTO linked_accounts (minecraft_uuid, minecraft_name, web_user_id, discord_id, discord_tag, gacha_balance) VALUES (?, ?, ?, ?, ?, ?)';

describe('planMinecraftLink', () => {
  it('re-linking the same account only refreshes the name: no row is deleted, the balance is untouched', () => {
    const mine = row({ minecraft_uuid: UUID_X, web_user_id: USER, gacha_balance: 5000 });

    const plan = planMinecraftLink(mine, mine, UUID_X, 'Steve', USER);

    expect(plan).toEqual([
      {
        sql: 'UPDATE linked_accounts SET minecraft_name = ? WHERE minecraft_uuid = ?',
        params: ['Steve', UUID_X],
      },
    ]);
  });

  it('claims a plugin-only row in place, keeping its coins and Discord link', () => {
    const pluginRow = row({
      minecraft_uuid: UUID_X,
      discord_id: 'discord-x',
      discord_tag: 'steve',
      gacha_balance: 300,
    });

    const plan = planMinecraftLink(undefined, pluginRow, UUID_X, 'Steve', USER);

    expect(plan).toHaveLength(1);
    expect(plan[0].sql).toMatch(
      /^UPDATE linked_accounts SET minecraft_name = \?, web_user_id = \?/,
    );
    expect(plan[0].params).toEqual(['Steve', USER, 'discord-x', 'steve', 300, UUID_X]);
  });

  it("does not hand another web user's coins or Discord link to the new owner", () => {
    const theirs = row({
      minecraft_uuid: UUID_X,
      web_user_id: OTHER_USER,
      discord_id: 'discord-b',
      discord_tag: 'bob',
      gacha_balance: 900,
    });

    const plan = planMinecraftLink(undefined, theirs, UUID_X, 'Steve', USER);

    expect(plan).toHaveLength(1);
    expect(plan[0].params).toEqual(['Steve', USER, null, null, 0, UUID_X]);
  });

  it('switching Minecraft accounts releases the old row first and carries balance and Discord over', () => {
    const oldRow = row({
      minecraft_uuid: UUID_Y,
      web_user_id: USER,
      discord_id: 'discord-a',
      discord_tag: 'alice',
      gacha_balance: 1200,
    });
    const pluginRow = row({ minecraft_uuid: UUID_X, gacha_balance: 50 });

    const plan = planMinecraftLink(oldRow, pluginRow, UUID_X, 'Steve', USER);

    expect(sqlOf(plan)).toEqual([
      'UPDATE linked_accounts SET web_user_id = NULL, discord_id = NULL, discord_tag = NULL, gacha_balance = 0 WHERE web_user_id = ?',
      'DELETE FROM linked_accounts WHERE minecraft_uuid IS NULL AND discord_id IS NULL AND web_user_id IS NULL',
      'UPDATE linked_accounts SET minecraft_name = ?, web_user_id = ?, discord_id = ?, discord_tag = ?, gacha_balance = ? WHERE minecraft_uuid = ?',
    ]);
    expect(plan[0].params).toEqual([USER]);
    expect(plan[2].params).toEqual(['Steve', USER, 'discord-a', 'alice', 1250, UUID_X]);
  });

  it('gives a Minecraft account without a row a fresh one, so the old account keeps its stats and tiers', () => {
    const oldRow = row({
      minecraft_uuid: UUID_Y,
      web_user_id: USER,
      discord_id: 'discord-a',
      discord_tag: 'alice',
      gacha_balance: 700,
    });

    const plan = planMinecraftLink(oldRow, undefined, UUID_X, 'Steve', USER);

    expect(sqlOf(plan)).toEqual([
      'UPDATE linked_accounts SET web_user_id = NULL, discord_id = NULL, discord_tag = NULL, gacha_balance = 0 WHERE web_user_id = ?',
      'DELETE FROM linked_accounts WHERE minecraft_uuid IS NULL AND discord_id IS NULL AND web_user_id IS NULL',
      INSERT_LINK,
    ]);
    expect(plan[2].params).toEqual([UUID_X, 'Steve', USER, 'discord-a', 'alice', 700]);
    // The old row is released by its web user, never re-pointed to the new UUID.
    expect(sqlOf(plan).join(' ')).not.toContain('SET minecraft_uuid');
  });

  it('inserts an empty row when neither side has one', () => {
    const plan = planMinecraftLink(undefined, undefined, UUID_X, 'Steve', USER);

    expect(plan).toEqual([{ sql: INSERT_LINK, params: [UUID_X, 'Steve', USER, null, null, 0] }]);
  });

  it('never deletes a row that holds an identifier', () => {
    const mine = row({ minecraft_uuid: UUID_Y, web_user_id: USER, gacha_balance: 10 });
    const theirs = row({ minecraft_uuid: UUID_X, web_user_id: OTHER_USER, gacha_balance: 20 });
    const plans = [
      planMinecraftLink(mine, mine, UUID_Y, 'Steve', USER),
      planMinecraftLink(mine, theirs, UUID_X, 'Steve', USER),
      planMinecraftLink(mine, undefined, UUID_X, 'Steve', USER),
      planMinecraftLink(undefined, theirs, UUID_X, 'Steve', USER),
    ];

    for (const sql of plans.flatMap(sqlOf)) {
      if (sql.startsWith('DELETE')) {
        expect(sql).toContain(
          'minecraft_uuid IS NULL AND discord_id IS NULL AND web_user_id IS NULL',
        );
      }
    }
  });
});

describe('syncMinecraftLink', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // A connection whose two locking SELECTs return the given rows and that records what runs on it.
  const connectionWith = (current: LinkRow | undefined, account: LinkRow | undefined) => {
    const writes: string[] = [];
    const events: string[] = [];
    const execute = async (sql: string) => {
      if (sql.includes('WHERE web_user_id = ? FOR UPDATE')) return [current ? [current] : [], []];
      if (sql.includes('WHERE minecraft_uuid = ? FOR UPDATE'))
        return [account ? [account] : [], []];
      writes.push(sql);
      return [{ affectedRows: 1 }, []];
    };
    vi.spyOn(pool, 'getConnection').mockResolvedValue({
      execute,
      beginTransaction: async () => void events.push('begin'),
      commit: async () => void events.push('commit'),
      rollback: async () => void events.push('rollback'),
      release: () => void events.push('release'),
    } as never);
    return { writes, events };
  };

  const otherUsersRow = () =>
    row({ minecraft_uuid: UUID_X, web_user_id: OTHER_USER, gacha_balance: 900 });

  it("saves the previous owner's coins to their Supabase balance before claiming their row", async () => {
    const db = new FakeSupabase({ profiles: [{ id: OTHER_USER, gacha_balance: 100 }] });
    vi.spyOn(supabase, 'from').mockImplementation(db.from as unknown as typeof supabase.from);
    const { writes, events } = connectionWith(undefined, otherUsersRow());

    await syncMinecraftLink(UUID_X, 'Steve', USER);

    expect(db.rows('profiles')[0]).toMatchObject({ id: OTHER_USER, gacha_balance: 900 });
    expect(writes).toHaveLength(1);
    expect(writes[0]).toContain('SET minecraft_name = ?, web_user_id = ?');
    expect(events).toEqual(['begin', 'commit', 'release']);
  });

  it("leaves the row alone when the previous owner's coins cannot be saved", async () => {
    const db = new FakeSupabase({ profiles: [{ id: OTHER_USER, gacha_balance: 100 }] });
    db.failWrites('profiles');
    vi.spyOn(supabase, 'from').mockImplementation(db.from as unknown as typeof supabase.from);
    const { writes, events } = connectionWith(undefined, otherUsersRow());

    await expect(syncMinecraftLink(UUID_X, 'Steve', USER)).rejects.toBeDefined();

    expect(writes).toEqual([]);
    expect(events).toEqual(['begin', 'rollback', 'release']);
  });
});

describe('GET /api/minecraft/link/check', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("only ever looks up the caller's own link, whatever ?userId= says", async () => {
    const victimId = crypto.randomUUID();
    const { headers, userId } = signInAs('user');
    const execute = vi.spyOn(pool, 'execute').mockResolvedValue([[], []] as never);

    const res = await request(app)
      .get('/api/minecraft/link/check')
      .query({ userId: victimId })
      .set(headers);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ linked: false });

    const queriedIds = execute.mock.calls.flatMap(([, params]) => (params as unknown[]) ?? []);
    expect(queriedIds).toContain(userId);
    expect(queriedIds).not.toContain(victimId);
  });
});

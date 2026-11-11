import crypto from 'node:crypto';
import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import pool from '../config/database.js';
import { planMinecraftLink, type LinkRow } from '../controllers/minecraftController.js';
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

  it("re-points the user's own row when the Minecraft account has none", () => {
    const oldRow = row({ minecraft_uuid: UUID_Y, web_user_id: USER, gacha_balance: 700 });

    const plan = planMinecraftLink(oldRow, undefined, UUID_X, 'Steve', USER);

    expect(plan).toEqual([
      {
        sql: 'UPDATE linked_accounts SET minecraft_uuid = ?, minecraft_name = ? WHERE web_user_id = ?',
        params: [UUID_X, 'Steve', USER],
      },
    ]);
  });

  it('inserts a basic row when neither side has one', () => {
    const plan = planMinecraftLink(undefined, undefined, UUID_X, 'Steve', USER);

    expect(plan).toEqual([
      {
        sql: 'INSERT INTO linked_accounts (minecraft_uuid, minecraft_name, web_user_id) VALUES (?, ?, ?)',
        params: [UUID_X, 'Steve', USER],
      },
    ]);
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

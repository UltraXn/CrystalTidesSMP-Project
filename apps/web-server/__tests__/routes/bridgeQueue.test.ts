import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import * as commandService from '../../services/commandService.js';
import { signInAs } from '../helpers/signInAs.js';
import type { FakeSupabase } from '../helpers/fakeSupabase.js';

const BOT_KEY = 'test-bot-key-for-bridge-queue';
const BOT_AUTH = { Authorization: `Bearer ${BOT_KEY}` };
const CHAT_RELAY = 'tellraw @a [{"text":"[Discord] ","color":"blue"},{"text":"hola a todos"}]';

const queue = (headers: Record<string, string>, command: string) =>
  request(app).post('/api/bridge/queue').set(headers).send({ command });

const auditRows = (db: FakeSupabase, action: string) =>
  db.rows('system_logs').filter((row) => row.action === action);

describe('POST /api/bridge/queue', () => {
  let queueCommand: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    process.env.BOT_API_KEY = BOT_KEY;
    queueCommand = vi
      .spyOn(commandService, 'queueCommand')
      .mockResolvedValue({ success: true, id: 42 });
  });

  afterEach(() => {
    process.env.BOT_API_KEY = '';
    vi.restoreAllMocks();
  });

  describe('Discord bot (service role)', () => {
    it('relays chat as tellraw without needing an admin 2FA session', async () => {
      const res = await queue(BOT_AUTH, CHAT_RELAY);

      expect(res.status).toBe(200);
      expect(queueCommand).toHaveBeenCalledWith(CHAT_RELAY);
    });

    it('cannot run anything else with the API key', async () => {
      for (const command of ['op attacker', 'say hi', 'tellraw @a not-json', 'tellraw @p {}']) {
        const res = await queue(BOT_AUTH, command);
        expect(res.status, command).toBe(403);
      }
      expect(queueCommand).not.toHaveBeenCalled();
    });

    it('no longer passes admin-only routes', async () => {
      const res = await request(app).get('/api/users').set(BOT_AUTH);

      expect(res.status).toBe(403);
    });
  });

  describe('admins', () => {
    it('queue moderation commands, normalized and audited', async () => {
      const { headers, db, userId } = signInAs('admin');
      const res = await queue(headers, '/kick Griefer spam');

      expect(res.status).toBe(200);
      expect(queueCommand).toHaveBeenCalledWith('kick Griefer spam');
      await vi.waitFor(() => expect(auditRows(db, 'BRIDGE_COMMAND_QUEUED')).toHaveLength(1));
      expect(auditRows(db, 'BRIDGE_COMMAND_QUEUED')[0]).toMatchObject({ user_id: userId });
    });

    it.each([
      'op attacker',
      'minecraft:op attacker',
      'execute as @a run op attacker',
      'lp user attacker permission set *',
      'sudo Owner op attacker',
      'stop',
      'say hi\nop attacker',
    ])('cannot escalate with %j, and the attempt is audited', async (command) => {
      const { headers, db } = signInAs('admin');
      const res = await queue(headers, command);

      expect(res.status).toBe(403);
      expect(queueCommand).not.toHaveBeenCalled();
      await vi.waitFor(() => expect(auditRows(db, 'BRIDGE_COMMAND_REJECTED')).toHaveLength(1));
    });

    it('a username matching an owner does not grant owner commands', async () => {
      const { headers } = signInAs('admin', { username: 'neroferno' });
      const res = await queue(headers, 'op attacker');

      expect(res.status).toBe(403);
    });
  });

  describe('owners', () => {
    it.each(['owner', 'neroferno'])('%s keeps full console access', async (role) => {
      const { headers } = signInAs(role);
      const res = await queue(headers, 'op TrustedMod');

      expect(res.status).toBe(200);
      expect(queueCommand).toHaveBeenCalledWith('op TrustedMod');
    });
  });

  it('regular users are rejected before the policy runs', async () => {
    const { headers } = signInAs('user');
    const res = await queue(headers, 'say hi');

    expect(res.status).toBe(403);
    expect(queueCommand).not.toHaveBeenCalled();
  });
});

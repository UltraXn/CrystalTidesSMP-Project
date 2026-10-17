import { describe, it, expect } from 'vitest';
import { authorizeCommand, baseCommand } from '../../utils/commandPolicy.js';

describe('baseCommand', () => {
  it.each([
    ['op x', 'op'],
    ['Minecraft:OP x', 'op'],
    ['bukkit:ban x', 'ban'],
    ['kick', 'kick'],
  ])('%j -> %j', (command, expected) => {
    expect(baseCommand(command)).toBe(expected);
  });
});

describe('authorizeCommand', () => {
  it('strips leading slashes and outer spaces but keeps the rest verbatim', () => {
    expect(authorizeCommand('admin', '  //say  hola   mundo ')).toEqual({
      allowed: true,
      command: 'say  hola   mundo',
    });
  });

  it('rejects control characters for every role, owners included', () => {
    for (const command of ['say hi\nop x', 'say hi\rop x', 'op\tx', 'say \u0000']) {
      expect(authorizeCommand('owner', command).allowed, JSON.stringify(command)).toBe(false);
    }
  });

  it('rejects empty commands', () => {
    expect(authorizeCommand('owner', ' / ').allowed).toBe(false);
  });

  it('limits admins to the allowlist, whatever the namespace or casing', () => {
    expect(authorizeCommand('admin', 'BAN Griefer x-ray').allowed).toBe(true);
    expect(authorizeCommand('Admin', 'minecraft:kick Griefer').allowed).toBe(true);
    expect(authorizeCommand('admin', 'Minecraft:Op x').allowed).toBe(false);
    expect(authorizeCommand('developer', 'give Griefer diamond 64').allowed).toBe(false);
  });

  it('only lets the service account relay tellraw JSON to everyone', () => {
    expect(authorizeCommand('service', 'tellraw @a {"text":"hi"}').allowed).toBe(true);
    expect(authorizeCommand('service', 'tellraw @a "just a string"').allowed).toBe(false);
    expect(authorizeCommand('service', 'tellraw @a {"text":"hi"} extra').allowed).toBe(false);
    expect(authorizeCommand('service', 'kick Owner').allowed).toBe(false);
  });

  it('names the restricted command in the reason', () => {
    expect(authorizeCommand('admin', 'execute run op x')).toEqual({
      allowed: false,
      reason: "'execute' is restricted to owners",
    });
  });
});

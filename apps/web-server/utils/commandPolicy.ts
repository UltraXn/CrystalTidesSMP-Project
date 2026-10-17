import { SERVICE_ROLE } from './roleUtils.js';

/**
 * Who may queue which console command through /api/bridge/queue.
 *
 * Allowlist per role instead of a denylist: a denylist of "op"/"deop" is
 * bypassed by any command that runs another one ("execute ... run op",
 * LuckPerms "lp user x permission set *", Essentials "sudo", ...).
 * The console runs everything with full privileges, so anything not listed
 * here stays owner-only.
 */

/** Roles (from profiles.role) with unrestricted console access, still behind 2FA. */
export const OWNER_ROLES = ['owner', 'neroferno', 'killu', 'killuwu'];

/** Communication and moderation: nothing that grants permissions, items or runs other commands. */
export const ADMIN_COMMANDS = new Set([
  'say',
  'tellraw',
  'title',
  'broadcast',
  'list',
  'time',
  'weather',
  'kick',
  'ban',
  'ban-ip',
  'tempban',
  'pardon',
  'pardon-ip',
  'unban',
  'mute',
  'tempmute',
  'unmute',
  'warn',
  'whitelist',
]);

// The Discord chat bridge only relays chat: `tellraw @a <JSON component>`.
const SERVICE_TELLRAW_PREFIX = 'tellraw @a ';

export type CommandDecision =
  | { allowed: true; command: string }
  | { allowed: false; reason: string };

// Tabs and line breaks too: the shared schema lets \t-\r through.
const SPACE_CHAR_CODE = 0x20;
const DELETE_CHAR_CODE = 0x7f;

const hasControlChars = (text: string): boolean =>
  [...text].some((char) => {
    const code = char.charCodeAt(0);
    return code < SPACE_CHAR_CODE || code === DELETE_CHAR_CODE;
  });

/** Command name as the server resolves it: "/Minecraft:OP x" -> "op". */
export function baseCommand(command: string): string {
  const firstToken = command.split(' ')[0] ?? '';
  return firstToken.toLowerCase().replace(/^.*:/, '');
}

function isChatRelay(command: string): boolean {
  if (!command.startsWith(SERVICE_TELLRAW_PREFIX)) return false;
  try {
    const component: unknown = JSON.parse(command.slice(SERVICE_TELLRAW_PREFIX.length));
    return typeof component === 'object' && component !== null;
  } catch {
    return false;
  }
}

function denied(reason: string): CommandDecision {
  return { allowed: false, reason };
}

/**
 * Decides whether `role` may queue `rawCommand`. On success returns the command
 * to queue: leading slashes and surrounding spaces removed, the rest untouched
 * (tellraw JSON is whitespace-sensitive).
 */
export function authorizeCommand(role: string, rawCommand: string): CommandDecision {
  if (hasControlChars(rawCommand)) {
    return denied('Command contains control characters');
  }

  const command = rawCommand.trim().replace(/^\/+/, '').trim();
  if (!command) return denied('Command cannot be empty');

  const normalizedRole = role.toLowerCase();
  if (OWNER_ROLES.includes(normalizedRole)) return { allowed: true, command };

  if (normalizedRole === SERVICE_ROLE) {
    return isChatRelay(command)
      ? { allowed: true, command }
      : denied('The service account may only relay chat (tellraw @a <json>)');
  }

  return ADMIN_COMMANDS.has(baseCommand(command))
    ? { allowed: true, command }
    : denied(`'${baseCommand(command)}' is restricted to owners`);
}

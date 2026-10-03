// Minecraft Java Edition validation and identifier formatting utilities

/**
 * Validates whether a given string is a valid Minecraft Java Edition username.
 * Rules: 3-16 characters, alphanumeric characters and underscores only.
 */
export function isValidMinecraftNick(nick: unknown): boolean {
  if (typeof nick !== 'string') return false;
  return /^[a-zA-Z0-9_]{3,16}$/.test(nick);
}

/**
 * Normalizes any valid 32-character (unhyphenated) or 36-character (canonical)
 * Minecraft UUID into lowercase canonical format (8-4-4-4-12).
 * Returns null if the format is invalid or malformed.
 */
export function normalizeMinecraftUuid(uuid: unknown): string | null {
  if (typeof uuid !== 'string') return null;
  const clean = uuid.replace(/-/g, '').trim().toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(clean)) return null;
  return clean.replace(
    /^([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12})$/,
    '$1-$2-$3-$4-$5',
  );
}

/**
 * Formats a Crafatar avatar render URL for a given Minecraft UUID or Nickname.
 * Falls back to local logo if input is missing or empty.
 */
export function formatMinecraftAvatarUrl(uuidOrNick: string, size = 64): string {
  if (!uuidOrNick || !uuidOrNick.trim()) {
    return '/images/ui/logo.webp';
  }
  return `https://crafatar.com/avatars/${encodeURIComponent(uuidOrNick.trim())}?size=${size}&overlay`;
}

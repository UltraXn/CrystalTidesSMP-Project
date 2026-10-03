import { RowDataPacket } from 'mysql2';
import db from '../config/database.js';

interface PlayerStats {
  username: string;
  rank: string;
  rank_image: string;
  playtime: string;
  kills: number;
  mob_kills: number;
  deaths: number;
  money: string;
  blocks_mined: string;
  blocks_placed: string;
  member_since: string;
  raw_id?: number;
  raw_playtime?: number;
  raw_kills?: number;
  raw_blocks_mined?: number;
  raw_blocks_placed?: number;
  raw_rank?: string;
}

interface SessionStats {
  playtime?: number;
  mobs?: number;
  deaths?: number;
}

interface PlanUserRow extends RowDataPacket {
  uuid: string;
  name: string;
  id: number;
  registered: number | string | Date;
}

interface CountRow extends RowDataPacket {
  count: number;
}

interface VaultBalanceRow extends RowDataPacket {
  vault_balance: number | null;
  vault_balance_str: string | null;
}

interface LuckPermsUserRow extends RowDataPacket {
  primary_group: string | null;
}

interface LuckPermsPermRow extends RowDataPacket {
  permission: string;
}

interface RankInfo {
  name: string;
  image: string;
}

const CONSTANTS = {
  DEFAULT_RANK: 'default',
  DEFAULT_RANK_IMAGE: 'user.png',
  ZERO_STAT: '0',
  UUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  PERMISSION_PREFIX: 'group.',
} as const;

const GROUP_MAP: Record<string, string> = {
  '§f§r': 'neroferno',
  '§f§r': 'fundador',
  '§f§r': 'donador',
  '§f§r': 'developer',
  '': 'killuwu',
  [CONSTANTS.DEFAULT_RANK]: CONSTANTS.DEFAULT_RANK,
};

const RANK_PRIORITY = [
  'default',
  'donador',
  'fundador',
  'developer',
  'killuwu',
  'neroferno',
] as const;

const RANK_IMAGES: Record<string, string> = {
  neroferno: 'rank-neroferno.png',
  fundador: 'rank-fundador.png',
  donador: 'rank-donador.png',
  developer: 'developer.png',
  killuwu: 'rank-killu.png',
  [CONSTANTS.DEFAULT_RANK]: CONSTANTS.DEFAULT_RANK_IMAGE,
};

const DEFAULT_SESSION_STATS: Required<SessionStats> = {
  playtime: 0,
  mobs: 0,
  deaths: 0,
};

const MONEY_TIERS = [
  { threshold: 1_000_000_000, suffix: 'B' },
  { threshold: 1_000_000, suffix: 'M' },
  { threshold: 1_000, suffix: 'k' },
] as const;

// --- Helper Functions ---

const resolvePlanUser = async (queryTerm: string): Promise<PlanUserRow | null> => {
  const isUUID = CONSTANTS.UUID_REGEX.test(queryTerm);
  const query = isUUID
    ? 'SELECT uuid, name, id, registered FROM plan_users WHERE uuid = ? LIMIT 1'
    : 'SELECT uuid, name, id, registered FROM plan_users WHERE name = ? ORDER BY registered DESC LIMIT 1';

  const [users] = await db.query<PlanUserRow[]>(query, [queryTerm]);
  if (!users || users.length === 0) {
    return null;
  }

  return users[0];
};

const formatPlaytime = (playtimeMs: number): string => {
  const totalMinutes = Math.floor(playtimeMs / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const formatMoneyCompact = (num: number): string => {
  for (const tier of MONEY_TIERS) {
    if (num >= tier.threshold) {
      const formatted = (num / tier.threshold).toFixed(2).replace(/\.00$/, '');
      return `${formatted}${tier.suffix}`;
    }
  }
  return num.toLocaleString('en-US');
};

const resolveHighestRank = (groups: string[]): string => {
  const normalizedGroups = groups.map((g) => GROUP_MAP[g] || g.toLowerCase());
  let highestRank: string = CONSTANTS.DEFAULT_RANK;
  let highestIndex = -1;

  for (const group of normalizedGroups) {
    const idx = (RANK_PRIORITY as readonly string[]).indexOf(group);
    if (idx > highestIndex) {
      highestIndex = idx;
      highestRank = group;
    }
  }

  if (highestIndex === -1 && normalizedGroups.length > 0) {
    const nonDefaultGroup = normalizedGroups.find((g) => g !== CONSTANTS.DEFAULT_RANK);
    if (nonDefaultGroup) {
      highestRank = nonDefaultGroup;
    }
  }

  return highestRank;
};

const processRank = (groups: string[]): RankInfo => {
  const highestRank = resolveHighestRank(groups);
  const rankName =
    highestRank === 'developer'
      ? 'Developer'
      : highestRank.charAt(0).toUpperCase() + highestRank.slice(1);

  const rankImage = RANK_IMAGES[highestRank] || CONSTANTS.DEFAULT_RANK_IMAGE;
  return { name: rankName, image: rankImage };
};

const getSessionStats = async (planUserId: number): Promise<SessionStats> => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `
            SELECT 
                SUM(CASE WHEN session_end IS NOT NULL THEN (session_end - session_start) ELSE (UNIX_TIMESTAMP(NOW()) * 1000 - session_start) END) as playtime,
                SUM(mob_kills) as mobs,
                SUM(deaths) as deaths
            FROM plan_sessions WHERE user_id = ?
        `,
      [planUserId],
    );

    return (rows[0] as SessionStats) || DEFAULT_SESSION_STATS;
  } catch (error) {
    console.error('SessionStats Error', error);
    return DEFAULT_SESSION_STATS;
  }
};

const getPvpKills = async (uuid: string): Promise<number> => {
  try {
    const [rows] = await db.query<CountRow[]>(
      'SELECT COUNT(*) as count FROM plan_kills WHERE killer_uuid = ?',
      [uuid],
    );
    return rows[0]?.count || 0;
  } catch {
    return 0;
  }
};

export const getMoney = async (uuid: string): Promise<number> => {
  try {
    const [rows] = await db.query<VaultBalanceRow[]>(
      `
            SELECT 
                (SELECT uv.double_value FROM plan_extension_user_values uv JOIN plan_extension_providers ep ON uv.provider_id = ep.id JOIN plan_extension_plugins pl ON ep.plugin_id = pl.id WHERE (pl.name LIKE '%Economy%' OR pl.name LIKE '%Vault%') AND (ep.name LIKE '%Balance%' OR ep.text LIKE '%Balance%') AND uv.uuid = ? ORDER BY uv.id DESC LIMIT 1) as vault_balance,
                (SELECT uv.string_value FROM plan_extension_user_values uv JOIN plan_extension_providers ep ON uv.provider_id = ep.id JOIN plan_extension_plugins pl ON ep.plugin_id = pl.id WHERE (pl.name LIKE '%Economy%' OR pl.name LIKE '%Vault%') AND (ep.name LIKE '%Balance%' OR ep.text LIKE '%Balance%' OR ep.name LIKE '%vault_eco_balance%') AND uv.uuid = ? ORDER BY uv.id DESC LIMIT 1) as vault_balance_str
        `,
      [uuid, uuid],
    );

    let val = Number(rows[0]?.vault_balance) || 0;
    if (val === 0 && rows[0]?.vault_balance_str) {
      val = Number(rows[0].vault_balance_str.replace(/[^0-9.]/g, '')) || 0;
    }
    return val;
  } catch {
    return 0;
  }
};

const getLuckPermsGroups = async (uuid: string): Promise<string[]> => {
  try {
    const [lpUsers] = await db.query<LuckPermsUserRow[]>(
      'SELECT primary_group FROM luckperms_players WHERE uuid = ?',
      [uuid],
    );
    const groups: string[] = [];
    if (lpUsers.length > 0 && lpUsers[0].primary_group) {
      groups.push(lpUsers[0].primary_group);
    }

    const [lpPerms] = await db.query<LuckPermsPermRow[]>(
      `SELECT permission FROM luckperms_user_permissions WHERE uuid = ? AND permission LIKE 'group.%'`,
      [uuid],
    );
    for (const row of lpPerms) {
      groups.push(row.permission.replace(CONSTANTS.PERMISSION_PREFIX, ''));
    }
    return groups;
  } catch {
    return [CONSTANTS.DEFAULT_RANK];
  }
};

// --- Main Service Export ---

export const getPlayerStats = async (usernameFragment: string): Promise<PlayerStats | null> => {
  const cleanUsername = usernameFragment.trim();
  if (!cleanUsername) {
    return null;
  }

  const user = await resolvePlanUser(cleanUsername);
  if (!user) {
    return null;
  }

  const { uuid, name: resolvedName, id: planUserId, registered } = user;

  const [sessionStats, killStats, moneyStats, lpGroups] = await Promise.all([
    getSessionStats(planUserId),
    getPvpKills(uuid),
    getMoney(uuid),
    getLuckPermsGroups(uuid),
  ]);

  const rankData = processRank(lpGroups);
  const playtimeMs = sessionStats.playtime || 0;

  return {
    username: resolvedName,
    rank: rankData.name,
    rank_image: rankData.image,
    playtime: formatPlaytime(playtimeMs),
    kills: killStats,
    mob_kills: sessionStats.mobs || 0,
    deaths: sessionStats.deaths || 0,
    money: formatMoneyCompact(moneyStats),
    blocks_mined: CONSTANTS.ZERO_STAT,
    blocks_placed: CONSTANTS.ZERO_STAT,
    member_since: new Date(registered).toLocaleDateString('es-ES'),
    raw_id: planUserId,
    raw_playtime: playtimeMs,
    raw_kills: killStats,
    raw_blocks_mined: 0,
    raw_blocks_placed: 0,
    raw_rank: rankData.name,
  };
};

import { RowDataPacket } from 'mysql2';
import db from '../config/database.js';

export interface PlayerStats {
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
  raw_money?: number;
  is_top1_constructor?: boolean;
  is_top1_luchador?: boolean;
  is_top1_mercader?: boolean;
  is_top1_constancia?: boolean;
  is_top1_explorador?: boolean;
  top1ConstructorScore?: number;
  top1LuchadorScore?: number;
  top1MercaderScore?: number;
  top1ConstanciaScore?: number;
  top1ExploradorScore?: number;
}

export interface ServerBenchmarks {
  topMercaderUuid: string | null;
  maxMoney: number;
  top1MercaderScore: number;
  top1ConstructorScore: number;
  topLuchadorUuid: string | null;
  top1LuchadorScore: number;
  top1ConstanciaScore: number;
  topExploradorUuid: string | null;
  top1ExploradorScore: number;
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

export const BENCHMARK_TTL_MS = 5 * 60 * 1000;

export const DEFAULT_BENCHMARKS: ServerBenchmarks = {
  topMercaderUuid: null,
  maxMoney: 0,
  top1MercaderScore: 500,
  top1ConstructorScore: 100000,
  topLuchadorUuid: null,
  top1LuchadorScore: 5000,
  top1ConstanciaScore: 900,
  topExploradorUuid: null,
  top1ExploradorScore: 3000,
};

let benchmarkCache: { data: ServerBenchmarks; expiresAt: number } | null = null;

export const clearBenchmarkCache = (): void => {
  benchmarkCache = null;
};

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

async function queryTopMercader(): Promise<{ maxMoney: number; topMercaderUuid: string | null }> {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `
      SELECT uv.uuid, uv.double_value, uv.string_value
      FROM plan_extension_user_values uv
      JOIN plan_extension_providers ep ON uv.provider_id = ep.id
      JOIN plan_extension_plugins pl ON ep.plugin_id = pl.id
      WHERE (pl.name LIKE '%Economy%' OR pl.name LIKE '%Vault%')
        AND (ep.name LIKE '%Balance%' OR ep.text LIKE '%Balance%' OR ep.name LIKE '%vault_eco_balance%')
      ORDER BY uv.double_value DESC
      LIMIT 1
      `,
    );

    if (!rows || rows.length === 0) {
      return { maxMoney: 0, topMercaderUuid: null };
    }

    const row = rows[0];
    let val = Number(row.double_value) || 0;
    if (val === 0 && row.string_value) {
      val = Number(row.string_value.replace(/[^0-9.]/g, '')) || 0;
    }

    return {
      maxMoney: val,
      topMercaderUuid: row.uuid ? String(row.uuid) : null,
    };
  } catch {
    return { maxMoney: 0, topMercaderUuid: null };
  }
}

async function queryTopLuchador(): Promise<{ maxScore: number; topLuchadorUuid: string | null }> {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `
      SELECT 
        u.uuid,
        (COALESCE(k.pvp_kills, 0) * 15 + COALESCE(s.total_mobs, 0)) AS combat_points
      FROM plan_users u
      LEFT JOIN (
        SELECT killer_uuid, COUNT(*) AS pvp_kills
        FROM plan_kills
        GROUP BY killer_uuid
      ) k ON u.uuid = k.killer_uuid
      LEFT JOIN (
        SELECT user_id, SUM(mob_kills) AS total_mobs
        FROM plan_sessions
        GROUP BY user_id
      ) s ON u.id = s.user_id
      ORDER BY combat_points DESC
      LIMIT 1
      `,
    );

    if (!rows || rows.length === 0) {
      return { maxScore: 5000, topLuchadorUuid: null };
    }

    const row = rows[0];
    const combatPoints = Number(row.combat_points) || 0;

    return {
      maxScore: Math.max(5000, combatPoints),
      topLuchadorUuid: row.uuid ? String(row.uuid) : null,
    };
  } catch {
    return { maxScore: 5000, topLuchadorUuid: null };
  }
}

async function queryTopExplorador(): Promise<{
  maxScore: number;
  topExploradorUuid: string | null;
}> {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `
      SELECT s.user_id, u.uuid,
        SUM(CASE WHEN s.session_end IS NOT NULL THEN (s.session_end - s.session_start) ELSE (UNIX_TIMESTAMP(NOW()) * 1000 - s.session_start) END) as max_playtime_ms
      FROM plan_sessions s
      JOIN plan_users u ON s.user_id = u.id
      GROUP BY s.user_id, u.uuid
      ORDER BY max_playtime_ms DESC
      LIMIT 1
      `,
    );

    if (!rows || rows.length === 0) {
      return { maxScore: 3000, topExploradorUuid: null };
    }

    const row = rows[0];
    const playtimeMs = Number(row.max_playtime_ms) || 0;
    const playtimeHours = Math.floor(playtimeMs / (1000 * 60 * 60));
    const explorerPoints = Math.round(playtimeHours * 45);

    return {
      maxScore: Math.max(3000, explorerPoints),
      topExploradorUuid: row.uuid ? String(row.uuid) : null,
    };
  } catch {
    return { maxScore: 3000, topExploradorUuid: null };
  }
}

async function queryServerBenchmarksFromDb(): Promise<ServerBenchmarks> {
  const [mercaderRes, luchadorRes, exploradorRes] = await Promise.allSettled([
    queryTopMercader(),
    queryTopLuchador(),
    queryTopExplorador(),
  ]);

  const mercader =
    mercaderRes.status === 'fulfilled' ? mercaderRes.value : { maxMoney: 0, topMercaderUuid: null };
  const luchador =
    luchadorRes.status === 'fulfilled'
      ? luchadorRes.value
      : { maxScore: 5000, topLuchadorUuid: null };
  const explorador =
    exploradorRes.status === 'fulfilled'
      ? exploradorRes.value
      : { maxScore: 3000, topExploradorUuid: null };

  const top1MercaderScore = Math.max(
    500,
    Math.round(100 * Math.log10(Math.max(1, mercader.maxMoney))),
  );
  const top1LuchadorScore = Math.max(5000, luchador.maxScore);
  const top1ExploradorScore = Math.max(3000, explorador.maxScore);

  return {
    topMercaderUuid: mercader.topMercaderUuid,
    maxMoney: mercader.maxMoney,
    top1MercaderScore,
    top1ConstructorScore: 100000,
    topLuchadorUuid: luchador.topLuchadorUuid,
    top1LuchadorScore,
    top1ConstanciaScore: 900,
    topExploradorUuid: explorador.topExploradorUuid,
    top1ExploradorScore,
  };
}

export const getServerBenchmarks = async (): Promise<ServerBenchmarks> => {
  const now = Date.now();
  if (benchmarkCache && benchmarkCache.expiresAt > now) {
    return benchmarkCache.data;
  }

  try {
    const benchmarks = await queryServerBenchmarksFromDb();
    benchmarkCache = {
      data: benchmarks,
      expiresAt: now + BENCHMARK_TTL_MS,
    };
    return benchmarks;
  } catch (error) {
    console.warn('[PlayerStats] Failed to compute server benchmarks, using defaults:', error);
    return DEFAULT_BENCHMARKS;
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

  const [sessionStats, killStats, moneyStats, lpGroups, benchmarks] = await Promise.all([
    getSessionStats(planUserId),
    getPvpKills(uuid),
    getMoney(uuid),
    getLuckPermsGroups(uuid),
    getServerBenchmarks(),
  ]);

  const rankData = processRank(lpGroups);
  const playtimeMs = sessionStats.playtime ?? 0;

  const isTop1Mercader = Boolean(
    (benchmarks.topMercaderUuid &&
      benchmarks.topMercaderUuid.toLowerCase() === uuid.toLowerCase()) ||
    (benchmarks.maxMoney > 0 && moneyStats >= benchmarks.maxMoney),
  );

  const combatPoints = killStats * 15 + (sessionStats.mobs ?? 0);
  const isTop1Luchador = Boolean(
    (benchmarks.topLuchadorUuid &&
      benchmarks.topLuchadorUuid.toLowerCase() === uuid.toLowerCase()) ||
    (combatPoints >= benchmarks.top1LuchadorScore && benchmarks.top1LuchadorScore > 5000),
  );

  const playtimeHours = Math.floor(playtimeMs / (1000 * 60 * 60));
  const explorerPoints = Math.round(playtimeHours * 45);
  const isTop1Explorador = Boolean(
    (benchmarks.topExploradorUuid &&
      benchmarks.topExploradorUuid.toLowerCase() === uuid.toLowerCase()) ||
    (explorerPoints >= benchmarks.top1ExploradorScore && benchmarks.top1ExploradorScore > 3000),
  );

  return {
    username: resolvedName,
    rank: rankData.name,
    rank_image: rankData.image,
    playtime: formatPlaytime(playtimeMs),
    kills: killStats,
    mob_kills: sessionStats.mobs ?? 0,
    deaths: sessionStats.deaths ?? 0,
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
    raw_money: moneyStats,
    is_top1_constructor: false,
    is_top1_luchador: isTop1Luchador,
    is_top1_mercader: isTop1Mercader,
    is_top1_constancia: false,
    is_top1_explorador: isTop1Explorador,
    top1ConstructorScore: benchmarks.top1ConstructorScore,
    top1LuchadorScore: benchmarks.top1LuchadorScore,
    top1MercaderScore: benchmarks.top1MercaderScore,
    top1ConstanciaScore: benchmarks.top1ConstanciaScore,
    top1ExploradorScore: benchmarks.top1ExploradorScore,
  };
};

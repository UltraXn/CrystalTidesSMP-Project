import db from '../config/database.js';
import cpDb from '../config/coreProtectDb.js';

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

// Map specific Unicode Groups found in DB to internal keys
import { RowDataPacket } from 'mysql2';

interface GroupMap { [key: string]: string }

// Map specific Unicode Groups found in DB to internal keys
const GROUP_MAP: GroupMap = {
    '§f§r': 'neroferno',
    '§f§r': 'fundador',
    '§f§r': 'donador',
    '§f§r': 'developer',
    '': 'killuwu',
    'default': 'default'
};
const RANK_PRIORITY = ['default', 'donador', 'fundador', 'developer', 'killuwu', 'neroferno'];

export const getPlayerStats = async (usernameFragment: string): Promise<PlayerStats | null> => {
    const cleanUsername = usernameFragment.trim();
    if (!cleanUsername) return null;

    // 1. Resolve User (UUID/Name) from PLAN
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanUsername);
    const query = isUUID 
        ? `SELECT uuid, name, id, registered FROM plan_users WHERE uuid = ? LIMIT 1`
        : `SELECT uuid, name, id, registered FROM plan_users WHERE name = ? ORDER BY registered DESC LIMIT 1`;

    const [users] = await db.query<RowDataPacket[]>(query, [cleanUsername]);

    // Fallback logic for compacted/dashed UUIDs
    if (users.length === 0 && isUUID) {
         // Logic skipped for brevity, keeping core flow clean. 
         // If exact match fails, return null. use proper UUID format
         return null; 
    }

    if (users.length === 0) return null;

    const user = users[0];
    const uuid = user.uuid;
    const resolvedName = user.name;
    const planUserId = user.id;

    // 2. Parallel Fetching for Performance
    const [sessionStats, killStats, moneyStats, lpGroups, cpStats] = await Promise.all([
        getSessionStats(planUserId),
        getPvpKills(uuid),
        getMoney(uuid),
        getLuckPermsGroups(uuid),
        getCoreProtectStats(resolvedName) // CP uses name usually
    ]);

    // 3. Process Rank
    const rankData = processRank(lpGroups);

    // 4. Format Playtime
    const playtimeMs = sessionStats.playtime || 0;
    const totalMinutes = Math.floor(playtimeMs / 1000 / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const playtimeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return {
        username: resolvedName,
        rank: rankData.name,
        rank_image: rankData.image,
        playtime: playtimeStr,
        kills: killStats,
        mob_kills: sessionStats.mobs || 0,
        deaths: sessionStats.deaths || 0,
        money: formatMoneyCompact(moneyStats),
        blocks_mined: (cpStats.mined || 0).toLocaleString('en-US'),
        blocks_placed: (cpStats.placed || 0).toLocaleString('en-US'),
        member_since: new Date(user.registered).toLocaleDateString('es-ES'),
        raw_id: planUserId, 
        raw_playtime: playtimeMs,
        raw_kills: killStats,
        raw_blocks_mined: cpStats.mined || 0,
        raw_blocks_placed: cpStats.placed || 0,
        raw_rank: rankData.name
    };
};

// --- Helpers ---

interface SessionStats {
    playtime?: number;
    mobs?: number;
    deaths?: number;
}

const getSessionStats = async (planUserId: number): Promise<SessionStats> => {
    try {
        const [rows] = await db.query<RowDataPacket[]>(`
            SELECT 
                SUM(CASE WHEN session_end IS NOT NULL THEN (session_end - session_start) ELSE (UNIX_TIMESTAMP(NOW()) * 1000 - session_start) END) as playtime,
                SUM(mob_kills) as mobs,
                SUM(deaths) as deaths
            FROM plan_sessions WHERE user_id = ?
        `, [planUserId]);
        return (rows[0] as SessionStats) || { playtime: 0, mobs: 0, deaths: 0 };
    } catch (e) { console.error("SessionStats Error", e); return { playtime: 0, mobs: 0, deaths: 0 }; }
};

const getPvpKills = async (uuid: string) => {
    try {
        const [rows] = await db.query<RowDataPacket[]>(`SELECT COUNT(*) as count FROM plan_kills WHERE killer_uuid = ?`, [uuid]);
        return rows[0]?.count || 0;
    } catch { return 0; }
};

export const getMoney = async (uuid: string) => {
    try {
         const [rows] = await db.query<RowDataPacket[]>(`
            SELECT 
                (SELECT uv.double_value FROM plan_extension_user_values uv JOIN plan_extension_providers ep ON uv.provider_id = ep.id JOIN plan_extension_plugins pl ON ep.plugin_id = pl.id WHERE (pl.name LIKE '%Economy%' OR pl.name LIKE '%Vault%') AND (ep.name LIKE '%Balance%' OR ep.text LIKE '%Balance%') AND uv.uuid = ? ORDER BY uv.id DESC LIMIT 1) as vault_balance,
                (SELECT uv.string_value FROM plan_extension_user_values uv JOIN plan_extension_providers ep ON uv.provider_id = ep.id JOIN plan_extension_plugins pl ON ep.plugin_id = pl.id WHERE (pl.name LIKE '%Economy%' OR pl.name LIKE '%Vault%') AND (ep.name LIKE '%Balance%' OR ep.text LIKE '%Balance%' OR ep.name LIKE '%vault_eco_balance%') AND uv.uuid = ? ORDER BY uv.id DESC LIMIT 1) as vault_balance_str
        `, [uuid, uuid]);
        
        let val = Number(rows[0]?.vault_balance) || 0;
        if (val === 0 && rows[0]?.vault_balance_str) {
            val = Number(rows[0].vault_balance_str.replace(/[^0-9.]/g, '')) || 0;
        }
        return val;
    } catch { return 0; }
};

const getLuckPermsGroups = async (uuid: string) => {
    try {
        const [lpUsers] = await db.query<RowDataPacket[]>(`SELECT primary_group FROM luckperms_players WHERE uuid = ?`, [uuid]);
        const groups: string[] = [];
        if (lpUsers.length > 0 && lpUsers[0].primary_group) groups.push(lpUsers[0].primary_group);
        
        const [lpPerms] = await db.query<RowDataPacket[]>(`SELECT permission FROM luckperms_user_permissions WHERE uuid = ? AND permission LIKE 'group.%'`, [uuid]);
        // Typed row instead of any
        lpPerms.forEach((row) => groups.push(row.permission.replace('group.', '')));
        return groups;
    } catch { return ['default']; }
};

const getCoreProtectStats = async (username: string) => {
    try {
        if (!process.env.CP_DB_HOST) return { mined: 0, placed: 0 };
        const [users] = await cpDb.query<RowDataPacket[]>('SELECT rowid FROM co_user WHERE user = ? LIMIT 1', [username]);
        if (users.length === 0) return { mined: 0, placed: 0 };
        
        const cpUserId = users[0].rowid;
        const [mined] = await cpDb.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM co_block WHERE user = ? AND action = 0', [cpUserId]);
        const [placed] = await cpDb.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM co_block WHERE user = ? AND action = 1', [cpUserId]);
        
        return { mined: mined[0].count, placed: placed[0].count };
    } catch (e) { console.error("CP Error", e); return { mined: 0, placed: 0 }; }
};

const processRank = (groups: string[]) => {
    const normalizedGroups = groups.map(g => GROUP_MAP[g] || g.toLowerCase());
    let highestRank = 'default';
    let highestIndex = -1;
    
    normalizedGroups.forEach(g => {
        const idx = RANK_PRIORITY.indexOf(g);
        if (idx > highestIndex) { highestIndex = idx; highestRank = g; }
    });
    
    if (highestIndex === -1 && normalizedGroups.length > 0) {
            const nonDef = normalizedGroups.find(g => g !== 'default');
            if (nonDef) highestRank = nonDef;
    }

    let rankName = highestRank.charAt(0).toUpperCase() + highestRank.slice(1);
    if (highestRank === 'developer') rankName = 'Developer';

    let rankImage = 'user.png';
    switch (highestRank) {
        case 'neroferno': rankImage = 'rank-neroferno.png'; break;
        case 'fundador':  rankImage = 'rank-fundador.png'; break;
        case 'donador':   rankImage = 'rank-donador.png'; break;
        case 'developer': rankImage = 'developer.png'; break;
        case 'killuwu':   rankImage = 'rank-killu.png'; break;
        default:          rankImage = 'user.png'; break;
    }
    return { name: rankName, image: rankImage };
};

function formatMoneyCompact(num: number) {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(2).replace(/\.00$/, '') + 'k';
    return num.toLocaleString('en-US');
}

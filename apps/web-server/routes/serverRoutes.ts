import util from 'minecraft-server-util';
import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import mysql from 'mysql2/promise';

import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole, STAFF_ROLES } from '../utils/roleUtils.js';
import supabase from '../config/supabaseClient.js';

const router = express.Router();

// Pterodactyl Config
const PANEL_URL = process.env.PTERODACTYL_HOST || "https://panel.holy.gg"; 
const API_KEY = process.env.PTERODACTYL_API_KEY;
const SERVER_ID = process.env.PTERODACTYL_SERVER_ID;

const dbConfig = { 
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME 
};

interface PteroResources {
    attributes: {
        current_state: string;
        resources: {
            memory_bytes: number;
            cpu_absolute: number;
            disk_bytes: number;
        };
    };
}

interface StaffCard {
    name: string;
    mc_nickname?: string;
    discordIds?: string[];
    socials?: {
        discord?: string;
    };
    role?: string;
    image?: string;
}

interface PteroLimits {
    memory: number;
    cpu: number;
    disk: number;
}

interface PteroServerDetails {
    attributes: {
        limits: PteroLimits;
    };
}

interface PlanGlobalStatsRow {
    online_count: number;
    total_users: number;
    new_users: number;
    total_playtime_ms: number | string;
}

interface LuckPermsRow {
    username: string;
    uuid: string;
    group_name: string | null;
}

interface SkinRow {
    uuid: string;
    skin_identifier: string;
}

interface SessionRow {
    uuid: string;
    session_start: number;
}

// Route: Get Server Resources (RAM, CPU, State) + PLAN GLOBAL STATS
router.get('/resources', authenticateToken, checkRole(STAFF_ROLES), async (req: Request, res: Response) => {
    let connection = null;
    try {
        if (!API_KEY || !SERVER_ID) {
            return res.status(500).json({ error: "Pterodactyl credentials missing" });
        }

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${API_KEY}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        const [resStats, resDetails] = await Promise.all([
            fetch(`${PANEL_URL}/api/client/servers/${SERVER_ID}/resources`, { method: 'GET', headers }),
            fetch(`${PANEL_URL}/api/client/servers/${SERVER_ID}`, { method: 'GET', headers })
        ]);

        let pteroData = {
            status: "offline",
            memory: { current: 0, limit: 0 },
            cpu: 0,
            disk: 0
        };

        if (resStats.ok) {
            const dataStats = await resStats.json() as PteroResources;
            const dataDetails = resDetails.ok ? await resDetails.json() as PteroServerDetails : null;
            const attr = dataStats.attributes;
            const limits = dataDetails?.attributes?.limits || { cpu: 100, memory: 0, disk: 0 };

            const cpuAbsolute = attr.resources.cpu_absolute;
            const cpuLimit = limits.cpu || 100; 
            const cpuNormalized = cpuLimit > 0 ? (cpuAbsolute / cpuLimit) * 100 : cpuAbsolute;

            pteroData = {
                status: attr.current_state,
                memory: {
                    current: Math.round(attr.resources.memory_bytes / 1024 / 1024),
                    limit: Math.round(limits.memory || 0)
                },
                cpu: parseFloat(cpuNormalized.toFixed(1)),
                disk: Math.round(attr.resources.disk_bytes / 1024 / 1024)
            };
        }

        const planStats = {
            online: 0,
            total_players: 0,
            new_players: 0,
            total_playtime_hours: 0
        };

        try {
            connection = await mysql.createConnection(dbConfig);
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
            
            const [rows] = await connection.execute(`
                SELECT 
                    (SELECT COUNT(*) FROM plan_sessions WHERE session_end IS NULL) as online_count,
                    (SELECT COUNT(*) FROM plan_users) as total_users,
                    (SELECT COUNT(*) FROM plan_users WHERE registered >= ?) as new_users,
                    (SELECT SUM(session_end - session_start) FROM plan_sessions WHERE session_end IS NOT NULL) as total_playtime_ms
                FROM DUAL
            `, [oneDayAgo]);
            
            if (Array.isArray(rows) && rows.length > 0) {
                const r = rows[0] as PlanGlobalStatsRow;
                planStats.online = r.online_count || 0;
                planStats.total_players = r.total_users || 0;
                planStats.new_players = r.new_users || 0;
                planStats.total_playtime_hours = Math.floor((Number(r.total_playtime_ms) || 0) / 1000 / 60 / 60);
            }
        } catch (dbErr: unknown) {
            console.error("Plan DB Error in Resource Route:", dbErr);
        } finally {
            if (connection) await connection.end();
        }

        res.json({ ...pteroData, ...planStats });
    } catch (error) {
        console.error("Server Status Route Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        if (connection) await connection.end();
    }
});

// Route: Get Online Staff
router.get('/staff', async (req: Request, res: Response) => {
    let connection = null;
    
    try {
        const host = process.env.MC_SERVER_HOST || 'localhost';
        const port = parseInt(process.env.MC_SERVER_PORT as string) || 25565;

        const uniqueUsers = new Map<string, { mc: boolean, discord: string }>();
        const getOrInitStatus = (nameInput: string) => {
            const name = nameInput.toLowerCase();
            if (!uniqueUsers.has(name)) {
                uniqueUsers.set(name, { mc: false, discord: 'offline' });
            }
            return uniqueUsers.get(name)!;
        };

        // 1. Try Query Protocol
        try {
            const result = await util.status(host, port, { timeout: 4000, enableSRV: true });
            if (result.players.sample) {
                 result.players.sample.forEach(p => getOrInitStatus(p.name).mc = true);
            }
        } catch (statusErr) {
             console.warn("[Staff Route] Query failed:", (statusErr as Error).message);
        }

        // 2. Try Plan DB
        try {
            if (!connection) connection = await mysql.createConnection(dbConfig);
            const [rows] = await connection.execute(`
                SELECT pu.name FROM plan_sessions ps
                JOIN plan_users pu ON ps.user_id = pu.id
                WHERE ps.session_end IS NULL
            `); 
            (rows as { name: string }[]).forEach((r) => getOrInitStatus(r.name).mc = true);
        } catch (dbErr: unknown) {
            console.error("[Staff Route] DB Fetch Error:", dbErr);
        }

        // 3. Check Discord Status via Bot
        let cards: StaffCard[] = [];
        try {
            const { data: settings } = await supabase.from('site_settings').select('value').eq('key', 'staff_cards').single();

            if (settings?.value) {
                try {
                    const parsed = typeof settings.value === 'string' ? JSON.parse(settings.value) : settings.value;
                    cards = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
                } catch(e) { console.error("Parse error:", e); }

                if (Array.isArray(cards)) {
                    const discordMapping: Record<string, string> = {};
                    const allIds: string[] = [];

                    cards.forEach((card: StaffCard) => {
                         const idsToCheck: string[] = [];
                         if (Array.isArray(card.discordIds)) idsToCheck.push(...card.discordIds);
                         if (card.socials?.discord) {
                             card.socials.discord.split(',').forEach((p: string) => {
                                 const trimmed = p.trim();
                                 if (/^\d{17,20}$/.test(trimmed)) idsToCheck.push(trimmed);
                             });
                         }
                         idsToCheck.forEach(id => {
                             discordMapping[id] = card.mc_nickname || card.name;
                             allIds.push(id);
                         });
                    });
                    
                    if (allIds.length > 0) {
                        const botHost = process.env.BOT_HOST || 'discord-bot';
                        const botApiPort = process.env.BOT_API_PORT || 3002;
                        let botUrl = botHost.startsWith('http') ? botHost : `http://${botHost}:${botApiPort}`;
                        botUrl = botUrl.replace(/\/$/, '');

                        const controller = new AbortController();
                        const timeout = setTimeout(() => controller.abort(), 5000);

                        try {
                            const resBot = await fetch(`${botUrl}/presence?ids=${allIds.join(',')}`, { signal: controller.signal });
                            clearTimeout(timeout);
                            if (resBot.ok) {
                                const presenceData = await resBot.json() as Record<string, string>;
                                Object.entries(presenceData).forEach(([id, status]) => {
                                    if (['online', 'idle', 'dnd', 'offline'].includes(status)) {
                                        const name = discordMapping[id];
                                        if (name) getOrInitStatus(name).discord = status;
                                    }
                                });
                            }
                        } catch (botErr: unknown) { 
                            const error = botErr as { message?: string; code?: string };
                            // Silent fallback for local dev to avoid console noise
                            if (process.env.NODE_ENV === 'production') {
                                console.warn("[Discord Bot] Presence fetch failed (Production):", error.message || error);
                            } else {
                                // Just a small info for dev
                                if (error.code !== 'ECONNREFUSED') {
                                    console.info("[Discord Bot] Presence skip (Dev): Bot not reachable.");
                                }
                            }
                        }
                    }
                }
            }
        } catch (err) { console.error("Discord check error:", err); }

        // 4. Combine and resolve LuckPerms details
        const activeUsernames = Array.from(uniqueUsers.entries())
            .filter(([_, s]) => s.mc || s.discord !== 'offline')
            .map(([name]) => name);

        if (activeUsernames.length === 0) {
            if (connection) await connection.end();
            return res.json([]);
        }

        if (!connection) connection = await mysql.createConnection(dbConfig);
        const placeholders = activeUsernames.map(() => '?').join(',');
        const [rows] = await connection.execute(`
            SELECT lp.username, lp.uuid, up.permission as group_name
            FROM luckperms_players lp
            LEFT JOIN luckperms_user_permissions up ON lp.uuid = up.uuid AND up.permission LIKE 'group.%'
            WHERE lp.username IN (${placeholders})
        `, activeUsernames);

        const dbUsersMap = new Map<string, { username: string, uuid: string, groups: string[] }>();
        (rows as LuckPermsRow[]).forEach((r) => {
            const low = r.username.toLowerCase();
            if (!dbUsersMap.has(low)) dbUsersMap.set(low, { username: r.username, uuid: r.uuid, groups: [] });
            if (r.group_name) dbUsersMap.get(low)!.groups.push(r.group_name.replace('group.', ''));
        });

        const skinMap: Record<string, string> = {};
        const sessionMap: Record<string, number> = {};
        const dbUuids = Array.from(dbUsersMap.values()).map(u => u.uuid);

        if (dbUuids.length > 0) {
            try {
                const uuidPlaceholders = dbUuids.map(() => '?').join(',');
                const [skinRows] = await connection.execute(`SELECT uuid, skin_identifier FROM sr_players WHERE uuid IN (${uuidPlaceholders})`, dbUuids);
                (skinRows as SkinRow[]).forEach(sr => skinMap[sr.uuid] = sr.skin_identifier);

                const [sessionRows] = await connection.execute(`
                    SELECT pu.uuid, MAX(ps.session_start) as session_start 
                    FROM plan_sessions ps JOIN plan_users pu ON ps.user_id = pu.id 
                    WHERE pu.uuid IN (${uuidPlaceholders}) AND ps.session_end IS NULL 
                    GROUP BY pu.uuid
                `, dbUuids);
                (sessionRows as SessionRow[]).forEach(s => sessionMap[s.uuid] = s.session_start);
            } catch (err) { console.warn("Extra DB fetch failed:", err); }
        }

        const staff = activeUsernames.map((lowName) => {
            const dbRef = dbUsersMap.get(lowName);
            const statusObj = uniqueUsers.get(lowName)!;
            const username = dbRef?.username || lowName.charAt(0).toUpperCase() + lowName.slice(1);
            const uuid = dbRef?.uuid || '00000000-0000-0000-0000-000000000000';
            const groups = dbRef?.groups || ['default'];
            
            const staffGroups = ['neroferno', 'killuwu', 'developer', 'admin', 'moderator', 'mod', 'helper', 'staff'];
            
            // Si el usuario está en las Staff Cards (supabase), podemos usar ese rol de fallback
            const panelInfo = Array.isArray(cards) ? cards.find((c: StaffCard) => c.name.toLowerCase() === lowName || (c.mc_nickname && c.mc_nickname.toLowerCase() === lowName)) : null;

            let role = groups.find(g => staffGroups.includes(g.toLowerCase())) || panelInfo?.role || groups[0] || 'default';
            let roleImage = null;

            if (username.toLowerCase() === 'ultraxn') { role = 'Neroferno'; roleImage = '/ranks/rank-neroferno.png'; }
            if (role === 'neroferno') { role = 'Neroferno'; roleImage = '/ranks/rank-neroferno.png'; }
            if (role === 'killuwu') { role = 'Killuwu'; roleImage = '/ranks/rank-killu.png'; }
            if (role === 'developer') { role = 'Developer'; roleImage = '/ranks/developer.png'; }

            const skinName = skinMap[uuid];
            
            // Prioridad: Imagen del Panel > Skin Identifier > Skin Username
            let avatarUrl = panelInfo?.image || (skinName ? `https://mc-heads.net/avatar/${skinName}/100` : `https://mc-heads.net/avatar/${username}/100`);
            
            // Si la imagen del panel es solo un nombre de usuario (ej: 'Neroferno'), convertir a URL de cabeza
            if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('/')) {
                avatarUrl = `https://mc-heads.net/avatar/${avatarUrl}/100`;
            }

            return {
                username, role, role_image: roleImage, uuid, avatar: avatarUrl,
                login_time: sessionMap[uuid] || null,
                mc_status: statusObj.mc ? 'online' : 'offline',
                discord_status: statusObj.discord
            };
        });

        // Solo devolver Staff real
        const allowedRoles = ['neroferno', 'killuwu', 'developer', 'admin', 'moderator', 'mod', 'helper', 'staff'];
        res.json(staff.filter(s => allowedRoles.includes(s.role.toLowerCase())));

    } catch (error) {
        console.error("Staff Route Error:", error);
        res.json([]);
    } finally {
        if (connection) await connection.end();
    }
});



export default router;

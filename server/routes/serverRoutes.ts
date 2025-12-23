import util from 'minecraft-server-util';
import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import mysql from 'mysql2/promise';

const router = express.Router();

// Pterodactyl Config
const PTERO_URL = "https://panel.holyhosting.net"; // Your panel URL (inferred from host IP but usually domain)
// Actually, let's assume standard Pterodactyl API URL structure based on host or provided var?
// Environment has PTERODACTYL_SERVER_ID and API_KEY. Need to know the PANEL URL.
// User didn't provide PANEL URL in .env, but usually it's passed or known.
// Let's look at existing code or ask. Assuming https://panel.holyhosting.net based on "HolyHosting".
// Wait, looking at .env content viewed earlier:
// PTERODACTYL_API_KEY=ptlc_...
// MC_SERVER_HOST=147...
// PTERODACTYL_SERVER_ID=5a931111
// We need the Panel URL. Usually client knows it. I'll make it an env var or guess.
// Let's use a placeholder and user can update or I will try to infer.

const PANEL_URL = process.env.PTERODACTYL_URL || "https://panel.holy.gg"; 
const API_KEY = process.env.PTERODACTYL_API_KEY;
const SERVER_ID = process.env.PTERODACTYL_SERVER_ID;

const dbConfig = { 
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME 
};

// Route: Get Server Resources (RAM, CPU, State) + PLAN GLOBAL STATS
router.get('/resources', async (req: Request, res: Response) => {
    let connection = null;
    try {
        if (!API_KEY || !SERVER_ID) {
            return res.status(500).json({ error: "Pterodactyl credentials missing" });
        }

        const headers: any = {
            'Authorization': `Bearer ${API_KEY}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        // 1. Fetch Pterodactyl Stats
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
            const dataStats: any = await resStats.json();
            const dataDetails: any = resDetails.ok ? await resDetails.json() : null;
            const attr = dataStats.attributes;
            const limits = dataDetails?.attributes?.limits || {};

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

        // 2. Fetch Plan Global Stats (MySQL)
        let planStats: any = {
            online: 0,
            total_players: 0,
            new_players: 0,
            total_playtime_hours: 0
        };

        try {
            connection = await mysql.createConnection(dbConfig);
            
            // 24h ago in ms
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
            
            const [rows]: any = await connection.execute(`
                SELECT 
                    (SELECT COUNT(*) FROM plan_sessions WHERE session_end IS NULL) as online_count,
                    (SELECT COUNT(*) FROM plan_users) as total_users,
                    (SELECT COUNT(*) FROM plan_users WHERE registered >= ?) as new_users,
                    (SELECT SUM(session_end - session_start) FROM plan_sessions WHERE session_end IS NOT NULL) as total_playtime_ms
                FROM DUAL
            `, [oneDayAgo]);
            
            if (rows.length > 0) {
                const r = rows[0];
                planStats.online = r.online_count || 0;
                planStats.total_players = r.total_users || 0;
                planStats.new_players = r.new_users || 0;
                planStats.total_playtime_hours = Math.floor((Number(r.total_playtime_ms) || 0) / 1000 / 60 / 60);
            }
            
        } catch (dbErr: any) {
            console.error("Plan DB Error in Resource Route:", dbErr.message);
        } finally {
            if (connection) await connection.end();
        }

        // Combine and Send
        res.json({
            ...pteroData,
            ...planStats
        });

    } catch (error) {
        console.error("Server Status Route Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
        if (connection) await connection.end();
    }
});

// Route: Get Online Staff
// (util imported at top)

// Route: Get Online Staff (Real-time via RCON)
router.get('/staff', async (req: Request, res: Response) => {
    let connection = null;
    const rconOptions = {
        timeout: 1000 * 5 // 5s timeout
    };
    
    try {
        // 1. Fetch Online Players via RCON
        const rconHost = process.env.RCON_HOST || process.env.MC_SERVER_HOST || 'localhost';
        const rconPort = parseInt(process.env.RCON_PORT as string) || 25575;
        const rconPass = process.env.RCON_PASSWORD;

        if (!rconPass) {
             throw new Error("RCON password not configured");
        }

        const client = new util.RCON();
        await client.connect(rconHost, rconPort);
        await client.login(rconPass);
        
        // Command: list
        // Output format typically: "There are 2/100 players online: User1, User2"
        const response = await client.execute('list');
        await client.close();
        
        // Parse Output
        // Remove color codes if any (Section sign + char)
        const cleanResponse = response.replace(/§./g, '');
        
        if (!cleanResponse.includes(':')) {
            // No players or empty list "There are 0/100 players online: " or just "There are 0/100..."
            return res.json([]);
        }
        
        const playerPart = cleanResponse.split(':')[1];
        if (!playerPart || playerPart.trim().length === 0) {
             return res.json([]);
        }

        // List of online usernames
        const onlineUsernames = playerPart.split(',').map(s => s.trim()).filter(s => s.length > 0);

        if (onlineUsernames.length === 0) {
            return res.json([]);
        }

        // 2. Resolve Ranks for these players via DB
        connection = await mysql.createConnection(dbConfig);
        
        // Prepare placeholders
        const placeholders = onlineUsernames.map(() => '?').join(',');
        
        // Query LP
        const [rows]: any = await connection.execute(`
            SELECT username, primary_group, uuid
            FROM luckperms_players
            WHERE username IN (${placeholders})
            AND (
                primary_group IN ('developer', 'killuwu', 'neroferno', 'killu', 'fundador', 'admin', 'owner', '§f§r')
                OR username = 'UltraXn'
            )
        `, onlineUsernames);

        // Query Skins from SkinRestorer (sr_players uses 'uuid' column type varchar? or binary? Assume varchar from previous debug)
        // Previous debug in playerStats.js confirmed table sr_players, column skin_identifier, uuid.
        
        // Fetch skins for these UUIDs
        let skinMap: any = {};
        if (rows.length > 0) {
            try {
                const uuids = rows.map((r: any) => r.uuid);
                const skinPlaceholders = uuids.map(() => '?').join(',');
                
                const [skinRows]: any = await connection.execute(`
                    SELECT uuid, skin_identifier 
                    FROM sr_players 
                    WHERE uuid IN (${skinPlaceholders})
                `, uuids);
                
                skinRows.forEach((sr: any) => {
                    skinMap[sr.uuid] = sr.skin_identifier;
                });
            } catch (err: any) {
                console.error("Error fetching skins for staff:", err.message);
            }
        }

        // Fetch Session Start Times (for uptime)
        let sessionMap: any = {};
        if (rows.length > 0) {
            try {
                const uuids = rows.map((r: any) => r.uuid);
                const sessionPlaceholders = uuids.map(() => '?').join(',');
                
                // Get active sessions (Latest session start)
                const [sessionRows]: any = await connection.execute(`
                    SELECT pu.uuid, MAX(ps.session_start) as session_start 
                    FROM plan_sessions ps 
                    JOIN plan_users pu ON ps.user_id = pu.id 
                    WHERE pu.uuid IN (${sessionPlaceholders})
                    GROUP BY pu.uuid
                `, uuids);
                
                sessionRows.forEach((s: any) => {
                    sessionMap[s.uuid] = s.session_start;
                });
            } catch (err: any) {
                console.error("Error fetching sessions for staff:", err.message);
            }
        }

        // Map structure
        const staff = rows.map((row: any) => {
            let role = row.primary_group;
            let roleImage = null;

            // Normalize Role & Image
            if (row.username === 'UltraXn' && row.primary_group === 'default') {
                role = 'Founder';
                roleImage = '/ranks/rank-neroferno.png';
            }
            
            if (row.primary_group === '§f§r') {
               role = 'Founder';
               roleImage = '/ranks/rank-neroferno.png';
            }

            if (row.primary_group === 'neroferno') {
                roleImage = '/ranks/rank-neroferno.png';
            }

            // Determine Avatar (Custom Skin > UUID)
            const skinName = skinMap[row.uuid];
            const avatarUrl = skinName 
                ? `https://mc-heads.net/avatar/${skinName}/100` 
                : `https://mc-heads.net/avatar/${row.uuid}/100`;

            return {
                username: row.username,
                role: role,
                role_image: roleImage,
                uuid: row.uuid,
                avatar: avatarUrl,
                login_time: sessionMap[row.uuid] || Date.now()
            }
        });

        res.json(staff);

    } catch (error) {
        console.error("Staff Online Route Error:", error);
        res.json([]);
    } finally {
        if (connection) await connection.end();
    }
});

export default router;

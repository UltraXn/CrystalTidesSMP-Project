import express, { Request, Response } from 'express';
import mysql from 'mysql2/promise';

const router = express.Router();

// Database Config
const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT as string) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Simplified and Robust Player Stats Route
router.get('/:username', async (req: Request, res: Response) => {
    console.log(`[Stats Request] Fetching for: ${req.params.username}`);
    console.log(`[Stats Debug] DB Config Host: ${dbConfig.host}, User: ${dbConfig.user}, DB: ${dbConfig.database}`);
    let connection = null;

    try {
        console.log("[Stats Debug] Attempting DB connection...");
        connection = await mysql.createConnection(dbConfig);
        console.log("[Stats Debug] DB Connection Established.");
        
        const { username } = req.params;
        const cleanUsername = username ? username.trim() : "";
        let uuid = null;
        let resolvedName = cleanUsername;

        console.log(`[Stats Debug] Raw Param: '${username}' | Clean Param: '${cleanUsername}'`);

        // 1. Resolve UUID/Name
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanUsername) || /^[0-9a-f]{32}$/i.test(cleanUsername);

        let userQuery = '';
        let userParam = cleanUsername;

        if (isUUID) {
            userQuery = `SELECT uuid, name, id, registered FROM plan_users WHERE uuid = ? LIMIT 1`;
        } else {
            userQuery = `SELECT uuid, name, id, registered FROM plan_users WHERE name = ? ORDER BY registered DESC LIMIT 1`;
        }
        
        console.log(`[Stats Debug] Executing: ${userQuery} with param: '${userParam}'`);
        const [users]: any = await connection.execute(userQuery, [userParam]);
        console.log(`[Stats Debug] Users Result Count: ${users.length}`);

        if (users.length === 0) {
            console.log("[Stats Debug] No user found. Checking strict vs loose UUID format...");
            // Fallback: If searching by UUID with dashes failed, try without (or vice versa)
            if (isUUID) {
                const isCompact = userParam.length === 32;
                const altParam = isCompact 
                    ? `${userParam.substr(0,8)}-${userParam.substr(8,4)}-${userParam.substr(12,4)}-${userParam.substr(16,4)}-${userParam.substr(20)}` // Add dashes
                    : userParam.replace(/-/g, ''); // Remove dashes
                
                console.log(`[Stats Debug] Trying alternative UUID format: '${altParam}'`);
                const [altUsers]: any = await connection.execute(`SELECT uuid, name, id, registered FROM plan_users WHERE uuid = ? LIMIT 1`, [altParam]);
                
                if (altUsers.length > 0) {
                    console.log("[Stats Debug] Found via alternative format!");
                    // Use this result
                    users.push(altUsers[0]);
                }
            }
            
            if (users.length === 0) {
                 // Still nothing? Dump sample
                 console.log("[Stats Debug] Still nothing. Dumping random sample from DB:");
                 const [sample]: any = await connection.execute('SELECT uuid FROM plan_users ORDER BY registered DESC LIMIT 1');
                 if(sample.length > 0) console.log(`[Stats Debug] Sample DB UUID: '${sample[0].uuid}'`);
                 
                 return res.status(404).json({ error: "Player not found" });
            }
        }

        const user = users[0];
        uuid = user.uuid;
        resolvedName = user.name;
        const planUserId = user.id;

        // 2. Fetch Basic Stats (Sessions)
        let playtimeMs = 0;
        let mobKills = 0;
        let deaths = 0;

        try {
            const [sessionStats]: any = await connection.execute(`
                SELECT 
                    SUM(
                        CASE 
                            WHEN session_end IS NOT NULL THEN (session_end - session_start)
                            ELSE (UNIX_TIMESTAMP(NOW()) * 1000 - session_start) 
                        END
                    ) as playtime,
                    SUM(mob_kills) as mobs,
                    SUM(deaths) as deaths
                FROM plan_sessions WHERE user_id = ?
            `, [planUserId]);

            if (sessionStats[0]) {
                playtimeMs = Number(sessionStats[0].playtime) || 0;
                mobKills = Number(sessionStats[0].mobs) || 0;
                deaths = Number(sessionStats[0].deaths) || 0;
            }
        } catch (e: any) {
            console.error("Session Stats Error:", e.message);
        }

        // 3. Fetch PVP Kills (Separate Table)
        let pvpKills = 0;
        try {
             const [killStats]: any = await connection.execute(`SELECT COUNT(*) as count FROM plan_kills WHERE killer_uuid = ?`, [uuid]);
             pvpKills = killStats[0]?.count || 0;
        } catch (e: any) {
             console.error("PVP Kills Error (Table missing?):", e.message);
        }

        // 4. Economy (Killucoins)
        let moneyVal = 0;
        try {
             // Try to fetch latest balance from Plan extensions
             const [ecoStats]: any = await connection.execute(`
                SELECT 
                    (
                        SELECT uv.double_value 
                        FROM plan_extension_user_values uv
                        JOIN plan_extension_providers ep ON uv.provider_id = ep.id
                        JOIN plan_extension_plugins pl ON ep.plugin_id = pl.id
                        WHERE (pl.name LIKE '%Economy%' OR pl.name LIKE '%Vault%') 
                        AND (ep.name LIKE '%Balance%' OR ep.text LIKE '%Balance%')
                        AND uv.uuid = ?
                        ORDER BY uv.id DESC LIMIT 1
                    ) as vault_balance,
                    (
                        SELECT uv.string_value 
                        FROM plan_extension_user_values uv
                        JOIN plan_extension_providers ep ON uv.provider_id = ep.id
                        JOIN plan_extension_plugins pl ON ep.plugin_id = pl.id
                        WHERE (pl.name LIKE '%Economy%' OR pl.name LIKE '%Vault%' OR pl.name LIKE '%PlaceholderAPI%') 
                        AND (ep.name LIKE '%Balance%' OR ep.text LIKE '%Balance%' OR ep.name LIKE '%vault_eco_balance%')
                        AND uv.uuid = ?
                        ORDER BY uv.id DESC LIMIT 1
                    ) as vault_balance_str
            `, [uuid, uuid]);
            
            if (ecoStats.length > 0) {
                 moneyVal = Number(ecoStats[0].vault_balance) || 0;
                 if (moneyVal === 0 && ecoStats[0].vault_balance_str) {
                      moneyVal = Number(ecoStats[0].vault_balance_str.replace(/[^0-9.]/g, '')) || 0;
                 }
            }
        } catch (e: any) {
            console.error("Economy Stats Error:", e.message);
        }

        function formatMoneyCompact(num: number) {
            if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'B';
            if (num >= 1_000_000) return (num / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
            if (num >= 1_000) return (num / 1_000).toFixed(2).replace(/\.00$/, '') + 'k';
            return num.toLocaleString('en-US');
        }
        const moneyFormatted = formatMoneyCompact(moneyVal);

        // 5. Rank (LuckPerms)
        let rank = "Miembro";
        let rankImage = "user.png";

        try {
            // Map specific Unicode Groups found in DB to internal keys
            const GROUP_MAP: any = {
                '§f§r': 'neroferno',
                '§f§r': 'fundador',
                '§f§r': 'donador',
                '§f§r': 'developer',
                '': 'killuwu',
                'default': 'default'
            };

            const RANK_PRIORITY = ['default', 'donador', 'fundador', 'developer', 'killuwu', 'neroferno'];
            
            const [lpUsers]: any = await connection.execute(`SELECT primary_group FROM luckperms_players WHERE uuid = ?`, [uuid]);
            let foundGroups: any[] = [];
            if (lpUsers.length > 0 && lpUsers[0].primary_group) foundGroups.push(lpUsers[0].primary_group);
            
            const [lpPerms]: any = await connection.execute(`SELECT permission FROM luckperms_user_permissions WHERE uuid = ? AND permission LIKE 'group.%'`, [uuid]);
            lpPerms.forEach((row: any) => foundGroups.push(row.permission.replace('group.', '')));

            console.log(`[Stats Debug] Raw DB Groups: ${JSON.stringify(foundGroups)}`);

            // Normalize groups to internal keys
            let normalizedGroups = foundGroups.map(g => GROUP_MAP[g] || g.toLowerCase());

            let highestRank = 'default';
            let highestIndex = -1;
            
            normalizedGroups.forEach(g => {
                const idx = RANK_PRIORITY.indexOf(g);
                if (idx > highestIndex) { highestIndex = idx; highestRank = g; }
            });
            
            // Fallback for known ranks if not in priority list but exist
            if (highestIndex === -1 && normalizedGroups.length > 0) {
                 const nonDef = normalizedGroups.find(g => g !== 'default');
                 if (nonDef) highestRank = nonDef;
            }
            
            // Format Display Name
            rank = highestRank.charAt(0).toUpperCase() + highestRank.slice(1);
            if (highestRank === 'developer') rank = 'Developer'; // Custom capitalization if needed
            
            // Rank Image Mapping (Using normalized keys)
            switch (highestRank) {
                case 'neroferno': rankImage = 'rank-neroferno.png'; break;
                case 'fundador':  rankImage = 'rank-fundador.png'; break;
                case 'donador':   rankImage = 'rank-donador.png'; break;
                case 'developer': rankImage = 'developer.png'; break;
                case 'killuwu':   rankImage = 'rank-killu.png'; break;
                default:          rankImage = 'user.png'; break;
            }
            
            console.log(`[Stats Debug] Normalized: ${highestRank} -> Image: ${rankImage}`);

        } catch (e: any) {
            console.error("Rank Query Error:", e.message);
        }

        // 6. CoreProtect (Blocks Mined/Placed)
        let mined = 0;
        let placed = 0;
        if (process.env.CP_DB_HOST) {
            try {
                const cpConfig = {
                    host: process.env.CP_DB_HOST,
                    port: parseInt(process.env.CP_DB_PORT as string),
                    user: process.env.CP_DB_USER,
                    password: process.env.CP_DB_PASSWORD,
                    database: process.env.CP_DB_NAME,
                    connectTimeout: 5000 // Safety Timeout for Secondary DB
                };
                
                const cpConnection = await mysql.createConnection(cpConfig);
                try {
                    // Try by UUID first (Modern CoreProtect)
                    // If table co_user has uuid column? Usually 'user' column is name, 'uuid' column exists in co_user in 2.15+
                    // Let's check 'user' column with name first as it is safer for legacy
                    const [cpUsers]: any = await cpConnection.execute(
                        'SELECT rowid FROM co_user WHERE user = ? LIMIT 1',
                        [resolvedName]
                    );

                    if (cpUsers.length > 0) {
                        const cpUserId = cpUsers[0].rowid;
                        // Action 0=Break, 1=Place
                        const [minedData]: any = await cpConnection.execute('SELECT COUNT(*) as count FROM co_block WHERE user = ? AND action = 0', [cpUserId]);
                        const [placedData]: any = await cpConnection.execute('SELECT COUNT(*) as count FROM co_block WHERE user = ? AND action = 1', [cpUserId]);
                        mined = minedData[0].count;
                        placed = placedData[0].count;
                    }
                } finally {
                    await cpConnection.end();
                }
            } catch (cpErr: any) {
                console.error("CoreProtect Stats Error:", cpErr.message);
            }
        }

        // Format Playtime
        const totalMinutes = Math.floor(playtimeMs / 1000 / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const playtimeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

        res.json({
            username: resolvedName,
            rank: rank,
            rank_image: rankImage, // New Field
            playtime: playtimeStr,
            kills: pvpKills,
            mob_kills: mobKills,
            deaths: deaths,
            money: moneyFormatted,
            blocks_mined: mined.toLocaleString('en-US'),
            blocks_placed: placed.toLocaleString('en-US'),
            member_since: new Date(user.registered).toLocaleDateString('es-ES')
        });

    } catch (error: any) {
        console.error("Critical Error in PlayerStats:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

export default router;

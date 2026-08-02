import * as minecraftService from '../services/minecraftService.js';
import * as skinService from '../services/skinService.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import pool from '../config/database.js';
import { Request, Response } from 'express';
import { ensureString } from '../utils/typeUtils.js';

// Database Schema Fix (Ensures missing columns exist)
(async () => {
    try {
        await pool.execute("ALTER TABLE linked_accounts ADD COLUMN IF NOT EXISTS gacha_balance BIGINT DEFAULT 0 AFTER web_user_id");
    } catch {
        // Fallback for older MySQL that doesn't support IF NOT EXISTS in ALTER TABLE
        try {
             await pool.execute("ALTER TABLE linked_accounts ADD COLUMN gacha_balance BIGINT DEFAULT 0 AFTER web_user_id");
        } catch {
             // Column probably already exists or other error we can't fix here
        }
    }
})();

export const getStatus = async (req: Request, res: Response) => {
    try {
        const host = process.env.MC_SERVER_HOST || 'localhost';
        const port = parseInt(process.env.MC_SERVER_PORT || '25565');

        const status = await minecraftService.getServerStatus(host, port);

        res.json(status);
    } catch (error) {
        console.error("[Minecraft Status CRITICAL 500]:", error);
        res.status(500).json({
            online: false,
            error: 'Internal server error fetching status',
            details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        });
    }
};

export const getSkin = async (req: Request, res: Response) => {
    try {
        const username = ensureString(req.params.username);
        if (!username) return res.status(400).json({ error: 'Username required' });

        const skinData = await skinService.getSkinUrl(username);
        res.json(skinData);
    } catch (error) {
        console.error("Error fetching skin:", error);
        // Fallback to minotar direct
        res.json({ url: `https://minotar.net/skin/${ensureString(req.params.username)}`, source: 'fallback' });
    }
};

// Supabase Admin Client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) supabase = createClient(supabaseUrl, supabaseKey);

import { RowDataPacket } from 'mysql2';

interface MetadataSync {
    minecraft_uuid?: string | null;
    minecraft_nick?: string | null;
    discord_id?: string | null;
    discord_tag?: string | null;
    discord_avatar?: string | null;
    gacha_balance?: number | string | null;
    social_discord?: string | null;
}

async function syncSupabaseMetadata(userId: string, _token: string | undefined, metadata: MetadataSync) {
    if (!supabase) return false;
    try {
        const { error } = await supabase.auth.admin.updateUserById(userId, { 
            user_metadata: metadata 
        });
        if (error) {
            console.error('Supabase Sync Error:', error.message);
            return false;
        }
        return true;
    } catch (e) {
        console.error('Supabase Sync Exception:', e);
        return false;
    }
}

export const verifyLinkCode = async (req: Request, res: Response) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = (req as any).user;
        const authUserId = user?.id;
        const { code, userId: bodyUserId } = req.body;
        
        const targetUserId = authUserId || bodyUserId;

        if (!code || !targetUserId) {
            return res.status(400).json({ error: 'Code and Authentication required' });
        }

        if (!supabase) return res.status(503).json({ error: 'Server configuration error (Supabase)' });

        // 1. Verify Code
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT source, source_id, player_name, avatar_url, expires_at FROM universal_links WHERE code = ?',
            [code.toUpperCase()]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Código inválido o inexistente.' });
        }

        const verification = rows[0];
        
        if (Date.now() > Number(verification.expires_at)) {
            await pool.execute('DELETE FROM universal_links WHERE code = ?', [code.toUpperCase()]);
            return res.status(400).json({ error: 'El código ha expirado.' });
        }

        const { source, source_id: sourceId, player_name: playerName, avatar_url: avatarUrl } = verification;

        // 2. Link Account (Unified Logic)
        if (source === 'minecraft') {
            // First, remove ANY link currently tied to this Minecraft UUID
            await pool.execute('DELETE FROM linked_accounts WHERE minecraft_uuid = ?', [sourceId]);

            // Second, check existing data for the WEB user to preserve gacha/discord
            const [existing] = await pool.execute<RowDataPacket[]>(
                'SELECT * FROM linked_accounts WHERE web_user_id = ?',
                [targetUserId]
            );

            if (existing.length > 0) {
                const oldRow = existing[0];
                // Delete old row because PK (minecraft_uuid) is changing
                await pool.execute('DELETE FROM linked_accounts WHERE web_user_id = ?', [targetUserId]);
                
                // Re-insert with new Minecraft data + preserved stats
                await pool.execute(
                    `INSERT INTO linked_accounts 
                    (minecraft_uuid, minecraft_name, web_user_id, discord_id, discord_tag, gacha_balance, unlocked_tiers) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [sourceId, playerName, targetUserId, oldRow.discord_id, oldRow.discord_tag, oldRow.gacha_balance, oldRow.unlocked_tiers]
                );
            } else {
                await pool.execute(
                    'INSERT INTO linked_accounts (minecraft_uuid, minecraft_name, web_user_id) VALUES (?, ?, ?)',
                    [sourceId, playerName, targetUserId]
                );
            }
        } else if (source === 'discord') {
            // Discord logic: much simpler as discord_id is just UNIQUE, not PK
            await pool.execute('UPDATE linked_accounts SET discord_id = NULL, discord_tag = NULL WHERE discord_id = ?', [sourceId]);
            await pool.execute('UPDATE linked_accounts SET discord_id = ?, discord_tag = ? WHERE web_user_id = ?', [sourceId, playerName, targetUserId]);
        }

        await pool.execute('DELETE FROM universal_links WHERE code = ?', [code.toUpperCase()]);

        // 3. Sync Meta
        const token = req.headers.authorization?.split(' ')[1];
        if (source === 'minecraft') {
            await syncSupabaseMetadata(targetUserId, token, { 
                minecraft_uuid: sourceId, 
                minecraft_nick: playerName 
            });
        } else if (source === 'discord') {
            await syncSupabaseMetadata(targetUserId, token, {
                discord_id: sourceId,
                discord_tag: playerName,
                discord_avatar: avatarUrl
            });
        }

        res.json({ success: true, source, linked: true, playerName });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        res.status(500).json({ 
            error: 'Error al procesar la vinculación.', 
            details: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal Server Error'
        });
    }
};

export const initWebLink = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'UserId required' });

        // Generate a random 6-char code
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const expiresAt = Date.now() + 15 * 60 * 1000;

        await pool.execute(
            'INSERT INTO universal_links (code, source, source_id, expires_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE expires_at = ?',
            [code, 'web', userId, expiresAt, expiresAt]
        );

        res.json({ success: true, code });

    } catch (error) {
        console.error('Init Web Link Error:', error);
        res.status(500).json({ error: 'Error al generar código de vinculación.' });
    }
};

export const checkLinkStatus = async (req: Request, res: Response) => {
    try {
        const userId = ensureString(req.query.userId); 
        if (!userId) return res.status(400).json({ error: 'UserId required' });

        if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });

        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM linked_accounts WHERE web_user_id = ?', 
            [userId]
        );

        // --- DISCORD AUTO-SYNC LOGIC ---
        try {
            const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId as string);
            if (!userError && user) {
                const discordIdentity = user.identities?.find(i => i.provider === 'discord');
                if (discordIdentity) {
                    const discordId = discordIdentity.id;
                    const discordTag = discordIdentity.identity_data?.full_name || discordIdentity.identity_data?.name || discordIdentity.identity_data?.custom_claims?.global_name || discordIdentity.identity_data?.user_name;
                    const discordAvatar = discordIdentity.identity_data?.avatar_url || discordIdentity.identity_data?.image_url || discordIdentity.identity_data?.picture;

                    if (rows.length > 0) {
                        const link = rows[0];
                        // If discord info is missing or outdated in SQL
                        if (link.discord_id !== discordId || link.discord_tag !== discordTag) {
                            // Handle potential collisions
                            await pool.execute('UPDATE linked_accounts SET discord_id = NULL, discord_tag = NULL WHERE discord_id = ?', [discordId]);
                            await pool.execute('UPDATE linked_accounts SET discord_id = ?, discord_tag = ? WHERE web_user_id = ?', [discordId, discordTag, userId]);
                            
                            const [newRows] = await pool.execute<RowDataPacket[]>('SELECT * FROM linked_accounts WHERE web_user_id = ?', [userId]);
                            if (newRows.length > 0) rows[0] = newRows[0];
                        }
                    }

                    // Always sync to Supabase metadata to ensure PFP is there
                    if (discordAvatar) {
                        await syncSupabaseMetadata(userId as string, req.headers.authorization?.split(' ')[1], {
                            discord_id: discordId,
                            discord_tag: discordTag,
                            discord_avatar: discordAvatar
                        });
                    }
                }
            }
        } catch (syncError) {
            console.error('Discord auto-sync non-fatal error:', syncError);
        }
        // -------------------------------

        if (rows.length > 0) {
            const link = rows[0];
            
            // Sync Supabase user metadata (Outward push)
            const token = req.headers.authorization?.split(' ')[1];
            
            // Try to preserve existing discord_avatar if we don't have a new one
            let existingAvatar = null;
            try {
                const { data: { user: userData } } = await supabase.auth.admin.getUserById(userId as string);
                existingAvatar = userData?.user_metadata?.discord_avatar;
            } catch { /* ignore */ }

            await syncSupabaseMetadata(userId as string, token, {
                minecraft_uuid: link.minecraft_uuid, 
                minecraft_nick: link.minecraft_name,
                discord_id: link.discord_id,
                discord_tag: link.discord_tag,
                discord_avatar: existingAvatar,
                gacha_balance: link.gacha_balance
            });
            
            return res.json({ 
                linked: true, 
                minecraft: { uuid: link.minecraft_uuid, name: link.minecraft_name },
                discord: { id: link.discord_id, tag: link.discord_tag },
                balance: link.gacha_balance
            });
        }
        
        res.json({ linked: false });

    } catch (error) {
        console.error('Check Link Status Error:', error);
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const unlinkAccount = async (req: Request, res: Response) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = (req as any).user;
        const userId = user?.id;
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        // We need a supabase client, but for metadata update, we can try using the user's token
        // to avoid dependency on SERVICE_ROLE_KEY if possible, OR fallback to admin if configured.
        
        // 1. Remove from MySQL (Set Minecraft columns to NULL)
        // First get the minecraft name to sync later
        const [rows] = await pool.execute('SELECT minecraft_name FROM linked_accounts WHERE web_user_id = ?', [userId]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const minecraftName = (rows as any[])[0]?.minecraft_name;

        await pool.execute('UPDATE linked_accounts SET minecraft_uuid = NULL, minecraft_name = NULL WHERE web_user_id = ?', [userId]);
        
        // Clean up if row is fully empty (no discord link either)
        await pool.execute('DELETE FROM linked_accounts WHERE web_user_id = ? AND minecraft_uuid IS NULL AND discord_id IS NULL', [userId]);

        // 2. Clear Supabase Metadata
        // Try to update using the user's own token first (safer/easier context)
        // Try to update using the user's own token first (safer/easier context)
        try {
            const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
            const sbAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

            if (token && sbUrl && sbAnonKey) {
                const userSupabase = createClient(
                    sbUrl, 
                    sbAnonKey, 
                    { global: { headers: { Authorization: `Bearer ${token}` } } }
                );
                await userSupabase.auth.updateUser({
                    data: {
                        minecraft_uuid: null,
                        minecraft_nick: null
                    }
                });
            } else if (supabase) {
                 // Fallback to admin if available and token method failed/skipped
                 await supabase.auth.admin.updateUserById(
                    userId,
                    {
                        user_metadata: {
                            minecraft_uuid: null,
                            minecraft_nick: null
                        }
                    }
                );
            }
        } catch (metaError) {
            console.error("Error updating Supabase metadata (non-fatal):", metaError);
            // Continue execution, as the primary unlink (MySQL) is done.
        }

        // 3. Sync with CrystalCore Plugin
        if (minecraftName) {
            try {
                await pool.execute('INSERT INTO web_pending_commands (command) VALUES (?)', [`crystalcore sync ${minecraftName}`]);
            } catch (dbError) {
                 console.error("Warning: Could not insert sync command (Plugin likely not updated or table missing):", dbError);
                 // Swallow error so client still gets success for the unlink itself
            }
        }

        res.json({ success: true, message: 'Minecraft account unlinked successfully' });

    } catch (error) {
        console.error('Unlink Account Error:', error);
        // Log detailed error for debugging schema issues
        if (error instanceof Error) {
             console.error('Stack:', error.stack);
             // @ts-expect-error sqlMessage exists on MySQL errors but not standard Error
             if (error.sqlMessage) console.error('SQL Message:', error.sqlMessage);
        }
        res.status(500).json({ error: 'Error al desvincular la cuenta.' });
    }
};

export const unlinkDiscord = async (req: Request, res: Response) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = (req as any).user;
        const userId = user?.id;
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // 1. Remove from MySQL (Set Discord columns to NULL)
        await pool.execute('UPDATE linked_accounts SET discord_id = NULL, discord_tag = NULL WHERE web_user_id = ?', [userId]);
        
        // Clean up if row is fully empty
        await pool.execute('DELETE FROM linked_accounts WHERE web_user_id = ? AND minecraft_uuid IS NULL AND discord_id IS NULL', [userId]);

        // 2. Clear Supabase Metadata
        try {
            const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
            const sbAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

            if (token && sbUrl && sbAnonKey) {
                const userSupabase = createClient(sbUrl, sbAnonKey, { 
                    global: { headers: { Authorization: `Bearer ${token}` } } 
                });
                await userSupabase.auth.updateUser({
                    data: {
                        discord_id: null,
                        discord_tag: null,
                        discord_avatar: null,
                        social_discord: null
                    }
                });
            } else if (supabase) {
                 await supabase.auth.admin.updateUserById(userId, {
                    user_metadata: {
                        discord_id: null,
                        discord_tag: null,
                        discord_avatar: null,
                        social_discord: null
                    }
                });
            }
        } catch (metaError) {
            console.error("Error updating Supabase metadata (non-fatal):", metaError);
        }

        res.json({ success: true, message: 'Discord account unlinked successfully' });

    } catch (error) {
        console.error('Unlink Discord Error:', error);
        res.status(500).json({ error: 'Error al desvincular Discord.' });
    }
};

const CLIENT_ID_AZURE = "3974b918-cd84-4d60-8955-2ad65234d16b";
const CLIENT_ID_LIVE = "00000000402B5328";

export const requestMsDeviceCode = async (_req: Request, res: Response) => {
    try {
        // 1. Try Live.com Device Code endpoint (standard for Minecraft public clients)
        const bodyLive = new URLSearchParams({
            client_id: CLIENT_ID_LIVE,
            scope: "service::user.auth.xboxlive.com::MBI_SSL",
            response_type: "device_code",
        });

        const rLive = await fetch("https://login.live.com/oauth20_connect.srf", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: bodyLive.toString(),
        });

        const dataLive = await rLive.json();
        if (rLive.ok && dataLive.user_code && dataLive.device_code) {
            return res.json({
                user_code: dataLive.user_code,
                device_code: dataLive.device_code,
                verification_uri: dataLive.verification_uri || "https://www.microsoft.com/link",
                interval: dataLive.interval || 5,
                expires_in: dataLive.expires_in || 900,
                isLive: true,
            });
        }

        // 2. Fallback to Azure v2.0 endpoint
        const bodyAzure = new URLSearchParams({
            client_id: CLIENT_ID_AZURE,
            scope: "XboxLive.SignIn XboxLive.offline_access",
        });

        const rAzure = await fetch("https://login.microsoftonline.com/consumers/oauth2/v2.0/devicecode", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: bodyAzure.toString(),
        });

        const dataAzure = await rAzure.json();
        if (rAzure.ok && dataAzure.device_code) {
            return res.json({ ...dataAzure, isLive: false });
        }

        return res.status(400).json({
            error: dataLive.error_description || dataLive.error || dataAzure.error_description || dataAzure.error || "Error al solicitar código de Microsoft",
        });
    } catch (err: unknown) {
        console.error("msDeviceCode error:", err);
        res.status(500).json({ error: "Error al solicitar el código de dispositivo de Microsoft." });
    }
};

export const pollMsDeviceToken = async (req: Request, res: Response) => {
    try {
        const { deviceCode, isLive } = req.body;
        if (!deviceCode) return res.status(400).json({ error: "deviceCode is required" });

        let accessToken: string | null = null;
        let authError: Record<string, unknown> | null = null;

        if (isLive !== false) {
            const bodyLive = new URLSearchParams({
                client_id: CLIENT_ID_LIVE,
                grant_type: "urn:ietf:params:oauth:grant-type:device_code",
                device_code: deviceCode,
            });

            const rLive = await fetch("https://login.live.com/oauth20_token.srf", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: bodyLive.toString(),
            });

            const dataLive = await rLive.json();
            if (dataLive.access_token) {
                accessToken = dataLive.access_token;
            } else if (dataLive.error) {
                authError = dataLive;
            }
        } else {
            const bodyAzure = new URLSearchParams({
                client_id: CLIENT_ID_AZURE,
                grant_type: "urn:ietf:params:oauth:grant-type:device_code",
                device_code: deviceCode,
            });

            const rAzure = await fetch("https://login.microsoftonline.com/consumers/oauth2/v2.0/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: bodyAzure.toString(),
            });

            const dataAzure = await rAzure.json();
            if (dataAzure.access_token) {
                accessToken = dataAzure.access_token;
            } else if (dataAzure.error) {
                authError = dataAzure;
            }
        }

        if (accessToken) {
            // 1. Xbox Live
            const r1 = await fetch("https://user.auth.xboxlive.com/user/authenticate", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({
                    Properties: {
                        AuthMethod: "RPS",
                        SiteName: "user.auth.xboxlive.com",
                        RpsTicket: accessToken.startsWith("Ew") || accessToken.startsWith("d=") ? accessToken : `d=${accessToken}`,
                    },
                    RelyingParty: "http://auth.xboxlive.com",
                    TokenType: "JWT",
                }),
            });
            let xblData = await r1.json();
            if (!r1.ok) {
                const r1Retry = await fetch("https://user.auth.xboxlive.com/user/authenticate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Accept: "application/json" },
                    body: JSON.stringify({
                        Properties: {
                            AuthMethod: "RPS",
                            SiteName: "user.auth.xboxlive.com",
                            RpsTicket: `t=${accessToken}`,
                        },
                        RelyingParty: "http://auth.xboxlive.com",
                        TokenType: "JWT",
                    }),
                });
                if (r1Retry.ok) xblData = await r1Retry.json();
                else return res.status(400).json({ error: "Fallo la autenticación con Xbox Live" });
            }

            const xblToken = xblData.Token;
            const userHash = xblData.DisplayClaims?.xui?.[0]?.uhs;

            // 2. XSTS
            const r2 = await fetch("https://xsts.auth.xboxlive.com/xsts/authorize", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({
                    Properties: {
                        SandboxId: "RETAIL",
                        UserTokens: [xblToken],
                    },
                    RelyingParty: "rp://api.minecraftservices.com/",
                    TokenType: "JWT",
                }),
            });
            const xstsData = await r2.json();
            if (!r2.ok) {
                if (xstsData.XErr === 2148916028) {
                    return res.status(400).json({ error: "Esta cuenta de Microsoft no posee un perfil de Minecraft comprado." });
                }
                return res.status(400).json({ error: `Error XSTS (${xstsData.XErr || "desconocido"})` });
            }

            const xstsToken = xstsData.Token;

            // 3. Minecraft Login
            const r3 = await fetch("https://api.minecraftservices.com/authentication/login_with_xbox", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identityToken: `XBL3.0 x=${userHash};${xstsToken}`,
                }),
            });
            const mcAuthData = await r3.json();
            if (!r3.ok) return res.status(400).json({ error: "Fallo el inicio de sesión en los servicios de Minecraft" });

            // 4. Fetch Profile
            const r4 = await fetch("https://api.minecraftservices.com/minecraft/profile", {
                headers: { Authorization: `Bearer ${mcAuthData.access_token}` },
            });
            const profile = await r4.json();
            if (!r4.ok || profile.error) {
                return res.status(400).json({ error: profile.errorMessage || "No se pudo obtener el perfil de Minecraft" });
            }

            return res.json({ success: true, profile });
        }

        return res.json(authError || { error: "authorization_pending" });
    } catch (err: unknown) {
        console.error("pollMsDeviceToken error:", err);
        res.status(500).json({ error: "Error al verificar la autorización con Microsoft." });
    }
};

export const exchangeMsAuthCode = async (req: Request, res: Response) => {
    try {
        const { code, redirectUri } = req.body;
        if (!code || !redirectUri) {
            return res.status(400).json({ error: "Code and redirectUri are required" });
        }

        const tokenParams: Record<string, string> = {
            client_id: CLIENT_ID_AZURE,
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
            scope: "XboxLive.SignIn XboxLive.offline_access",
        };

        if (process.env.MICROSOFT_CLIENT_SECRET) {
            tokenParams.client_secret = process.env.MICROSOFT_CLIENT_SECRET;
        }

        const body = new URLSearchParams(tokenParams);

        const rMs = await fetch("https://login.microsoftonline.com/consumers/oauth2/v2.0/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
        });

        const msData = await rMs.json();
        if (!rMs.ok || !msData.access_token) {
            return res.status(400).json({
                error: msData.error_description || msData.error || "Error al canjear el código de autorización de Microsoft",
            });
        }

        const accessToken = msData.access_token;

        const r1 = await fetch("https://user.auth.xboxlive.com/user/authenticate", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
                Properties: {
                    AuthMethod: "RPS",
                    SiteName: "user.auth.xboxlive.com",
                    RpsTicket: `d=${accessToken}`,
                },
                RelyingParty: "http://auth.xboxlive.com",
                TokenType: "JWT",
            }),
        });

        const xblData = await r1.json();
        if (!r1.ok) {
            return res.status(400).json({ error: "Fallo la autenticación con Xbox Live" });
        }

        const xblToken = xblData.Token;
        const userHash = xblData.DisplayClaims?.xui?.[0]?.uhs;

        const r2 = await fetch("https://xsts.auth.xboxlive.com/xsts/authorize", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
                Properties: {
                    SandboxId: "RETAIL",
                    UserTokens: [xblToken],
                },
                RelyingParty: "rp://api.minecraftservices.com/",
                TokenType: "JWT",
            }),
        });
        const xstsData = await r2.json();
        if (!r2.ok) {
            if (xstsData.XErr === 2148916028) {
                return res.status(400).json({ error: "Esta cuenta de Microsoft no posee un perfil de Minecraft comprado." });
            }
            return res.status(400).json({ error: `Error XSTS (${xstsData.XErr || "desconocido"})` });
        }

        const xstsToken = xstsData.Token;

        const r3 = await fetch("https://api.minecraftservices.com/authentication/login_with_xbox", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                identityToken: `XBL3.0 x=${userHash};${xstsToken}`,
            }),
        });
        const mcAuthData = await r3.json();
        if (!r3.ok) return res.status(400).json({ error: "Fallo el inicio de sesión en los servicios de Minecraft" });

        const r4 = await fetch("https://api.minecraftservices.com/minecraft/profile", {
            headers: { Authorization: `Bearer ${mcAuthData.access_token}` },
        });
        const profile = await r4.json();
        if (!r4.ok || profile.error) {
            return res.status(400).json({ error: profile.errorMessage || "No se pudo obtener el perfil de Minecraft" });
        }

        return res.json({ success: true, profile });
    } catch (err: unknown) {
        console.error("exchangeMsAuthCode error:", err);
        res.status(500).json({ error: "Error al autenticar con Microsoft." });
    }
};


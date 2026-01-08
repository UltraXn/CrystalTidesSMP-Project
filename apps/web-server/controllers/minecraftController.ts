import * as minecraftService from '../services/minecraftService.js';
import * as skinService from '../services/skinService.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import pool from '../config/database.js';
import { Request, Response } from 'express';

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
    } catch {
        res.status(500).json({
            online: false,
            error: 'Internal server error fetching status'
        });
    }
};

export const getSkin = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        if (!username) return res.status(400).json({ error: 'Username required' });

        const skinData = await skinService.getSkinUrl(username);
        res.json(skinData);
    } catch (error) {
        console.error("Error fetching skin:", error);
        // Fallback to minotar direct
        res.json({ url: `https://minotar.net/skin/${req.params.username}`, source: 'fallback' });
    }
};

// Supabase Admin Client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) supabase = createClient(supabaseUrl, supabaseKey);

import { RowDataPacket } from 'mysql2';

async function syncSupabaseMetadata(userId: string, _token: string | undefined, metadata: any) {
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
            'SELECT source, source_id, player_name, expires_at FROM universal_links WHERE code = ?',
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

        const { source, source_id: sourceId, player_name: playerName } = verification;

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
                discord_tag: playerName
            });
        }

        res.json({ success: true, source, linked: true, playerName });

    } catch (error) {
        console.error('Link Verification Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        // @ts-expect-error sqlMessage might exist
        const sqlError = error?.sqlMessage || '';
        res.status(500).json({ 
            error: 'Error al procesar la vinculación.', 
            details: errorMessage,
            sqlError: sqlError
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
        const { userId } = req.query; 
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
                    const discordTag = discordIdentity.identity_data?.full_name || discordIdentity.identity_data?.name || discordIdentity.identity_data?.custom_claims?.global_name;

                    if (rows.length > 0) {
                        const link = rows[0];
                        // If discord info is missing or outdated in SQL
                        if (link.discord_id !== discordId || link.discord_tag !== discordTag) {
                            // Handle potential collisions: if this discordId is ALREADY linked to another row, clear it first
                            await pool.execute('UPDATE linked_accounts SET discord_id = NULL, discord_tag = NULL WHERE discord_id = ?', [discordId]);
                            // Update current row
                            await pool.execute('UPDATE linked_accounts SET discord_id = ?, discord_tag = ? WHERE web_user_id = ?', [discordId, discordTag, userId]);
                            // Refresh local 'rows' for the final response
                            const [newRows] = await pool.execute<RowDataPacket[]>('SELECT * FROM linked_accounts WHERE web_user_id = ?', [userId]);
                            if (newRows.length > 0) rows[0] = newRows[0];
                        }
                    } else {
                        // NO MC LINK YET - We can't auto-create the row because minecraft_uuid is the PK and NOT NULL.
                        // For now, we skip auto-linking Discord-only users unless we change the table schema.
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
            await syncSupabaseMetadata(userId as string, token, {
                minecraft_uuid: link.minecraft_uuid, 
                minecraft_nick: link.minecraft_name,
                discord_id: link.discord_id,
                discord_tag: link.discord_tag,
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

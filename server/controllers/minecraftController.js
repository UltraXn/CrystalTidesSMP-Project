const minecraftService = require('../services/minecraftService');
const skinService = require('../services/skinService');

const getStatus = async (req, res) => {
    try {
        const host = process.env.MC_SERVER_HOST || 'localhost';
        const port = parseInt(process.env.MC_SERVER_PORT || '25565');

        const status = await minecraftService.getServerStatus(host, port);

        res.json(status);
    } catch (error) {
        res.status(500).json({
            online: false,
            error: 'Internal server error fetching status'
        });
    }
};

const getSkin = async (req, res) => {
    try {
        const { username } = req.params;
        if (!username) return res.status(400).json({ error: 'Username required' });

        const skinData = await skinService.getSkinUrl(username);
        // Redirect to the skin URL so the frontend can just use <img src="/api/minecraft/skin/user" />?
        // OR return JSON?
        // SkinViewer expects a URL to a texture image.
        // If I redirect, I can just pass the API URL to SkinViewer.
        // However, SkinViewer (skinview3d) might need CORS headers on the image.
        // Mojang/Minotar images usually have CORS.
        // If I redirect, the browser fetches the target.
        // Let's return JSON to be safe and flexible.
        res.json(skinData);
    } catch (error) {
        console.error("Error fetching skin:", error);
        // Fallback to minotar direct
        res.json({ url: `https://minotar.net/skin/${req.params.username}`, source: 'fallback' });
    }
};

const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');

// Database Config
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Supabase Admin Client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
let supabase;
if (supabaseUrl && supabaseKey) supabase = createClient(supabaseUrl, supabaseKey);

const pool = require('../config/database');

const verifyLinkCode = async (req, res) => {
    try {
        const { code, userId } = req.body;
        if (!code || !userId) return res.status(400).json({ error: 'Code and UserId required' });

        if (!supabase) return res.status(503).json({ error: 'Server configuration error (Supabase)' });

        // 1. Verify Code in MySQL
        const [rows] = await pool.execute(
            'SELECT * FROM web_verifications WHERE code = ?',
            [code]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Invalid or expired code.' });
        }

        const verification = rows[0];
        
        // Check Expiry
        if (Date.now() > Number(verification.expires_at)) {
            await pool.execute('DELETE FROM web_verifications WHERE code = ?', [code]);
            return res.status(400).json({ error: 'Code expired. Please generate a new one.' });
        }

        // 2. Code is Valid! Link Account in Supabase (Web Side)
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            userId,
            { user_metadata: { minecraft_uuid: verification.uuid, minecraft_nick: verification.player_name } }
        );

        if (updateError) throw updateError;

        // 3. Link Account in MySQL (Plugin Side)
        // This allows the plugin to check verification status via SQL
        await pool.execute(
            'INSERT INTO linked_accounts (uuid, player_name, web_user_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE player_name = ?, web_user_id = ?',
            [verification.uuid, verification.player_name, userId, verification.player_name, userId]
        );

        // 4. Cleanup
        await pool.execute('DELETE FROM web_verifications WHERE uuid = ?', [verification.uuid]);
        
        res.json({ success: true, username: verification.player_name, uuid: verification.uuid });

    } catch (error) {
        console.error('Link Verification Error:', error);
        res.status(500).json({ error: 'Verification failed: ' + error.message });
    }
};

const initWebLink = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'UserId required' });

        // Generate a random 4-char code (e.g. "XT92")
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I O 0 1 for clarity
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Expires in 15 minutes
        const expiresAt = Date.now() + 15 * 60 * 1000;

        // Insert into pending_web_links (requires table creation)
        await pool.execute(
            'INSERT INTO pending_web_links (code, web_user_id, expires_at) VALUES (?, ?, ?)',
            [code, userId, expiresAt]
        );

        res.json({ success: true, code });

    } catch (error) {
        console.error('Init Web Link Error:', error);
        res.status(500).json({ error: 'Failed to initiate link: ' + error.message });
    }
};

const checkLinkStatus = async (req, res) => {
    try {
        const { userId } = req.query; 
        if (!userId) return res.status(400).json({ error: 'UserId required' });

        if (!supabase) return res.status(503).json({ error: 'Supabase not configured' });

        const [rows] = await pool.execute('SELECT * FROM linked_accounts WHERE web_user_id = ?', [userId]);

        if (rows.length > 0) {
            const link = rows[0];
            
            // Sync Supabase
             const { error: updateError } = await supabase.auth.admin.updateUserById(
                userId,
                { user_metadata: { minecraft_uuid: link.uuid, minecraft_nick: link.player_name } }
            );
            
            if (updateError) {
                console.error("Supabase sync error:", updateError);
            }
            
            return res.json({ linked: true, uuid: link.uuid, nick: link.player_name });
        }
        
        res.json({ linked: false });

    } catch (error) {
        console.error('Check Link Status Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getStatus,
    getSkin,
    verifyLinkCode,
    initWebLink,
    checkLinkStatus
};

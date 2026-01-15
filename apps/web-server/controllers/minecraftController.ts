import * as minecraftService from '../services/minecraftService.js';
import * as skinService from '../services/skinService.js';
import { Request, Response } from 'express';
import supabase_internal from '../services/supabaseService.js';

const supabase = supabase_internal;

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

export const verifyLinkCode = async (req: Request, res: Response) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userSub = (req as any).user;
        const authUserId = userSub?.id;
        const { code, userId: bodyUserId } = req.body;
        
        const targetUserId = authUserId || bodyUserId;

        if (!code || !targetUserId) {
            return res.status(400).json({ error: 'Code and Authentication required' });
        }

        if (!supabase) return res.status(503).json({ error: 'Server configuration error (Supabase)' });

        // 1. Verify Code
        const { data: results, error: fetchError } = await supabase
            .from('universal_links')
            .select('*')
            .eq('code', code.toUpperCase());

        if (fetchError) throw fetchError;

        if (!results || results.length === 0) {
            return res.status(404).json({ error: 'Código inválido o inexistente.' });
        }

        const verification = results[0];
        
        if (Date.now() > Number(verification.expires_at)) {
            await supabase.from('universal_links').delete().eq('code', code.toUpperCase());
            return res.status(400).json({ error: 'El código ha expirado.' });
        }

        const { source, source_id: sourceId, player_name: playerName, avatar_url: avatarUrl } = verification;

        // 2. Link Account (Supabase Profiles)
        if (source === 'minecraft') {
            // First, remove ANY link currently tied to this Minecraft UUID
            await supabase
                .from('profiles')
                .update({ minecraft_uuid: null, minecraft_name: null })
                .eq('minecraft_uuid', sourceId);

            // Update target user profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ 
                    minecraft_uuid: sourceId, 
                    minecraft_name: playerName 
                })
                .eq('id', targetUserId);

            if (updateError) throw updateError;

        } else if (source === 'discord') {
            await supabase
                .from('profiles')
                .update({ social_discord: null, discord_tag: null, social_avatar_url: null })
                .eq('social_discord', sourceId);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ 
                    social_discord: sourceId, 
                    discord_tag: playerName,
                    social_avatar_url: avatarUrl
                })
                .eq('id', targetUserId);
            
            if (updateError) throw updateError;
        }

        await supabase.from('universal_links').delete().eq('code', code.toUpperCase());

        res.json({ success: true, source, linked: true, playerName });

    } catch (error) {
        console.error('Link Verification Error:', error);
        res.status(500).json({ error: 'Error al procesar la vinculación.' });
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

        const { error } = await supabase
            .from('universal_links')
            .upsert({
                code: code,
                source: 'web',
                source_id: userId,
                expires_at: expiresAt
            });

        if (error) throw error;

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

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        if (profile) {
            return res.json({ 
                linked: !!profile.minecraft_uuid, 
                minecraft: { uuid: profile.minecraft_uuid, name: profile.minecraft_name },
                discord: { id: profile.social_discord, tag: profile.discord_tag },
                balance: profile.gacha_balance
            });
        }
        
        res.json({ linked: false });

    } catch (error) {
        console.error('Check Link Status Error:', error);
        res.status(500).json({ error: 'Error checking status' });
    }
};

export const unlinkAccount = async (req: Request, res: Response) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = (req as any).user;
        const userId = user?.id;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        
        const { error } = await supabase
            .from('profiles')
            .update({
                minecraft_uuid: null,
                minecraft_name: null
            })
            .eq('id', userId);

        if (error) throw error;

        res.json({ success: true, message: 'Minecraft account unlinked successfully' });

    } catch (error) {
        console.error('Unlink Account Error:', error);
        res.status(500).json({ error: 'Error al desvincular la cuenta.' });
    }
};

export const unlinkDiscord = async (req: Request, res: Response) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = (req as any).user;
        const userId = user?.id;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { error } = await supabase
            .from('profiles')
            .update({
                social_discord: null,
                discord_tag: null,
                social_avatar_url: null
            })
            .eq('id', userId);

        if (error) throw error;

        res.json({ success: true, message: 'Discord account unlinked successfully' });

    } catch (error) {
        console.error('Unlink Discord Error:', error);
        res.status(500).json({ error: 'Error al desvincular Discord.' });
    }
};

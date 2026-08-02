import { Request, Response } from 'express';
import db from '../config/database.js';
import { updateUserMetadata } from '../services/userService.js';
import { RowDataPacket } from 'mysql2';

interface VerificationCode extends RowDataPacket {
    code: string;
    discord_id: string;
    discord_username: string;
}

export const linkAccount = async (req: Request, res: Response) => {
    try {
        const { code } = req.body;
        const userId = req.user?.id; 

        if (!userId) {
            return res.status(401).json({ message: 'No autenticado' });
        }

        if (!code) {
            return res.status(400).json({ message: 'Falta el código' });
        }

        // 1. Verify Code in MySQL
        const [rows] = await db.query<VerificationCode[]>(
            'SELECT * FROM verification_codes WHERE code = ?',
            [code]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Código inválido o expirado' });
        }

        const verification = rows[0];

        // 2. Update Supabase User Profile
        await updateUserMetadata(userId, {
            discord: {
                id: verification.discord_id,
                username: verification.discord_username
            },
            social_discord: verification.discord_username // Legacy support
        });

        // 3. Delete Code
        await db.query('DELETE FROM verification_codes WHERE code = ?', [code]);

        res.json({ success: true, message: 'Cuenta vinculada exitosamente', discord: verification.discord_username });

    } catch (error) {
        console.error('Link Error:', error);
        res.status(500).json({ message: 'Error al vincular cuenta' });
    }
};

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const ANNOUNCEMENTS_CHANNEL_ID = process.env.DISCORD_ANNOUNCEMENTS_CHANNEL_ID || "1297052480676560906";

interface DiscordAttachment {
    filename: string;
    url: string;
}

interface DiscordAuthor {
    id: string;
    username: string;
    global_name?: string;
    avatar?: string;
}

interface DiscordMessage {
    id: string;
    content: string;
    author?: DiscordAuthor;
    timestamp: string;
    attachments?: DiscordAttachment[];
}

export const getDiscordAnnouncements = async (_req: Request, res: Response) => {
    try {
        const response = await fetch(`https://discord.com/api/v10/channels/${ANNOUNCEMENTS_CHANNEL_ID}/messages?limit=5`, {
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error(`Discord API status ${response.status}`);
        }

        const messages = await response.json();
        const formatted = (Array.isArray(messages) ? messages as DiscordMessage[] : []).map((msg: DiscordMessage) => ({
            id: msg.id,
            content: msg.content,
            author: {
                username: msg.author?.global_name || msg.author?.username || 'Staff',
                avatar: msg.author?.avatar ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png` : '/skins/kiru.png'
            },
            timestamp: msg.timestamp,
            attachments: (msg.attachments || []).map((att: DiscordAttachment) => ({
                filename: att.filename,
                url: att.url
            }))
        }));

        res.json({ success: true, announcements: formatted });
    } catch (error) {
        console.error('Error fetching Discord announcements:', error);
        res.json({
            success: false,
            announcements: [
                {
                    id: '1',
                    content: 'Servidor de Minecraft 1.21+ activo. ¡Conéctate en mc.crystaltidessmp.net!',
                    author: { username: 'Killuwu', avatar: '/skins/killu.png' },
                    timestamp: new Date().toISOString()
                }
            ]
        });
    }
};

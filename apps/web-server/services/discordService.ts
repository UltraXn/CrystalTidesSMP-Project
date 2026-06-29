import fetch from 'node-fetch';
import { ForumThread } from './forumService.js';

const DISCORD_FORUM_WEBHOOK = process.env.DISCORD_FORUM_WEBHOOK;
const DISCORD_MC_EVENTS_WEBHOOK = process.env.DISCORD_MC_EVENTS_WEBHOOK;

interface WebhookPayload {
    content?: string;
    embeds?: Record<string, unknown>[];
    username?: string;
    avatar_url?: string;
}

/**
 * Send an announcement to a Discord channel via Webhook
 */
export const sendAnnouncement = async (webhookUrl: string | undefined, payload: WebhookPayload) => {
    if (!webhookUrl) {
        console.warn("[Discord Service] Webhook URL not configured. Skipping announcement.");
        return;
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`[Discord Service] Failed to send webhook: ${response.statusText}`);
        }
    } catch (error) {
        console.error("[Discord Service] Error sending message:", error);
    }
};

/**
 * Specific helper for Forum Threads
 */
export const notifyNewThread = async (thread: ForumThread) => {
    const payload = {
        embeds: [{
            title: `📌 Nuevo Tema: ${thread.title}`,
            description: thread.content.substring(0, 200) + (thread.content.length > 200 ? '...' : ''),
            url: `${process.env.FRONTEND_URL}/forum/thread/topic/${thread.id}`,
            color: 0x6DA5C0, // User color
            author: {
                name: thread.author_name,
                icon_url: thread.author_avatar || undefined
            },
            timestamp: new Date().toISOString()
        }]
    };

    await sendAnnouncement(DISCORD_FORUM_WEBHOOK, payload);
};

/**
 * Specific helper for Minecraft Events
 */
export const notifyMinecraftEvent = async (event: string, player: string, details: string) => {
    const payload = {
        embeds: [{
            title: `🎮 Evento In-Game: ${event}`,
            description: `**${player}** ${details}`,
            color: 0x4CAF50, // Minecraft Green
            timestamp: new Date().toISOString()
        }]
    };

    await sendAnnouncement(DISCORD_MC_EVENTS_WEBHOOK, payload);
};

/**
 * Specific helper for Ko-fi Donations
 */
export const sendDonationAlert = async (donation: { from_name: string; amount: string; currency: string; message?: string }) => {
    const payload = {
        embeds: [{
            title: `💎 ¡Nueva Donación en Ko-fi!`,
            description: `**${donation.from_name}** ha donado **${donation.amount} ${donation.currency}**`,
            fields: donation.message ? [{
                name: "Mensaje",
                value: donation.message.substring(0, 1024)
            }] : [],
            color: 0x29ABE2, // Ko-fi Blue
            thumbnail: {
                url: "https://storage.ko-fi.com/cdn/brandasset/v2/Logo_Full_White.png"
            },
            timestamp: new Date().toISOString()
        }]
    };

    const DISCORD_NEWS_WEBHOOK_URL = process.env.DISCORD_NEWS_WEBHOOK_URL;
    await sendAnnouncement(DISCORD_NEWS_WEBHOOK_URL, payload);
};

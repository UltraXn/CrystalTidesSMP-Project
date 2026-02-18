import { ForumThread } from './forumService.js';

const DISCORD_FORUM_WEBHOOK = process.env.DISCORD_FORUM_WEBHOOK;
const DISCORD_MC_EVENTS_WEBHOOK = process.env.DISCORD_MC_EVENTS_WEBHOOK;

interface WebhookPayload {
    content?: string;
    embeds?: Record<string, unknown>[];
    username?: string;
    avatar_url?: string;
}

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

export const notifyNewThread = async (thread: ForumThread) => {
    const payload = {
        embeds: [{
            title: `📌 Nuevo Tema: ${thread.title}`,
            description: thread.content.substring(0, 200) + (thread.content.length > 200 ? '...' : ''),
            url: `${process.env.FRONTEND_URL}/forum/thread/topic/${thread.id}`,
            color: 0x6DA5C0,
            author: {
                name: thread.author_name,
                icon_url: thread.author_avatar || undefined
            },
            timestamp: new Date().toISOString()
        }]
    };

    await sendAnnouncement(DISCORD_FORUM_WEBHOOK, payload);
};

export const notifyMinecraftEvent = async (event: string, player: string, details: string) => {
    const payload = {
        embeds: [{
            title: `🎮 Evento In-Game: ${event}`,
            description: `**${player}** ${details}`,
            color: 0x4CAF50,
            timestamp: new Date().toISOString()
        }]
    };

    await sendAnnouncement(DISCORD_MC_EVENTS_WEBHOOK, payload);
};

const BOT_API_URL = 'http://localhost:3002';

export const sendDiscordLog = async (title: string, message: string, level: 'info' | 'warn' | 'error' | 'success' | 'action' = 'info') => {
    try {
        await fetch(`${BOT_API_URL}/log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, message, level })
        });
    } catch (error) {
        console.error('Failed to send log to Discord Bot:', error);
    }
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ServerStatusData {
    online: boolean;
    motd: string;
    version: string;
    players: {
        online: number;
        max: number;
        sample: { name: string, id: string }[]
    };
    icon: string;
    latency?: number;
    error?: string;
}

export const getServerStatus = async (): Promise<ServerStatusData> => {
    const res = await fetch(`${API_URL}/server/status/live`);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return await res.json();
    }
    throw new Error('Invalid response format');
};

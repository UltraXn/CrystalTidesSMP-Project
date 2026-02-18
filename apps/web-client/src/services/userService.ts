import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Profile {
    id: string;
    username: string;
    avatar_url?: string;
    profile_banner_url?: string;
    role: string;
    created_at: string;
    medals?: (string | number)[];
    public_stats: boolean;
    bio?: string;
    social_discord?: string;
    social_twitter?: string;
    social_twitch?: string;
    social_youtube?: string;
    minecraft_uuid?: string;
    minecraft_nick?: string;
    original_username?: string;
    avatar_preference?: 'minecraft' | 'social';
    reputation?: number;
    status_message?: string;
    full_name?: string;
}

export interface MedalDefinition {
    id: string | number;
    name: string;
    description: string;
    icon: string;
    color: string;
    image_url?: string;
    name_en?: string;
    description_en?: string;
}

export interface PlayerStats {
    playtime: string;
    kills: number;
    mob_kills: number;
    deaths: number;
    money: string;
    blocks_mined: string;
    blocks_placed: string;
}

export const fetchUserProfile = async (username: string): Promise<Profile> => {
    const res = await fetch(`${API_URL}/users/profile/${username}`);
    if (!res.ok) {
        if (res.status === 404) throw new Error('profile.not_found');
        throw new Error('Error loading profile');
    }
    const response = await res.json();
    if (!response.success || !response.data) throw new Error('Invalid response format');
    return response.data;
};

export const fetchMedalDefinitions = async (): Promise<MedalDefinition[]> => {
    const res = await fetch(`${API_URL}/settings`);
    if (!res.ok) return [];
    const settings = await res.json();
    if (settings.medal_definitions) {
        const parsed = typeof settings.medal_definitions === 'string'
            ? JSON.parse(settings.medal_definitions)
            : settings.medal_definitions;
        return Array.isArray(parsed) ? parsed : [];
    }
    return [];
};

export const fetchPlayerStats = async (identifier: string): Promise<PlayerStats | null> => {
    const res = await fetch(`${API_URL}/player-stats/${identifier}`);
    if (!res.ok) return null;
    const response = await res.json();
    return response.success && response.data ? response.data : response;
};

export const giveKarma = async (targetUserId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${API_URL}/users/${targetUserId}/karma`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
        }
    });
    
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status}`);
    }
    return res.json();
};

export const verifyMinecraftLink = async (code: string, userId: string): Promise<any> => {
    const res = await fetch(`${API_URL}/minecraft/link`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            code,
            userId,
        }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al vincular la cuenta.");
    }
    return data;
};

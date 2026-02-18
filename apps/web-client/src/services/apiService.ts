import { supabase } from './supabaseClient';
import { getAuthHeaders } from './adminAuth';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// --- Auth Helper ---
const getHeaders = async (isJson = true) => {
    const { data: { session } } = await supabase.auth.getSession();
    const authHeaders = getAuthHeaders(session?.access_token || null);
    
    if (isJson) {
        return {
            'Content-Type': 'application/json',
            ...authHeaders
        };
    }
    return authHeaders;
};

// --- Public Endpoints ---

export const fetchServerResources = async () => {
    const res = await fetch(`${API_URL}/server/resources`);
    if (!res.ok) throw new Error('Failed to fetch server resources');
    return res.json();
};

export const fetchDiscordCount = async () => {
    const res = await fetch('https://discord.com/api/v9/invites/TDmwYNnvyT?with_counts=true');
    if (!res.ok) throw new Error('Failed to fetch Discord count');
    const data = await res.json();
    return data.approximate_member_count || 0;
};

export const fetchStaffList = async () => {
    const res = await fetch(`${API_URL}/users/staff`);
    if (!res.ok) throw new Error('Failed to fetch staff list');
    const data = await res.json();
    return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
};

export const fetchSettings = async () => {
    const res = await fetch(`${API_URL}/settings?t=${new Date().getTime()}`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
};

// --- Staff/Admin Hub (Tasks) ---

export const fetchTasks = async () => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/staff/tasks`, { headers });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
};

export const createTask = async (task: any) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/staff/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify(task)
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
};

export const updateTask = async (id: number | string, task: any) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/staff/tasks/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(task)
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
};

export const deleteTask = async (id: number | string) => {
    const headers = await getHeaders(false);
    const res = await fetch(`${API_URL}/staff/tasks/${id}`, {
        method: 'DELETE',
        headers
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return res.ok;
};

// --- Integration Syncs ---

export const fetchCalendarEvents = async () => {
    const headers = await getHeaders(false);
    const res = await fetch(`${API_URL}/staff/tasks/calendar`, { headers });
    if (!res.ok) throw new Error('Failed to fetch calendar events');
    return res.json();
};

export const getCalendarSubscriptionUrl = async () => {
    const headers = await getHeaders(false);
    const res = await fetch(`${API_URL}/staff/tasks/calendar/subscribe`, { headers });
    if (!res.ok) throw new Error('Failed to get calendar subscription URL');
    const data = await res.json();
    return data.url;
};

export const fetchNotionTasks = async () => {
    const headers = await getHeaders(false);
    const res = await fetch(`${API_URL}/staff/tasks/notion`, { headers });
    if (!res.ok) throw new Error('Failed to fetch Notion tasks');
    return res.json();
};
// --- Admin Docs ---

export const fetchAdminDocs = async () => {
    const headers = await getHeaders(false);
    const res = await fetch(`${API_URL}/settings/admin_docs`, { headers });
    if (!res.ok) throw new Error('Failed to fetch admin docs');
    const data = await res.json();
    return data && data.value ? (typeof data.value === 'string' ? JSON.parse(data.value) : data.value) : null;
};

export const updateAdminDocs = async (docs: any[], userId: string, username: string) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/settings/admin_docs`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ 
            value: JSON.stringify(docs),
            userId,
            username
        })
    });
    if (!res.ok) throw new Error('Failed to update admin docs');
    return res.json();
};

export const uploadAdminAsset = async (file: File, path: string) => {
    const { error: uploadError } = await supabase.storage
        .from('admin-assets')
        .upload(path, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
        .from('admin-assets')
        .getPublicUrl(path);

    return publicUrl;
};

// --- Wiki & Rules ---

export const fetchWikiPage = async (slug: string) => {
    const res = await fetch(`${API_URL}/wiki/${slug}`);
    if (!res.ok) throw new Error('Failed to fetch wiki page');
    return res.json();
};

export const fetchRules = async () => {
    const res = await fetch(`${API_URL}/server/rules`);
    if (!res.ok) throw new Error('Failed to fetch rules');
    return res.json();
};

export const fetchPolicies = async () => {
    const res = await fetch(`${API_URL}/server/policies`);
    if (!res.ok) throw new Error('Failed to fetch policies');
    return res.json();
};

// --- Gacha ---

export const fetchGachaHistory = async () => {
    const headers = await getHeaders(false);
    const res = await fetch(`${API_URL}/gacha/history`, { headers });
    if (!res.ok) throw new Error('Failed to fetch gacha history');
    return res.json();
};

export const checkGachaLink = async () => {
    const headers = await getHeaders(false);
    const res = await fetch(`${API_URL}/gacha/check-link`, { headers });
    if (!res.ok) throw new Error('Failed to check gacha link');
    return res.json();
};

export const rollGacha = async (userId: string) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/gacha/roll`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error('Failed to roll gacha');
    return res.json();
};

export const checkMinecraftLink = async (userId: string) => {
    const headers = await getHeaders(false);
    const res = await fetch(`${API_URL}/minecraft/link/check?userId=${userId}`, { headers });
    if (!res.ok) throw new Error('Failed to check minecraft link');
    return res.json();
};

export const initMinecraftLink = async (userId: string) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/minecraft/link/init`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error('Failed to init minecraft link');
    return res.json();
};

// --- Forum ---

export const fetchForumStats = async () => {
    const res = await fetch(`${API_URL}/forum/stats`);
    if (!res.ok) throw new Error('Failed to fetch forum stats');
    return res.json();
};

export const fetchForumNews = async () => {
    const res = await fetch(`${API_URL}/forum/news`);
    if (!res.ok) throw new Error('Failed to fetch forum news');
    return res.json();
};

// --- Server Status ---

export const fetchServerStatus = async () => {
    const res = await fetch(`${API_URL}/server/status`);
    if (!res.ok) throw new Error('Failed to fetch server status');
    return res.json();
};

// --- Public Profile & Social ---

export const fetchPublicProfile = async (username: string) => {
    const res = await fetch(`${API_URL}/profiles/${username}`);
    if (!res.ok) throw new Error('Failed to fetch public profile');
    return res.json();
};

export const fetchUserMedals = async (userId: string) => {
    const res = await fetch(`${API_URL}/profiles/${userId}/medals`);
    if (!res.ok) throw new Error('Failed to fetch user medals');
    return res.json();
};

export const fetchPlayerStats = async (minecraftNick: string) => {
    const res = await fetch(`${API_URL}/minecraft/stats/${minecraftNick}`);
    if (!res.ok) throw new Error('Failed to fetch player stats');
    return res.json();
};

export const giveKarma = async (targetUserId: string) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/profiles/${targetUserId}/karma`, {
        method: 'POST',
        headers
    });
    if (!res.ok) throw new Error('Failed to give karma');
    return res.json();
};

// --- Verification ---

export const verifyUserToken = async (token: string) => {
    const res = await fetch(`${API_URL}/auth/verify?token=${token}`, {
        method: 'POST'
    });
    if (!res.ok) throw new Error('Verification failed');
    return res.json();
};

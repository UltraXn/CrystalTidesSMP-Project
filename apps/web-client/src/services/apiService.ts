import { supabase } from './supabaseClient';

export const fetchServerResources = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/server/resources`);
    if (!response.ok) {
        throw new Error('Failed to fetch server resources');
    }
    return response.json();
};

export const fetchStaffList = async () => {
    try {
        const headers = await getHeaders();
        const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/staff`, { headers });
        if (!response.ok) {
            return [];
        }
        const data = await response.json();
        return data && Array.isArray(data.data) ? data.data : [];
    } catch {
        return [];
    }
};

const getHeaders = async (): Promise<HeadersInit> => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const fetchTasks = async () => {
    const headers = await getHeaders();
    const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/tasks`, { headers });
    if (!response.ok) {
        throw new Error('Failed to fetch tasks');
    }
    return response.json();
};

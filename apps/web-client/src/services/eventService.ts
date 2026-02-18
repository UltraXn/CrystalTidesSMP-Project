import { supabase } from "./supabaseClient";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ContestEvent {
    id: string | number;
    title: string;
    title_en?: string;
    description: string;
    description_en?: string;
    type: 'hammer' | 'dice' | 'map' | 'running';
    status: 'active' | 'soon' | 'finished';
}

export const getEvents = async (): Promise<ContestEvent[]> => {
    const res = await fetch(`${API_URL}/events`);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return await res.json();
};

export const getMyRegistrations = async (userId: string): Promise<(string | number)[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return [];

    const res = await fetch(`${API_URL}/events/my-registrations?userId=${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return await res.json();
};

export const registerToEvent = async (eventId: string | number, userId: string): Promise<any> => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_URL}/events/${eventId}/register`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
    });
    
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Error al registrarse");
    }
    return data;
};

export const getEventRegistrations = async (eventId: string | number): Promise<any[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_URL}/events/${eventId}/registrations`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return await res.json();
};

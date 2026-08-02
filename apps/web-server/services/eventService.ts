import supabase from '../config/supabaseClient.js';
import { translateText } from './translationService.js';

export interface Event {
    id: number;
    title: string;
    description: string;
    title_en?: string;
    description_en?: string;
    type: string;
    status: string;
    image_url?: string;
    created_at?: string;
}


export const getAllEvents = async () => {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const createEvent = async (eventData: Partial<Event>) => {
    // Auto translation
    try {
        if (eventData.title && !eventData.title_en) {
            eventData.title_en = await translateText(eventData.title, 'en');
        }
        if (eventData.description && !eventData.description_en) {
            eventData.description_en = await translateText(eventData.description, 'en');
        }
    } catch (err) {
        console.error("Error translating event:", err);
    }

    // Sanitize data (Optional: remove this block if you trust all inputs, but good for safety)
    const { title, description, title_en, description_en, type, status, image_url } = eventData;
    const cleanData = { title, description, title_en, description_en, type, status, image_url };

    const { data, error } = await supabase
        .from('events')
        .insert([cleanData])
        .select();

    if (error) {
        console.error("Supabase CREATE Event Error:", JSON.stringify(error));
        throw error;
    }
    return data[0];
};

export const updateEvent = async (id: number, updates: Partial<Event>) => {
    // Auto translation
    try {
        if (updates.title && !updates.title_en) {
            updates.title_en = await translateText(updates.title, 'en');
        }
        if (updates.description && !updates.description_en) {
            updates.description_en = await translateText(updates.description, 'en');
        }
    } catch (err) {
        console.error("Error translating event update:", err);
    }

    // Sanitize updates
    const cleanUpdates: Record<string, unknown> = {};
    const allowed = ['title', 'description', 'title_en', 'description_en', 'type', 'status', 'image_url'] as const;
    allowed.forEach(field => {
        if (updates[field as keyof Event] !== undefined) {
             cleanUpdates[field] = updates[field as keyof Event];
        }
    });

    const { data, error } = await supabase
        .from('events')
        .update(cleanUpdates)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data[0];
};

export const deleteEvent = async (id: number) => {
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
};

export const registerUser = async (eventId: number, userId: string) => {
    // Check if already registered
    const { data: existing } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

    if (existing) {
        throw new Error("Ya estás inscrito en este evento");
    }

    const { data, error } = await supabase
        .from('event_registrations')
        .insert([{ event_id: eventId, user_id: userId }])
        .select();

    if (error) throw error;
    return data[0];
};

export const getRegistrations = async (eventId: number) => {
     const { data: regs, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId);
    
    if (error) {
        console.error("Supabase Error (event_registrations):", error);
        return [];
    }
    if (!regs) return []; // Access check

    // Fetch all users to map names (Since we don't have a public profiles table relation)
    // Using safer destructuring
    const userResponse = await supabase.auth.admin.listUsers();
    
    if (userResponse.error) {
        console.error("Error fetching users for registrations:", userResponse.error);
        return regs.map((r) => ({ ...r, profiles: { username: 'Unknown', avatar_url: null } }));
    }

    const users = userResponse.data?.users || [];

    return regs.map((reg) => {
        const user = users.find((u) => u.id === reg.user_id);
        const username = user?.user_metadata?.username || user?.user_metadata?.full_name || 'Desconocido';
        const avatar = user?.user_metadata?.avatar_url || null;

        return {
            ...reg,
            profiles: {
                username,
                avatar_url: avatar
            }
        };
    });
}

export const getUserRegistrations = async (userId: string) => {
    const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('user_id', userId);

    if (error) throw error;
    return data.map((r) => r.event_id);
}

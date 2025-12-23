import supabase from '../config/supabaseClient.js';

export const getAllEvents = async () => {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const createEvent = async (eventData: any) => {
    const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select();

    if (error) throw error;
    return data[0];
};

export const updateEvent = async (id: number, updates: any) => {
    const { data, error } = await supabase
        .from('events')
        .update(updates)
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
     const { data, error } = await supabase
        .from('event_registrations')
        .select('*, profiles(username, avatar_url)') 
        .eq('event_id', eventId);
    
    if (error) throw error;
    return data;
}

export const getUserRegistrations = async (userId: string) => {
    const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('user_id', userId);

    if (error) throw error;
    return data.map((r: any) => r.event_id);
}

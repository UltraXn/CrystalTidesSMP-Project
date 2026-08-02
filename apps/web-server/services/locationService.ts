import supabase from './supabaseService.js';

interface LocationAuthor {
    name: string;
    role: string;
}

export interface WorldLocation {
    id: number;
    title: string;
    description: string;
    long_description: string;
    coords: string;
    image_url: string | null;
    is_coming_soon: boolean;
    authors: LocationAuthor[];
    sort_order: number;
    created_at?: string;
    updated_at?: string;
}

export const getAllLocations = async () => {
    const { data, error } = await supabase
        .from('world_locations')
        .select('*')
        .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data as WorldLocation[];
};

export const createLocation = async (locationData: Omit<WorldLocation, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
        .from('world_locations')
        .insert([locationData])
        .select()
        .single();
    
    if (error) throw error;
    return data as WorldLocation;
};

export const updateLocation = async (id: number, updates: Partial<WorldLocation>) => {
    const { data, error } = await supabase
        .from('world_locations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    
    if (error) throw error;
    return data as WorldLocation;
};

export const deleteLocation = async (id: number) => {
    const { error } = await supabase
        .from('world_locations')
        .delete()
        .eq('id', id);
    
    if (error) throw error;
    return true;
};

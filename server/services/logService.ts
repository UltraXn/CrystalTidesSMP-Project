import supabase from './supabaseService.js';

export const createLog = async ({ user_id, username, action, details, source = 'web' }: any) => {
    // Si details es string, usarlo. Si es objeto, stringify.
    const detailsText = typeof details === 'object' ? JSON.stringify(details) : details;

    const { data, error } = await supabase
        .from('system_logs')
        .insert([{ 
            user_id: user_id || null, 
            username: username || 'System', 
            action, 
            details: detailsText, 
            source 
        }])
        .select()
        .single();
    
    if (error) {
        console.error("Error creating log:", error);
        // Don't throw to avoid blocking the main action if logging fails
        return null;
    }
    return data;
};

export const getLogs = async ({ limit = 50, offset = 0, source, search }: any) => {
    let query = supabase
        .from('system_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (source) query = query.eq('source', source);
    if (search) query = query.or(`username.ilike.%${search}%,action.ilike.%${search}%,details.ilike.%${search}%`);

    const { data, count, error } = await query;
    if (error) throw error;

    return { logs: data, total: count };
};

// Placeholder for CoreProtect
export const getGameLogs = async (params: any) => {
    // Future integration with CoreProtect MySQL
    return {
        logs: [],
        total: 0,
        message: "Conexión a CoreProtect pendiente."
    };
};

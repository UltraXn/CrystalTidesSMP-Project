import supabase from './supabaseService.js';

interface LogEntry {
  user_id?: string;
  username?: string;
  action: string;
  details: string | object;
  source?: string;
}

interface LogQueryParams {
  limit?: number;
  offset?: number;
  source?: string;
  search?: string;
}

export const createLog = async ({
  user_id,
  username,
  action,
  details,
  source = 'web',
}: LogEntry) => {
  // Si details es string, usarlo. Si es objeto, stringify.
  const detailsText = typeof details === 'object' ? JSON.stringify(details) : details;

  const { data, error } = await supabase
    .from('system_logs')
    .insert([
      {
        user_id: user_id ?? null,
        username: username ?? 'System',
        action,
        details: detailsText,
        source,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating log:', error);
    // Don't throw to avoid blocking the main action if logging fails
    return null;
  }
  return data;
};

export const getLogs = async ({ limit = 50, offset = 0, source, search }: LogQueryParams) => {
  let query = supabase
    .from('system_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (source && source !== 'all') query = query.eq('source', source);
  if (search) {
    // Strip PostgREST filter operator characters to prevent filter manipulation or syntax breakage
    const cleanSearch = search.replace(/[,()"]/g, '').trim();
    if (cleanSearch) {
      query = query.or(
        `username.ilike.%${cleanSearch}%,action.ilike.%${cleanSearch}%,details.ilike.%${cleanSearch}%`,
      );
    }
  }

  const { data, count, error } = await query;
  if (error) throw error;

  return { data: data, total: count };
};

// Placeholder for CoreProtect
export const getGameLogs = async (_params: LogQueryParams) => {
  // Future integration with CoreProtect MySQL
  return {
    data: [],
    total: 0,
    message: 'Conexión a CoreProtect pendiente.',
  };
};

import supabase from './supabaseService.js';

export const getMonthlyStats = async () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11

    // ISO Strings for Supabase comparison
    // Use UTC to ensure consistency
    const startOfCurrentMonth = new Date(Date.UTC(currentYear, currentMonth, 1)).toISOString();
    const startOfNextMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 1)).toISOString();
    const startOfPrevMonth = new Date(Date.UTC(currentYear, currentMonth - 1, 1)).toISOString();

    // Query Current Month
    const { data: currentData, error: currentError } = await supabase
        .from('donations')
        .select('amount')
        .gte('created_at', startOfCurrentMonth)
        .lt('created_at', startOfNextMonth);

    if (currentError) throw currentError;

    // Query Previous Month
    const { data: prevData, error: prevError } = await supabase
        .from('donations')
        .select('amount')
        .gte('created_at', startOfPrevMonth)
        .lt('created_at', startOfCurrentMonth);

    if (prevError) throw prevError;

    // Helper helper sum
    const sum = (rows: any[]) => rows.reduce((acc, row) => acc + parseFloat(row.amount || 0), 0);
    const currentTotal = sum(currentData);
    const prevTotal = sum(prevData);

    // Calculate percent change
    let percentChange = 0;
    if (prevTotal > 0) {
        percentChange = ((currentTotal - prevTotal) / prevTotal) * 100;
    } else if (currentTotal > 0) {
        percentChange = 100;
    }

    return {
        currentMonth: currentTotal.toFixed(2),
        previousMonth: prevTotal.toFixed(2),
        percentChange: percentChange.toFixed(1)
    };
};

export const getDonations = async ({ page = 1, limit = 20, search = '' }: any) => {
    const offset = (page - 1) * limit;
    
    let query = supabase
        .from('donations')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (search) {
            query = query.or(`from_name.ilike.%${search}%,message.ilike.%${search}%`);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return { 
        data, 
        total: count, 
        page, 
        totalPages: Math.ceil((count || 0) / limit) 
    };
};

export const createDonation = async (donationData: any) => {
    const { data, error } = await supabase
        .from('donations')
        .insert([donationData])
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const updateDonation = async (id: number, updates: any) => {
    const { data, error } = await supabase
        .from('donations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteDonation = async (id: number) => {
    const { error } = await supabase
        .from('donations')
        .delete()
        .eq('id', id);
    if (error) throw error;
    return true;
};

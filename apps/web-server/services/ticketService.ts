import supabase from './supabaseService.js';

/**
 * Get all tickets (For Admin Panel)
 * Fetches user metadata (email/metadata) by joining or separate query if needed.
 * Note: Supabase JS join syntax depends on foreign keys. 
 * Since we have user_id referencing auth.users, getting user email might require a View or a manual fetch if auth schema is protected.
 * For now, we'll fetch tickets and typically frontend handles user ID resolution or we join 'profiles' if it exists.
 */
export const getAllTickets = async () => {
    // Fetch tickets with associated profile aliases
    const { data, error } = await supabase
        .from('tickets')
        .select('*, profiles(username, avatar_url)')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

/**
 * Get a single ticket by id
 */
export const getTicketById = async (id: number) => {
    const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

/**
 * Create a new ticket
 */
interface TicketData {
    subject: string;
    description: string;
    priority?: string;
}

export const createTicket = async (userId: string, ticketData: TicketData) => {
    const { subject, description, priority } = ticketData;

    const { data, error } = await supabase
        .from('tickets')
        .insert([
            {
                user_id: userId,
                subject,
                description,
                priority: priority || 'medium',
                status: 'open'
            }
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Update ticket status (For Admin)
 */
export const updateTicketStatus = async (ticketId: number, status: string) => {
    const { data, error } = await supabase
        .from('tickets')
        .update({ status })
        .eq('id', ticketId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Get tickets for a specific user
 */
export const getUserTickets = async (userId: string) => {
    const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

/**
 * Get ticket statistics (counts)
 */
export const getTicketStats = async () => {
    // Count open tickets
    const { count: openCount, error: errorOpen } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

    // Count urgent/high tickets
    const { count: urgentCount, error: errorUrgent } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .in('priority', ['high', 'urgent'])
        .neq('status', 'closed')
        .neq('status', 'resolved');

    if (errorOpen || errorUrgent) throw errorOpen || errorUrgent;

    return {
        open: openCount,
        urgent: urgentCount
    };
};

/**
 * Get messages for a ticket
 */
export const getTicketMessages = async (ticketId: number) => {
    const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
};

/**
 * Add a message to a ticket
 */
export const addTicketMessage = async (ticketId: number, userId: string, message: string, isStaff = false) => {
    const { data, error } = await supabase
        .from('ticket_messages')
        .insert([
            {
                ticket_id: ticketId,
                user_id: userId,
                message,
                is_staff: isStaff
            }
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteTicket = async (ticketId: number) => {
    const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);

    if (error) throw error;
    return { message: "Ticket deleted successfully" };
};

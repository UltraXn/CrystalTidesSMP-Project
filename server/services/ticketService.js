const supabase = require('./supabaseService');

/**
 * Get all tickets (For Admin Panel)
 * Fetches user metadata (email/metadata) by joining or separate query if needed.
 * Note: Supabase JS join syntax depends on foreign keys. 
 * Since we have user_id referencing auth.users, getting user email might require a View or a manual fetch if auth schema is protected.
 * For now, we'll fetch tickets and typically frontend handles user ID resolution or we join 'profiles' if it exists.
 */
const getAllTickets = async () => {
    // Fetch tickets ordered by created_at desc
    const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

/**
 * Create a new ticket
 */
const createTicket = async (userId, ticketData) => {
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
const updateTicketStatus = async (ticketId, status) => {
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
const getUserTickets = async (userId) => {
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
const getTicketStats = async () => {
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
const getTicketMessages = async (ticketId) => {
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
const addTicketMessage = async (ticketId, userId, message, isStaff = false) => {
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

module.exports = {
    getAllTickets,
    createTicket,
    updateTicketStatus,
    getUserTickets,
    getTicketStats,
    getTicketMessages,
    addTicketMessage
};

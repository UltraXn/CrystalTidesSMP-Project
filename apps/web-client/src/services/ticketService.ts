import { supabase } from './supabaseClient';
import { getAuthHeaders } from './adminAuth';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = async (isJson = true) => {
    const { data: { session } } = await supabase.auth.getSession();
    const authHeaders = getAuthHeaders(session?.access_token || null);
    
    if (isJson) {
        return {
            'Content-Type': 'application/json',
            ...authHeaders
        };
    }
    return authHeaders;
};

export interface Ticket {
    id: string;
    user_id: string;
    subject: string;
    category: string;
    priority: string;
    status: string;
    created_at: string;
    description?: string; // Only for initial creation
}

export interface TicketMessage {
    id: string;
    ticket_id: string;
    user_id: string;
    message: string;
    is_staff: boolean;
    created_at: string;
    author?: {
        username: string;
        avatar_url: string;
        role: string;
    };
}

export const fetchTickets = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");
    
    const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
};

export const createTicket = async (data: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    // 1. Create Ticket
    const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .insert([{
            user_id: session.user.id,
            subject: data.title,
            category: data.category,
            priority: data.priority,
            status: 'open',
            description: data.description
        }])
        .select()
        .single();

    if (ticketError) throw ticketError;
    
    // 2. Create Initial Message
    const { error: msgError } = await supabase
        .from('ticket_messages')
        .insert([{
            ticket_id: ticketData.id,
            user_id: session.user.id,
            message: data.description,
            is_staff: false
        }]);
    
    if (msgError) throw msgError;

    return ticketData;
};

export const fetchTicketDetail = async (id: string) => {
    const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error) throw error;
    return data;
};

export const fetchTicketMessages = async (id: string) => {
    const { data, error } = await supabase
        .from('ticket_messages')
        .select(`
            *,
            author:profiles!user_id (
                username,
                avatar_url,
                role
            )
        `)
        .eq('ticket_id', id)
        .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
};

export const sendTicketMessage = async (id: string, content: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from('ticket_messages')
        .insert([{
            ticket_id: id,
            user_id: session.user.id,
            message: content,
            is_staff: false
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const closeTicket = async (id: string) => {
    const { error } = await supabase
        .from('tickets')
        .update({ status: 'closed' })
        .eq('id', id);
    
    if (error) throw error;
};

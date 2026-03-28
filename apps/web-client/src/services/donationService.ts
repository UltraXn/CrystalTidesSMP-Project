import { getAuthHeaders } from './adminAuth';
import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Simulates a donation by calling the server's test endpoint.
 * Used for development/demo purposes by admins.
 */
export const simulateDonation = async (
    fromName: string,
    amount: number,
    currency: string = 'USD'
): Promise<void> => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(session?.access_token || null),
    };

    const res = await fetch(`${API_URL}/donations/simulate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ from_name: fromName, amount, currency }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(err.message || `Server responded with ${res.status}`);
    }
};

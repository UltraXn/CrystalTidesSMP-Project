import { supabase } from './supabaseClient';
import { getAuthHeaders } from './adminAuth';
import type { Registration } from '../components/Admin/Events/types';

export async function loadEventRegistrations(
  apiUrl: string,
  eventId: number,
): Promise<Registration[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const res = await fetch(`${apiUrl}/events/${eventId}/registrations`, {
    headers: getAuthHeaders(session?.access_token || null),
  });

  if (!res.ok) {
    return [];
  }
  return res.json();
}

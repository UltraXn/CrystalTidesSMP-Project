import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';
import { getAuthHeaders } from '../services/adminAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// --- Auth ---

export const useVerifyAdmin2FA = () => {
    return useMutation({
        mutationFn: async (code: string) => {
            const session = (await supabase.auth.getSession()).data.session;
            if (!session) throw new Error('No session');
            
            const res = await fetch(`${API_URL}/auth/2fa/verify`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}` 
                },
                body: JSON.stringify({ token: code }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Verification failed');
            return data.data; // { adminToken: string }
        },
    });
};

// --- Settings ---

export interface SiteSettings {
    theme: string;
    maintenance_mode: string;
    broadcast_config: string | { message: string; type: 'info' | 'alert' | 'error'; active: boolean };
    hero_slides: string | unknown[];
    recruitment_status?: string;
    recruitment_link?: string;
    server_rules?: string | unknown[];
    medal_definitions?: string | unknown[];
    achievement_definitions?: string | unknown[];
    donors_list?: string | unknown[];
    staff_cards?: string | unknown[];
    [key: string]: unknown;
}

export const useSiteSettings = () => {
    return useQuery<SiteSettings>({
        queryKey: ['admin', 'settings'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/settings`);
            if (!res.ok) throw new Error('Failed to fetch settings');
            const data = await res.json();
            return data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
};

export const useAdminSettings = () => {
    const query = useSiteSettings();
    
    const parsedData = useMemo(() => {
        if (!query.data) return { medals: [], achievements: [], donors: [], staff: [] };

        const parseDef = (val: unknown) => {
            if (!val) return [];
            try {
                const p = typeof val === 'string' ? JSON.parse(val) : val;
                return Array.isArray(p) ? p : [];
            } catch { return []; }
        };

        return {
            medals: parseDef(query.data.medal_definitions),
            achievements: parseDef(query.data.achievement_definitions),
            donors: parseDef(query.data.donors_list),
            staff: parseDef(query.data.staff_cards)
        };
    }, [query.data]);

    return { ...query, data: parsedData };
};

export const useUpdateSiteSetting = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ key, value, username, userId }: { key: string; value: unknown; username?: string; userId?: string }) => {
            const session = (await supabase.auth.getSession()).data.session;
            const headers = { 
                'Content-Type': 'application/json',
                ...getAuthHeaders(session?.access_token || null)
            };
            const res = await fetch(`${API_URL}/settings/${key}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ value: String(value), username, userId })
            });
            if (!res.ok) throw new Error('Failed to update setting');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
        }
    });
};

// --- Users Management ---

export const useSearchUsers = () => {
    return useMutation({
        mutationFn: async (query: string) => {
            const session = (await supabase.auth.getSession()).data.session;
            const headers = getAuthHeaders(session?.access_token || null);

            const res = await fetch(`${API_URL}/users?search=${encodeURIComponent(query)}`, { headers });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'User search failed');
            }
            const response = await res.json();
            return Array.isArray(response) ? response : (response.data || []);
        }
    });
};

export const useUpdateUserRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
            const session = (await supabase.auth.getSession()).data.session;
            const headers = {
                'Content-Type': 'application/json',
                ...getAuthHeaders(session?.access_token || null)
            };

            const res = await fetch(`${API_URL}/users/${userId}/role`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ role })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to update user role');
            }
            return await res.json();
        },
        onSuccess: () => {
            // We might want to invalidate queries that show users
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        }
    });
};

export const useUpdateUserMetadata = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, type, values }: { userId: string; type: 'medals' | 'achievements'; values: (string | number)[] }) => {
            const session = (await supabase.auth.getSession()).data.session;
            const headers = {
                'Content-Type': 'application/json',
                ...getAuthHeaders(session?.access_token || null)
            };

            const payload = type === 'medals' ? { medals: values } : { achievements: values };

            const res = await fetch(`${API_URL}/users/${userId}/metadata`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ metadata: payload })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to update user metadata');
            }
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        }
    });
};
// --- Tickets Management ---

export interface Ticket {
    id: number;
    user_id: string;
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'pending' | 'resolved' | 'closed';
    created_at: string;
    profiles?: {
        username: string;
        avatar_url: string;
    };
}

export const useAdminTickets = () => {
    return useQuery({
        queryKey: ['admin', 'tickets'],
        queryFn: async () => {
            const session = (await supabase.auth.getSession()).data.session;
            const headers = getAuthHeaders(session?.access_token || null);
            const res = await fetch(`${API_URL}/tickets`, { headers });
            
            if (!res.ok) throw new Error('Failed to fetch tickets');
            const data = await res.json();
            const tickets = Array.isArray(data) ? data : data.data || [];
            return tickets as Ticket[];
        }
    });
};

export const useTicketStats = () => {
    return useQuery({
        queryKey: ['admin', 'tickets', 'stats'],
        queryFn: async () => {
            const session = (await supabase.auth.getSession()).data.session;
            const headers = getAuthHeaders(session?.access_token || null);
            const res = await fetch(`${API_URL}/tickets/stats`, { headers });
            if (!res.ok) throw new Error('Failed to fetch ticket stats');
            const data = await res.json();
            return data.success ? data.data : data;
        },
        refetchInterval: 30000, // Refresh every 30s
    });
};

export const useDeleteTicket = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const session = (await supabase.auth.getSession()).data.session;
            const headers = getAuthHeaders(session?.access_token || null);
            const res = await fetch(`${API_URL}/tickets/${id}`, {
                method: 'DELETE',
                headers
            });
            if (!res.ok) throw new Error('Failed to delete ticket');
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
        }
    });
};
// --- Suggestions Management ---

export interface Suggestion {
    id: number;
    type: string;
    nickname: string;
    message: string;
    created_at: string;
    status: 'pending' | 'approved' | 'rejected' | 'implemented';
    votes?: number;
}

export const useAdminSuggestions = () => {
    return useQuery({
        queryKey: ['admin', 'suggestions'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/suggestions`);
            if (!res.ok) throw new Error('Failed to fetch suggestions');
            const data = await res.json();
            return data as Suggestion[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useUpdateSuggestionStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: number; status: string }) => {
            const session = (await supabase.auth.getSession()).data.session;
            const headers = { 
                'Content-Type': 'application/json',
                ...getAuthHeaders(session?.access_token || null)
            };
            const res = await fetch(`${API_URL}/suggestions/${id}/status`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error('Failed to update status');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'suggestions'] });
        }
    });
};

export const useDeleteSuggestion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const session = (await supabase.auth.getSession()).data.session;
            const headers = getAuthHeaders(session?.access_token || null);
            const res = await fetch(`${API_URL}/suggestions/${id}`, {
                method: 'DELETE',
                headers
            });
            if (!res.ok) throw new Error('Failed to delete suggestion');
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'suggestions'] });
        }
    });
};

// --- Polls Management ---

export interface PollPayload {
    title: string;
    title_en?: string;
    question: string;
    question_en?: string;
    options: { label: string; label_en?: string }[];
    closes_at: string;
}

export const useAdminActivePoll = () => {
    return useQuery({
        queryKey: ['admin', 'polls', 'active'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/polls/active`);
            if (!res.ok) throw new Error('Failed to fetch active poll');
            const data = await res.json();
            return data.success ? data.data : data;
        },
        staleTime: 1000 * 60, // 1 minute
    });
};

export const useAdminPolls = (page: number, limit: number = 10) => {
    return useQuery({
        queryKey: ['admin', 'polls', 'history', page, limit],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/polls?page=${page}&limit=${limit}`);
            if (!res.ok) throw new Error('Failed to fetch polls history');
            const data = await res.json();
            const payload = data.success ? data.data : data;
            return {
                data: Array.isArray(payload.data) ? payload.data : [],
                totalPages: payload.totalPages || 1
            };
        },
        placeholderData: (previousData) => previousData, 
    });
};

export const useCreatePoll = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: PollPayload) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/polls/create`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to create poll');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'polls'] });
        }
    });
};

export const useUpdatePoll = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: PollPayload }) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/polls/update/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to update poll');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'polls'] });
        }
    });
};

export const useClosePoll = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/polls/close/${id}`, {
                method: 'POST',
                headers: getAuthHeaders(session?.access_token || null)
            });
            if (!res.ok) throw new Error('Failed to close poll');
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'polls'] });
        }
    });
};

export const useDeletePoll = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/polls/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(session?.access_token || null)
            });
            if (!res.ok) throw new Error('Failed to delete poll');
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'polls'] });
        }
    });
};

export const useTranslateText = () => {
    return useMutation({
        mutationFn: async ({ text, targetLang = 'en' }: { text: string; targetLang?: string }) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/translation`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify({ text, targetLang })
            });
            if (!res.ok) throw new Error('Translation failed');
            const data = await res.json();
            return data.translatedText || '';
        }
    });
};

// --- News Management ---

export interface NewsPayload {
    title: string;
    title_en?: string;
    content: string;
    content_en?: string;
    image_url: string;
    category: string;
    author: string;
}

export const useAdminNews = () => {
    return useQuery({
        queryKey: ['admin', 'news'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/news`);
            if (!res.ok) throw new Error('Failed to fetch news');
            return await res.json();
        }
    });
};

export const useCreateNews = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: NewsPayload) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/news`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to create news');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'news'] });
        }
    });
};

export const useUpdateNews = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: string | number; payload: NewsPayload }) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/news/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to update news');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'news'] });
        }
    });
};

export const useDeleteNews = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string | number) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/news/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(session?.access_token || null)
            });
            if (!res.ok) throw new Error('Failed to delete news');
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'news'] });
        }
    });
};

// --- Wiki Management ---

export interface WikiPayload {
    title: string;
    title_en?: string;
    content: string;
    content_en?: string;
    description: string;
    description_en?: string;
    category: string;
    slug: string;
    icon?: string;
}

export const useWikiArticles = () => {
    return useQuery({
        queryKey: ['admin', 'wiki'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/wiki`);
            if (!res.ok) throw new Error('Failed to fetch wiki articles');
            return await res.json();
        }
    });
};

export const useCreateWikiArticle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: WikiPayload) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/wiki`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to create wiki article');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'wiki'] });
        }
    });
};

export const useUpdateWikiArticle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: string | number; payload: WikiPayload }) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/wiki/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to update wiki article');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'wiki'] });
        }
    });
};

export const useDeleteWikiArticle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string | number) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/wiki/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(session?.access_token || null)
            });
            if (!res.ok) throw new Error('Failed to delete wiki article');
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'wiki'] });
        }
    });
};

// --- Donations Management ---

export interface DonationPayload {
    donor_name: string;
    amount: number;
    currency: string;
    message?: string;
    source: string;
    status: string;
}

export const useAdminDonations = (page: number, limit: number, search: string) => {
    return useQuery({
        queryKey: ['admin', 'donations', page, limit, search],
        queryFn: async () => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/donations?page=${page}&limit=${limit}&search=${search}`, {
                headers: getAuthHeaders(session?.access_token || null)
            });
            if (!res.ok) throw new Error('Donations fetch failed');
            return await res.json();
        },
        placeholderData: (previousData) => previousData,
    });
};

export const useCreateDonation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: DonationPayload) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/donations`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Donation creation failed');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'donations'] });
        }
    });
};

export const useUpdateDonation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: string | number; payload: DonationPayload }) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/donations/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Donation update failed');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'donations'] });
        }
    });
};

export const useDeleteDonation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string | number) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/donations/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(session?.access_token || null)
            });
            if (!res.ok) throw new Error('Donation deletion failed');
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'donations'] });
        }
    });
};

export const useDonationStats = () => {
    return useQuery({
        queryKey: ['admin', 'donations', 'stats'],
        queryFn: async () => {
            const session = (await supabase.auth.getSession()).data.session;
            const headers = getAuthHeaders(session?.access_token || null);
            const res = await fetch(`${API_URL}/donations/stats`, { headers });
            if (!res.ok) throw new Error('Failed to fetch donation stats');
            const data = await res.json();
            return data.success ? data.data : data;
        },
        refetchInterval: 60000, // Refresh every minute
    });
};

// --- Events Management ---

export interface EventPayload {
    title: string;
    title_en?: string;
    description: string;
    description_en?: string;
    type: string;
    status: string;
    image_url?: string;
    event_date?: string;
}

export const useAdminEvents = () => {
    return useQuery({
        queryKey: ['admin', 'events'],
        queryFn: async () => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/events`, {
                headers: getAuthHeaders(session?.access_token || null)
            });
            if (!res.ok) throw new Error('Events fetch failed');
            return await res.json();
        }
    });
};

export const useCreateEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: EventPayload) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/events`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Event creation failed');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
        }
    });
};

export const useUpdateEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: string | number; payload: EventPayload }) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/events/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Event update failed');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
        }
    });
};

export const useDeleteEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string | number) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/events/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(session?.access_token || null)
            });
            if (!res.ok) throw new Error('Event deletion failed');
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
        }
    });
};

export const useStaffOnlineStatus = () => {
    return useQuery({
        queryKey: ['admin', 'staff-online'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/server/staff`);
            if (!res.ok) throw new Error('Staff online status fetch failed');
            const data = await res.json();
            return Array.isArray(data) ? data : (data.data || []);
        },
        refetchInterval: 60000 // Poll every 60s
    });
};

export const useAuditLogs = (page: number, limit: number, search: string, source: string) => {
    return useQuery({
        queryKey: ['admin', 'audit-logs', page, limit, search, source],
        queryFn: async () => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/admin/logs?page=${page}&limit=${limit}&search=${search}&source=${source}`, {
                headers: getAuthHeaders(session?.access_token || null)
            });
            if (!res.ok) throw new Error('Failed to fetch audit logs');
            return await res.json();
        }
    });
};

// --- Dashboard & Server Stats ---

export const useServerResources = () => {
    return useQuery({
        queryKey: ['admin', 'server', 'resources'],
        queryFn: async () => {
            const session = (await supabase.auth.getSession()).data.session;
            const headers = getAuthHeaders(session?.access_token || null);
            const res = await fetch(`${API_URL}/server/resources`, { headers });
            if (!res.ok) throw new Error('Failed to fetch server resources');
            const data = await res.json();
            return data.success ? data.data : data;
        },
        refetchInterval: 10000, // 10s for near real-time telemetry
    });
};

export const useServerLiveStatus = () => {
    return useQuery({
        queryKey: ['admin', 'server', 'status', 'live'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/server/status/live`);
            if (!res.ok) throw new Error('Failed to fetch live status');
            const data = await res.json();
            return data.success ? data.data : data;
        },
        refetchInterval: 10000, // 10s
    });
};

// --- Rules Management ---

export interface Rule {
    id: number;
    category: string;
    title: string;
    title_en?: string;
    content: string;
    content_en?: string;
    color?: string;
    sort_order: number;
}

export const useRules = () => {
    return useQuery({
        queryKey: ['admin', 'rules'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/rules`);
            if (!res.ok) throw new Error('Failed to fetch rules');
            const data = await res.json();
            return data.success ? data.data : data;
        },
        staleTime: 1000 * 60 * 60, // Rules are fairly static
    });
};

export const useCreateRule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: Omit<Rule, 'id'>) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/rules`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to create rule');
            const data = await res.json();
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'rules'] });
        }
    });
};

export const useUpdateRule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: Partial<Rule> }) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/rules/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to update rule');
            const data = await res.json();
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'rules'] });
        }
    });
};

export const useDeleteRule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/rules/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(session?.access_token || null)
            });
            if (!res.ok) throw new Error('Failed to delete rule');
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'rules'] });
        }
    });
};

// --- Policies Management ---

export interface Policy {
    id: number;
    slug: string;
    title: string;
    content: string;
    title_en?: string;
    content_en?: string;
    updated_at: string;
}

export const usePolicies = () => {
    return useQuery({
        queryKey: ['admin', 'policies'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/policies`);
            if (!res.ok) throw new Error('Failed to fetch policies');
            const data = await res.json();
            return data.success ? data.data : data;
        },
        staleTime: 1000 * 60 * 60 * 24, // Policies are very static
    });
};

export const useUpdatePolicy = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ slug, payload }: { slug: string; payload: Partial<Policy> }) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/policies/${slug}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to update policy');
            const data = await res.json();
            return data.data;
        },
        onSuccess: (_, { slug }) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'policies'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'policy', slug] });
        }
    });
};

// --- Secure Console ---

export const useSendCommand = () => {
    return useMutation({
        mutationFn: async ({ command, twoFactorToken }: { command: string; twoFactorToken?: string | null }) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/bridge/queue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null),
                    ...(twoFactorToken ? { 'x-admin-token': twoFactorToken } : {})
                },
                body: JSON.stringify({ command })
            });

            if (!res.ok) {
                 const err = await res.json();
                 throw new Error(err.error || 'Failed to send command');
            }
            return await res.json();
        }
    });
};

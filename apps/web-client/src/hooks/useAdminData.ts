import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';
import { getAuthHeaders } from '../services/adminAuth';
import { UserDefinition } from '../components/Admin/Users/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const HTTP_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  APPLICATION_JSON: 'application/json',
} as const;

const HTTP_METHODS = {
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

const QUERY_KEYS = {
  ADMIN: 'admin',
  SETTINGS: 'settings',
  USERS: 'users',
  TICKETS: 'tickets',
  STATS: 'stats',
  SUGGESTIONS: 'suggestions',
  POLLS: 'polls',
  ACTIVE: 'active',
  HISTORY: 'history',
  TRANSLATIONS: 'translations',
  NEWS: 'news',
  WIKI: 'wiki',
  DONATIONS: 'donations',
  EVENTS: 'events',
  STAFF_ONLINE: 'staff-online',
  AUDIT_LOGS: 'audit-logs',
  SERVER: 'server',
  RESOURCES: 'resources',
  STATUS: 'status',
  LIVE: 'live',
  RULES: 'rules',
  POLICIES: 'policies',
  POLICY: 'policy',
} as const;

const TIME_CONSTANTS = {
  TEN_SECONDS: 10000,
  THIRTY_SECONDS: 30000,
  ONE_MINUTE: 60000,
  FIVE_MINUTES: 1000 * 60 * 5,
  TEN_MINUTES: 1000 * 60 * 10,
  ONE_HOUR: 1000 * 60 * 60,
  ONE_DAY: 1000 * 60 * 60 * 24,
} as const;

// --- Helper Functions ---
/* eslint-disable @typescript-eslint/no-explicit-any */

const getSessionAccessToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
};

const getAuthHeadersAsync = async (): Promise<Record<string, string>> => {
  const token = await getSessionAccessToken();
  return getAuthHeaders(token);
};

const getJsonAuthHeadersAsync = async (): Promise<Record<string, string>> => {
  const token = await getSessionAccessToken();
  return {
    [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.APPLICATION_JSON,
    ...getAuthHeaders(token),
  };
};

const parseJsonError = async (res: Response, fallbackMessage: string): Promise<string> => {
  try {
    const errorData = (await res.json()) as { error?: string };
    if (typeof errorData?.error === 'string' && errorData.error.length > 0) {
      return errorData.error;
    }
  } catch {
    // Fall back to provided default message
  }
  return fallbackMessage;
};

const sendJsonAuthRequest = async <T>(
  url: string,
  method: (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS],
  bodyPayload: unknown,
  fallbackErrorMessage: string,
): Promise<T> => {
  const headers = await getJsonAuthHeadersAsync();
  const res = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(bodyPayload),
  });

  if (!res.ok) {
    const message = await parseJsonError(res, fallbackErrorMessage);
    throw new Error(message);
  }

  return (await res.json()) as T;
};

const executeDeleteRequest = async (
  url: string,
  fallbackErrorMessage: string,
): Promise<boolean> => {
  const headers = await getAuthHeadersAsync();
  const res = await fetch(url, {
    method: HTTP_METHODS.DELETE,
    headers,
  });

  if (!res.ok) {
    throw new Error(fallbackErrorMessage);
  }

  return true;
};

const unwrapDataField = <T = any>(payload: any): T => {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    const withSuccess = payload as { success: boolean; data: any };
    return (withSuccess.success ? withSuccess.data : payload) as T;
  }
  return payload as T;
};

const unwrapArrayField = <T = any>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const withData = payload as { data: unknown };
    if (Array.isArray(withData.data)) {
      return withData.data as T[];
    }
  }
  return [];
};

const parseJsonArray = <T = any>(val: unknown): T[] => {
  if (!val) {
    return [];
  }
  if (Array.isArray(val)) {
    return val as T[];
  }
  if (typeof val !== 'string') {
    return [];
  }
  try {
    const parsed = JSON.parse(val);
    return (Array.isArray(parsed) ? parsed : []) as T[];
  } catch {
    return [];
  }
};

// --- Auth ---

export const useVerifyAdmin2FA = () => {
  return useMutation({
    mutationFn: async (code: string) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        throw new Error('No session');
      }

      const res = await fetch(`${API_URL}/auth/2fa/verify`, {
        method: HTTP_METHODS.POST,
        headers: {
          [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.APPLICATION_JSON,
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ token: code }),
      });

      if (!res.ok) {
        const message = await parseJsonError(res, 'Verification failed');
        throw new Error(message);
      }

      const data = (await res.json()) as { data: { adminToken: string } };
      return data.data;
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
    queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.SETTINGS],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/settings`);
      if (!res.ok) {
        throw new Error('Failed to fetch settings');
      }
      return (await res.json()) as SiteSettings;
    },
    staleTime: TIME_CONSTANTS.TEN_MINUTES,
  });
};

export const useAdminSettings = () => {
  const query = useSiteSettings();

  const parsedData = useMemo(() => {
    if (!query.data) {
      return { medals: [], achievements: [], donors: [], staff: [] };
    }

    return {
      medals: parseJsonArray(query.data.medal_definitions),
      achievements: parseJsonArray(query.data.achievement_definitions),
      donors: parseJsonArray(query.data.donors_list),
      staff: parseJsonArray(query.data.staff_cards),
    };
  }, [query.data]);

  return { ...query, data: parsedData };
};

export const useUpdateSiteSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      key,
      value,
      username,
      userId,
    }: {
      key: string;
      value: unknown;
      username?: string;
      userId?: string;
    }) => {
      return sendJsonAuthRequest(
        `${API_URL}/settings/${key}`,
        HTTP_METHODS.PUT,
        { value: String(value), username, userId },
        'Failed to update setting',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.SETTINGS] });
    },
  });
};

// --- Users Management ---

export const useUsers = (search = '') => {
  return useQuery<UserDefinition[]>({
    queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.USERS, search],
    queryFn: async () => {
      const headers = await getAuthHeadersAsync();
      const res = await fetch(`${API_URL}/users?search=${encodeURIComponent(search)}`, { headers });
      if (!res.ok) {
        const message = await parseJsonError(res, 'User search failed');
        throw new Error(message);
      }
      const response = await res.json();
      return unwrapArrayField<UserDefinition>(response);
    },
    staleTime: TIME_CONSTANTS.FIVE_MINUTES,
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return sendJsonAuthRequest(
        `${API_URL}/users/${userId}/role`,
        HTTP_METHODS.PATCH,
        { role },
        'Failed to update user role',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.USERS] });
    },
  });
};

export const useUpdateUserMetadata = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      type,
      values,
    }: {
      userId: string;
      type: 'medals' | 'achievements';
      values: (string | number)[];
    }) => {
      const payload = type === 'medals' ? { medals: values } : { achievements: values };
      return sendJsonAuthRequest(
        `${API_URL}/users/${userId}/metadata`,
        HTTP_METHODS.PATCH,
        { metadata: payload },
        'Failed to update user metadata',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.USERS] });
    },
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
  return useQuery<Ticket[]>({
    queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.TICKETS],
    queryFn: async () => {
      const headers = await getAuthHeadersAsync();
      const res = await fetch(`${API_URL}/tickets`, { headers });
      if (!res.ok) {
        throw new Error('Failed to fetch tickets');
      }
      const data = await res.json();
      return unwrapArrayField<Ticket>(data);
    },
  });
};

export const useTicketStats = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.TICKETS, QUERY_KEYS.STATS],
    queryFn: async () => {
      const headers = await getAuthHeadersAsync();
      const res = await fetch(`${API_URL}/tickets/stats`, { headers });
      if (!res.ok) {
        throw new Error('Failed to fetch ticket stats');
      }
      const data = await res.json();
      return unwrapDataField(data);
    },
    refetchInterval: TIME_CONSTANTS.THIRTY_SECONDS,
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      executeDeleteRequest(`${API_URL}/tickets/${id}`, 'Failed to delete ticket'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.TICKETS] });
    },
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
  return useQuery<Suggestion[]>({
    queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.SUGGESTIONS],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/suggestions`);
      if (!res.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      return (await res.json()) as Suggestion[];
    },
    staleTime: TIME_CONSTANTS.FIVE_MINUTES,
  });
};

export const useUpdateSuggestionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return sendJsonAuthRequest(
        `${API_URL}/suggestions/${id}/status`,
        HTTP_METHODS.PATCH,
        { status },
        'Failed to update status',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.SUGGESTIONS] });
    },
  });
};

export const useDeleteSuggestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      executeDeleteRequest(`${API_URL}/suggestions/${id}`, 'Failed to delete suggestion'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.SUGGESTIONS] });
    },
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
    queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.POLLS, QUERY_KEYS.ACTIVE],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/polls/active`);
      if (!res.ok) {
        throw new Error('Failed to fetch active poll');
      }
      const data = await res.json();
      return unwrapDataField(data);
    },
    staleTime: TIME_CONSTANTS.ONE_MINUTE,
  });
};

export const useAdminPolls = (page: number, limit: number = 10) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.POLLS, QUERY_KEYS.HISTORY, page, limit],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/polls?page=${page}&limit=${limit}`);
      if (!res.ok) {
        throw new Error('Failed to fetch polls history');
      }
      const data = await res.json();
      const payload = unwrapDataField<{ data?: any[]; totalPages?: number }>(data);
      return {
        data: Array.isArray(payload.data) ? payload.data : [],
        totalPages: payload.totalPages ?? 1,
      };
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useCreatePoll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PollPayload) => {
      return sendJsonAuthRequest(
        `${API_URL}/polls/create`,
        HTTP_METHODS.POST,
        payload,
        'Failed to create poll',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.POLLS] });
    },
  });
};

export const useUpdatePoll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: PollPayload }) => {
      return sendJsonAuthRequest(
        `${API_URL}/polls/update/${id}`,
        HTTP_METHODS.PUT,
        payload,
        'Failed to update poll',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.POLLS] });
    },
  });
};

export const useClosePoll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const headers = await getAuthHeadersAsync();
      const res = await fetch(`${API_URL}/polls/close/${id}`, {
        method: HTTP_METHODS.POST,
        headers,
      });
      if (!res.ok) {
        throw new Error('Failed to close poll');
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.POLLS] });
    },
  });
};

export const useDeletePoll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      executeDeleteRequest(`${API_URL}/polls/${id}`, 'Failed to delete poll'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.POLLS] });
    },
  });
};

export const useTranslateText = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ text, targetLang = 'en' }: { text: string; targetLang?: string }) => {
      const data = await sendJsonAuthRequest<{ translatedText?: string }>(
        `${API_URL}/translation`,
        HTTP_METHODS.POST,
        { text, targetLang },
        'Translation failed',
      );
      return data.translatedText ?? '';
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.TRANSLATIONS] });
    },
  });
};

// --- News Management ---

export interface NewsPayload {
  title: string;
  title_en?: string;
  content: string;
  content_en?: string;
  category: string;
  status?: 'Published' | 'Draft';
  id?: number;
  image?: string;
  image_url?: string;
  author?: string;
  author_id?: string;
  username?: string;
  user_id?: string;
}

export const useAdminNews = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.NEWS],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/news`);
      if (!res.ok) {
        throw new Error('Failed to fetch news');
      }
      return await res.json();
    },
  });
};

export const useCreateNews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: NewsPayload) => {
      return sendJsonAuthRequest(
        `${API_URL}/news`,
        HTTP_METHODS.POST,
        payload,
        'Failed to create news',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.NEWS] });
    },
  });
};

export const useUpdateNews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string | number; payload: NewsPayload }) => {
      return sendJsonAuthRequest(
        `${API_URL}/news/${id}`,
        HTTP_METHODS.PUT,
        payload,
        'Failed to update news',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.NEWS] });
    },
  });
};

export const useDeleteNews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) =>
      executeDeleteRequest(`${API_URL}/news/${id}`, 'Failed to delete news'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.NEWS] });
    },
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
    queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.WIKI],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/wiki`);
      if (!res.ok) {
        throw new Error('Failed to fetch wiki articles');
      }
      const json = await res.json();
      return unwrapArrayField(json);
    },
  });
};

export const useCreateWikiArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: WikiPayload) => {
      return sendJsonAuthRequest(
        `${API_URL}/wiki`,
        HTTP_METHODS.POST,
        payload,
        'Failed to create wiki article',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.WIKI] });
    },
  });
};

export const useUpdateWikiArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string | number; payload: WikiPayload }) => {
      return sendJsonAuthRequest(
        `${API_URL}/wiki/${id}`,
        HTTP_METHODS.PUT,
        payload,
        'Failed to update wiki article',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.WIKI] });
    },
  });
};

export const useDeleteWikiArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) =>
      executeDeleteRequest(`${API_URL}/wiki/${id}`, 'Failed to delete wiki article'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.WIKI] });
    },
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
    queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.DONATIONS, page, limit, search],
    queryFn: async () => {
      const headers = await getAuthHeadersAsync();
      const res = await fetch(
        `${API_URL}/donations?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
        {
          headers,
        },
      );
      if (!res.ok) {
        throw new Error('Donations fetch failed');
      }
      return await res.json();
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateDonation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DonationPayload) => {
      return sendJsonAuthRequest(
        `${API_URL}/donations`,
        HTTP_METHODS.POST,
        payload,
        'Donation creation failed',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.DONATIONS] });
    },
  });
};

export const useUpdateDonation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string | number; payload: DonationPayload }) => {
      return sendJsonAuthRequest(
        `${API_URL}/donations/${id}`,
        HTTP_METHODS.PUT,
        payload,
        'Donation update failed',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.DONATIONS] });
    },
  });
};

export const useDeleteDonation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) =>
      executeDeleteRequest(`${API_URL}/donations/${id}`, 'Donation deletion failed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.DONATIONS] });
    },
  });
};

export const useDonationStats = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.DONATIONS, QUERY_KEYS.STATS],
    queryFn: async () => {
      const headers = await getAuthHeadersAsync();
      const res = await fetch(`${API_URL}/donations/stats`, { headers });
      if (!res.ok) {
        throw new Error('Failed to fetch donation stats');
      }
      const data = await res.json();
      return unwrapDataField(data);
    },
    refetchInterval: TIME_CONSTANTS.ONE_MINUTE,
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
    queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.EVENTS],
    queryFn: async () => {
      const headers = await getAuthHeadersAsync();
      const res = await fetch(`${API_URL}/events`, { headers });
      if (!res.ok) {
        throw new Error('Events fetch failed');
      }
      return await res.json();
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: EventPayload) => {
      return sendJsonAuthRequest(
        `${API_URL}/events`,
        HTTP_METHODS.POST,
        payload,
        'Event creation failed',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.EVENTS] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string | number; payload: EventPayload }) => {
      return sendJsonAuthRequest(
        `${API_URL}/events/${id}`,
        HTTP_METHODS.PUT,
        payload,
        'Event update failed',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.EVENTS] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) =>
      executeDeleteRequest(`${API_URL}/events/${id}`, 'Event deletion failed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.EVENTS] });
    },
  });
};

export const useStaffOnlineStatus = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.STAFF_ONLINE],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/server/staff`);
      if (!res.ok) {
        throw new Error('Staff online status fetch failed');
      }
      const data = await res.json();
      return unwrapArrayField(data);
    },
    refetchInterval: TIME_CONSTANTS.ONE_MINUTE,
  });
};

export const useAuditLogs = (page: number, limit: number, search: string, source: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.AUDIT_LOGS, page, limit, search, source],
    queryFn: async () => {
      const headers = await getAuthHeadersAsync();
      const queryParams = `page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&source=${encodeURIComponent(source)}`;
      const res = await fetch(`${API_URL}/logs?${queryParams}`, { headers });
      if (!res.ok) {
        throw new Error('Failed to fetch audit logs');
      }
      return await res.json();
    },
  });
};

// --- Dashboard & Server Stats ---

export const useServerResources = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.SERVER, QUERY_KEYS.RESOURCES],
    queryFn: async () => {
      const headers = await getAuthHeadersAsync();
      const res = await fetch(`${API_URL}/server/resources`, { headers });
      if (!res.ok) {
        throw new Error('Failed to fetch server resources');
      }
      const data = await res.json();
      return unwrapDataField(data);
    },
    refetchInterval: TIME_CONSTANTS.TEN_SECONDS,
  });
};

export const useServerLiveStatus = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.SERVER, QUERY_KEYS.STATUS, QUERY_KEYS.LIVE],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/server/status/live`);
      if (!res.ok) {
        throw new Error('Failed to fetch live status');
      }
      const data = await res.json();
      return unwrapDataField(data);
    },
    refetchInterval: TIME_CONSTANTS.TEN_SECONDS,
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
    queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.RULES],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/rules`);
      if (!res.ok) {
        throw new Error('Failed to fetch rules');
      }
      const data = await res.json();
      return unwrapDataField(data);
    },
    staleTime: TIME_CONSTANTS.ONE_HOUR,
  });
};

export const useCreateRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Rule, 'id'>) => {
      const data = await sendJsonAuthRequest<{ data: Rule }>(
        `${API_URL}/rules`,
        HTTP_METHODS.POST,
        payload,
        'Failed to create rule',
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.RULES] });
    },
  });
};

export const useUpdateRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<Rule> }) => {
      const data = await sendJsonAuthRequest<{ data: Rule }>(
        `${API_URL}/rules/${id}`,
        HTTP_METHODS.PUT,
        payload,
        'Failed to update rule',
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.RULES] });
    },
  });
};

export const useDeleteRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      executeDeleteRequest(`${API_URL}/rules/${id}`, 'Failed to delete rule'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.RULES] });
    },
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
    queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.POLICIES],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/policies`);
      if (!res.ok) {
        throw new Error('Failed to fetch policies');
      }
      const data = await res.json();
      return unwrapDataField(data);
    },
    staleTime: TIME_CONSTANTS.ONE_DAY,
  });
};

export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, payload }: { slug: string; payload: Partial<Policy> }) => {
      const data = await sendJsonAuthRequest<{ data: Policy }>(
        `${API_URL}/policies/${slug}`,
        HTTP_METHODS.PUT,
        payload,
        'Failed to update policy',
      );
      return data.data;
    },
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.POLICIES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN, QUERY_KEYS.POLICY, slug] });
    },
  });
};

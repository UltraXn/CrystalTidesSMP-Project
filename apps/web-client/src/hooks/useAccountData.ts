import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';
import type { UserIdentity } from '@supabase/supabase-js';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const QUERY_KEYS = {
  ACCOUNT_SETTINGS: 'account-settings',
  USER_THREADS: 'user-threads',
  PLAYER_STATS: 'player-stats',
  LINK_STATUS: 'link-status',
  GACHA_BALANCE: 'gacha-balance',
  TWO_FACTOR_STATUS: '2fa-status',
} as const;

const HEADERS = {
  CONTENT_TYPE_JSON: 'application/json',
} as const;

// ---------------------------------------------------------------------------
// Pure Helpers & Utility Functions
// ---------------------------------------------------------------------------
/* eslint-disable @typescript-eslint/no-explicit-any */

function parseDefinitions<T = any>(raw: unknown): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as T[];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return (Array.isArray(parsed) ? parsed : []) as T[];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizePlayerStatsResponse(response: any): any {
  if (response?.data) {
    return response.data;
  }
  return response;
}

async function getSessionToken(): Promise<string | undefined> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

async function getRequiredSessionToken(errorMessage = 'No session'): Promise<string> {
  const token = await getSessionToken();
  if (!token) throw new Error(errorMessage);
  return token;
}

async function parseErrorMessage(res: Response, fallbackMessage: string): Promise<string> {
  try {
    const errorData = await res.json();
    if (errorData.details) {
      return `${errorData.error}: ${errorData.details}`;
    }
    return errorData.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

// ---------------------------------------------------------------------------
// Account Unlinking Sub-routines
// ---------------------------------------------------------------------------

async function unlinkProviderIdentity(identity: UserIdentity): Promise<void> {
  const { error } = await supabase.auth.unlinkIdentity(identity);
  if (error) throw error;
}

async function unlinkMinecraftAccount(accessToken: string): Promise<void> {
  try {
    await fetch(`${API_URL}/minecraft/link/unlink`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (e) {
    console.warn('Backend server unlink failed, proceeding with metadata cleanup', e);
  }
  const { error } = await supabase.auth.updateUser({
    data: { minecraft_uuid: null, minecraft_nick: null },
  });
  if (error) throw error;
}

async function unlinkDiscordAccount(accessToken: string): Promise<void> {
  try {
    await fetch(`${API_URL}/minecraft/link/unlink-discord`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (e) {
    console.warn('Backend server discord unlink failed', e);
  }
  const { error } = await supabase.auth.updateUser({
    data: {
      discord_id: null,
      discord_tag: null,
      discord_avatar: null,
      social_discord: null,
    },
  });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// React Query Hooks
// ---------------------------------------------------------------------------

export const useAccountSettings = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ACCOUNT_SETTINGS],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/settings`);
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();

      return {
        medal_definitions: parseDefinitions(data.medal_definitions),
        achievement_definitions: parseDefinitions(data.achievement_definitions),
      };
    },
    staleTime: 1000 * 60 * 30, // Settings don't change often
  });
};

export const useUserThreads = (userId?: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_THREADS, userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`${API_URL}/forum/user/${userId}/threads`);
      if (!res.ok) throw new Error('Failed to fetch threads');
      return res.json();
    },
    enabled: enabled && !!userId,
  });
};

export const usePlayerStats = (uuid?: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PLAYER_STATS, uuid],
    queryFn: async () => {
      if (!uuid) return null;
      const res = await fetch(`${API_URL}/player-stats/${uuid}`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      const response = await res.json();
      return normalizePlayerStatsResponse(response);
    },
    enabled: enabled && !!uuid,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useLinkStatus = (userId?: string, isLinkCodeVisible: boolean = false) => {
  return useQuery({
    queryKey: [QUERY_KEYS.LINK_STATUS, userId],
    queryFn: async () => {
      if (!userId) return { linked: false };
      const accessToken = await getSessionToken();
      const res = await fetch(`${API_URL}/minecraft/link/check?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) throw new Error('Failed to check link status');
      return res.json();
    },
    enabled: !!userId && isLinkCodeVisible,
    refetchInterval: (query) => {
      const data = query.state.data as { linked?: boolean } | undefined;
      if (data?.linked) return false;
      return 3000;
    },
  });
};

export const useGenerateLinkCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const accessToken = await getSessionToken();
      const res = await fetch(`${API_URL}/minecraft/link/init`, {
        method: 'POST',
        headers: {
          'Content-Type': HEADERS.CONTENT_TYPE_JSON,
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const message = await parseErrorMessage(res, 'Failed to generate code');
        throw new Error(message);
      }
      const data = await res.json();
      return data.code;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LINK_STATUS] });
    },
  });
};

export const useVerifyLinkCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, code }: { userId: string; code: string }) => {
      const accessToken = await getSessionToken();
      const res = await fetch(`${API_URL}/minecraft/link`, {
        method: 'POST',
        headers: {
          'Content-Type': HEADERS.CONTENT_TYPE_JSON,
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId, code }),
      });
      if (!res.ok) {
        const message = await parseErrorMessage(res, 'Invalid code');
        throw new Error(message);
      }
      const data = await res.json();
      if (!data.linked && !data.success) {
        const errorMsg = data.details
          ? `${data.error}: ${data.details}`
          : data.error || 'Invalid code';
        throw new Error(errorMsg);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LINK_STATUS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PLAYER_STATS] });
    },
  });
};

export const useGachaBalance = (userId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GACHA_BALANCE, userId],
    queryFn: async () => {
      if (!userId) return 0;
      const { data, error } = await supabase
        .from('profiles')
        .select('gacha_balance')
        .eq('id', userId)
        .single();
      if (error) return 0;
      return Number(data?.gacha_balance ?? 0);
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
};

export const useLinkMicrosoftAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ uuid, nick }: { uuid: string; nick: string }) => {
      const { error } = await supabase.auth.updateUser({
        data: {
          minecraft_uuid: uuid,
          minecraft_nick: nick,
          is_premium: true,
        },
      });
      if (error) throw error;
      return { success: true, uuid, nick };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LINK_STATUS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PLAYER_STATS] });
    },
  });
};

export const useUnlinkAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      target,
      identity,
    }: {
      target: 'minecraft' | 'discord' | 'provider';
      identity?: UserIdentity;
    }) => {
      const accessToken = await getRequiredSessionToken('No active session');

      if (target === 'provider' && identity) {
        await unlinkProviderIdentity(identity);
      } else if (target === 'minecraft') {
        await unlinkMinecraftAccount(accessToken);
      } else if (target === 'discord') {
        await unlinkDiscordAccount(accessToken);
      }

      await supabase.auth.refreshSession();
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LINK_STATUS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PLAYER_STATS] });
      window.location.reload(); // Hard reload to ensure all contexts catch up with identity changes
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const {
        data: { user },
        error,
      } = await supabase.auth.updateUser({
        data,
      });
      if (error) throw error;
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PLAYER_STATS] });
    },
  });
};

export const useUpdatePassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNT_SETTINGS] });
    },
  });
};

export const use2FAStatus = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.TWO_FACTOR_STATUS],
    queryFn: async () => {
      const accessToken = await getSessionToken();
      if (!accessToken) return { enabled: false };
      const res = await fetch(`${API_URL}/auth/2fa/status`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch 2FA status');
      const data = await res.json();
      return data.data; // { enabled: boolean }
    },
  });
};

export const useSetup2FA = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const accessToken = await getRequiredSessionToken();
      const res = await fetch(`${API_URL}/auth/2fa/setup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const message = await parseErrorMessage(res, 'Setup failed');
        throw new Error(message);
      }
      const data = await res.json();
      return data.data; // { secret, qrCode }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TWO_FACTOR_STATUS] });
    },
  });
};

export const useEnable2FA = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ token, secret }: { token: string; secret: string }) => {
      const accessToken = await getRequiredSessionToken();
      const res = await fetch(`${API_URL}/auth/2fa/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': HEADERS.CONTENT_TYPE_JSON,
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ token, secret }),
      });
      if (!res.ok) {
        const message = await parseErrorMessage(res, 'Verification failed');
        throw new Error(message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TWO_FACTOR_STATUS] });
    },
  });
};

export const useDisable2FA = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const accessToken = await getRequiredSessionToken();
      const res = await fetch(`${API_URL}/auth/2fa/disable`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to disable 2FA');
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TWO_FACTOR_STATUS] });
    },
  });
};

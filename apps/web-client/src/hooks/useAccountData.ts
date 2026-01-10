import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';
import { UserIdentity } from '@supabase/supabase-js';

const API_URL = import.meta.env.VITE_API_URL;

export const useAccountSettings = () => {
    return useQuery({
        queryKey: ['account-settings'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/settings`);
            if (!res.ok) throw new Error('Failed to fetch settings');
            const data = await res.json();
            
            // Parse medal_definitions and achievement_definitions if they are strings
            const medal_definitions = data.medal_definitions 
                ? (typeof data.medal_definitions === 'string' ? JSON.parse(data.medal_definitions) : data.medal_definitions)
                : [];
            
            const achievement_definitions = data.achievement_definitions
                ? (typeof data.achievement_definitions === 'string' ? JSON.parse(data.achievement_definitions) : data.achievement_definitions)
                : [];

            return {
                medal_definitions: Array.isArray(medal_definitions) ? medal_definitions : [],
                achievement_definitions: Array.isArray(achievement_definitions) ? achievement_definitions : []
            };
        },
        staleTime: 1000 * 60 * 30, // Settings don't change often
    });
};

export const useUserThreads = (userId?: string, enabled: boolean = false) => {
    return useQuery({
        queryKey: ['user-threads', userId],
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
        queryKey: ['player-stats', uuid],
        queryFn: async () => {
            if (!uuid) return null;
            const res = await fetch(`${API_URL}/player-stats/${uuid}`);
            if (!res.ok) throw new Error('Failed to fetch stats');
            const response = await res.json();
            
            // Standardize response
            if (response.success && response.data) return response.data;
            if (!response.success && response.data) return response.data;
            return response;
        },
        enabled: enabled && !!uuid,
        staleTime: 1000 * 60, // 1 minute
    });
};

export const useLinkStatus = (userId?: string, isLinkCodeVisible: boolean = false) => {
    return useQuery({
        queryKey: ['link-status', userId],
        queryFn: async () => {
            if (!userId) return { linked: false };
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/minecraft/link/check?userId=${userId}`, {
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                },
            });
            if (!res.ok) throw new Error('Failed to check link status');
            return res.json();
        },
        enabled: !!userId && isLinkCodeVisible,
        refetchInterval: (query) => {
            // Only poll if not linked yet
            if (query.state.data?.linked) return false;
            return 3000;
        },
    });
};

export const useGenerateLinkCode = () => {
    return useMutation({
        mutationFn: async (userId: string) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/minecraft/link/init`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ userId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to generate code');
            return data.code;
        },
    });
};

export const useVerifyLinkCode = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, code }: { userId: string; code: string }) => {
            const session = (await supabase.auth.getSession()).data.session;
            const res = await fetch(`${API_URL}/minecraft/link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ userId, code }),
            });
            const data = await res.json();
            if (!res.ok || (!data.linked && !data.success)) {
                throw new Error(data.details ? `${data.error}: ${data.details}` : data.error || 'Invalid code');
            }
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['link-status'] });
            queryClient.invalidateQueries({ queryKey: ['player-stats'] });
        },
    });
};

export const useUnlinkAccount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ target, identity }: { target: 'minecraft' | 'discord' | 'provider'; identity?: UserIdentity }) => {
            const session = (await supabase.auth.getSession()).data.session;
            if (!session) throw new Error('No active session');

            if (target === 'provider' && identity) {
                const { error } = await supabase.auth.unlinkIdentity(identity);
                if (error) throw error;
            } else if (target === 'minecraft') {
                try {
                    await fetch(`${API_URL}/minecraft/link/unlink`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${session.access_token}` },
                    });
                } catch (e) {
                    console.warn('Backend server unlink failed, proceeding with metadata cleanup', e);
                }
                const { error } = await supabase.auth.updateUser({
                    data: { minecraft_uuid: null, minecraft_nick: null },
                });
                if (error) throw error;
            } else if (target === 'discord') {
                try {
                    await fetch(`${API_URL}/minecraft/link/unlink-discord`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${session.access_token}` },
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

            await supabase.auth.refreshSession();
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['link-status'] });
            queryClient.invalidateQueries({ queryKey: ['player-stats'] });
            window.location.reload(); // Hard reload to ensure all contexts catch up with identity changes
        },
    });
};
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Record<string, unknown>) => {
            const { data: { user }, error } = await supabase.auth.updateUser({
                data: data
            });
            if (error) throw error;
            return user;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['player-stats'] });
        },
    });
};

export const useUpdatePassword = () => {
    return useMutation({
        mutationFn: async (password: string) => {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            return { success: true };
        },
    });
};

export const use2FAStatus = () => {
    return useQuery({
        queryKey: ['2fa-status'],
        queryFn: async () => {
            const session = (await supabase.auth.getSession()).data.session;
            if (!session) return { enabled: false };
            const res = await fetch(`${API_URL}/auth/2fa/status`, {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (!res.ok) throw new Error('Failed to fetch 2FA status');
            const data = await res.json();
            return data.data; // { enabled: boolean }
        },
    });
};

export const useSetup2FA = () => {
    return useMutation({
        mutationFn: async () => {
            const session = (await supabase.auth.getSession()).data.session;
            if (!session) throw new Error('No session');
            const res = await fetch(`${API_URL}/auth/2fa/setup`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Setup failed');
            return data.data; // { secret, qrCode }
        },
    });
};

export const useEnable2FA = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ token, secret }: { token: string; secret: string }) => {
            const session = (await supabase.auth.getSession()).data.session;
            if (!session) throw new Error('No session');
            const res = await fetch(`${API_URL}/auth/2fa/enable`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}` 
                },
                body: JSON.stringify({ token, secret }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Verification failed');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
        },
    });
};

export const useDisable2FA = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const session = (await supabase.auth.getSession()).data.session;
            if (!session) throw new Error('No session');
            const res = await fetch(`${API_URL}/auth/2fa/disable`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (!res.ok) throw new Error('Failed to disable 2FA');
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
        },
    });
};

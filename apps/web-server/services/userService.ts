import supabase from './supabaseService.js';
import { User } from '@supabase/supabase-js';

export interface WebUser {
    id: string;
    email?: string;
    username: string;
    role: string;
    medals: unknown[];
    avatar_url?: string;
    discord: { id: string; username: string } | null;
    twitch: { id: string; username: string } | null;
    created_at: string;
    last_sign_in?: string;
}

/**
 * Get Staff Users with real-time status from Minecraft and Discord
 */
export const getStaffUsers = async () => {
    try {
        // 1. Fetch Staff Profiles from Supabase
        // We look for profiles with staff roles in metadata
        // In a real production environment, this would be a join with an 'app_roles' table
        const { data: { users }, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;

        const staffRoles = ['admin', 'moderator', 'helper', 'owner'];
        const staffProfiles = users.filter(u => staffRoles.includes(u.user_metadata?.role))
            .map(u => ({
                id: u.id,
                username: u.user_metadata?.username || u.user_metadata?.full_name || 'Staff Member',
                role: u.user_metadata?.role,
                avatar_url: u.user_metadata?.avatar_url || u.user_metadata?.picture,
                minecraft_uuid: u.user_metadata?.minecraft_uuid,
                social_discord: u.user_metadata?.social_discord || u.user_metadata?.discord
            }));

        // 2. Fetch Minecraft Server Status (for Online Players)
        let minecraftOnlinePlayers: string[] = [];
        try {
            const host = process.env.MC_SERVER_HOST || 'localhost';
            const port = parseInt(process.env.MC_SERVER_PORT || '25565');
            const { getServerStatus } = await import('./minecraftService.js');
            const status = await getServerStatus(host, port);
            interface MinecraftStatus {
                players?: {
                    sample?: Array<{ id: string; name: string }>;
                };
            }
            minecraftOnlinePlayers = (status as MinecraftStatus).players?.sample?.map(p => p.id) || [];
        } catch (mcError) {
            console.warn("[User Service] Failed to fetch Minecraft status for staff presence:", mcError);
        }

        const discordIds = staffProfiles
            .map(s => s.social_discord)
            .filter((id): id is string => !!id);

        // 3. Fetch Discord Presence from Bot
        let discordPresence: Record<string, string> = {};
        try {
            const botApiUrl = process.env.BOT_API_URL || 'http://localhost:3002';
            const botApiKey = process.env.BOT_API_KEY;

            const botRes = await fetch(`${botApiUrl}/presence?ids=${discordIds.join(',')}`, {
                headers: {
                    'Authorization': `Bearer ${botApiKey}`
                }
            });
            if (botRes.ok) {
                discordPresence = await botRes.json();
            }
        } catch (botError) {
            console.warn("[User Service] Failed to fetch Discord presence from bot:", botError);
        }

        // 4. Merge Data
        return staffProfiles.map(staff => {
            const isOnlineMC = staff.minecraft_uuid && minecraftOnlinePlayers.includes(staff.minecraft_uuid);
            const discordStatus = staff.social_discord ? (discordPresence[staff.social_discord] || 'offline') : 'offline';

            return {
                ...staff,
                mc_status: isOnlineMC ? 'online' : 'offline',
                discord_status: discordStatus
            };
        });

    } catch (error) {
        console.error("[User Service] Error in getStaffUsers:", error);
        return [];
    }
};

/**
 * Get all users from Supabase Auth (Requires Service Role)
 * Note: 'auth.users' is a system table. We should fetch from 'public.profiles' if synced,
 * but for roles management often we interact with auth metadata or custom profile field.
 * For this implementation, we will fetch from public.profiles and assume it has role field,
 * OR we fetch auth.users using listUsers() admin method.
 */
export const getAllUsers = async (query = ''): Promise<WebUser[]> => {
    // Using Supabase Admin API to list users
    // If you have a LOT of users, you should rely on server-side pagination or search if available.
    // Standard Supabase List Users does not search by email easily. We will filter in memory for now.
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    
    let filtered = users || [];
    if(query) {
        filtered = filtered.filter((u) => 
            (u.email && u.email.toLowerCase().includes(query.toLowerCase())) ||
            (u.user_metadata?.username && u.user_metadata.username.toLowerCase().includes(query.toLowerCase())) ||
            (u.user_metadata?.full_name && u.user_metadata.full_name.toLowerCase().includes(query.toLowerCase()))
        );
    }

    // Map to a friendlier format
    return filtered.map((u) => {
        const discordIdentity = u.identities?.find((i) => i.provider === 'discord');
        const twitchIdentity = u.identities?.find((i) => i.provider === 'twitch');

        return {
            id: u.id,
            email: u.email,
            username: u.user_metadata?.username || u.user_metadata?.full_name || 'Sin Nick',
            role: u.user_metadata?.role || 'user', // Read from metadata
            medals: u.user_metadata?.medals || [], // Start empty if none
            avatar_url: u.user_metadata?.avatar_url,
            // Connected Accounts
            discord: discordIdentity ? {
                id: discordIdentity.id,
                username: discordIdentity.identity_data?.full_name || discordIdentity.identity_data?.name || discordIdentity.identity_data?.custom_claims?.global_name
            } : null,
            twitch: twitchIdentity ? {
                id: twitchIdentity.id,
                username: twitchIdentity.identity_data?.full_name || twitchIdentity.identity_data?.name || twitchIdentity.identity_data?.preferred_username
            } : null,
            created_at: u.created_at,
            last_sign_in: u.last_sign_in_at
        };
    });
};

/**
 * Update user role
 * We will store the role in user_metadata for simplicity
 */
export const updateUserRole = async (userId: string, newRole: string): Promise<User | null> => {
    const { data: { user }, error } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { role: newRole } }
    );

    if (error) throw error;
    return user;
};

/**
 * Update any user metadata (e.g. medals)
 * This performs a merge with existing metadata
 */
export const updateUserMetadata = async (userId: string, metadata: Record<string, unknown>): Promise<User | null> => {
    const { data: { user }, error } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: metadata }
    );

    if (error) throw error;
    return user;
};

/**
 * Get public profile by username
 */
export const getPublicProfile = async (identifier: string) => {
    // Note: In a production app with many users, this is inefficient.
    // We should index username in a separate table.
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;

    const searchTerm = identifier.toLowerCase().replace(/[-_]/g, ' '); // Map neroferno_ultranix back to Neroferno Ultranix
    const searchTermWithUnderscore = identifier.toLowerCase().replace(/ /g, '_');
    const searchTermWithDash = identifier.toLowerCase().replace(/ /g, '-');

    const target = users?.find((u) => {
        const meta = u.user_metadata || {};
        const uUsername = (meta.username || '').toLowerCase();
        const uFullName = (meta.full_name || '').toLowerCase();
        const uMcNick = (meta.minecraft_nick || '').toLowerCase();
        
        return uUsername === searchTerm || uUsername === searchTermWithUnderscore || uUsername === searchTermWithDash ||
               uFullName === searchTerm || uFullName === searchTermWithUnderscore || uFullName === searchTermWithDash ||
               uMcNick === searchTerm || uMcNick === searchTermWithUnderscore || uMcNick === searchTermWithDash ||
               (meta.minecraft_uuid && meta.minecraft_uuid === identifier);
    });

    if (!target) return null;

    // Determine displayName for UI
    const displayName = target.user_metadata?.minecraft_nick || 
                        target.user_metadata?.username || 
                        target.user_metadata?.full_name || 
                        'Usuario';

    return {
        id: target.id,
        username: displayName,
        minecraft_nick: target.user_metadata?.minecraft_nick,
        original_username: target.user_metadata?.username,
        full_name: target.user_metadata?.full_name,
        role: target.user_metadata?.role || 'user',
        medals: target.user_metadata?.medals || [],
        avatar_url: target.user_metadata?.avatar_url,
        profile_banner_url: target.user_metadata?.profile_banner_url,
        created_at: target.created_at,
        public_stats: target.user_metadata?.public_stats || false,
        bio: target.user_metadata?.bio,
        reputation: target.user_metadata?.reputation || 0,
        social_discord: target.user_metadata?.social_discord || target.user_metadata?.discord,
        social_twitter: target.user_metadata?.social_twitter,
        social_twitch: target.user_metadata?.social_twitch,
        social_youtube: target.user_metadata?.social_youtube,
        minecraft_uuid: target.user_metadata?.minecraft_uuid,
        social_avatar_url: target.user_metadata?.picture || target.user_metadata?.avatar_url,
        avatar_preference: target.user_metadata?.avatar_preference || 'minecraft'
    };
};

/**
 * Give Karma to a user
 */
export const giveKarma = async (userId: string, voterId: string): Promise<number> => {
    const { data: { user }, error: fetchError } = await supabase.auth.admin.getUserById(userId);
    if (fetchError || !user) throw new Error('User not found');

    const metadata = user.user_metadata || {};
    const currentReputation = metadata.reputation || 0;
    const voters = metadata.voters || [];

    if (voters.includes(voterId)) {
        throw new Error('Ya le has dado karma a este usuario');
    }

    const newReputation = currentReputation + 1;
    voters.push(voterId);

    const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { ...metadata, reputation: newReputation, voters } }
    );

    if (updateError) throw updateError;
    return newReputation;
};

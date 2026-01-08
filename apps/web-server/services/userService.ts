import supabase from './supabaseService.js';
import db from '../config/database.js';
import { RowDataPacket } from 'mysql2';
import { User } from '@supabase/supabase-js';

interface LuckPermsPlayer extends RowDataPacket {
    uuid: string;
    username: string;
    role: string;
}

interface LuckPermsPermission extends RowDataPacket {
    uuid: string;
    permission: string;
}

interface PlanUser extends RowDataPacket {
    uuid: string;
    name: string;
}

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
 * Get Staff Users from Database (LuckPerms + Web Users)
 * Queries LP tables for specific groups and merges with web profiles.
 */
export const getStaffUsers = async () => {
    try {
        const targetGroups = ['neroferno', 'killuwu', 'killu', 'developer', 'admin', 'moderator', 'helper']; 
        
        // 1. Fetch UUIDs from LuckPerms Players (Primary Group)
        const groupsPlaceholder = targetGroups.map(() => '?').join(',');
        const [lpPlayers] = await db.query<LuckPermsPlayer[]>(`
            SELECT uuid, username, primary_group as role FROM luckperms_players 
            WHERE primary_group IN (${groupsPlaceholder})
        `, targetGroups);

        // 2. Fetch UUIDs from Permissions (Secondary Groups)
        const groupPerms = targetGroups.map(g => `group.${g}`);
        const permsPlaceholder = groupPerms.map(() => '?').join(',');
        const [lpPermissions] = await db.query<LuckPermsPermission[]>(`
            SELECT uuid, permission FROM luckperms_user_permissions 
            WHERE permission IN (${permsPlaceholder})
        `, groupPerms);
        
        // Merge results (Map UUID -> Role)
        const staffMap = new Map<string, { role: string, name?: string }>();
        
        lpPlayers.forEach((row) => {
            staffMap.set(row.uuid, { role: row.role, name: row.username });
        });
        
        lpPermissions.forEach((row) => {
            if (!staffMap.has(row.uuid)) {
                staffMap.set(row.uuid, { role: row.permission.replace('group.', ''), name: undefined });
            }
        });
        
        const uuids = Array.from(staffMap.keys());
        if (uuids.length === 0) return [];

        // 3. Resolve Names (if missing) from PLAN
        const missingNameUUIDs = uuids.filter(uuid => !staffMap.get(uuid)?.name);
        
        if (missingNameUUIDs.length > 0) {
            const [planUsers] = await db.query<PlanUser[]>(`
                SELECT uuid, name FROM plan_users WHERE uuid IN (${missingNameUUIDs.map(() => '?').join(',')})
            `, missingNameUUIDs);
            
            planUsers.forEach((u) => {
                const manual = staffMap.get(u.uuid);
                if (manual) manual.name = u.name;
            });
        }
        
        // 4. Fetch Supabase Users for Web Socials
        const sbUsers = await getAllUsers('');
        
        // 5. Build Final List
        const finalStaff = [];
        for (const [uuid, data] of staffMap.entries()) {
            if (!data.name) continue; // Skip if name unresolved
            
            // Match Supabase User
            const sbMatch = sbUsers.find((sb) => sb.username.toLowerCase() === data.name!.toLowerCase());
            
            finalStaff.push({
                uuid: uuid, // Minecraft UUID
                username: data.name,
                role: data.role.charAt(0).toUpperCase() + data.role.slice(1), // Capitalize
                avatar_url: sbMatch?.avatar_url, // Web Avatar
                discord: sbMatch?.discord,
                twitch: sbMatch?.twitch,
                web_id: sbMatch?.id
            });
        }
        
        return finalStaff;

    } catch (error) {
        console.error("Error fetching staff from LP:", error);
        throw new Error("Failed to fetch staff users");
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

    const searchTerm = identifier.toLowerCase();

    const target = users?.find((u) => {
        const meta = u.user_metadata || {};
        return (meta.username && meta.username.toLowerCase() === searchTerm) ||
               (meta.full_name && meta.full_name.toLowerCase() === searchTerm) ||
               (meta.minecraft_nick && meta.minecraft_nick.toLowerCase() === searchTerm) ||
               (meta.minecraft_uuid && meta.minecraft_uuid === identifier); // UUID is usually exact
    });

    if (!target) return null;

    // Determine display name: specific Minecraft Nick > Web Username > Full Name
    const displayName = target.user_metadata?.minecraft_nick || 
                        target.user_metadata?.username || 
                        target.user_metadata?.full_name || 
                        'Usuario';

    return {
        id: target.id,
        username: displayName, // Show Minecraft Name if available
        original_username: target.user_metadata?.username, // Keep track of login/original name
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

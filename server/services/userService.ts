import supabase from './supabaseService.js';

/**
 * Get all users from Supabase Auth (Requires Service Role)
 * Note: 'auth.users' is a system table. We should fetch from 'public.profiles' if synced,
 * but for roles management often we interact with auth metadata or custom profile field.
 * For this implementation, we will fetch from public.profiles and assume it has role field,
 * OR we fetch auth.users using listUsers() admin method.
 */
export const getAllUsers = async (query = '') => {
    // Using Supabase Admin API to list users
    // If you have a LOT of users, you should rely on server-side pagination or search if available.
    // Standard Supabase List Users does not search by email easily. We will filter in memory for now.
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    
    let filtered = users;
    if(query) {
        filtered = users.filter((u: any) => u.email && u.email.toLowerCase().includes(query.toLowerCase()));
    }

    // Map to a friendlier format
    return filtered.map((u: any) => ({
        id: u.id,
        email: u.email,
        role: u.user_metadata?.role || 'user', // Read from metadata
        medals: u.user_metadata?.medals || [], // Start empty if none
        created_at: u.created_at,
        last_sign_in: u.last_sign_in_at
    }));
};

/**
 * Update user role
 * We will store the role in user_metadata for simplicity
 */
/**
 * Update user role
 * We will store the role in user_metadata for simplicity
 */
export const updateUserRole = async (userId: string, newRole: string) => {
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
export const updateUserMetadata = async (userId: string, metadata: any) => {
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
export const getPublicProfile = async (username: string) => {
    // Note: In a production app with many users, this is inefficient.
    // We should index username in a separate table.
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;

    const target = users.find((u: any) => 
        (u.user_metadata?.username && u.user_metadata.username.toLowerCase() === username.toLowerCase()) ||
        (u.user_metadata?.full_name && u.user_metadata.full_name.toLowerCase() === username.toLowerCase())
    );

    if (!target) return null;

    return {
        id: target.id,
        username: target.user_metadata?.username || target.user_metadata?.full_name || 'Usuario',
        role: target.user_metadata?.role || 'user',
        medals: target.user_metadata?.medals || [],
        avatar_url: target.user_metadata?.avatar_url,
        created_at: target.created_at,
        public_stats: target.user_metadata?.public_stats || false
    };
};

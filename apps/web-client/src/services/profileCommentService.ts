import { supabase } from './supabaseClient'

export interface ProfileComment {
    id: number;
    content: string;
    created_at: string;
    author_id: string;
    author?: {
        username: string;
        avatar_url: string;
        role: string;
        metadata?: Record<string, unknown>;
        social_avatar_url?: string;
        avatar_preference?: string;
        minecraft_nick?: string;
        status_message?: string;
        full_name?: string;
        discord_tag?: string;
    };
}

export const getProfileComments = async (profileId: string): Promise<ProfileComment[]> => {
    const { data, error } = await supabase
        .from('profile_comments')
        .select(`
            *,
            author:profiles!author_id (
                username,
                avatar_url,
                role,
                social_avatar_url,
                avatar_preference,
                minecraft_nick,
                status_message,
                full_name,
                discord_tag
            )
        `)
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
}

export const postProfileComment = async (profileId: string, content: string): Promise<ProfileComment> => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Not authenticated")

    const { data, error } = await supabase
        .from('profile_comments')
        .insert({
            profile_id: profileId,
            author_id: session.user.id,
            content
        })
        .select(`
            *,
            author:profiles!author_id (
                username,
                avatar_url,
                role,
                social_avatar_url,
                avatar_preference,
                minecraft_nick,
                status_message,
                full_name,
                discord_tag
            )
        `)
        .single()

    if (error) throw error
    return data
}

export const deleteProfileComment = async (commentId: number): Promise<void> => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) throw new Error("Debes iniciar sesión para eliminar comentarios")

    const { error } = await supabase
        .from('profile_comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', session.user.id)

    if (error) throw error
}

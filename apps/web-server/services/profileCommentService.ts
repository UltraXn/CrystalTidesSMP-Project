import supabase from './supabaseService.js';
import { STAFF_ROLES } from '../utils/roleUtils.js';

interface Requestor {
    id: string;
    role: string;
}

export const getCommentsByProfile = async (profileId: string) => {
    // 1. Fetch comments (No Join)
    const { data: comments, error: commentError } = await supabase
        .from('profile_comments')
        .select('id, content, created_at, author_id')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

    if (commentError) throw commentError;
    if (!comments || comments.length === 0) return [];

    // 2. Fetch Profiles Manually (to avoid FK issues)
    const authorIds = [...new Set(comments.map(c => c.author_id))];
    
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, role')
        .in('id', authorIds);

    if (profileError) throw profileError;

    // 3. Map & Merge
    const profileMap = new Map(profiles?.map(p => [p.id, p]));
    
    return comments.map(c => ({
        ...c,
        profiles: profileMap.get(c.author_id)
    }));
};

export const createComment = async (profileId: string, authorId: string, content: string) => {
    // 1. Insert Comment
    const { data: comment, error: insertError } = await supabase
        .from('profile_comments')
        .insert([{
            profile_id: profileId,
            author_id: authorId,
            content: content
        }])
        .select('id, content, created_at, author_id')
        .single();

    if (insertError) throw insertError;

    // 2. Fetch Author Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url, role')
        .eq('id', authorId)
        .single();

    return {
        ...comment,
        profiles: profile
    };
};

export const deleteComment = async (commentId: number, requestor: Requestor) => {
    // 1. Fetch comment to check ownership
    const { data: comment } = await supabase
        .from('profile_comments')
        .select('author_id, profile_id')
        .eq('id', commentId)
        .single();
    
    if (!comment) throw new Error("Comment not found");

    // 2. Authorization check
    // Allowed if:
    // - User is the author
    // - User is the owner of the profile where the comment is posted
    // - User is staff/admin
    const isAuthor = comment.author_id === requestor.id;
    const isProfileOwner = comment.profile_id === requestor.id;
    const isStaff = STAFF_ROLES.includes(requestor.role.toLowerCase());

    if (!isAuthor && !isProfileOwner && !isStaff) {
        throw new Error("Forbidden: You do not have permission to delete this comment");
    }

    const { error } = await supabase
        .from('profile_comments')
        .delete()
        .eq('id', commentId);

    if (error) throw error;
    return true;
};

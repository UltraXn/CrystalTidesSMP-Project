import supabase from './supabaseService.js';
import * as pollService from './pollService.js';
import * as discordService from './discordService.js';
import { STAFF_ROLES } from '../utils/roleUtils.js';

interface Requestor {
    id: string;
    role: string;
}

export interface ForumThread {
    id: number;
    category_id: number;
    user_id: string;
    author_name: string;
    author_avatar: string;
    author_role: string;
    title: string;
    content: string;
    slug: string;
    views: number;
    pinned: boolean;
    poll_id?: number | null;
    created_at: string;
    reply_count?: number; // Virtual field
    forum_posts?: { count: number }[]; // Relation for count
}

export interface ForumPost {
    id: number;
    thread_id: number;
    user_id: string;
    author_name: string;
    author_avatar: string;
    author_role: string;
    content: string;
    created_at: string;
}

interface CreateThreadData {
    category_id: number;
    title: string;
    content: string;
    user_data: {
        id: string;
        name: string;
        avatar: string;
        role: string;
    };
    poll_data?: {
        enabled: boolean;
        question?: string;
        options?: string[];
        closes_at?: string;
        discord_link?: string;
    };
}

// Helper function for slug generation
const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};

export const getThreads = async (categoryId: number) => {
    // Select * and the count of related posts
    const { data, error } = await supabase
        .from('forum_threads')
        .select('*, forum_posts(count)')
        .eq('category_id', categoryId)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });
        
    if(error) throw error;
    
    // Flatten structure: forum_posts: [{count: 3}] -> reply_count: 3
    return (data as unknown as ForumThread[]).map((t) => ({
        ...t,
        reply_count: t.forum_posts && t.forum_posts.length > 0 ? t.forum_posts[0].count : 0,
        forum_posts: undefined // Remove the array
    }));
};

export const getUserThreads = async (userId: string) => {
    const { data, error } = await supabase
        .from('forum_threads')
        .select('*, forum_posts(count)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if(error) throw error;

    return (data as unknown as ForumThread[]).map((t) => ({
        ...t,
        reply_count: t.forum_posts && t.forum_posts.length > 0 ? t.forum_posts[0].count : 0,
        forum_posts: undefined
    }));
};

export const getThread = async (id: number | string) => {
    const isNumeric = /^\d+$/.test(String(id));
    
    let query = supabase.from('forum_threads').select('*');
    
    if (isNumeric) {
        query = query.eq('id', id);
    } else {
        query = query.eq('slug', id);
    }
    
    const { data: thread, error } = await query.single();
    
    if(error) throw error;
    
    let poll = null;
    if (thread.poll_id) {
         poll = await pollService.getPollById(thread.poll_id);
    }
    
    // Fetch Author Profile Fresh Data
    const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, role, status_message, avatar_preference, community_pref, minecraft_uuid, minecraft_nick, social_discord, social_avatar_url')
        .eq('id', thread.user_id)
        .maybeSingle();
        
    return { ...thread, poll, author_data_fresh: profile };
};

export const createThread = async ({ category_id, title, content, user_data, poll_data }: CreateThreadData) => {
    const slug = slugify(title);

    // 1. Create Thread
    const { data: thread, error } = await supabase
        .from('forum_threads')
        .insert([{
            category_id,
            user_id: user_data.id,
            author_name: user_data.name,
            author_avatar: user_data.avatar,
            author_role: user_data.role,
            title,
            content,
            slug,
            views: 0
        }])
        .select()
        .single();
        
    if(error) throw error;

    // 2. Create Poll if requested
    if (poll_data && poll_data.enabled) {
        // If discord link provided, maybe question is empty? 
        // Logic: If linking discord, maybe we don't create a local poll but just store link?
        // But pollService.createPoll handles discord_link.
        
        const poll = await pollService.createPoll({
            thread_id: thread.id,
            title: title + " - Encuesta",
            question: poll_data.question || "Encuesta externa",
            options: poll_data.options || [],
            closes_at: poll_data.closes_at,
            discord_link: poll_data.discord_link
        });
        
        await supabase.from('forum_threads').update({ poll_id: poll.id }).eq('id', thread.id);
    }

    // 3. Notify Discord
    discordService.notifyNewThread(thread).catch(console.error);

    return thread;
};

export const getPosts = async (threadIdOrSlug: number | string) => {
    let threadId: number;
    
    if (typeof threadIdOrSlug === 'string' && !/^\d+$/.test(threadIdOrSlug)) {
        // It's a slug, find the ID first
        const { data: thread, error } = await supabase
            .from('forum_threads')
            .select('id')
            .eq('slug', threadIdOrSlug)
            .single();
        if (error || !thread) return [];
        threadId = thread.id;
    } else {
        threadId = typeof threadIdOrSlug === 'number' ? threadIdOrSlug : parseInt(threadIdOrSlug);
    }

    const { data: posts, error } = await supabase.from('forum_posts').select('*').eq('thread_id', threadId).order('created_at', {ascending:true});
    if(error) {
        console.error("Error fetching posts for thread:", threadId, error);
        throw error;
    }
    
    if (!posts || posts.length === 0) return [];

    // Fetch Profiles
    const userIds = [...new Set(posts.map((p: ForumPost) => p.user_id).filter(id => !!id))];
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, role, status_message, avatar_preference, community_pref, minecraft_uuid, minecraft_nick, social_discord, social_avatar_url')
        .in('id', userIds);
    
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    return posts.map((p: ForumPost) => ({
        ...p,
        author_data_fresh: profileMap.get(p.user_id) || null
    }));
};

export const createPost = async ({ thread_id, content, user_data }: { thread_id: number | string; content: string; user_data: { id: string; name: string; avatar: string; role: string } }) => {
    let resolvedThreadId: number;

    if (typeof thread_id === 'string' && !/^\d+$/.test(thread_id)) {
        const { data: thread } = await supabase.from('forum_threads').select('id').eq('slug', thread_id).single();
        if (!thread) throw new Error("Thread not found");
        resolvedThreadId = thread.id;
    } else {
        resolvedThreadId = typeof thread_id === 'number' ? thread_id : parseInt(thread_id);
    }

    const { data, error } = await supabase.from('forum_posts').insert([{
        thread_id: resolvedThreadId, 
        content, 
        user_id: user_data.id, 
        author_name: user_data.name, 
        author_avatar: user_data.avatar, 
        author_role: user_data.role
    }]).select().single();
    if(error) throw error;
    return data;
};

export const getCategoryStats = async () => {
    const categories = [2, 3, 4];
    const stats = [];

    // News (Cat 1)
    const { count: newsCount } = await supabase.from('news').select('*', { count: 'exact', head: true }).eq('status', 'Published');
    
    // News "Last Post" - assuming we just check the latest news item
    const { data: latestNews } = await supabase.from('news').select('author, created_at').eq('status', 'Published').order('created_at', {ascending:false}).limit(1).maybeSingle();
    let newsLastPost = { user: "Staff", date: "-" };
    if (latestNews) {
        newsLastPost = { user: latestNews.author || "Staff", date: new Date(latestNews.created_at).toLocaleDateString() };
    }

    stats.push({
        id: 1,
        topics: newsCount || 0,
        posts: newsCount || 0,
        lastPost: newsLastPost
    });

    // Forum Cats
    for (const catId of categories) {
        // 1. Count Topics (Threads)
        const { count: threadCount } = await supabase
            .from('forum_threads')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', catId);
        
        // 2. Count Posts (Replies) and determine Last Activity
        let postCount = 0;
        let lastPostData = { user: "-", date: "-" }; // Default if empty

        // Fetch thread IDs to query related posts
        const { data: threads } = await supabase
            .from('forum_threads')
            .select('id')
            .eq('category_id', catId);
        
        if (threads && threads.length > 0) {
            const threadIds = threads.map((t) => t.id);

            // Count replies
            const { count: replyCount } = await supabase
                .from('forum_posts')
                .select('*', { count: 'exact', head: true })
                .in('thread_id', threadIds);
            
            postCount = replyCount || 0;

            // Find latest activity
            // A. Latest Thread Creation
            const { data: latestThread } = await supabase
                .from('forum_threads')
                .select('author_name, created_at')
                .eq('category_id', catId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            // B. Latest Reply
            const { data: latestReply } = await supabase
                .from('forum_posts')
                .select('author_name, created_at')
                .in('thread_id', threadIds)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            // Compare dates
            let lastActivity = null;
            if (latestThread && latestReply) {
                lastActivity = new Date(latestThread.created_at) > new Date(latestReply.created_at) ? latestThread : latestReply;
            } else if (latestThread) {
                lastActivity = latestThread;
            } else if (latestReply) {
                lastActivity = latestReply;
            }

            if (lastActivity) {
                lastPostData = { 
                    user: lastActivity.author_name, 
                    date: new Date(lastActivity.created_at).toLocaleDateString() 
                };
            }
        }
        
        stats.push({
            id: catId,
            topics: threadCount || 0,
            posts: postCount, 
            lastPost: lastPostData
        });
    }
    return stats;
}

export const updateThread = async (idOrSlug: number | string, updates: Partial<ForumThread>, requestor: Requestor) => {
    let threadId: number;
    
    if (typeof idOrSlug === 'string' && !/^\d+$/.test(idOrSlug)) {
        const { data: thread } = await supabase.from('forum_threads').select('id, user_id').eq('slug', idOrSlug).single();
        if (!thread) throw new Error("Thread not found");
        
        // Ownership Check (Allow staff/admin to moderate)
        if (thread.user_id !== requestor.id && !STAFF_ROLES.includes(requestor.role.toLowerCase())) {
            throw new Error("Forbidden: You do not own this thread");
        }
        
        threadId = thread.id;
    } else {
        threadId = typeof idOrSlug === 'number' ? idOrSlug : parseInt(idOrSlug);
        const { data: thread } = await supabase.from('forum_threads').select('user_id').eq('id', threadId).single();
        if (!thread) throw new Error("Thread not found");
        
        // Ownership Check (Allow staff/admin to moderate)
        if (thread.user_id !== requestor.id && !STAFF_ROLES.includes(requestor.role.toLowerCase())) {
            throw new Error("Forbidden: You do not own this thread");
        }
    }

    const { data, error } = await supabase.from('forum_threads').update(updates).eq('id', threadId).select().single();
    if(error) throw error;
    return data;
};

export const deleteThread = async (idOrSlug: number | string, requestor: Requestor) => {
    let threadId: number;
    
    if (typeof idOrSlug === 'string' && !/^\d+$/.test(idOrSlug)) {
        const { data: thread } = await supabase.from('forum_threads').select('id, user_id, poll_id').eq('slug', idOrSlug).single();
        if (!thread) throw new Error("Thread not found");
        
        // Ownership Check (Allow staff/admin to moderate)
        if (thread.user_id !== requestor.id && !STAFF_ROLES.includes(requestor.role.toLowerCase())) {
            throw new Error("Forbidden: You do not own this thread");
        }
        
        threadId = thread.id;
    } else {
        threadId = typeof idOrSlug === 'number' ? idOrSlug : parseInt(idOrSlug);
        const { data: thread } = await supabase.from('forum_threads').select('user_id, poll_id').eq('id', threadId).single();
        if (!thread) throw new Error("Thread not found");
        
        // Ownership Check (Allow staff/admin to moderate)
        if (thread.user_id !== requestor.id && !STAFF_ROLES.includes(requestor.role.toLowerCase())) {
            throw new Error("Forbidden: You do not own this thread");
        }
    }

    // 1. Fetch thread first (already done above, merged logic)
    const { data: threadInfo } = await supabase.from('forum_threads').select('poll_id').eq('id', threadId).single();

    // 2. Delete Poll if exists
    if (threadInfo && threadInfo.poll_id) {
        await pollService.deletePoll(threadInfo.poll_id).catch(err => console.error("Error cleaning up poll:", err));
    }

    // 3. Delete posts
    await supabase.from('forum_posts').delete().eq('thread_id', threadId);
    
    // 4. Delete thread
    const { error } = await supabase.from('forum_threads').delete().eq('id', threadId);
    if(error) throw error;
};

export const updatePost = async (id: number, updates: { content: string }, requestor: Requestor) => {
    const { data: post } = await supabase.from('forum_posts').select('user_id').eq('id', id).single();
    if (!post) throw new Error("Post not found");

    if (post.user_id !== requestor.id && !STAFF_ROLES.includes(requestor.role.toLowerCase())) {
        throw new Error("Forbidden: You do not own this post");
    }

    const { data, error } = await supabase.from('forum_posts').update({ content: updates.content }).eq('id', id).select().single();
    if(error) throw error;
    return data;
};

export const deletePost = async (id: number, requestor: Requestor) => {
    const { data: post } = await supabase.from('forum_posts').select('user_id').eq('id', id).single();
    if (!post) throw new Error("Post not found");

    if (post.user_id !== requestor.id && !STAFF_ROLES.includes(requestor.role.toLowerCase())) {
        throw new Error("Forbidden: You do not own this post");
    }

    const { error } = await supabase.from('forum_posts').delete().eq('id', id);
    if(error) throw error;
};

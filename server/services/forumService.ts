import supabase from './supabaseService.js';
import * as pollService from './pollService.js';

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
    return data.map((t: any) => ({
        ...t,
        reply_count: t.forum_posts ? t.forum_posts[0].count : 0,
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

    return data.map((t: any) => ({
        ...t,
        reply_count: t.forum_posts ? t.forum_posts[0].count : 0,
        forum_posts: undefined
    }));
};

export const getThread = async (id: number) => {
    const { data: thread, error } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('id', id)
        .single();
    
    if(error) throw error;
    
    let poll = null;
    if (thread.poll_id) {
         poll = await pollService.getPollById(thread.poll_id);
    }
    
    return { ...thread, poll };
};

export const createThread = async ({ category_id, title, content, user_data, poll_data }: any) => {
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

    return thread;
};

export const getPosts = async (threadId: number) => {
    const { data, error } = await supabase.from('forum_posts').select('*').eq('thread_id', threadId).order('created_at', {ascending:true});
    if(error) throw error;
    return data;
};

export const createPost = async ({ thread_id, content, user_data }: any) => {
    const { data, error } = await supabase.from('forum_posts').insert([{
        thread_id, 
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
            const threadIds = threads.map((t: any) => t.id);

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

export const updateThread = async (id: number, { title, content }: any) => {
    const { data, error } = await supabase.from('forum_threads').update({ title, content }).eq('id', id).select().single();
    if(error) throw error;
    return data;
};

export const deleteThread = async (id: number) => {
    // 1. Fetch thread first to check for poll
    const { data: thread } = await supabase.from('forum_threads').select('poll_id').eq('id', id).single();

    // 2. Delete Poll if exists
    if (thread && thread.poll_id) {
        await pollService.deletePoll(thread.poll_id).catch(err => console.error("Error cleaning up poll:", err));
    }

    // 3. Delete posts
    await supabase.from('forum_posts').delete().eq('thread_id', id);
    
    // 4. Delete thread
    const { error } = await supabase.from('forum_threads').delete().eq('id', id);
    if(error) throw error;
};

export const updatePost = async (id: number, { content }: any) => {
    const { data, error } = await supabase.from('forum_posts').update({ content }).eq('id', id).select().single();
    if(error) throw error;
    return data;
};

export const deletePost = async (id: number) => {
    const { error } = await supabase.from('forum_posts').delete().eq('id', id);
    if(error) throw error;
};

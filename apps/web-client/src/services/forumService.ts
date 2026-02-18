const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface CategoryStat {
    id: number;
    topics: number;
    posts: number;
    lastPost: { user: string; date: string };
}

export interface NewsResponse {
    id: string | number;
    title: string;
    content: string;
    title_en?: string;
    content_en?: string;
    image?: string;
    replies?: number;
    views?: number;
    created_at: string;
    category: string | null;
    status: string;
    slug?: string;
    author_id?: string;
    author_data_fresh?: any;
}

export interface ThreadResponse {
    id: string | number;
    title: string;
    content?: string;
    author_name?: string;
    user_id?: string;
    reply_count?: number;
    views?: number;
    created_at: string;
    pinned?: boolean;
    locked?: boolean;
    slug?: string;
    category_id?: number;
    author_avatar?: string;
    author_role?: string;
    author_data_fresh?: any;
    title_en?: string;
    content_en?: string;
}

export interface CommentResponse {
    id: string | number;
    author_name?: string;
    user_name?: string;
    user_id?: string;
    author_avatar?: string;
    user_avatar?: string;
    author_role?: string;
    user_role?: string;
    created_at: string;
    content: string;
    author_data_fresh?: any;
}

export const getForumStats = async (): Promise<CategoryStat[]> => {
    const res = await fetch(`${API_URL}/forum/stats`);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return await res.json();
};

export const getCategoryThreads = async (categoryId: string | number): Promise<ThreadResponse[]> => {
    const res = await fetch(`${API_URL}/forum/category/${categoryId}`);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return await res.json();
};

export const getThread = async (threadId: string | number): Promise<ThreadResponse> => {
    const res = await fetch(`${API_URL}/forum/thread/${threadId}`);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return await res.json();
};

export const getThreadPosts = async (threadId: string | number): Promise<CommentResponse[]> => {
    const res = await fetch(`${API_URL}/forum/thread/${threadId}/posts`);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return await res.json();
};

export const getNewsThread = async (newsId: string | number): Promise<NewsResponse> => {
    const res = await fetch(`${API_URL}/news/${newsId}`);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return await res.json();
};

export const getNewsComments = async (newsId: string | number): Promise<CommentResponse[]> => {
    const res = await fetch(`${API_URL}/news/${newsId}/comments`);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return await res.json();
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface NewsItem {
    id: string | number;
    title: string;
    title_en?: string;
    image: string;
    content: string;
    content_en?: string;
    category: string;
    created_at: string;
    status: string;
    replies?: number;
    views?: number;
    slug?: string;
}

export const getLatestNews = async (): Promise<NewsItem[]> => {
    const res = await fetch(`${API_URL}/news`);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return await res.json();
};

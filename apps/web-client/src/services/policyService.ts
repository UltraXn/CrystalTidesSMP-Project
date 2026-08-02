const API_URL = import.meta.env.VITE_API_URL;

export interface Policy {
    id: number;
    slug: string;
    title: string;
    content: string;
    title_en?: string;
    content_en?: string;
    updated_at: string;
}

export const getPolicy = async (slug: string): Promise<Policy> => {
    const res = await fetch(`${API_URL}/policies/${slug}`);
    if (!res.ok) throw new Error('Error fetching policy');
    const data = await res.json();
    return data.success ? data.data : data;
};

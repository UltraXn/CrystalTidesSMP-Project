import supabase from './supabaseService.js';

export interface WikiArticle {
    id: number;
    slug: string;
    title: string;
    content: string;
    category: string;
    author_id: string;
    created_at: string;
    updated_at: string;
}

const STANDARD_KEYS = new Set([
    'id', 'slug', 'title', 'content', 'category', 'description', 'author_id', 'created_at', 'updated_at', 'metadata'
]);

function prepareArticlePayload(input: Record<string, unknown>) {
    const payload: Record<string, unknown> = {};
    const inputMetadata = (input.metadata && typeof input.metadata === 'object') ? (input.metadata as Record<string, unknown>) : null;
    const metadata: Record<string, unknown> = inputMetadata ? { ...inputMetadata } : {};

    for (const [key, value] of Object.entries(input)) {
        if (value === undefined) continue;
        if (STANDARD_KEYS.has(key)) {
            if (key !== 'metadata') {
                payload[key] = value;
            }
        } else {
            metadata[key] = value;
        }
    }

    payload.metadata = metadata;
    return payload;
}

function formatArticleResponse(record: Record<string, unknown> | null) {
    if (!record) return null;
    const { metadata, ...rest } = record;
    return {
        ...rest,
        ...(metadata && typeof metadata === 'object' ? (metadata as Record<string, unknown>) : {})
    };
}

export const getAllArticles = async (category?: string) => {
    let query = supabase.from('wiki_articles').select('*').order('created_at', { ascending: false });
    if (category) {
        query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(formatArticleResponse);
};

export const getArticleBySlug = async (slug: string) => {
    const { data, error } = await supabase
        .from('wiki_articles')
        .select('*')
        .eq('slug', slug)
        .single();
    if (error) throw error;
    return formatArticleResponse(data);
};

export const createArticle = async (articleData: Record<string, unknown>) => {
    const payload = prepareArticlePayload(articleData);
    const { data, error } = await supabase
        .from('wiki_articles')
        .insert([payload])
        .select()
        .single();
    if (error) throw error;
    return formatArticleResponse(data);
};

export const updateArticle = async (id: number, articleData: Record<string, unknown>) => {
    // If updating, fetch current metadata to merge
    const existing = await supabase.from('wiki_articles').select('metadata').eq('id', id).single();
    const currentMetadata: Record<string, unknown> = (existing.data?.metadata as Record<string, unknown>) || {};
    const inputMetadata = (articleData.metadata && typeof articleData.metadata === 'object') ? (articleData.metadata as Record<string, unknown>) : {};
    
    const payload = prepareArticlePayload({
        ...articleData,
        metadata: { ...currentMetadata, ...inputMetadata }
    });

    const { data, error } = await supabase
        .from('wiki_articles')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return formatArticleResponse(data);
};

export const deleteArticle = async (id: number) => {
    const { error } = await supabase
        .from('wiki_articles')
        .delete()
        .eq('id', id);
    if (error) throw error;
    return true;
};


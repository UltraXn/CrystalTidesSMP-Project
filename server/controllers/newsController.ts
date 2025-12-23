import supabase from '../services/supabaseService.js';
import * as logService from '../services/logService.js';

// Canal de anuncios de Discord (Debería estar en .env idealmente, aquí hardcodeado o pasado por config)
const DISCORD_ANNOUNCEMENTS_CHANNEL_ID = process.env.DISCORD_ANNOUNCEMENTS_CHANNEL_ID;

export const getAllNews = async (req: any, res: any) => {
    // ... existing body ...
    try {
        const { data, error } = await supabase
            .from('news')
            .select('*, comments(count)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const newsWithCounts = data.map((n: any) => ({
            ...n,
            replies: n.comments ? n.comments[0].count : 0,
            comments: undefined
        }));

        res.status(200).json(newsWithCounts);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getNewsById = async (req: any, res: any) => {
    // ... existing body ...
    try {
        const { id } = req.params;

        // 1. Obtener noticia actual
        const { data: newsItem, error: fetchError } = await supabase
            .from('news')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;
        if (!newsItem) return res.status(404).json({ error: "Noticia no encontrada" });

        // 2. Incrementar visitas (si existe la columna views)
        // Nota: Asegúrate de correr "ALTER TABLE public.news ADD COLUMN views INTEGER DEFAULT 0;"
        const newViews = (newsItem.views || 0) + 1;

        await supabase
            .from('news')
            .update({ views: newViews })
            .eq('id', id);

        // Retornamos el item con las vistas actualizadas (optimista)
        res.status(200).json({ ...newsItem, views: newViews });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getCommentsByNewsId = async (req: any, res: any) => {
    // ... existing body ...
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('news_id', id)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createComment = async (req: any, res: any) => {
    try {
        const { id } = req.params; // news_id
        const { user_name, user_avatar, content, user_role } = req.body;

        const { data, error } = await supabase
            .from('comments')
            .insert([{
                news_id: id,
                user_name,
                user_avatar,
                content,
                user_role: user_role || 'user'
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createNews = async (req: any, res: any) => {
    try {
        const { title, category, content, image, status, author_id, username } = req.body;

        const { data, error } = await supabase
            .from('news')
            .insert([{ title, category, content, image, status, author_id }])
            .select();

        if (error) throw error;

        // Log action
        logService.createLog({
            user_id: author_id,
            username: username || 'Admin', 
            action: 'CREATE_NEWS',
            details: `Created news: ${title}`,
            source: 'web'
        }).catch(console.error);

        res.status(201).json(data[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateNews = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { title, category, content, image, status, username, user_id } = req.body;

        const { data, error } = await supabase
            .from('news')
            .update({ title, category, content, image, status })
            .eq('id', id)
            .select();

        if (error) throw error;

        // Log action
        logService.createLog({
            user_id: user_id || null,
            username: username || 'Admin',
            action: 'UPDATE_NEWS',
            details: `Updated news #${id}: ${title} (${status})`,
            source: 'web'
        }).catch(console.error);

        res.status(200).json(data[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteNews = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { userId, username } = req.query;

        const { error } = await supabase
            .from('news')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Log action
        logService.createLog({
            user_id: userId || null,
            username: username || 'Admin',
            action: 'DELETE_NEWS',
            details: `Deleted news #${id}`,
            source: 'web'
        }).catch(console.error);

        res.status(200).json({ message: 'Noticia eliminada correctamente' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

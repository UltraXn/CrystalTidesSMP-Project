const supabase = require('../services/supabaseService');
const { sendDiscordNotification } = require('../services/discordService');

// Canal de anuncios de Discord (Debería estar en .env idealmente, aquí hardcodeado o pasado por config)
const DISCORD_ANNOUNCEMENTS_CHANNEL_ID = process.env.DISCORD_ANNOUNCEMENTS_CHANNEL_ID;

const getAllNews = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getNewsById = async (req, res) => {
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
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCommentsByNewsId = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('news_id', id)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createComment = async (req, res) => {
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
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createNews = async (req, res) => {
    try {
        const { title, category, content, image, status, author_id } = req.body;

        const { data, error } = await supabase
            .from('news')
            .insert([{ title, category, content, image, status, author_id }])
            .select();

        if (error) throw error;

        // Si se publica directamente, notificar a Discord
        if (status === 'Published' && DISCORD_ANNOUNCEMENTS_CHANNEL_ID) {
            await sendDiscordNotification(
                DISCORD_ANNOUNCEMENTS_CHANNEL_ID,
                `📢 Nueva Noticia: ${title}`,
                `${content.substring(0, 150)}...\n\nLeer más en la web.`,
                '#0F969C'
            );
        }

        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, content, image, status } = req.body;

        const { data, error } = await supabase
            .from('news')
            .update({ title, category, content, image, status })
            .eq('id', id)
            .select();

        if (error) throw error;

        res.status(200).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('news')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.status(200).json({ message: 'Noticia eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllNews,
    getNewsById,
    getCommentsByNewsId,
    createComment,
    createNews,
    updateNews,
    deleteNews
};

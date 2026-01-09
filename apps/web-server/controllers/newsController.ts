import supabase from '../services/supabaseService.js';
import * as logService from '../services/logService.js';
import { translateText } from '../services/translationService.js';

import { Request, Response } from 'express';
import { WebhookClient, EmbedBuilder } from 'discord.js';

// Canal de anuncios de Discord
const NEWS_WEBHOOK_URL = process.env.DISCORD_NEWS_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;

interface NewsWebhookProps {
    title: string;
    category: string;
    content: string;
    image?: string;
    slug: string;
}

const sendNewsWebhook = async (news: NewsWebhookProps) => {
    if (!NEWS_WEBHOOK_URL) {
        console.warn('DISCORD_NEWS_WEBHOOK_URL (or fallback) not configured, skipping announcement.');
        return;
    }

    try {
        const webhookClient = new WebhookClient({ url: NEWS_WEBHOOK_URL });
        
        // Truncate content for description if too long
        // Max description length is 4096, but we keep it shorter for readability
        let description = news.content.length > 200 
            ? news.content.substring(0, 197) + '...' 
            : news.content;

        // Add Role Tag inside the embed as requested
        const roleToTag = '1272263167090626712'; // Role requested by user
        description += `\n\n<@&${roleToTag}>`;

        const embed = new EmbedBuilder()
            .setTitle(`📢 ${news.title}`)
            .setURL(`https://crystaltidessmp.net/news/${news.slug}`) 
            .setColor(0x00aabb) // Aqua/Cyan color for CrystalTides
            .setDescription(description)
            .addFields({ name: 'Categoría', value: news.category, inline: true })
            .setTimestamp()
            .setFooter({ text: 'CrystalTides News' });

        // Ensure image URL is absolute
        if (news.image) {
            let imageUrl = news.image;
            if (!imageUrl.startsWith('http')) {
                // Assuming images are hosted on the main domain
                imageUrl = `https://crystaltidessmp.net${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
            }
            embed.setImage(imageUrl);
        }

        await webhookClient.send({
            // Content left empty or with a non-ping text if they strictly want it inside embed. 
            // However, usually users want the ping. Mentions in embeds DO NOT ping.
            // But the user asked "por favor dentro del embed". 
            // To ensure functionality (ping) + request (inside embed), we often do both or just content.
            // Given the strict phrasing "dentro del embed", I will put it there. 
            // Any "content" ping is removed to follow the "visual" instruction, 
            // BUT this means it won't trigger a push notification for the role.
            // I'll add a subtle ping in content just in case, but rely on the embed for the "tag".
            // actually, let's keep the content clean if requested "inside".
            content: `Nuevo anuncio publicado!`, 
            embeds: [embed],
        });
    } catch (error) {
        console.error('Error sending news webhook:', error);
    }
};

// Helper function for slug generation
const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Normalize special chars (e.g. á -> a)
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/-+/g, '-'); // Replace multiple - with single -
};

export const getAllNews = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('news')
            .select('*, comments(count)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Type the mapped item explicitly to avoid 'any'
        interface NewsItem {
            comments?: { count: number }[];
            [key: string]: unknown;
        }

        const newsWithCounts = data.map((n: NewsItem) => ({
            ...n,
            replies: n.comments && n.comments[0] ? n.comments[0].count : 0,
            comments: undefined
        }));

        res.status(200).json(newsWithCounts);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const getNewsById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const isNumeric = /^\d+$/.test(id);

        let query = supabase.from('news').select('*');
        
        if (isNumeric) {
            query = query.eq('id', id);
        } else {
            query = query.eq('slug', id);
        }

        const { data: newsItem, error: fetchError } = await query.single();

        if (fetchError) throw fetchError;
        if (!newsItem) return res.status(404).json({ error: "Noticia no encontrada" });

        // 2. Incrementar visitas (si existe la columna views)
        const newViews = (newsItem.views || 0) + 1;

        await supabase
            .from('news')
            .update({ views: newViews })
            .eq('id', newsItem.id); // Always update by ID once found

        // Retornamos el item con las vistas actualizadas (optimista)
        res.status(200).json({ ...newsItem, views: newViews });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const getCommentsByNewsId = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        let newsId = id;

        // Si el ID no es numérico, asumimos que es un slug y buscamos el ID real
        if (!/^\d+$/.test(id)) {
            const { data: news, error: newsError } = await supabase
                .from('news')
                .select('id')
                .eq('slug', id)
                .single();
            
            if (newsError || !news) {
                return res.status(404).json({ error: "Noticia no encontrada" });
            }
            newsId = news.id;
        }

        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('news_id', newsId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const createComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // news_id o slug
        // Don't trust body for user info
        const { content } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }

        let newsId = id;

        // Resolver slug a ID si es necesario
        if (!/^\d+$/.test(id)) {
            const { data: news, error: newsError } = await supabase
                .from('news')
                .select('id')
                .eq('slug', id)
                .single();
            
            if (newsError || !news) {
                console.error(`Error resolving slug '${id}' to ID:`, newsError);
                return res.status(404).json({ error: "Noticia no encontrada" });
            }
            newsId = news.id;
        }

        // Fetch latest user metadata to get correct avatar and role
        // Ideally this should come from a 'profiles' table join, but for now we query auth/profiles
        const { data: profile } = await supabase
            .from('profiles')
            .select('username, role, avatar_url')
            .eq('id', user.id)
            .single();

        // Fallback to auth metadata if profile fails or is incomplete
        const { data: { user: authUser } } = await supabase.auth.admin.getUserById(user.id);
        
        // Hybrid Priority Resolution based on User Feedback
        // 1. Username: Profile (UltraXn) > Metadata (Discord Name)
        const finalUsername = profile?.username || authUser?.user_metadata?.username || user.username;
        
        // 2. Role: Metadata (Source of Truth for Permissions) > Profile
        const finalRole = authUser?.user_metadata?.role || profile?.role || 'user';
        
        // 3. Avatar: Metadata (Social PFP) > Profile (Minecraft Skin)
        const finalAvatar = authUser?.user_metadata?.avatar_url || profile?.avatar_url || null;

        const { data, error } = await supabase
            .from('comments')
            .insert([{
                news_id: newsId,
                // user_id removed as column does not exist
                user_name: finalUsername,
                user_avatar: finalAvatar,
                content,
                user_role: finalRole
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const updateComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // comment id
        const { content } = req.body;
        const user = req.user;

        if (!user) return res.status(401).json({ error: "Usuario no autenticado" });

        // 1. Verify existence and ownership
        const { data: comment, error: fetchError } = await supabase
            .from('comments')
            .select('user_name')
            .eq('id', id)
            .single();

        if (fetchError || !comment) return res.status(404).json({ error: "Comentario no encontrado" });

        // Fallback ownership check using username (since user_id is missing in this table)
        if (comment.user_name !== user.username) {
             return res.status(403).json({ error: "No tienes permiso para editar este comentario" });
        }

        // 2. Update
        const { error } = await supabase
            .from('comments')
            .update({ content })
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: "Comentario actualizado" });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // comment id
        const user = req.user;
        console.log(`[deleteComment] Attempting to delete comment ID: ${id} by User: ${user?.username} (${user?.id})`);

        if (!user) return res.status(401).json({ error: "Usuario no autenticado" });

        // 1. Verify existence
        const { data: comment, error: fetchError } = await supabase
            .from('comments')
            .select('user_name')
            .eq('id', id)
            .single();

        if (fetchError) console.error(`[deleteComment] DB Error fetching comment:`, fetchError);
        if (!comment) console.error(`[deleteComment] Comment not found in DB`);

        if (fetchError || !comment) return res.status(404).json({ error: "Comentario no encontrado" });

        // 2. Check Permissions (Owner OR Admin)
        const isAdmin = ['admin', 'neroferno', 'killu', 'killuwu', 'developer', 'helper'].includes(user.role);
        
        // Ownership check via username
        if (comment.user_name !== user.username && !isAdmin) {
            return res.status(403).json({ error: "No tienes permiso para eliminar este comentario" });
        }

        // 3. Delete
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: "Comentario eliminado" });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const createNews = async (req: Request, res: Response) => {
    try {
        const { title, category, content, image, status, author_id, username, title_en, content_en } = req.body;

        // Auto Translation if not provided
        const finalTitleEn = title_en || await translateText(title, 'en');
        const finalContentEn = content_en || await translateText(content, 'en');
        
        // Generate Slug
        const slug = slugify(title);

        const { data, error } = await supabase
            .from('news')
            .insert([{ 
                title, 
                category, 
                content, 
                image, 
                status, 
                author_id,
                title_en: finalTitleEn, 
                content_en: finalContentEn,
                slug: slug
            }])
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

        // Notify Discord
        if (status === 'Published') {
            sendNewsWebhook({
                title,
                category,
                content, // Pass content for description
                image,
                slug // Pass slug for URL
            }).catch(console.error);
        }

        res.status(201).json(data[0]);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const updateNews = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        console.log(`[UPDATE NEWS] ID: ${id}, Body:`, JSON.stringify(req.body));
        const { title, category, content, image, status, username, user_id, title_en, content_en } = req.body;

        // If title changed, update slug
        let slug = undefined;
        if (title) {
            slug = slugify(title);
        }

        interface NewsUpdates {
            title?: string;
            category?: string;
            content?: string;
            image?: string;
            status?: string;
            title_en?: string;
            content_en?: string;
            slug?: string;
        }

        const updates: NewsUpdates = { title, category, content, image, status, title_en, content_en };
        if (slug) updates.slug = slug;

        const { data, error } = await supabase
            .from('news')
            .update(updates)
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
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export const deleteNews = async (req: Request, res: Response) => {
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
            user_id: userId as string || undefined,
            username: username as string || 'Admin',
            action: 'DELETE_NEWS',
            details: `Deleted news #${id}`,
            source: 'web'
        }).catch(console.error);

        res.status(200).json({ message: 'Noticia eliminada correctamente' });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

import supabase from '../services/supabaseService.js';
import * as logService from '../services/logService.js';
import * as minecraftService from '../services/minecraftService.js';
import { translateText } from '../services/translationService.js';

import { Request, Response } from 'express';
import { WebhookClient, EmbedBuilder } from 'discord.js';
import { ensureString } from '../utils/typeUtils.js';

const NEWS_WEBHOOK_URL = process.env.DISCORD_NEWS_WEBHOOK_URL ?? process.env.DISCORD_WEBHOOK_URL;

const ERRORS = {
  UNAUTH: 'Usuario no autenticado',
  NEWS_NOT_FOUND: 'Noticia no encontrada',
  COMMENT_NOT_FOUND: 'Comentario no encontrado',
} as const;

const CONSTANTS = {
  ADMIN: 'Admin',
  WEB: 'web',
} as const;

interface NewsWebhookProps {
  title: string;
  category: string;
  content: string;
  image?: string;
  slug: string;
}

// Helper: Handle errors uniformly without leaking internal DB errors
const handleControllerError = (res: Response, error: unknown) => {
  console.error('[NewsController] Internal error:', error);
  res.status(500).json({ error: 'Internal server error' });
};

// Helper: Resolve ID or Slug to news ID
const resolveNewsId = async (idOrSlug: string): Promise<string | null> => {
  if (/^\d+$/.test(idOrSlug)) return idOrSlug;
  const { data, error } = await supabase.from('news').select('id').eq('slug', idOrSlug).single();
  if (error || !data) return null;
  return String(data.id);
};

const TAG_COLORS: Record<string, string> = {
  EVENT: '#F59E0B',
  CHANGELOG: '#10B981',
};
const DEFAULT_TAG_COLOR = '#2DD4BF';

const resolveTag = (tagLabel: unknown, category: string): string => {
  if (tagLabel) return String(tagLabel);
  if (category === 'CHANGELOG') return 'CHANGELOG';
  return category || 'NOTICIA';
};

const resolveTagColor = (tagColor: unknown, category: string): string => {
  if (tagColor) return String(tagColor);
  return TAG_COLORS[category] || DEFAULT_TAG_COLOR;
};

const resolveSummary = (summary: unknown, content: unknown): string => {
  if (summary) return String(summary);
  if (typeof content === 'string') return content.substring(0, 140) + '...';
  return '';
};

const resolveImageUrl = (bannerUrl: unknown, imageUrl: unknown): string | null => {
  if (bannerUrl) return String(bannerUrl);
  if (imageUrl) return String(imageUrl);
  return null;
};

// Helper: Format News Feed Item
const formatNewsFeedItem = (n: Record<string, unknown>) => {
  const category = String(n.category || 'ANNOUNCEMENT');

  return {
    id: String(n.id),
    title: String(n.title || ''),
    slug: String(n.slug || n.id),
    category,
    tag: resolveTag(n.tag_label, category),
    tagColor: resolveTagColor(n.tag_color, category),
    summary: resolveSummary(n.summary, n.content),
    imageUrl: resolveImageUrl(n.banner_image_url, n.image_url),
    actionLabel: String(n.action_label || 'LEER MÁS'),
    actionUrl: String(n.action_url || `https://crystaltidessmp.net/news/${n.slug || n.id}`),
    publishedAt: String(n.created_at || new Date().toISOString()),
  };
};

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

const sendNewsWebhook = async (news: NewsWebhookProps) => {
  if (!NEWS_WEBHOOK_URL) {
    console.warn('DISCORD_NEWS_WEBHOOK_URL (or fallback) not configured, skipping announcement.');
    return;
  }

  try {
    const webhookClient = new WebhookClient({ url: NEWS_WEBHOOK_URL });

    let description =
      news.content.length > 200 ? news.content.substring(0, 197) + '...' : news.content;

    const roleToTag = '1272263167090626712';
    description += `\n\n<@&${roleToTag}>`;

    const embed = new EmbedBuilder()
      .setTitle(`📢 ${news.title}`)
      .setURL(`https://crystaltidessmp.net/news/${news.slug}`)
      .setColor(0x00aabb)
      .setDescription(description)
      .addFields({ name: 'Categoría', value: news.category, inline: true })
      .setTimestamp()
      .setFooter({ text: 'CrystalTides News' });

    if (news.image) {
      let imageUrl = news.image;
      if (!imageUrl.startsWith('http')) {
        imageUrl = `https://crystaltidessmp.net${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
      embed.setImage(imageUrl);
    }

    await webhookClient.send({
      content: `Nuevo anuncio publicado!`,
      embeds: [embed],
    });
  } catch (error) {
    console.error('Error sending news webhook:', error);
  }
};

export const getAllNews = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*, comments(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    interface NewsItem {
      comments?: { count: number }[];
      [key: string]: unknown;
    }

    const newsWithCounts = data.map((n: NewsItem) => ({
      ...n,
      replies: n.comments?.[0]?.count ?? 0,
      comments: undefined,
    }));

    res.status(200).json(newsWithCounts);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const getNewsById = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);
    const isNumeric = /^\d+$/.test(id);

    let query = supabase.from('news').select('*');
    if (isNumeric) query = query.eq('id', id);
    else query = query.eq('slug', id);

    const { data: newsItem, error: fetchError } = await query.single();

    if (fetchError) throw fetchError;
    if (!newsItem) return res.status(404).json({ error: ERRORS.NEWS_NOT_FOUND });

    const newViews = (newsItem.views || 0) + 1;

    await supabase.from('news').update({ views: newViews }).eq('id', newsItem.id);

    const { data: profile } = await supabase
      .from('profiles')
      .select(
        'username, full_name, avatar_url, role, status_message, avatar_preference, community_pref, minecraft_uuid, minecraft_nick, social_discord, social_avatar_url',
      )
      .eq('id', newsItem.author_id)
      .maybeSingle();

    res.status(200).json({ ...newsItem, views: newViews, author_data_fresh: profile });
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const getCommentsByNewsId = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);
    const newsId = await resolveNewsId(id);
    if (!newsId) return res.status(404).json({ error: ERRORS.NEWS_NOT_FOUND });

    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles!comments_user_id_fkey(*)')
      .eq('news_id', newsId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    interface JoinedComment {
      profiles?: unknown;
      [key: string]: unknown;
    }

    const mappedComments = (data as JoinedComment[]).map((c) => ({
      ...c,
      author_data_fresh: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles || null,
      profiles: undefined,
    }));

    res.status(200).json(mappedComments);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);
    const { content } = req.body;
    const user = req.user;

    if (!user) return res.status(401).json({ error: ERRORS.UNAUTH });

    const newsId = await resolveNewsId(id);
    if (!newsId) return res.status(404).json({ error: ERRORS.NEWS_NOT_FOUND });

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, role, avatar_url')
      .eq('id', user.id)
      .single();

    const {
      data: { user: authUser },
    } = await supabase.auth.admin.getUserById(user.id);

    const finalUsername = profile?.username || authUser?.user_metadata?.username || user.username;
    // Role badge only from profiles: user_metadata.role is editable by the commenter.
    const finalRole = profile?.role || user.role || 'user';
    const finalAvatar = authUser?.user_metadata?.avatar_url || profile?.avatar_url || null;

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          news_id: newsId,
          user_id: user.id,
          user_name: finalUsername,
          user_avatar: finalAvatar,
          content,
          user_role: finalRole,
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);
    const { content } = req.body;
    const user = req.user;

    if (!user) return res.status(401).json({ error: ERRORS.UNAUTH });

    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !comment) return res.status(404).json({ error: ERRORS.COMMENT_NOT_FOUND });
    if (comment.user_id !== user.id)
      return res.status(403).json({ error: 'No tienes permiso para editar este comentario' });

    const { error } = await supabase.from('comments').update({ content }).eq('id', id);

    if (error) throw error;
    res.status(200).json({ message: 'Comentario actualizado' });
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);
    const user = req.user;

    if (!user) return res.status(401).json({ error: ERRORS.UNAUTH });

    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !comment) return res.status(404).json({ error: ERRORS.COMMENT_NOT_FOUND });

    const isStaff = [
      'admin',
      'neroferno',
      'killu',
      'killuwu',
      'developer',
      'moderator',
      'mod',
      'helper',
    ].includes(user.role.toLowerCase());

    if (comment.user_id !== user.id && !isStaff) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este comentario' });
    }

    const { error } = await supabase.from('comments').delete().eq('id', id);

    if (error) throw error;
    res.status(200).json({ message: 'Comentario eliminado' });
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const createNews = async (req: Request, res: Response) => {
  try {
    const { title, category, content, image, status, author_id, username, title_en, content_en } =
      req.body;

    const finalTitleEn = title_en || (await translateText(title, 'en'));
    const finalContentEn = content_en || (await translateText(content, 'en'));
    const slug = slugify(title);

    const { data, error } = await supabase
      .from('news')
      .insert([
        {
          title,
          category,
          content,
          image,
          status,
          author_id,
          title_en: finalTitleEn,
          content_en: finalContentEn,
          slug,
        },
      ])
      .select();

    if (error) throw error;

    logService
      .createLog({
        user_id: author_id,
        username: username || CONSTANTS.ADMIN,
        action: 'CREATE_NEWS',
        details: `Created news: ${title}`,
        source: CONSTANTS.WEB,
      })
      .catch(console.error);

    if (status === 'Published') {
      sendNewsWebhook({ title, category, content, image, slug }).catch(console.error);
    }

    res.status(201).json(data[0]);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const updateNews = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);
    const { title, category, content, image, status, username, user_id, title_en, content_en } =
      req.body;

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
    if (title) updates.slug = slugify(title);

    const { data, error } = await supabase.from('news').update(updates).eq('id', id).select();

    if (error) throw error;

    logService
      .createLog({
        user_id: user_id || null,
        username: username || CONSTANTS.ADMIN,
        action: 'UPDATE_NEWS',
        details: `Updated news #${id}: ${title} (${status})`,
        source: CONSTANTS.WEB,
      })
      .catch(console.error);

    res.status(200).json(data[0]);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const deleteNews = async (req: Request, res: Response) => {
  try {
    const id = ensureString(req.params.id);
    const user = req.user;

    if (!user) return res.status(401).json({ error: ERRORS.UNAUTH });

    const { error } = await supabase.from('news').delete().eq('id', id);

    if (error) throw error;

    logService
      .createLog({
        user_id: user.id,
        username: user.username ?? CONSTANTS.ADMIN,
        action: 'DELETE_NEWS',
        details: `Deleted news #${id}`,
        source: CONSTANTS.WEB,
      })
      .catch(console.error);

    res.status(200).json({ message: 'Noticia eliminada correctamente' });
  } catch (error) {
    handleControllerError(res, error);
  }
};

interface LauncherServerStatus {
  online: boolean;
  motd: string;
  networkRegion: string;
  latencyMs: number | null;
  players: { online: number; max: number };
  version: string | null;
}

interface LauncherChangelog {
  version: string;
  buildDate: string;
  bullets: string[];
  actionUrl: string;
}

interface RawChangelogRow {
  tag_label?: string | null;
  title?: string | null;
  created_at?: string | null;
  content_markdown?: string | null;
  summary?: string | null;
  action_url?: string | null;
}

interface RawNewspaperEdition {
  id: number | string;
  issue_number: number | string;
  issue_date?: string;
  headline: string;
  front_page_summary: string;
  created_at: string;
}

interface NewsFeedCard {
  id: string;
  title: string;
  slug: string;
  category: string;
  tag: string;
  tagColor: string;
  summary: string;
  imageUrl: string | null;
  actionLabel: string;
  actionUrl: string;
  publishedAt: string;
}

const parseChangelogBullets = (text: string | null | undefined): string[] => {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter((line) => line.length > 0);
};

const formatBuildDate = (isoDate: string | null | undefined): string => {
  if (!isoDate) return '';
  const dateObj = new Date(isoDate);
  if (Number.isNaN(dateObj.getTime())) return '';
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  return `${year}.${month}`;
};

const fetchLauncherServerStatus = async (): Promise<LauncherServerStatus> => {
  const mcHost = process.env.MC_SERVER_HOST ?? 'mc.crystaltidessmp.net';
  const mcPort = Number.parseInt(process.env.MC_SERVER_PORT ?? '25565', 10);
  const liveStatus = await minecraftService.getServerStatus(mcHost, mcPort);

  const motd =
    liveStatus.online && typeof liveStatus.motd === 'string' && liveStatus.motd.trim()
      ? liveStatus.motd.trim()
      : (process.env.MC_SERVER_MOTD ?? 'CrystalTides SMP');

  const latencyMs =
    liveStatus.online && typeof liveStatus.ping === 'number' ? liveStatus.ping : null;

  const players =
    liveStatus.online && liveStatus.players
      ? { online: liveStatus.players.online, max: liveStatus.players.max }
      : { online: 0, max: 0 };

  const version = liveStatus.online && liveStatus.version ? liveStatus.version : null;

  return {
    online: Boolean(liveStatus.online),
    motd,
    networkRegion: process.env.MC_NETWORK_REGION ?? 'US-East',
    latencyMs,
    players,
    version,
  };
};

const fetchLatestLauncherChangelog = async (): Promise<LauncherChangelog | null> => {
  const { data: changelogFeedRow } = await supabase
    .from('news_feed_items')
    .select('tag_label, title, created_at, content_markdown, summary, action_url')
    .eq('is_published', true)
    .in('category', ['CHANGELOG', 'UPDATE'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let changelogRow = changelogFeedRow as RawChangelogRow | null;

  if (!changelogRow) {
    const { data: newsChangelogRow } = await supabase
      .from('news')
      .select('title, created_at, content, summary')
      .eq('status', 'Published')
      .in('category', ['CHANGELOG', 'UPDATE'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (newsChangelogRow) {
      changelogRow = {
        tag_label: null,
        title: newsChangelogRow.title,
        created_at: newsChangelogRow.created_at,
        content_markdown: newsChangelogRow.content,
        summary: newsChangelogRow.summary,
        action_url: null,
      };
    }
  }

  if (!changelogRow) {
    return null;
  }

  const rawBullets = parseChangelogBullets(changelogRow.content_markdown || changelogRow.summary);

  return {
    version: changelogRow.tag_label || changelogRow.title || '',
    buildDate: formatBuildDate(changelogRow.created_at),
    bullets: rawBullets.length > 0 ? rawBullets : [changelogRow.title || 'Actualización'],
    actionUrl: changelogRow.action_url || 'https://crystaltidessmp.net/changelog',
  };
};

const fetchNewsFeedRows = async (): Promise<Record<string, unknown>[]> => {
  const { data: feedData } = await supabase
    .from('news_feed_items')
    .select(
      'id, title, slug, summary, content_markdown, category, tag_label, tag_color, banner_image_url, action_label, action_url, is_featured, priority, created_at',
    )
    .eq('is_published', true)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10);

  if (feedData && feedData.length > 0) {
    return feedData as Record<string, unknown>[];
  }

  const { data: fallbackData } = await supabase
    .from('news')
    .select('id, title, slug, summary, content, category, image_url, created_at, is_featured')
    .eq('status', 'Published')
    .order('created_at', { ascending: false })
    .limit(10);

  return (fallbackData || []) as Record<string, unknown>[];
};

const fetchLatestNewspaper = async (): Promise<RawNewspaperEdition | null> => {
  const { data } = await supabase
    .from('ai_newspaper_editions')
    .select('id, issue_number, issue_date, headline, front_page_summary, created_at')
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as RawNewspaperEdition | null) ?? null;
};

const resolveFeaturedLauncherItem = (
  items: NewsFeedCard[],
  rawItems: Record<string, unknown>[],
  latestNewspaper: RawNewspaperEdition | null,
): NewsFeedCard | null => {
  const explicitFeatured = items.find((i) =>
    rawItems.some((raw) => String(raw.id) === i.id && Boolean(raw.is_featured)),
  );

  if (explicitFeatured) {
    return explicitFeatured;
  }

  if (items[0]) {
    return items[0];
  }

  if (latestNewspaper) {
    return {
      id: `newspaper-${latestNewspaper.id}`,
      title: latestNewspaper.headline,
      slug: `newspaper-${latestNewspaper.issue_number}`,
      category: 'NOTICIERO',
      tag: `EDICIÓN #${latestNewspaper.issue_number}`,
      tagColor: '#2DD4BF',
      summary: latestNewspaper.front_page_summary,
      imageUrl: null,
      actionLabel: 'LEER EDICIÓN',
      actionUrl: 'https://crystaltidessmp.net/newspaper/latest',
      publishedAt: String(latestNewspaper.created_at),
    };
  }

  return null;
};

export const getLauncherNewsFeed = async (req: Request, res: Response) => {
  try {
    const [serverStatus, latestChangelog, newsItems, latestNewspaper] = await Promise.all([
      fetchLauncherServerStatus(),
      fetchLatestLauncherChangelog(),
      fetchNewsFeedRows(),
      fetchLatestNewspaper(),
    ]);

    const items = newsItems.map(formatNewsFeedItem);
    const featured = resolveFeaturedLauncherItem(items, newsItems, latestNewspaper);

    const feedPayload = {
      featured,
      cards: items.slice(0, 6),
      latestChangelog,
      serverStatus,
    };

    res.status(200).json(feedPayload);
  } catch (error) {
    handleControllerError(res, error);
  }
};

interface NewsLikeResult {
  liked: boolean;
  likes_count: number;
}

export const likeNewsArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = ensureString(req.params.id);
    if (!rawId) {
      res.status(400).json({ error: 'ID de noticia inválido' });
      return;
    }

    const numericCandidate = Number(rawId);
    if (!Number.isNaN(numericCandidate)) {
      if (!Number.isSafeInteger(numericCandidate) || numericCandidate <= 0) {
        res.status(400).json({ error: 'ID de noticia inválido' });
        return;
      }
    }

    if (!req.user) {
      res.status(401).json({ error: ERRORS.UNAUTH });
      return;
    }

    const resolvedId = await resolveNewsId(rawId);
    if (!resolvedId) {
      res.status(404).json({ error: ERRORS.NEWS_NOT_FOUND });
      return;
    }

    const numericId = Number(resolvedId);
    if (!Number.isSafeInteger(numericId) || numericId <= 0) {
      res.status(400).json({ error: 'ID de noticia inválido' });
      return;
    }

    const { data, error } = await supabase.rpc('like_news_article', {
      p_news_id: numericId,
      p_user_id: req.user.id,
    });

    if (error) {
      handleControllerError(res, error);
      return;
    }

    const rows = (data ?? []) as NewsLikeResult[];
    if (rows.length === 0) {
      res.status(404).json({ error: ERRORS.NEWS_NOT_FOUND });
      return;
    }

    res.json({ success: true, liked: rows[0].liked, likes_count: rows[0].likes_count });
  } catch (err: unknown) {
    handleControllerError(res, err);
  }
};

export const getMyLikedNews = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: ERRORS.UNAUTH });
      return;
    }

    const { data, error } = await supabase
      .from('news_likes')
      .select('news_id')
      .eq('user_id', req.user.id);

    if (error) {
      handleControllerError(res, error);
      return;
    }

    const likedIds = (data ?? []).map((row: { news_id: number }) => row.news_id);
    res.json({ liked_ids: likedIds });
  } catch (err: unknown) {
    handleControllerError(res, err);
  }
};

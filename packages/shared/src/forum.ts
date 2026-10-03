// Forum domain utilities and thread normalization for CrystalTides SMP

export const FORUM_CATEGORY_NAMES: Record<number, string> = {
  1: 'Anuncios',
  2: 'Discusión General',
  3: 'Soporte',
  4: 'Off-Topic',
};

export interface ParsedThreadDetail {
  id: string | number;
  title: string;
  content: string;
  author: string;
  author_id: string;
  author_avatar: string;
  author_role: string;
  date: string;
  longDate: string;
  image: string | null;
  tag: string;
  category_id?: number;
  views: number;
  poll: unknown | null;
  pinned: boolean;
  locked: boolean;
  title_en?: string;
  content_en?: string;
  author_data_fresh?: unknown;
}

function formatSafeDate(rawDate?: unknown): { date: string; longDate: string } {
  if (!rawDate) {
    const fallback = new Date().toLocaleDateString();
    return { date: fallback, longDate: fallback };
  }
  const d = new Date(rawDate as string | number | Date);
  if (isNaN(d.getTime())) {
    const fallback = 'Fecha desconocida';
    return { date: fallback, longDate: fallback };
  }
  const dateStr = d.toLocaleDateString();
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return {
    date: dateStr,
    longDate: `${dateStr} ${timeStr}`,
  };
}

interface RawThreadInput {
  id: string | number;
  title?: string;
  content?: string;
  title_en?: string;
  content_en?: string;
  author_name?: string;
  user_id?: string;
  author_id?: string;
  author_avatar?: string;
  author_role?: string;
  created_at?: string;
  image?: string;
  category_id?: number;
  category?: string;
  views?: number | string;
  poll?: unknown;
  pinned?: boolean;
  locked?: boolean;
  author_data_fresh?: unknown;
}

export function parseThreadDetail(raw: unknown, type: 'topic' | 'news'): ParsedThreadDetail | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const data = raw as RawThreadInput;
  const isTopic = type === 'topic';
  const { date, longDate } = formatSafeDate(
    typeof data.created_at === 'string' ? data.created_at : undefined,
  );

  const rawViews = Number(data.views);
  const views = Number.isFinite(rawViews) ? Math.max(0, Math.floor(rawViews)) : 0;

  const defaultAvatar = '/images/ui/logo.webp';
  const authorAvatar =
    typeof data.author_avatar === 'string' && data.author_avatar.trim()
      ? data.author_avatar
      : defaultAvatar;

  return {
    id: data.id,
    title: String(data.title ?? ''),
    content: String(data.content ?? ''),
    title_en: data.title_en,
    content_en: data.content_en,
    author: isTopic ? data.author_name || 'Anónimo' : 'CrystalTidesSMP',
    author_id: isTopic ? data.user_id || '' : data.author_id || '',
    author_avatar: isTopic ? authorAvatar : defaultAvatar,
    author_role: isTopic ? data.author_role || 'user' : 'staff',
    date,
    longDate,
    image: isTopic ? null : data.image || null,
    tag: isTopic
      ? (data.category_id !== undefined ? FORUM_CATEGORY_NAMES[data.category_id] : undefined) ||
        'General'
      : data.category || 'Noticias',
    category_id: data.category_id,
    views,
    poll: data.poll || null,
    pinned: Boolean(data.pinned),
    locked: Boolean(data.locked),
    author_data_fresh: data.author_data_fresh,
  };
}

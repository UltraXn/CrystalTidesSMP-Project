import { useParams, Link } from 'react-router';
import { User, MessageSquare, Clock, Pen, Pin, ArrowLeft } from 'lucide-react';
import Loader from '../components/UI/Loader';
import { useTranslation } from 'react-i18next';
import Section from '../components/Layout/Section';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '../utils/date';

interface ThreadSummary {
  id: string | number;
  title: string;
  author: string;
  replies: number;
  views: number;
  lastActivity: string;
  pinned: boolean;
  tag: string | null;
  slug?: string;
}

interface NewsResponse {
  id: string | number;
  title: string;
  replies?: number;
  views?: number;
  created_at: string;
  category: string | null;
  status: string;
  slug?: string;
}

interface ThreadResponse {
  id: string | number;
  title: string;
  author_name?: string;
  reply_count?: number;
  views?: number;
  created_at: string;
  pinned?: boolean;
  slug?: string;
}

const NEWS_CATEGORY_ID = '1';
const FORUM_CREATE_PATH = '/forum/create';

const CATEGORY_SLUGS: Record<string, number> = {
  announcements: 1,
  general: 2,
  support: 3,
  'off-topic': 4,
};

const CATEGORY_TRANSLATION_KEYS: Record<string, string> = {
  announcements: 'announcements',
  '1': 'announcements',
  news: 'announcements',
  general: 'general',
  '2': 'general',
  support: 'support',
  '3': 'support',
  'off-topic': 'offtopic',
  '4': 'offtopic',
};

function resolveCategoryId(slug?: string): string | number | null {
  if (!slug) return null;
  return CATEGORY_SLUGS[slug] ?? slug;
}

function resolveCategoryTitle(
  slug: string | undefined,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  const translationKey = slug ? CATEGORY_TRANSLATION_KEYS[slug] : undefined;
  return translationKey
    ? t(`forum_page.categories.${translationKey}.title`)
    : t('forum_page.categories.general.title');
}

function mapNewsToThreadSummary(n: NewsResponse): ThreadSummary {
  return {
    id: n.id,
    title: n.title,
    author: 'Staff',
    replies: n.replies ?? 0,
    views: n.views ?? 0,
    lastActivity: formatDate(n.created_at),
    pinned: true,
    tag: 'NEWS',
    slug: n.slug ?? `news-${n.id}`,
  };
}

function mapThreadToSummary(t: ThreadResponse): ThreadSummary {
  return {
    id: t.id,
    title: t.title,
    author: t.author_name ?? 'Aventurero',
    replies: t.reply_count ?? 0,
    views: t.views ?? 0,
    lastActivity: formatDate(t.created_at),
    pinned: t.pinned || false,
    tag: null,
    slug: t.slug,
  };
}

async function fetchNewsThreads(apiUrl: string): Promise<ThreadSummary[]> {
  const res = await fetch(`${apiUrl}/news`);
  if (!res.ok) {
    throw new Error('Failed to fetch news');
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return (data as NewsResponse[]).reduce<ThreadSummary[]>((acc, newsItem) => {
    if (newsItem.status === 'Published') {
      acc.push(mapNewsToThreadSummary(newsItem));
    }
    return acc;
  }, []);
}

async function fetchCategoryThreads(
  apiUrl: string,
  categoryId: string | number,
): Promise<ThreadSummary[]> {
  const res = await fetch(`${apiUrl}/forum/category/${categoryId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch threads');
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return (data as ThreadResponse[]).map(mapThreadToSummary);
}

interface CategoryHeaderProps {
  readonly isNewsCategory: boolean;
}

function CategoryHeader({ isNewsCategory }: Readonly<CategoryHeaderProps>) {
  const { t } = useTranslation();

  return (
    <div className="mb-8 flex items-center justify-between rounded-2xl border border-white/5 bg-black/40 p-4 backdrop-blur-md">
      <Link
        to="/forum"
        className="hover:text-(--accent) flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 transition-colors"
      >
        <ArrowLeft /> {t('forum_category.back_link')}
      </Link>

      {!isNewsCategory && (
        <Link
          to={FORUM_CREATE_PATH}
          className="bg-(--accent) shadow-(--accent)/20 flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest text-black shadow-lg transition-transform hover:scale-105"
        >
          <Pen /> {t('forum_category.new_thread')}
        </Link>
      )}
    </div>
  );
}

function CategoryLoadingState() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="border-t-(--accent) size-12 animate-spin rounded-full border-4 border-white/10" />
      <Loader text={t('forum_category.loading')} />
    </div>
  );
}

interface EmptyThreadsStateProps {
  readonly isNewsCategory: boolean;
}

function EmptyThreadsState({ isNewsCategory }: Readonly<EmptyThreadsStateProps>) {
  const { t } = useTranslation();

  return (
    <div className="bg-white/2 flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-white/10 py-20">
      <MessageSquare className="text-6xl text-white/10" />
      <div className="text-center">
        <p className="mb-4 font-medium text-gray-400">{t('forum_category.no_threads')}</p>
        {!isNewsCategory && (
          <Link to={FORUM_CREATE_PATH} className="text-(--accent) font-bold hover:underline">
            {t('forum_category.be_first')}
          </Link>
        )}
      </div>
    </div>
  );
}

interface ThreadRowProps {
  readonly thread: ThreadSummary;
  readonly isNewsCategory: boolean;
}

function ThreadRow({ thread, isNewsCategory }: Readonly<ThreadRowProps>) {
  const { t } = useTranslation();
  const threadTargetId = thread.slug ?? thread.id;
  const threadUrl = isNewsCategory
    ? `/forum/thread/news/${threadTargetId}`
    : `/forum/thread/topic/${threadTargetId}`;

  const iconStyle = thread.pinned
    ? 'bg-(--accent)/10 text-(--accent)'
    : 'bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-gray-300';

  return (
    <Link to={threadUrl} className="group block">
      <div className="hover:border-(--accent)/30 hover:shadow-(--accent)/5 flex items-center gap-6 rounded-2xl border border-white/5 bg-black/40 p-6 backdrop-blur-xl transition-colors duration-300 hover:-translate-y-1 hover:bg-white/5 hover:shadow-xl">
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-full text-xl ${iconStyle}`}
        >
          {thread.pinned ? <Pin className="rotate-45" /> : <MessageSquare />}
        </div>

        <div className="min-w-0 grow">
          <div className="mb-2 flex items-center gap-3">
            {thread.tag && (
              <span className="bg-(--accent) shrink-0 rounded-sm px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-black">
                {thread.tag}
              </span>
            )}
            <h3 className="group-hover:text-(--accent) truncate text-lg font-bold text-white transition-colors">
              {thread.title}
            </h3>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-gray-500">
            <span className="flex items-center gap-2">
              <User className="text-(--accent)/50" /> {thread.author}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="text-(--accent)/50" /> {thread.lastActivity}
            </span>
          </div>
        </div>

        <div className="hidden shrink-0 gap-8 border-l border-white/5 pl-8 text-center sm:flex">
          <div className="flex flex-col">
            <span className="group-hover:text-(--accent) text-xl font-black text-white transition-colors">
              {thread.replies}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500">
              {t('forum_category.replies')}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="group-hover:text-(--accent) text-xl font-black text-white transition-colors">
              {thread.views}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500">
              {t('forum_category.views')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ForumCategory() {
  const { id: slug } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const API_URL = import.meta.env.VITE_API_URL;

  const categoryId = resolveCategoryId(slug);
  const categoryTitle = resolveCategoryTitle(slug, t);
  const isNewsCategory = String(categoryId) === NEWS_CATEGORY_ID;

  const { data: threads = [], isLoading: loading } = useQuery<ThreadSummary[]>({
    queryKey: ['forumCategoryThreads', categoryId, isNewsCategory, API_URL],
    queryFn: async () => {
      if (!categoryId) return [];
      return isNewsCategory ? fetchNewsThreads(API_URL) : fetchCategoryThreads(API_URL, categoryId);
    },
    enabled: Boolean(categoryId),
    staleTime: 30_000,
  });

  return (
    <div className="min-h-screen pt-24">
      <Section title={categoryTitle}>
        <div className="mx-auto max-w-4xl">
          <CategoryHeader isNewsCategory={isNewsCategory} />

          {loading && <CategoryLoadingState />}

          {!loading && threads.length === 0 && (
            <EmptyThreadsState isNewsCategory={isNewsCategory} />
          )}

          {!loading && threads.length > 0 && (
            <div className="flex flex-col gap-4">
              {threads.map((thread) => (
                <ThreadRow key={thread.id} thread={thread} isNewsCategory={isNewsCategory} />
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

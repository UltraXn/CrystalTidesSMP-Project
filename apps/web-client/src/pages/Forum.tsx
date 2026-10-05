import React, { useMemo } from 'react';
import {
  MessageSquare,
  Megaphone,
  Wrench,
  Coffee,
  User,
  Clock,
  Flame,
  BarChart3,
} from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import Section from '../components/Layout/Section';
import { useSEO } from '../hooks/useSEO';

interface PollOption {
  id: string | number;
  label: string;
  label_en?: string;
  percent: number;
}

interface Poll {
  question: string;
  question_en?: string;
  options: PollOption[];
}

interface CategoryLastPost {
  user: string;
  date: string;
}

interface Category {
  id: number;
  slug: string;
  translationKey: string;
  icon: React.ReactElement;
  topics: number;
  posts: number;
  lastPost: CategoryLastPost;
}

interface NewsItem {
  id: string | number;
  title: string;
  title_en?: string;
  image: string;
  content: string;
  content_en?: string;
  status: string;
  slug?: string;
}

interface CategoryStat {
  id: number;
  topics: number;
  posts: number;
  lastPost: CategoryLastPost;
}

const LANG_EN = 'en';
const DEFAULT_PLACEHOLDER_IMAGE = '/img/placeholder.webp';

const SEO_CONFIG = {
  title: 'Foro Oficial de la Comunidad',
  description:
    'Participa en los debates, comparte tus construcciones e historias y conéctate con los jugadores en el foro de CrystalTides SMP.',
  keywords: 'foro minecraft, comunidad smp, debate minecraft, historias minecraft, foro espanol',
  canonical: 'https://crystaltidessmp.net/forum',
} as const;

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 1,
    slug: 'announcements',
    translationKey: 'announcements',
    icon: <Megaphone />,
    topics: 0,
    posts: 0,
    lastPost: { user: 'Staff', date: '-' },
  },
  {
    id: 2,
    slug: 'general',
    translationKey: 'general',
    icon: <MessageSquare />,
    topics: 0,
    posts: 0,
    lastPost: { user: '-', date: '-' },
  },
  {
    id: 3,
    slug: 'support',
    translationKey: 'support',
    icon: <Wrench />,
    topics: 0,
    posts: 0,
    lastPost: { user: '-', date: '-' },
  },
  {
    id: 4,
    slug: 'off-topic',
    translationKey: 'offtopic',
    icon: <Coffee />,
    topics: 0,
    posts: 0,
    lastPost: { user: '-', date: '-' },
  },
];

function getLocalizedText(language: string, defaultText: string, englishText?: string): string {
  if (language === LANG_EN && englishText) {
    return englishText;
  }
  return defaultText;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/g, '');
}

async function fetchActivePoll(apiUrl: string): Promise<Poll | null> {
  const res = await fetch(`${apiUrl}/polls/active`);
  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`);
  }
  const resData = await res.json();
  const poll: Poll | ({ message?: string } & Record<string, unknown>) = resData.success
    ? resData.data
    : resData;
  if (
    poll &&
    !('message' in poll && poll.message) &&
    'options' in poll &&
    Array.isArray(poll.options) &&
    poll.options.length > 0
  ) {
    return poll as Poll;
  }
  return null;
}

async function fetchForumStats(apiUrl: string): Promise<CategoryStat[]> {
  const res = await fetch(`${apiUrl}/forum/stats`);
  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`);
  }
  return res.json();
}

async function fetchLatestNews(apiUrl: string): Promise<NewsItem | null> {
  const res = await fetch(`${apiUrl}/news`);
  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`);
  }
  const data: NewsItem[] = await res.json();
  if (!Array.isArray(data)) {
    return null;
  }
  const published = data.filter((item) => item.status === 'Published');
  return published.length > 0 ? published[0] : null;
}

interface PollCardProps {
  poll: Poll | null;
}

function PollCard({ poll }: Readonly<PollCardProps>) {
  const { t, i18n } = useTranslation();

  if (!poll) {
    return (
      <div className="hover:border-(--accent)/30 flex h-full flex-col rounded-3xl border border-white/5 bg-black/40 p-8 backdrop-blur-xl transition-colors">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white">
            <BarChart3 className="text-(--accent) text-lg" />
            <span>{t('forum_page.official_poll_section')}</span>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center opacity-50">
          <BarChart3 className="text-4xl text-gray-500" />
          <p className="text-sm font-medium uppercase tracking-widest text-gray-400">
            {t('forum_page.no_active_poll')}
          </p>
        </div>
      </div>
    );
  }

  const questionText = getLocalizedText(i18n.language, poll.question, poll.question_en);
  const visibleOptions = (poll.options || []).slice(0, 3);

  return (
    <div className="hover:border-(--accent)/30 flex h-full flex-col rounded-3xl border border-white/5 bg-black/40 p-8 backdrop-blur-xl transition-colors">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white">
          <BarChart3 className="text-(--accent) text-lg" />
          <span>{t('forum_page.official_poll_section')}</span>
        </div>
        <div className="flex animate-pulse items-center gap-2 text-xs font-bold uppercase text-red-500">
          <Flame /> {t('forum_page.hot')}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="mb-6 text-xl/tight font-bold text-white md:text-2xl">{questionText}</h3>
        <div className="flex-1 space-y-4">
          {visibleOptions.map((opt) => {
            const labelText = getLocalizedText(i18n.language, opt.label, opt.label_en);
            return (
              <div key={opt.id} className="group relative">
                <div className="relative h-12 overflow-hidden rounded-xl bg-white/5">
                  <div
                    className="bg-(--accent) absolute inset-y-0 left-0 opacity-20 transition-colors duration-1000 ease-out group-hover:opacity-30"
                    style={{ width: `${opt.percent}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-6">
                    <span className="z-10 text-sm font-bold text-white">{labelText}</span>
                    <span className="text-(--accent) z-10 text-sm font-black">{opt.percent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface NewsCardProps {
  news: NewsItem | null;
}

function NewsCard({ news }: Readonly<NewsCardProps>) {
  const { t, i18n } = useTranslation();

  if (!news) {
    return (
      <div className="h-full">
        <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-white/5 bg-black/40 p-8 text-center backdrop-blur-xl">
          <div className="mb-2 flex size-16 items-center justify-center rounded-full bg-white/5 text-gray-500">
            <Megaphone className="text-2xl" />
          </div>
          <p className="text-sm font-medium uppercase tracking-widest text-gray-400">
            {t('forum_page.loading_news')}
          </p>
        </div>
      </div>
    );
  }

  const titleText = getLocalizedText(i18n.language, news.title, news.title_en);
  const contentText = stripHtml(
    getLocalizedText(i18n.language, news.content || '', news.content_en),
  );
  const targetUrl = `/forum/thread/news/${news.slug || news.id}`;
  const backgroundImageUrl = news.image || DEFAULT_PLACEHOLDER_IMAGE;

  return (
    <div className="h-full">
      <Link
        to={targetUrl}
        className="hover:border-(--accent) group relative block h-full overflow-hidden rounded-3xl border border-white/5 transition-colors"
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        />
        <div className="bg-linear-to-t absolute inset-0 from-black via-black/80 to-transparent" />

        <div className="relative flex h-full flex-col justify-end p-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black">
              <Megaphone /> {t('forum_page.new_badge')}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              {t('forum_page.news_section')}
            </span>
          </div>
          <h3 className="group-hover:text-(--accent) mb-2 text-2xl/tight font-black text-white transition-colors">
            {titleText}
          </h3>
          <p className="line-clamp-2 text-sm text-gray-300">{contentText}</p>
        </div>
      </Link>
    </div>
  );
}

interface CategoryCardProps {
  category: Category;
}

function CategoryCard({ category }: Readonly<CategoryCardProps>) {
  const { t } = useTranslation();

  return (
    <Link
      to={`/forum/${category.slug}`}
      className="hover:border-(--accent)/40 hover:shadow-(--accent)/5 group flex flex-col items-center gap-6 rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md transition-colors duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-xl sm:flex-row sm:items-stretch"
    >
      <div className="group-hover:text-(--accent) group-hover:bg-(--accent)/10 flex size-16 shrink-0 items-center justify-center rounded-xl bg-black/40 text-3xl text-gray-400 transition-colors sm:h-auto sm:w-20">
        {category.icon}
      </div>

      <div className="min-w-0 flex-1 text-center sm:text-left">
        <h3 className="group-hover:text-(--accent) mb-2 text-xl font-bold uppercase tracking-tight text-white transition-colors">
          {t(`forum_page.categories.${category.translationKey}.title`)}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm text-gray-400">
          {t(`forum_page.categories.${category.translationKey}.desc`)}
        </p>

        <div className="flex items-center justify-center gap-6 border-t border-white/5 pt-4 sm:justify-start">
          <div className="flex flex-col">
            <span className="text-lg font-black text-white">{category.topics}</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500">
              {t('forum_page.stats.topics')}
            </span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-lg font-black text-white">{category.posts}</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500">
              {t('forum_page.stats.posts')}
            </span>
          </div>
        </div>
      </div>

      <div className="min-w-30 ml-2 hidden flex-col items-end justify-center border-l border-white/5 pl-6 text-right text-xs text-gray-500 xl:flex">
        <div className="mb-1 flex items-center gap-2 text-gray-300">
          <User className="text-(--accent)/50 text-[10px]" /> {category.lastPost.user}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="text-(--accent)/50 text-[10px]" /> {category.lastPost.date}
        </div>
      </div>
    </Link>
  );
}

function mergeCategoryStats(
  baseCategories: Category[],
  stats: CategoryStat[] | undefined,
): Category[] {
  if (!stats || !Array.isArray(stats)) {
    return baseCategories;
  }
  return baseCategories.map((cat) => {
    const stat = stats.find((item) => item.id === cat.id);
    if (!stat) {
      return cat;
    }
    return {
      ...cat,
      topics: stat.topics,
      posts: stat.posts,
      lastPost: stat.lastPost,
    };
  });
}

export default function Forum() {
  const { t } = useTranslation();

  useSEO(SEO_CONFIG);

  const API_URL = import.meta.env.VITE_API_URL;

  const { data: activePoll = null } = useQuery<Poll | null>({
    queryKey: ['forumActivePoll'],
    queryFn: () => (API_URL ? fetchActivePoll(API_URL) : Promise.resolve(null)),
    enabled: Boolean(API_URL),
    staleTime: 30_000,
  });

  const { data: statsData } = useQuery<CategoryStat[]>({
    queryKey: ['forumStats'],
    queryFn: () => (API_URL ? fetchForumStats(API_URL) : Promise.resolve([])),
    enabled: Boolean(API_URL),
    staleTime: 30_000,
  });

  const categories = useMemo(() => {
    return mergeCategoryStats(INITIAL_CATEGORIES, statsData);
  }, [statsData]);

  const { data: latestNews = null } = useQuery<NewsItem | null>({
    queryKey: ['forumLatestNews'],
    queryFn: () => (API_URL ? fetchLatestNews(API_URL) : Promise.resolve(null)),
    enabled: Boolean(API_URL),
    staleTime: 60_000,
  });

  return (
    <div className="min-h-screen pt-24">
      <Section title={t('forum_page.title')}>
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="text-lg/relaxed text-gray-400">{t('forum_page.subtitle')}</p>
        </div>

        <div className="mx-auto mb-16 grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
          <PollCard poll={activePoll} />
          <NewsCard news={latestNews} />
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </Section>
    </div>
  );
}

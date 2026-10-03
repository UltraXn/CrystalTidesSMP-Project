import { secureRandom } from '../utils/random';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, ArrowRight, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import Section from '../components/Layout/Section';
import { useTranslation } from 'react-i18next';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from 'boneyard-js/react';
import { useSEO } from '../hooks/useSEO';

export interface Article {
  id: string | number;
  title: string;
  image?: string;
  category: string;
  created_at: string;
  content?: string;
  excerpt?: string;
  status?: string;
  slug?: string;
  title_en?: string;
  content_en?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  rotate: number;
}

const CONSTANTS = {
  CATEGORY_ALL: 'Todos',
  STATUS_PUBLISHED: 'Published',
  DEFAULT_API_URL: '/api',
  PARTICLE_DISMISS_DELAY_MS: 800,
  MAX_DISPLAYED_ARTICLES: 4,
} as const;

const STORAGE_KEYS = {
  LIKE_PREFIX: 'like_v1_',
  IS_LIKED_PREFIX: 'is_liked_v1_',
} as const;

const CATEGORY_EMOJIS: Readonly<Record<string, string>> = {
  Evento: '🐉',
  Sistema: '⚙️',
  Anuncio: '⚔️',
};
const DEFAULT_CATEGORY_EMOJI = '⚔️';
const PARTICLE_EMOJIS = ['💎', '✨', '💙', '👑'] as const;

const DEFAULT_FALLBACK_NEWS: Article[] = [
  {
    id: 'fallback-1',
    title: 'Lanzamiento Oficial de CrystalTides SMP 1.21.1',
    category: 'Anuncio',
    created_at: new Date().toISOString(),
    content:
      'Bienvenido a CrystalTides SMP. Explora un mundo místico repleto de bossing, biomas abisales, mecánicas personalizadas y una comunidad vibrante.',
    image:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
  },
];

function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJIS[category] || DEFAULT_CATEGORY_EMOJI;
}

function resolveArticleTitle(article: Article, isEn: boolean): string {
  if (isEn && article.title_en) {
    return article.title_en;
  }
  return article.title;
}

function resolveArticleContent(article: Article, isEn: boolean, fallbackText: string): string {
  if (isEn && article.content_en) {
    return article.content_en;
  }
  return article.content || article.excerpt || fallbackText;
}

function getArticleThreadUrl(article: Article): string {
  return `/forum/thread/news/${article.slug || article.id}`;
}

function formatArticleDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', { timeZone: 'UTC' });
}

function generateLikeParticles(): Particle[] {
  const timestamp = Date.now();
  return Array.from({ length: 6 }, (_, index) => {
    const randomEmojiIndex = Math.floor(secureRandom() * PARTICLE_EMOJIS.length);
    return {
      id: timestamp + index,
      x: (secureRandom() - 0.5) * 80,
      y: -(secureRandom() * 60 + 30),
      emoji: PARTICLE_EMOJIS[randomEmojiIndex] ?? '💎',
      rotate: (secureRandom() - 0.5) * 90,
    };
  });
}

function getInitialLikeCount(articleId: string | number): number {
  const saved = localStorage.getItem(`${STORAGE_KEYS.LIKE_PREFIX}${articleId}`);
  return saved ? Number.parseInt(saved, 10) : Math.floor(secureRandom() * 40) + 15;
}

function getInitialIsLiked(articleId: string | number): boolean {
  return localStorage.getItem(`${STORAGE_KEYS.IS_LIKED_PREFIX}${articleId}`) === 'true';
}

function extractNewsCategories(articles: Article[]): string[] {
  const uniqueCategories = new Set(articles.map((item) => item.category));
  return [CONSTANTS.CATEGORY_ALL, ...Array.from(uniqueCategories)];
}

function filterNewsByCategory(articles: Article[], selectedCategory: string): Article[] {
  const matched =
    selectedCategory === CONSTANTS.CATEGORY_ALL
      ? articles
      : articles.filter((item) => item.category === selectedCategory);
  return matched.slice(0, CONSTANTS.MAX_DISPLAYED_ARTICLES);
}

async function fetchPublishedNews(apiUrl: string): Promise<Article[]> {
  try {
    const res = await fetch(`${apiUrl}/news`);
    if (!res.ok) return DEFAULT_FALLBACK_NEWS;
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return DEFAULT_FALLBACK_NEWS;
    const published = (data as Article[]).filter((n) => n.status === CONSTANTS.STATUS_PUBLISHED);
    return published.length > 0 ? published : DEFAULT_FALLBACK_NEWS;
  } catch {
    return DEFAULT_FALLBACK_NEWS;
  }
}

// Like Button Component with Magic Particles
const LikeButton = ({ articleId }: { articleId: string | number }) => {
  const [likes, setLikes] = useState<number>(() => getInitialLikeCount(articleId));
  const [isLiked, setIsLiked] = useState<boolean>(() => getInitialIsLiked(articleId));
  const [particles, setParticles] = useState<Particle[]>([]);

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const newLiked = !isLiked;
    const newLikesCount = newLiked ? likes + 1 : likes - 1;

    setIsLiked(newLiked);
    setLikes(newLikesCount);

    localStorage.setItem(`${STORAGE_KEYS.IS_LIKED_PREFIX}${articleId}`, String(newLiked));
    localStorage.setItem(`${STORAGE_KEYS.LIKE_PREFIX}${articleId}`, String(newLikesCount));

    if (newLiked) {
      setParticles(generateLikeParticles());
      setTimeout(() => setParticles([]), CONSTANTS.PARTICLE_DISMISS_DELAY_MS);
    }
  };

  const buttonStyleClass = isLiked
    ? 'bg-(--accent)/25 text-(--accent) border-(--accent)/40 shadow-(--accent)/10 scale-105 shadow-lg'
    : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white';

  return (
    <div className="relative inline-block">
      <button
        aria-label="Action"
        type="button"
        onClick={handleLike}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black transition-colors ${buttonStyleClass}`}
      >
        <span className="text-sm leading-none">{isLiked ? '💙' : '🤍'}</span>
        <span>{likes}</span>
      </button>

      <AnimatePresence>
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            initial={{ opacity: 1, scale: 0.6, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              scale: [1, 1.3, 0.7],
              x: particle.x,
              y: particle.y,
              rotate: particle.rotate,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="pointer-events-none absolute left-1/2 top-0 z-50 -ml-2 text-sm"
          >
            {particle.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Featured News Card - Spans 2 Columns
const FeaturedNewsCard = ({ article }: { article: Article }) => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const title = resolveArticleTitle(article, isEn);
  const content = resolveArticleContent(article, isEn, t('blog.empty'));

  return (
    <div className="rounded-4xl hover:border-(--accent)/30 hover:shadow-(--accent)/10 group flex h-full flex-col overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl transition-colors duration-500 hover:bg-white/5 hover:shadow-2xl">
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-white/5">
        {article.image ? (
          <img
            src={article.image}
            alt={title}
            className="size-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        ) : (
          <div className="text-9xl opacity-10 transition-opacity group-hover:opacity-20">
            {getCategoryEmoji(article.category)}
          </div>
        )}
        <div className="text-(--accent) absolute left-6 top-6 flex items-center gap-2 rounded-full border border-white/10 bg-black/80 px-4 py-2 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
          <Tag size={12} /> {article.category}
        </div>
      </div>

      <div className="flex grow flex-col gap-6 p-8 md:p-10">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <Calendar size={12} /> {formatArticleDate(article.created_at)}
        </div>

        <h3 className="group-hover:text-(--accent) text-3xl/tight font-black tracking-tighter text-white transition-colors md:text-4xl">
          {title}
        </h3>

        <p className="line-clamp-3 grow text-base/relaxed font-medium text-gray-400">{content}</p>

        <div className="mt-4 flex items-center justify-between">
          <Link
            to={getArticleThreadUrl(article)}
            className="text-(--accent) group/link inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-colors hover:translate-x-2"
          >
            {t('blog.read_more')}
            <ArrowRight className="transition-transform group-hover/link:translate-x-1" />
          </Link>

          <LikeButton articleId={article.id} />
        </div>
      </div>
    </div>
  );
};

// Compact News Card for Right Column
const CompactNewsCard = ({ article }: { article: Article }) => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const title = resolveArticleTitle(article, isEn);

  return (
    <div className="hover:border-(--accent)/30 hover:shadow-(--accent)/5 group flex flex-col gap-6 overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl transition-colors duration-500 hover:bg-white/5 hover:shadow-xl sm:flex-row">
      <div className="relative flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/5 sm:w-32">
        {article.image ? (
          <img
            src={article.image}
            alt={title}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="text-4xl opacity-20 transition-opacity group-hover:opacity-40">
            {getCategoryEmoji(article.category)}
          </div>
        )}
      </div>

      <div className="flex grow flex-col justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gray-500">
              <Calendar size={10} /> {formatArticleDate(article.created_at)}
            </span>
            <span className="text-(--accent) text-[9px] font-black uppercase tracking-widest">
              {article.category}
            </span>
          </div>

          <h4 className="group-hover:text-(--accent) text-lg/snug font-black text-white transition-colors">
            {title}
          </h4>
        </div>

        <div className="flex items-center justify-between">
          <Link
            to={getArticleThreadUrl(article)}
            className="text-(--accent) group/link inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest transition-colors hover:translate-x-1"
          >
            {t('blog.read_more')}
            <ArrowRight size={14} className="transition-transform group-hover/link:translate-x-1" />
          </Link>

          <LikeButton articleId={article.id} />
        </div>
      </div>
    </div>
  );
};

// Category Filter Bar Component
interface CategoryFilterBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryFilterBar = ({
  categories,
  selectedCategory,
  onSelectCategory,
}: Readonly<CategoryFilterBarProps>) => {
  return (
    <div className="mb-12 flex flex-wrap justify-center gap-3">
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        const buttonClasses = isSelected
          ? 'text-black'
          : 'border border-white/5 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white';

        return (
          <button
            aria-label="Action"
            type="button"
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`relative rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-colors ${buttonClasses}`}
          >
            <span className="relative z-10">{category}</span>
            {isSelected && (
              <motion.div
                layoutId="activeBlogCategory"
                className="bg-(--accent) absolute inset-0 rounded-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

// Skeleton Placeholder Fallback
const BlogSkeletonFallback = () => (
  <div className="min-h-87.5 grid grid-cols-1 gap-8 lg:grid-cols-3">
    <div className="h-95 flex animate-pulse flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-8 lg:col-span-2">
      <div className="flex items-center gap-3">
        <div className="h-6 w-20 rounded-full bg-white/10" />
        <div className="h-4 w-28 rounded-sm bg-white/5" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-8 w-3/4 rounded-lg bg-white/10" />
        <div className="h-5 w-1/2 rounded-lg bg-white/5" />
      </div>
    </div>

    <div className="flex flex-col gap-6">
      {[1, 2].map((i) => (
        <div
          key={`blog-skeleton-item-${i}`}
          className="h-43.75 flex animate-pulse flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <div className="h-5 w-16 rounded-full bg-white/10" />
          <div className="h-6 w-4/5 rounded-sm bg-white/10" />
          <div className="h-4 w-24 rounded-sm bg-white/5" />
        </div>
      ))}
    </div>
  </div>
);

// Empty State View
const BlogEmptyState = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-white/2 flex flex-col items-center justify-center gap-6 rounded-3xl border border-white/5 py-20 backdrop-blur-xl">
      <Tag size={48} className="text-white/10" />
      <div className="text-center">
        <h3 className="mb-2 text-xl font-black text-white">{t('blog.no_news')}</h3>
        <p className="font-medium text-gray-500">{t('blog.stay_tuned')}</p>
      </div>
    </div>
  );
};

export default function Blog() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>(CONSTANTS.CATEGORY_ALL);

  useSEO({
    title: 'Noticias y Notas de Parche 1.21+',
    description:
      'Entérate de las últimas novedades, parches, eventos y actualizaciones del servidor CrystalTides SMP 1.21+.',
    keywords:
      'noticias minecraft, parches smp, actualizaciones servidor minecraft, eventos minecraft',
    canonical: 'https://crystaltidessmp.net/news',
  });

  const apiUrl = import.meta.env.VITE_API_URL || CONSTANTS.DEFAULT_API_URL;

  const { data: news = DEFAULT_FALLBACK_NEWS, isLoading: loading } = useQuery<Article[]>({
    queryKey: ['blogPublishedNews'],
    queryFn: () => fetchPublishedNews(apiUrl),
    staleTime: 60_000,
  });

  const categories = useMemo(() => extractNewsCategories(news), [news]);

  const filteredNews = useMemo(
    () => filterNewsByCategory(news, selectedCategory),
    [news, selectedCategory],
  );

  const featuredArticle = filteredNews[0];
  const otherArticles = filteredNews.slice(1);

  return (
    <Section title={t('blog.title')}>
      <Section>
        {!loading && categories.length > 1 && (
          <CategoryFilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}

        <Skeleton
          name="blog-news-grid"
          loading={loading}
          fallback={<BlogSkeletonFallback />}
          animate="shimmer"
          color="#1a1a2e"
          darkColor="#0f0f1a"
        >
          {filteredNews.length > 0 ? (
            <div className="min-h-87.5 grid grid-cols-1 gap-8 lg:grid-cols-3">
              {featuredArticle && (
                <div className="lg:col-span-2">
                  <FeaturedNewsCard article={featuredArticle} />
                </div>
              )}

              {otherArticles.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {otherArticles.map((article) => (
                    <CompactNewsCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                featuredArticle && (
                  <div className="rounded-4xl flex items-center justify-center border border-white/5 bg-black/20 p-8 text-center text-sm italic text-gray-500">
                    No hay más artículos en esta categoría
                  </div>
                )
              )}
            </div>
          ) : (
            <BlogEmptyState />
          )}
        </Skeleton>

        <div className="mt-16 text-center">
          <Link
            to="/forum/announcements"
            className="hover:bg-(--accent) inline-flex items-center rounded-full bg-white px-10 py-4 text-sm font-black uppercase tracking-widest text-black shadow-xl shadow-black/50 transition-colors hover:scale-105 active:scale-95"
          >
            {t('blog.view_all')}
          </Link>
        </div>
      </Section>
    </Section>
  );
}

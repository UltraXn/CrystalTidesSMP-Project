import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import {
  Flame,
  Clock,
  Calendar,
  User,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Newspaper as NewspaperIcon,
  Swords,
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const TABS = {
  BLOG: 'blog',
  QUESTS: 'quests',
} as const;

type TabType = (typeof TABS)[keyof typeof TABS];

const UI_STRINGS = {
  CMD_MISIONES: '/misiones',
  DEFAULT_HEADLINE: 'Edición Oficial del Servidor',
  FALLBACK_IMAGE_ALT: 'Imagen del Periódico',
  INLINE_IMAGE_ALT: 'Imagen inline',
  EDICION_PREFIX: 'EDICIÓN #',
} as const;

const STYLES = {
  BORDER_CARD: 'border-white/10',
  TEXT_ACCENT: 'text-(--accent)',
  BG_ACCENT: 'bg-(--accent)',
  GLASS_PANEL: 'bg-black/40 backdrop-blur-xl border border-white/10 shadow-xl',
} as const;

export interface NewspaperEdition {
  id: string;
  issue_number: number;
  issue_date: string;
  headline: string;
  front_page_summary: string;
  full_markdown: string;
  image?: string;
  likes_count: number;
  created_at: string;
}

export interface DailyQuest {
  id: number;
  quest_type: 'HUNT' | 'CRAFT' | 'EXPLORE' | 'COMMERCE';
  title: string;
  description: string;
  target: string;
  amount: number;
  reward_kc: number;
}

const isSafeImageUrl = (url: string): boolean => {
  let cleaned = '';
  for (let i = 0; i < url.length; i += 1) {
    const code = url.codePointAt(i);
    if (code !== undefined && code > 32 && code !== 127) {
      cleaned += url[i];
    }
  }
  return cleaned.startsWith('/') || /^https?:\/\//i.test(cleaned);
};

const DEFAULT_COVERS: readonly string[] = [
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
];

function getCoverImage(edition: NewspaperEdition, index = 0): string {
  if (edition.image && isSafeImageUrl(edition.image)) {
    return edition.image;
  }
  return DEFAULT_COVERS[Math.abs(index) % DEFAULT_COVERS.length];
}

function isLeadingNoise(codePoint: number, firstChar: string): boolean {
  if (/\s/.test(firstChar)) return true;
  if ((codePoint >= 48 && codePoint <= 57) || codePoint === 46) return true;
  return (
    (codePoint >= 0x1f300 && codePoint <= 0x1f9ff) || (codePoint >= 0x2600 && codePoint <= 0x26ff)
  );
}

function cleanTitle(rawHeadline: string | undefined | null): string {
  if (!rawHeadline) return UI_STRINGS.DEFAULT_HEADLINE;
  let title = rawHeadline.replace(/^#+\s*/, '').trim();
  while (title.length > 0) {
    const codePoint = title.codePointAt(0);
    if (!codePoint || !isLeadingNoise(codePoint, title[0])) {
      break;
    }
    const charLen = codePoint > 0xffff ? 2 : 1;
    title = title.slice(charLen);
  }
  return title.trim();
}

async function fetchLatestNewspaper(): Promise<NewspaperEdition | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/newspaper/latest`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchNewspaperArchive(): Promise<NewspaperEdition[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/newspaper/archive?limit=15`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.editions ?? [];
  } catch {
    return [];
  }
}

async function fetchDailyQuests(): Promise<DailyQuest[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/quests/daily`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

function renderImageBlock(trimmed: string, key: string): ReactNode {
  const match = /^!\[(.*?)\]\((.*?)\)$/.exec(trimmed);
  if (!match || !isSafeImageUrl(match[2])) {
    return null;
  }
  const altText = match[1] || UI_STRINGS.FALLBACK_IMAGE_ALT;
  return (
    <figure key={key} className="my-6 space-y-2">
      <img
        src={match[2]}
        alt={altText}
        className="max-h-137.5 w-full rounded-2xl border border-white/10 object-cover shadow-2xl transition-transform hover:scale-[1.01]"
      />
      {match[1] ? (
        <figcaption className="text-center font-mono text-xs italic text-gray-400">
          📷 {match[1]}
        </figcaption>
      ) : null}
    </figure>
  );
}

function renderHeading(trimmed: string, key: string): ReactNode {
  const cleanHeading = cleanTitle(trimmed);
  if (cleanHeading.toLowerCase().includes('titular sensacionalista') && cleanHeading.length < 35) {
    return null;
  }

  return (
    <h3
      key={key}
      className="flex items-center gap-3 border-b border-white/10 pb-3 pt-8 text-2xl font-black tracking-tight text-white sm:text-3xl"
    >
      {cleanHeading}
    </h3>
  );
}

function renderListBlock(trimmed: string, key: string): ReactNode {
  const items = trimmed.split('\n').filter(Boolean);
  return (
    <ul key={key} className="border-(--accent)/40 my-4 space-y-2 border-l-2 pl-4">
      {items.map((it) => {
        const itemText = it.replace(/^[-*]\s*/, '').trim();
        return (
          <li
            key={`it_${itemText.slice(0, 20)}_${itemText.length}`}
            className="text-sm text-gray-300 sm:text-base"
          >
            {itemText}
          </li>
        );
      })}
    </ul>
  );
}

function renderParagraph(trimmed: string, key: string): ReactNode {
  const parts: ReactNode[] = [];
  let lastIdx = 0;
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  let imgMatch: RegExpExecArray | null = imageRegex.exec(trimmed);

  while (imgMatch !== null) {
    if (imgMatch.index > lastIdx) {
      parts.push(trimmed.substring(lastIdx, imgMatch.index));
    }
    const [, altText, imageUrl] = imgMatch;
    if (isSafeImageUrl(imageUrl)) {
      parts.push(
        <img
          key={`img_inline_${imgMatch.index}`}
          src={imageUrl}
          alt={altText || UI_STRINGS.INLINE_IMAGE_ALT}
          className="max-h-100 my-4 w-full rounded-2xl border border-white/10 object-cover shadow-xl"
        />,
      );
    }
    lastIdx = imgMatch.index + imgMatch[0].length;
    imgMatch = imageRegex.exec(trimmed);
  }

  if (lastIdx < trimmed.length) {
    parts.push(trimmed.substring(lastIdx));
  }

  const content = parts.length > 0 ? parts : trimmed;

  return (
    <p key={key} className="text-base/relaxed font-normal text-gray-300 sm:text-lg">
      {content}
    </p>
  );
}

function renderMarkdownBlock(para: string): ReactNode {
  const trimmed = para.trim();
  const elementKey = `para_${trimmed.slice(0, 15)}_${trimmed.length}`;

  if (trimmed.startsWith('![')) {
    return renderImageBlock(trimmed, elementKey);
  }

  if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
    return renderHeading(trimmed, elementKey);
  }

  if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
    return renderListBlock(trimmed, elementKey);
  }

  return renderParagraph(trimmed, elementKey);
}

/**
 * Renderizador de Markdown Enriquecido estilo Blog con soporte de Imágenes Inline `![alt](url)`
 */
export function RichBlogMarkdownRenderer({ markdown }: Readonly<{ readonly markdown: string }>) {
  if (!markdown) return null;

  const paragraphs = markdown.split('\n\n').filter(Boolean);

  return (
    <div className="space-y-6 text-base/relaxed text-gray-200 sm:text-lg">
      {paragraphs.map(renderMarkdownBlock)}
    </div>
  );
}

function DailyQuestCard({ quest }: Readonly<{ readonly quest: DailyQuest }>) {
  return (
    <div className={`rounded-3xl p-6 ${STYLES.GLASS_PANEL} space-y-4`}>
      <div className="flex items-center justify-between">
        <span
          className={`bg-(--accent)/10 rounded-full px-3 py-1 ${STYLES.TEXT_ACCENT} border-(--accent)/30 border font-mono text-[10px] font-bold uppercase`}
        >
          {quest.quest_type}
        </span>
        <span className={`font-mono text-xs font-black ${STYLES.TEXT_ACCENT}`}>
          +{quest.reward_kc} KC
        </span>
      </div>

      <div>
        <h3 className="mb-1 text-lg font-bold text-white">{quest.title}</h3>
        <p className="text-xs/relaxed text-gray-300">{quest.description}</p>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[10px] text-gray-400">
        <span>
          Objetivo: {quest.target} x{quest.amount}
        </span>
        <span className={STYLES.TEXT_ACCENT}>{UI_STRINGS.CMD_MISIONES}</span>
      </div>
    </div>
  );
}

function DailyQuestsBoard({
  quests,
  isLoading,
}: Readonly<{
  readonly quests?: DailyQuest[];
  readonly isLoading: boolean;
}>) {
  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-gray-400">
        <RefreshCw className={`size-8 ${STYLES.TEXT_ACCENT} mx-auto mb-4 animate-spin`} />
        Cargando misiones del día...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-black uppercase tracking-tight text-white">
          Tablón de Misiones Diarias
        </h2>
        <p className="text-sm text-gray-400">
          Completa misiones in-game ejecutando{' '}
          <code className={STYLES.TEXT_ACCENT}>{UI_STRINGS.CMD_MISIONES}</code> para reclamar
          KilluCoins (KC).
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quests?.map((q) => (
          <DailyQuestCard key={q.id} quest={q} />
        ))}
      </div>
    </div>
  );
}

function ArticleReaderHeader({
  edition,
  hasLiked,
  onLike,
}: Readonly<{
  readonly edition: NewspaperEdition;
  readonly hasLiked: boolean;
  readonly onLike: (id: string) => void;
}>) {
  const extraLikes = hasLiked ? 1 : 0;
  const likeBtnClass = hasLiked
    ? `${STYLES.BG_ACCENT} text-black shadow-lg shadow-(--accent)/20`
    : 'bg-white/10 text-gray-300 hover:bg-white/20';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`bg-(--accent)/10 rounded-full px-3 py-1 ${STYLES.TEXT_ACCENT} border-(--accent)/30 border font-mono text-xs font-bold`}
        >
          {UI_STRINGS.EDICION_PREFIX}
          {edition.issue_number}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className={`size-3.5 ${STYLES.TEXT_ACCENT}`} /> {edition.issue_date}
        </span>
      </div>

      <h1 className="text-3xl/tight font-black tracking-tight text-white sm:text-5xl">
        {cleanTitle(edition.headline)}
      </h1>

      <div className="flex items-center justify-between border-y border-white/10 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-(--accent)/20 border-(--accent)/40 flex size-10 items-center justify-center rounded-full border font-bold text-white">
            <User className={`size-5 ${STYLES.TEXT_ACCENT}`} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white">Prensa Oficial</p>
            <p className="text-[10px] text-gray-400">CrystalTides SMP</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onLike(edition.id)}
          className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-colors ${likeBtnClass}`}
        >
          <Flame className="size-4" />
          {edition.likes_count + extraLikes} Likes
        </button>
      </div>
    </div>
  );
}

function ArticleReader({
  edition,
  hasLiked,
  onLike,
}: Readonly<{
  readonly edition: NewspaperEdition;
  readonly hasLiked: boolean;
  readonly onLike: (id: string) => void;
}>) {
  return (
    <article className={`space-y-8 ${STYLES.GLASS_PANEL} rounded-3xl p-8 shadow-2xl sm:p-12`}>
      <ArticleReaderHeader edition={edition} hasLiked={hasLiked} onLike={onLike} />

      <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
        <img
          src={getCoverImage(edition)}
          alt={edition.headline}
          className="size-full object-cover"
        />
        <div className="bg-linear-to-t absolute inset-0 from-black/80 via-transparent to-transparent" />
      </div>

      <RichBlogMarkdownRenderer markdown={edition.full_markdown} />
    </article>
  );
}

function HeroArticleCard({
  hero,
  likes,
  onRead,
  onLike,
}: Readonly<{
  readonly hero: NewspaperEdition;
  readonly likes: number;
  readonly onRead: (art: NewspaperEdition) => void;
  readonly onLike: (id: string) => void;
}>) {
  const headline = cleanTitle(hero.headline);

  return (
    <article className="group space-y-6">
      <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 bg-black/60 shadow-2xl">
        <img
          src={getCoverImage(hero, 0)}
          alt={headline}
          className="group-hover:scale-103 size-full object-cover transition-transform duration-1000"
        />
        <div className="bg-linear-to-t absolute inset-0 from-black via-black/30 to-transparent" />
        <span
          className={`absolute left-6 top-6 rounded-full border border-white/10 bg-black/80 px-4 py-1.5 text-xs font-black backdrop-blur-md ${STYLES.TEXT_ACCENT} flex items-center gap-1.5 uppercase tracking-widest`}
        >
          <NewspaperIcon className="size-3.5" /> EDICIÓN DESTACADA #{hero.issue_number}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4 font-mono text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className={`size-3.5 ${STYLES.TEXT_ACCENT}`} /> {hero.issue_date}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <User className={`size-3.5 ${STYLES.TEXT_ACCENT}`} /> Staff
          </span>
        </div>

        <h1 className="group-hover:text-(--accent) text-3xl/tight font-black tracking-tight text-white transition-colors sm:text-5xl">
          {headline}
        </h1>

        <p className="text-base/relaxed font-normal text-gray-300 sm:text-lg">
          {hero.front_page_summary}
        </p>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="button"
            onClick={() => onRead(hero)}
            className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 ${STYLES.BG_ACCENT} shadow-(--accent)/20 cursor-pointer text-xs font-black uppercase tracking-widest text-black shadow-lg transition-transform hover:scale-105`}
          >
            Leer Artículo Completo <ArrowRight className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => onLike(hero.id)}
            className="flex cursor-pointer items-center gap-2 rounded-2xl bg-white/10 px-5 py-3.5 text-xs font-bold text-gray-300 transition-colors hover:bg-white/20"
          >
            <Flame className="size-4 text-amber-500" />
            {likes} Likes
          </button>
        </div>
      </div>
    </article>
  );
}

function CatalogCard({
  art,
  idx,
  onSelect,
}: Readonly<{
  readonly art: NewspaperEdition;
  readonly idx: number;
  readonly onSelect: (art: NewspaperEdition) => void;
}>) {
  return (
    <button
      type="button"
      onClick={() => onSelect(art)}
      className="hover:border-(--accent)/40 group flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-black/40 text-left shadow-xl backdrop-blur-xl transition-[border-color,transform] duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-video overflow-hidden bg-black/50">
        <img
          src={getCoverImage(art, idx + 1)}
          alt={art.headline}
          className="group-hover:scale-108 size-full object-cover transition-transform duration-700"
        />
        <div
          className={`absolute left-4 top-4 rounded-full border border-white/10 bg-black/80 px-3 py-1 text-[10px] font-black backdrop-blur-md ${STYLES.TEXT_ACCENT} uppercase tracking-widest`}
        >
          {UI_STRINGS.EDICION_PREFIX}
          {art.issue_number}
        </div>
      </div>

      <div className="flex grow flex-col justify-between space-y-3 p-6">
        <div className="space-y-2">
          <span className="font-mono text-[10px] text-gray-400">{art.issue_date}</span>
          <h4 className="group-hover:text-(--accent) line-clamp-2 text-base/snug font-bold text-white transition-colors">
            {cleanTitle(art.headline)}
          </h4>
          <p className="line-clamp-3 text-xs/relaxed text-gray-400">{art.front_page_summary}</p>
        </div>

        <div
          className={`flex items-center justify-between border-t border-white/10 pt-3 text-xs font-bold ${STYLES.TEXT_ACCENT}`}
        >
          <span>Leer Noticia</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
}

function ArticlesCatalog({
  articles,
  onSelect,
}: Readonly<{
  readonly articles: NewspaperEdition[];
  readonly onSelect: (art: NewspaperEdition) => void;
}>) {
  if (articles.length === 0) {
    return <p className="text-sm text-gray-400">No hay ediciones anteriores archivadas.</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {articles.map((art, idx) => (
        <CatalogCard key={art.id} art={art} idx={idx} onSelect={onSelect} />
      ))}
    </div>
  );
}

function SidebarQuestsList({
  quests,
  isLoading,
}: Readonly<{
  readonly quests?: DailyQuest[];
  readonly isLoading: boolean;
}>) {
  if (isLoading) {
    return (
      <div className="p-6 text-center text-xs text-gray-400">
        <RefreshCw className={`size-5 ${STYLES.TEXT_ACCENT} mx-auto mb-2 animate-spin`} />
        Cargando misiones...
      </div>
    );
  }

  if (!quests || quests.length === 0) {
    return <p className="text-xs text-gray-400">No hay misiones activas por hoy.</p>;
  }

  return (
    <div className="space-y-3">
      {quests.slice(0, 3).map((quest) => (
        <div key={quest.id} className="space-y-2 rounded-2xl border border-white/5 bg-white/5 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">{quest.title}</span>
            <span className={`${STYLES.TEXT_ACCENT} font-mono font-bold`}>
              +{quest.reward_kc} KC
            </span>
          </div>
          <p className="line-clamp-2 text-xs/relaxed text-gray-400">{quest.description}</p>
        </div>
      ))}
    </div>
  );
}

function RecentEditionsList({
  articles,
  onSelectArticle,
}: Readonly<{
  readonly articles: NewspaperEdition[];
  readonly onSelectArticle: (art: NewspaperEdition) => void;
}>) {
  if (articles.length === 0) return null;

  return (
    <div className={`rounded-3xl p-6 ${STYLES.GLASS_PANEL} space-y-4`}>
      <h4 className="flex items-center gap-2 border-b border-white/10 pb-3 text-base font-black uppercase tracking-wider text-white">
        <BookOpen className={`size-4 ${STYLES.TEXT_ACCENT}`} /> Ediciones Recientes
      </h4>

      <div className="space-y-3">
        {articles.slice(0, 4).map((art, idx) => (
          <button
            type="button"
            key={art.id}
            onClick={() => onSelectArticle(art)}
            className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-white/5"
          >
            <img
              src={getCoverImage(art, idx + 1)}
              alt={art.headline}
              className="size-14 shrink-0 rounded-xl border border-white/10 object-cover"
            />
            <div className="min-w-0 grow">
              <span className={`font-mono text-[10px] ${STYLES.TEXT_ACCENT}`}>
                {UI_STRINGS.EDICION_PREFIX}
                {art.issue_number}
              </span>
              <h5 className="group-hover:text-(--accent) line-clamp-1 text-xs font-bold text-white transition-colors">
                {cleanTitle(art.headline)}
              </h5>
              <span className="text-[10px] text-gray-500">{art.issue_date}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SidebarWidgets({
  dailyQuests,
  loadingQuests,
  allArticles,
  onSelectArticle,
}: Readonly<{
  readonly dailyQuests?: DailyQuest[];
  readonly loadingQuests: boolean;
  readonly allArticles: NewspaperEdition[];
  readonly onSelectArticle: (art: NewspaperEdition) => void;
}>) {
  return (
    <div className="sticky top-28 space-y-8 lg:col-span-4">
      <div className={`rounded-3xl p-6 ${STYLES.GLASS_PANEL} space-y-4`}>
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h4 className="flex items-center gap-2 text-base font-black uppercase tracking-wider text-white">
            <Swords className={`size-4 ${STYLES.TEXT_ACCENT}`} /> Misiones Diarias
          </h4>
          <span
            className={`font-mono text-[10px] ${STYLES.TEXT_ACCENT} bg-(--accent)/10 border-(--accent)/30 rounded-full border px-2 py-0.5`}
          >
            {UI_STRINGS.CMD_MISIONES}
          </span>
        </div>

        <SidebarQuestsList quests={dailyQuests} isLoading={loadingQuests} />
      </div>

      <RecentEditionsList articles={allArticles} onSelectArticle={onSelectArticle} />
    </div>
  );
}

function MainArticlesFeed({
  readingEdition,
  loadingLatest,
  activeHero,
  allArticles,
  hasLiked,
  likes,
  onLike,
  onSelectEdition,
}: Readonly<{
  readonly readingEdition: NewspaperEdition | null;
  readonly loadingLatest: boolean;
  readonly activeHero: NewspaperEdition | null;
  readonly allArticles: NewspaperEdition[];
  readonly hasLiked: boolean;
  readonly likes: number;
  readonly onLike: (id: string) => void;
  readonly onSelectEdition: (art: NewspaperEdition) => void;
}>) {
  if (readingEdition) {
    return <ArticleReader edition={readingEdition} hasLiked={hasLiked} onLike={onLike} />;
  }

  return (
    <div className="space-y-12">
      {loadingLatest && (
        <div className={`rounded-3xl p-16 text-center ${STYLES.GLASS_PANEL}`}>
          <RefreshCw className={`size-8 ${STYLES.TEXT_ACCENT} mx-auto mb-4 animate-spin`} />
          <p className="text-sm text-gray-400">Cargando artículo principal...</p>
        </div>
      )}

      {!loadingLatest && activeHero && (
        <HeroArticleCard hero={activeHero} likes={likes} onRead={onSelectEdition} onLike={onLike} />
      )}

      <div className="space-y-6 border-t border-white/10 pt-6">
        <h3 className="flex items-center gap-2 text-2xl font-black uppercase tracking-tight text-white">
          <BookOpen className={`size-6 ${STYLES.TEXT_ACCENT}`} /> Catálogo de Noticias
        </h3>

        <ArticlesCatalog articles={allArticles} onSelect={onSelectEdition} />
      </div>
    </div>
  );
}

function TabNavigation({
  activeTab,
  questCount,
  showReturn,
  onTabChange,
  onReturn,
}: Readonly<{
  readonly activeTab: TabType;
  readonly questCount: number;
  readonly showReturn: boolean;
  readonly onTabChange: (tab: TabType) => void;
  readonly onReturn: () => void;
}>) {
  const blogTabStyle =
    activeTab === TABS.BLOG
      ? `${STYLES.BG_ACCENT} text-black shadow-lg shadow-(--accent)/20`
      : 'bg-white/5 text-gray-300 hover:bg-white/10';

  const questsTabStyle =
    activeTab === TABS.QUESTS
      ? `${STYLES.BG_ACCENT} text-black shadow-lg shadow-(--accent)/20`
      : 'bg-white/5 text-gray-300 hover:bg-white/10';

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onTabChange(TABS.BLOG)}
          className={`flex items-center gap-2 rounded-full px-6 py-3 text-xs font-black uppercase tracking-widest transition-colors ${blogTabStyle}`}
        >
          <NewspaperIcon className="size-4" /> Noticias & Artículos
        </button>
        <button
          type="button"
          onClick={() => onTabChange(TABS.QUESTS)}
          className={`flex items-center gap-2 rounded-full px-6 py-3 text-xs font-black uppercase tracking-widest transition-colors ${questsTabStyle}`}
        >
          <Swords className="size-4" /> Misiones del Gremio ({questCount})
        </button>
      </div>

      {showReturn && (
        <button
          type="button"
          onClick={onReturn}
          className={`font-mono text-xs ${STYLES.TEXT_ACCENT} flex items-center gap-1 hover:underline`}
        >
          ← Volver a Portada
        </button>
      )}
    </div>
  );
}

function resolveLikesCount(activeHero: NewspaperEdition | null, hasLiked: boolean): number {
  if (!activeHero) return 0;
  return activeHero.likes_count + (hasLiked ? 1 : 0);
}

export function NewspaperSection() {
  const [activeTab, setActiveTab] = useState<TabType>(TABS.BLOG);
  const [readingEdition, setReadingEdition] = useState<NewspaperEdition | null>(null);
  const [likedEditions, setLikedEditions] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const { data: latestEdition, isLoading: loadingLatest } = useQuery({
    queryKey: ['latest-newspaper-edition'],
    queryFn: fetchLatestNewspaper,
  });

  const { data: archiveEditions } = useQuery({
    queryKey: ['newspaper-archive-list'],
    queryFn: fetchNewspaperArchive,
  });

  const { data: dailyQuests, isLoading: loadingQuests } = useQuery({
    queryKey: ['daily-quests-list'],
    queryFn: fetchDailyQuests,
  });

  const activeHero = latestEdition ?? archiveEditions?.[0] ?? null;
  const allArticles = archiveEditions ? archiveEditions.filter((a) => a.id !== activeHero?.id) : [];

  const targetId = readingEdition?.id ?? activeHero?.id;
  const hasLiked = Boolean(targetId && likedEditions[targetId]);
  const likes = resolveLikesCount(activeHero, hasLiked);

  const handleLike = async (editionId: string) => {
    if (likedEditions[editionId]) return;
    // El servidor solo acepta un like por cuenta: sin sesión, al login
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      navigate('/login');
      return;
    }
    setLikedEditions((prev) => ({ ...prev, [editionId]: true }));
    try {
      await fetch(`${API_BASE_URL}/ai/newspaper/${editionId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
    } catch (err) {
      console.warn('Error al enviar like:', err);
    }
  };

  const handleTabSelect = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === TABS.BLOG) {
      setReadingEdition(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10">
      <TabNavigation
        activeTab={activeTab}
        questCount={dailyQuests?.length ?? 0}
        showReturn={Boolean(readingEdition)}
        onTabChange={handleTabSelect}
        onReturn={() => setReadingEdition(null)}
      />

      {activeTab === TABS.QUESTS ? (
        <DailyQuestsBoard quests={dailyQuests} isLoading={loadingQuests} />
      ) : (
        <div className="grid items-start gap-10 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-8">
            <MainArticlesFeed
              readingEdition={readingEdition}
              loadingLatest={loadingLatest}
              activeHero={activeHero}
              allArticles={allArticles}
              hasLiked={hasLiked}
              likes={likes}
              onLike={handleLike}
              onSelectEdition={setReadingEdition}
            />
          </div>

          <SidebarWidgets
            dailyQuests={dailyQuests}
            loadingQuests={loadingQuests}
            allArticles={allArticles}
            onSelectArticle={setReadingEdition}
          />
        </div>
      )}
    </div>
  );
}

export default function NewspaperPage() {
  return (
    <div className="min-h-screen bg-[#07090e] pb-16 pt-24 text-white">
      <NewspaperSection />
    </div>
  );
}

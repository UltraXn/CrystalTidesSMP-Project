import { Link } from 'react-router-dom';
import { BookOpen, Flame, Skull, Heart, Search, ArrowRight, Book } from 'lucide-react';
import type { WikiArticle } from '../../services/wikiService';

interface CategoryCounts {
  readonly bosses: number;
  readonly hostiles: number;
  readonly critters: number;
  readonly guides: number;
}

interface WikiPortalViewProps {
  readonly portalArticles: WikiArticle[];
  readonly portalSearch: string;
  readonly onSearchChange: (query: string) => void;
  readonly categoryCounts: CategoryCounts;
}

interface QuickCategoryCard {
  readonly key: string;
  readonly countText: string;
  readonly title: string;
  readonly description: string;
  readonly colorClass: string;
  readonly icon: React.ReactNode;
}

function getCategoryIcon(category: string): React.ReactNode {
  switch (category) {
    case 'bosses':
      return <Flame size={16} className="text-red-400" />;
    case 'mobs_hostiles':
      return <Skull size={16} className="text-purple-400" />;
    case 'mobs_pacificos':
      return <Heart size={16} className="text-emerald-400" />;
    default:
      return <BookOpen size={16} className="text-blue-400" />;
  }
}

function buildCategoryCards(counts: CategoryCounts): readonly QuickCategoryCard[] {
  return [
    {
      key: 'bosses',
      countText: `${counts.bosses} Jefes`,
      title: 'Jefes Imperiales',
      description: 'Bosses míticos con múltiples fases y botines épicos.',
      colorClass: 'text-red-400',
      icon: <Flame size={20} />,
    },
    {
      key: 'hostiles',
      countText: `${counts.hostiles} Mobs`,
      title: 'Hostiles Míticos',
      description: 'Depredadores y constructos que patrullan el mundo.',
      colorClass: 'text-purple-400',
      icon: <Skull size={20} />,
    },
    {
      key: 'critters',
      countText: `${counts.critters} Especies`,
      title: 'Fauna & Compañeros',
      description: 'Criaturas pacíficas y mascotas domesticables.',
      colorClass: 'text-emerald-400',
      icon: <Heart size={20} />,
    },
    {
      key: 'guides',
      countText: `${counts.guides} Guías`,
      title: 'Guías & Servidor',
      description: 'Comandos esenciales y sistema de KilluCoins.',
      colorClass: 'text-blue-400',
      icon: <Book size={20} />,
    },
  ];
}

interface ArticleRowProps {
  readonly article: WikiArticle;
}

function ArticleRow({ article }: ArticleRowProps) {
  const is3D = Boolean(article.model_3d_url);
  const formattedCategory = article.category.replaceAll('_', ' ');

  return (
    <Link
      to={`/wiki/${article.slug}`}
      className="group flex flex-col justify-between gap-2 rounded-xl px-3 py-3.5 transition-colors hover:bg-neutral-800/60 sm:flex-row sm:items-center"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 transition-colors group-hover:text-white">
          {getCategoryIcon(article.category)}
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-white transition-colors group-hover:text-neutral-200">
            <span>{article.title}</span>
            {is3D && (
              <span className="py-0.2 rounded-sm border border-neutral-700 bg-neutral-800 px-1.5 font-mono text-[9px] font-semibold text-neutral-300">
                3D
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500">
            <span className="capitalize">{formattedCategory}</span>
            {article.boss_mod_name && <span>• {article.boss_mod_name}</span>}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4 text-xs font-semibold text-neutral-400">
        {article.boss_hp && <span className="font-mono text-neutral-300">{article.boss_hp}</span>}
        {article.boss_kc_reward ? (
          <span className="font-mono font-bold text-amber-400">
            +{article.boss_kc_reward} KC
          </span>
        ) : null}
        <ArrowRight
          size={14}
          className="text-neutral-600 transition-colors group-hover:text-neutral-300"
        />
      </div>
    </Link>
  );
}

export default function WikiPortalView({
  portalArticles,
  portalSearch,
  onSearchChange,
  categoryCounts,
}: Readonly<WikiPortalViewProps>) {
  const quickCategories = buildCategoryCards(categoryCounts);

  return (
    <div className="space-y-8">
      {/* Portal Hero Banner (Clean Neutral Dark) */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl backdrop-blur-xl sm:p-12">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-300">
            <BookOpen size={14} />
            <span>Enciclopedia Oficial 1.21+</span>
          </div>
          <h1 className="text-3xl/tight font-black tracking-tight text-white sm:text-5xl">
            Bienvenido a la Wiki de CrystalTides
          </h1>
          <p className="text-sm/relaxed font-normal text-neutral-400 sm:text-base">
            El compendio definitivo para aventureros de CrystalTides SMP. Consulta información
            técnica, modelos 3D de criaturas con sus animaciones, estadísticas de combate, comandos
            esenciales y guías de economía.
          </p>
        </div>
      </div>

      {/* Portal Hub Quick Category Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickCategories.map((card) => (
          <div
            key={card.key}
            className="space-y-2 rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
          >
            <div className={`flex items-center justify-between ${card.colorClass}`}>
              {card.icon}
              <span className="font-mono text-xs font-bold">{card.countText}</span>
            </div>
            <h3 className="text-sm font-bold text-white">{card.title}</h3>
            <p className="text-xs text-neutral-400">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Portal Index Table / Directory */}
      <div className="space-y-6 rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl md:p-8">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-neutral-800 pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Índice Maestro de Artículos
            </h2>
            <p className="mt-0.5 text-xs text-neutral-400">
              Selecciona cualquier entidad o guía de la lista o desde la barra lateral izquierda.
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <input
              type="text"
              aria-label="Buscar artículos o guías por título o mod"
              placeholder="Buscar por título o mod..."
              value={portalSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-2 pl-9 pr-4 text-xs text-white placeholder-neutral-500 transition-colors focus:border-neutral-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="divide-y divide-neutral-800/80">
          {portalArticles.map((article) => (
            <ArticleRow key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}
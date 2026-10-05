import React, { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Skull,
  Heart,
  BookOpen,
  Flame,
  X,
  Layers,
  Box,
} from 'lucide-react';
import { WikiArticle } from '../../services/wikiService';

interface WikiTreeSidebarProps {
  articles: WikiArticle[];
  onSelectArticle?: () => void;
}

interface CategoryGroup {
  id: string;
  title: string;
  icon: React.ElementType;
  iconColor: string;
  articles: WikiArticle[];
}

export default function WikiTreeSidebar({
  articles,
  onSelectArticle,
}: Readonly<WikiTreeSidebarProps>) {
  const { slug } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Group articles by category
  const categories: CategoryGroup[] = useMemo(() => {
    const groups: Record<string, WikiArticle[]> = {};

    articles.forEach((art) => {
      const cat = art.category || 'otros';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(art);
    });

    const categoryDefs = [
      { id: 'bosses', title: 'Jefes Supremos & Bosses', icon: Flame, iconColor: 'text-rose-400' },
      {
        id: 'mobs_hostiles',
        title: 'Mobs Hostiles Míticos',
        icon: Skull,
        iconColor: 'text-purple-400',
      },
      {
        id: 'mobs_pacificos',
        title: 'Fauna & Mascotas',
        icon: Heart,
        iconColor: 'text-emerald-400',
      },
      {
        id: 'guias_generales',
        title: 'Guías & Comandos',
        icon: BookOpen,
        iconColor: 'text-blue-400',
      },
    ];

    const result: CategoryGroup[] = [];

    categoryDefs.forEach((def) => {
      let catArticles: WikiArticle[] = [];
      if (def.id === 'guias_generales') {
        catArticles = articles.filter(
          (a) =>
            a.category === 'guias_generales' ||
            a.category === 'comandos' ||
            a.category === 'guias_items',
        );
      } else {
        catArticles = groups[def.id] || [];
      }

      if (catArticles.length > 0) {
        result.push({
          id: def.id,
          title: def.title,
          icon: def.icon,
          iconColor: def.iconColor,
          articles: catArticles,
        });
      }
    });

    // Catch any remaining categories
    Object.keys(groups).forEach((catKey) => {
      if (
        catKey !== 'bosses' &&
        catKey !== 'mobs_hostiles' &&
        catKey !== 'mobs_pacificos' &&
        catKey !== 'guias_generales' &&
        catKey !== 'comandos' &&
        catKey !== 'guias_items'
      ) {
        result.push({
          id: catKey,
          title: catKey.replaceAll('_', ' ').toUpperCase(),
          icon: Layers,
          iconColor: 'text-neutral-400',
          articles: groups[catKey],
        });
      }
    });

    return result;
  }, [articles]);

  // Filter by search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;

    const term = searchTerm.toLowerCase();
    return categories
      .map((group) => {
        const matchedArticles = group.articles.filter(
          (a) =>
            a.title.toLowerCase().includes(term) ||
            (a.boss_mod_name || '').toLowerCase().includes(term) ||
            (a.content || '').toLowerCase().includes(term),
        );
        return {
          ...group,
          articles: matchedArticles,
        };
      })
      .filter((group) => group.articles.length > 0);
  }, [categories, searchTerm]);

  return (
    <aside
      aria-label="Navegación del compendio Wiki"
      className="sticky top-24 flex max-h-[calc(100vh-120px)] w-full shrink-0 flex-col gap-3.5 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/90 p-4 shadow-xl backdrop-blur-xl lg:w-80"
    >
      {/* Wiki Header in Sidebar */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <Link to="/wiki" className="group flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 transition-colors group-hover:border-neutral-500 group-hover:text-white">
            <BookOpen size={16} aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white transition-colors group-hover:text-neutral-200">
              Compendio Wiki
            </div>
            <div className="text-[11px] font-medium tabular-nums text-neutral-400">
              {articles.length} Entidades & Guías
            </div>
          </div>
        </Link>
      </div>

      {/* Tree Search Box */}
      <div className="relative">
        <Search
          size={14}
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
        />
        <input
          type="text"
          aria-label="Filtrar compendio Wiki"
          placeholder="Filtrar compendio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-2 pl-8 pr-7 text-xs text-white placeholder-neutral-500 transition-colors focus:border-neutral-600 focus:outline-none"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            aria-label="Limpiar filtro"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-neutral-500 hover:text-white"
          >
            <X size={13} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Accordion / Category Tree */}
      <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto pr-1 text-xs">
        {filteredCategories.length === 0 ? (
          <output aria-live="polite" className="block py-8 text-center text-xs text-neutral-500">
            No hay artículos coincidentes
          </output>
        ) : (
          filteredCategories.map((group) => {
            const Icon = group.icon;
            const isCollapsed = !!collapsedCategories[group.id] && !searchTerm;

            return (
              <div key={group.id} className="space-y-1">
                {/* Category Header Button */}
                <button
                  type="button"
                  onClick={() => toggleCategory(group.id)}
                  aria-expanded={!isCollapsed}
                  aria-controls={`wiki-category-${group.id}`}
                  className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-neutral-800/80 bg-neutral-950/60 px-2.5 py-1.5 text-left font-bold text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <Icon size={14} aria-hidden="true" className={group.iconColor} />
                    <span className="text-[11px] uppercase tracking-wider">{group.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <span className="py-0.2 rounded-sm bg-neutral-900 px-1.5 font-mono text-[10px] font-semibold tabular-nums">
                      {group.articles.length}
                    </span>
                    {isCollapsed ? (
                      <ChevronRight size={13} aria-hidden="true" />
                    ) : (
                      <ChevronDown size={13} aria-hidden="true" />
                    )}
                  </div>
                </button>

                {/* Article List */}
                {!isCollapsed && (
                  <div id={`wiki-category-${group.id}`} className="space-y-0.5 pl-1">
                    {group.articles.map((art) => {
                      const isActive = slug === art.slug;
                      const is3D = !!art.model_3d_url;
                      const isBoss = group.id === 'bosses';
                      const isHostile = group.id === 'mobs_hostiles';
                      const isCompanion = group.id === 'mobs_pacificos';

                      // Soft theme styling for active items
                      let activeClasses =
                        'bg-neutral-800 text-white font-semibold border border-neutral-700';
                      let activeTagClasses = 'bg-neutral-700 text-neutral-200 border-neutral-600';

                      if (isBoss) {
                        activeClasses =
                          'bg-rose-950/40 text-rose-100 font-semibold border border-rose-900/60';
                        activeTagClasses = 'bg-rose-900/50 text-rose-200 border-rose-800/60';
                      } else if (isHostile) {
                        activeClasses =
                          'bg-purple-950/40 text-purple-100 font-semibold border border-purple-900/60';
                        activeTagClasses = 'bg-purple-900/50 text-purple-200 border-purple-800/60';
                      } else if (isCompanion) {
                        activeClasses =
                          'bg-emerald-950/40 text-emerald-100 font-semibold border border-emerald-900/60';
                        activeTagClasses =
                          'bg-emerald-900/50 text-emerald-200 border-emerald-800/60';
                      }

                      return (
                        <Link
                          key={art.id}
                          to={`/wiki/${art.slug}`}
                          onClick={onSelectArticle}
                          aria-current={isActive ? 'page' : undefined}
                          className={`group flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] transition-colors ${
                            isActive
                              ? activeClasses
                              : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'
                          }`}
                          title={art.title}
                        >
                          <span className="truncate">{art.title}</span>

                          {is3D && (
                            <span
                              className={`py-0.2 ml-1.5 flex shrink-0 items-center gap-1 rounded-sm border px-1.5 font-mono text-[9px] font-bold ${
                                isActive
                                  ? activeTagClasses
                                  : 'border-neutral-800 bg-neutral-950/60 text-neutral-500 group-hover:text-neutral-300'
                              }`}
                            >
                              <Box size={10} aria-hidden="true" />
                              <span>3D</span>
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Portal Link */}
      <div className="border-t border-neutral-800 pt-2">
        <Link
          to="/wiki"
          className="flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-center text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
        >
          <BookOpen size={14} aria-hidden="true" className="text-neutral-400" />
          <span>Portal Principal de la Wiki</span>
        </Link>
      </div>
    </aside>
  );
}

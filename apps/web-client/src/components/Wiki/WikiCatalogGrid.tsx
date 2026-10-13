import { useState, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { WikiArticle } from '../../services/wikiService';
import {
  CatalogHeroHeader,
  CatalogCategoryTabs,
  CatalogFilterToolbar,
  CatalogItemCard,
  CatalogEmptyState,
  CATEGORY_TABS,
} from './Catalog';

export interface WikiCatalogGridProps {
  articles: WikiArticle[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

function matchesTab(article: WikiArticle, selectedTab: string): boolean {
  if (selectedTab === 'all') return true;
  if (selectedTab === 'guias_generales') {
    return (
      article.category === 'guias_generales' ||
      article.category === 'comandos' ||
      article.category === 'guias_items'
    );
  }
  return article.category === selectedTab;
}

function matchesSearch(article: WikiArticle, term: string): boolean {
  if (!term) return true;
  const lowerTerm = term.toLowerCase();
  const titleMatch = article.title.toLowerCase().includes(lowerTerm);
  const descMatch = (article.content || '').toLowerCase().includes(lowerTerm);
  const modMatch = (article.boss_mod_name ?? '').toLowerCase().includes(lowerTerm);
  const locMatch = (article.boss_location ?? '').toLowerCase().includes(lowerTerm);
  return titleMatch || descMatch || modMatch || locMatch;
}

export default function WikiCatalogGrid({
  articles,
  selectedCategory: initialCategory = 'all',
  onCategoryChange,
}: Readonly<WikiCatalogGridProps>) {
  const [selectedTab, setSelectedTab] = useState<string>(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMod, setSelectedMod] = useState<string>('all');

  const handleTabSelect = (tabId: string) => {
    setSelectedTab(tabId);
    if (onCategoryChange) onCategoryChange(tabId);
  };

  const handleResetFilters = () => {
    setSelectedTab('all');
    setSelectedMod('all');
    setSearchTerm('');
    if (onCategoryChange) onCategoryChange('all');
  };

  // Extract unique mod names
  const mods = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.boss_mod_name) set.add(a.boss_mod_name);
    });
    return Array.from(set);
  }, [articles]);

  const modCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach((a) => {
      if (a.boss_mod_name) {
        counts[a.boss_mod_name] = (counts[a.boss_mod_name] || 0) + 1;
      }
    });
    return counts;
  }, [articles]);

  const total3DCount = useMemo(() => {
    return articles.filter((a) => !!a.model_3d_url).length;
  }, [articles]);

  const getModCount = useCallback((modName: string) => modCounts[modName] || 0, [modCounts]);

  // Filter articles based on tab, search, and mod
  const filteredArticles = useMemo(() => {
    const trimmed = searchTerm.trim();
    return articles.filter((a) => {
      if (!matchesTab(a, selectedTab)) return false;
      if (selectedMod !== 'all' && a.boss_mod_name !== selectedMod) return false;
      return matchesSearch(a, trimmed);
    });
  }, [articles, selectedTab, selectedMod, searchTerm]);

  // Calculate count per tab
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: articles.length };
    CATEGORY_TABS.forEach((t) => {
      if (t.id === 'all') return;
      counts[t.id] = articles.filter((a) => matchesTab(a, t.id)).length;
    });
    return counts;
  }, [articles]);

  const hasActiveFilters =
    searchTerm.trim() !== '' || selectedMod !== 'all' || selectedTab !== 'all';

  return (
    <div className="w-full space-y-10">
      {/* Cinematic Hero Header */}
      <CatalogHeroHeader
        totalCount={articles.length}
        bossesCount={tabCounts.bosses || 0}
        hostilesCount={tabCounts.mobs_hostiles || 0}
        peacefulCount={tabCounts.mobs_pacificos || 0}
      />

      {/* Category Segmented Tabs */}
      <CatalogCategoryTabs
        selectedTab={selectedTab}
        tabCounts={tabCounts}
        onSelectTab={handleTabSelect}
      />

      {/* Filter & Search Bar */}
      <CatalogFilterToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={() => setSearchTerm('')}
        mods={mods}
        selectedTab={selectedTab}
        selectedMod={selectedMod}
        onSelectMod={setSelectedMod}
        total3DCount={total3DCount}
        getModCount={getModCount}
      />

      {/* Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1 text-xs font-medium text-slate-400">
          <span>
            Mostrando <strong className="tabular-nums text-white">{filteredArticles.length}</strong>{' '}
            de <span className="tabular-nums">{articles.length}</span> entradas
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="cursor-pointer font-bold text-teal-400 hover:text-teal-300 hover:underline"
            >
              Limpiar todos los filtros
            </button>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {filteredArticles.length > 0 ? (
            <div
              id="wiki-results-grid"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredArticles.map((article, idx) => (
                <CatalogItemCard key={article.slug} article={article} index={idx} />
              ))}
            </div>
          ) : (
            <CatalogEmptyState onResetFilters={handleResetFilters} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

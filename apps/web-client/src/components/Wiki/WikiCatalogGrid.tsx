import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { m as motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Skull,
  Heart,
  Coins,
  ArrowRight,
  BookOpen,
  Layers,
  X,
  Sparkles,
  MapPin,
  Flame,
} from 'lucide-react';
import { WikiArticle } from '../../services/wikiService';

interface WikiCatalogGridProps {
  articles: WikiArticle[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const CATEGORY_TABS = [
  {
    id: 'all',
    label: 'Todo el Compendio',
    icon: Sparkles,
    color: 'text-teal-400',
    activeBg: 'from-teal-500/20 to-cyan-500/20',
    borderColor: 'border-teal-500/40',
  },
  {
    id: 'bosses',
    label: 'Jefes Supremos',
    icon: Flame,
    color: 'text-red-400',
    activeBg: 'from-red-500/20 to-rose-500/20',
    borderColor: 'border-red-500/40',
  },
  {
    id: 'mobs_hostiles',
    label: 'Mobs Hostiles',
    icon: Skull,
    color: 'text-purple-400',
    activeBg: 'from-purple-500/20 to-indigo-500/20',
    borderColor: 'border-purple-500/40',
  },
  {
    id: 'mobs_pacificos',
    label: 'Fauna & Mascotas',
    icon: Heart,
    color: 'text-emerald-400',
    activeBg: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/40',
  },
  {
    id: 'guias_generales',
    label: 'Guías del Servidor',
    icon: BookOpen,
    color: 'text-amber-400',
    activeBg: 'from-amber-500/20 to-yellow-500/20',
    borderColor: 'border-amber-500/40',
  },
];

export default function WikiCatalogGrid({
  articles,
  selectedCategory: initialCategory = 'all',
  onCategoryChange,
}: WikiCatalogGridProps) {
  const [selectedTab, setSelectedTab] = useState<string>(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMod, setSelectedMod] = useState<string>('all');

  const handleTabSelect = (tabId: string) => {
    setSelectedTab(tabId);
    if (onCategoryChange) onCategoryChange(tabId);
  };

  // Extract unique mod names
  const mods = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.boss_mod_name) set.add(a.boss_mod_name);
    });
    return Array.from(set);
  }, [articles]);

  // Filter articles based on tab, search, and mod
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      if (selectedTab !== 'all') {
        if (selectedTab === 'guias_generales') {
          const isGuide =
            a.category === 'guias_generales' ||
            a.category === 'comandos' ||
            a.category === 'guias_items';
          if (!isGuide) return false;
        } else if (a.category !== selectedTab) {
          return false;
        }
      }

      if (selectedMod !== 'all' && a.boss_mod_name !== selectedMod) {
        return false;
      }

      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const titleMatch = a.title.toLowerCase().includes(term);
        const descMatch = (a.content || '').toLowerCase().includes(term);
        const modMatch = (a.boss_mod_name || '').toLowerCase().includes(term);
        const locMatch = (a.boss_location || '').toLowerCase().includes(term);
        if (!titleMatch && !descMatch && !modMatch && !locMatch) return false;
      }

      return true;
    });
  }, [articles, selectedTab, selectedMod, searchTerm]);

  // Calculate count per tab
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: articles.length };
    CATEGORY_TABS.forEach((t) => {
      if (t.id === 'all') return;
      if (t.id === 'guias_generales') {
        counts[t.id] = articles.filter(
          (a) =>
            a.category === 'guias_generales' ||
            a.category === 'comandos' ||
            a.category === 'guias_items',
        ).length;
      } else {
        counts[t.id] = articles.filter((a) => a.category === t.id).length;
      }
    });
    return counts;
  }, [articles]);

  // Visual theme styling per card
  const getCardVisuals = (article: WikiArticle) => {
    const isBoss = article.category === 'bosses';
    const isHostile = article.category === 'mobs_hostiles';
    const isPeaceful = article.category === 'mobs_pacificos';

    if (isBoss) {
      return {
        bgGradient: 'from-red-950/40 via-slate-900/80 to-black/90',
        border: 'border-red-500/20 hover:border-red-500/60',
        glow: 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.25)]',
        badgeBg: 'bg-red-500/10 text-red-400 border-red-500/30',
        accentColor: 'text-red-400',
        btnClass:
          'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30 group-hover:border-red-500/60',
        tag: 'JEFE SUPREMO',
        icon: Flame,
      };
    }
    if (isHostile) {
      return {
        bgGradient: 'from-purple-950/40 via-slate-900/80 to-black/90',
        border: 'border-purple-500/20 hover:border-purple-500/60',
        glow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]',
        badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        accentColor: 'text-purple-400',
        btnClass:
          'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/30 group-hover:border-purple-500/60',
        tag: 'MOB HOSTIL',
        icon: Skull,
      };
    }
    if (isPeaceful) {
      return {
        bgGradient: 'from-emerald-950/40 via-slate-900/80 to-black/90',
        border: 'border-emerald-500/20 hover:border-emerald-500/60',
        glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]',
        badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        accentColor: 'text-emerald-400',
        btnClass:
          'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30 group-hover:border-emerald-500/60',
        tag: 'DOMESTICABLE',
        icon: Heart,
      };
    }
    return {
      bgGradient: 'from-teal-950/40 via-slate-900/80 to-black/90',
      border: 'border-teal-500/20 hover:border-teal-500/60',
      glow: 'group-hover:shadow-[0_0_30px_rgba(20,184,166,0.25)]',
      badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
      accentColor: 'text-teal-400',
      btnClass:
        'bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border-teal-500/30 group-hover:border-teal-500/60',
      tag: 'GUÍA OFICIAL',
      icon: BookOpen,
    };
  };

  return (
    <div className="w-full space-y-10">
      {/* Cinematic Hero Header */}
      <div className="bg-linear-to-br relative overflow-hidden rounded-[2.5rem] border border-teal-500/30 from-slate-900/90 via-slate-950/95 to-[#05080c] p-8 shadow-[0_0_50px_rgba(20,184,166,0.1)] backdrop-blur-2xl sm:p-12">
        {/* Background Aura Glows */}
        <div className="pointer-events-none absolute right-1/4 top-0 -mt-20 h-96 w-96 rounded-full bg-teal-500/10 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 -mb-20 h-80 w-80 rounded-full bg-purple-500/10 blur-[90px]" />
        <div className="bg-size-[24px_24px] pointer-events-none absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] opacity-10" />

        <div className="relative z-10 max-w-4xl space-y-5">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-teal-300 shadow-inner">
            <Sparkles size={14} className="animate-spin-slow text-teal-400" />
            <span>Compendio Enciclopédico & Bestiario 3D</span>
          </div>

          <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl">
            Bestiario & Guías de <br className="hidden sm:block" />
            <span className="bg-linear-to-r from-teal-300 via-cyan-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
              CrystalTides SMP
            </span>
          </h1>

          <p className="max-w-2xl text-base font-normal leading-relaxed text-slate-300 sm:text-lg">
            Sumérgete en la enciclopedia oficial del reino. Inspecciona modelos 3D interactivos,
            estadísticas de combate en tiempo real, tablas de botín y manuales del servidor.
          </p>

          {/* Metric Quick Badges */}
          <div className="flex flex-wrap gap-4 border-t border-white/10 pt-4 text-xs font-bold text-slate-300">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400" aria-hidden="true" />
              <span className="tabular-nums">{articles.length} Entidades Totales</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-1.5 text-red-300">
              <Flame size={14} aria-hidden="true" className="text-red-400" />
              <span className="tabular-nums">{tabCounts.bosses || 0} Jefes Supremos</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-3.5 py-1.5 text-purple-300">
              <Skull size={14} aria-hidden="true" className="text-purple-400" />
              <span className="tabular-nums">{tabCounts.mobs_hostiles || 0} Hostiles Míticos</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-emerald-300">
              <Heart size={14} aria-hidden="true" className="text-emerald-400" />
              <span className="tabular-nums">{tabCounts.mobs_pacificos || 0} Mascotas & Fauna</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Segmented Tabs */}
      <div
        role="tablist"
        aria-label="Filtrar por categoría"
        className="scrollbar-none flex items-center gap-2.5 overflow-x-auto pb-2"
      >
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedTab === tab.id;
          const count = tabCounts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls="wiki-results-grid"
              onClick={() => handleTabSelect(tab.id)}
              className={`group relative flex shrink-0 cursor-pointer items-center gap-2.5 rounded-2xl border px-5 py-3 text-xs font-black transition-all duration-300 sm:text-sm ${
                isSelected
                  ? `bg-linear-to-r ${tab.activeBg} ${tab.color} ${tab.borderColor} scale-102 shadow-[0_0_20px_rgba(20,184,166,0.15)]`
                  : 'border-white/10 bg-slate-900/60 text-slate-400 hover:border-white/20 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon
                size={16}
                aria-hidden="true"
                className={`transition-transform group-hover:scale-110 ${isSelected ? tab.color : 'text-slate-500 group-hover:text-white'}`}
              />
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-black tabular-nums ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-slate-500 group-hover:text-slate-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg backdrop-blur-xl md:flex-row md:items-center">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search
            size={18}
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            aria-label="Buscar por nombre, mod, hábitat, ataque o recompensa"
            placeholder="Buscar por nombre, mod, hábitat, ataque o recompensa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/50 py-3 pl-11 pr-10 text-sm font-medium text-white placeholder-slate-500 transition-all focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-slate-400 hover:text-white"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Mod Chips */}
        {mods.length > 0 && selectedTab !== 'guias_generales' && (
          <div
            role="group"
            aria-label="Filtrar por mod"
            className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0"
          >
            <span className="mr-1 shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Mod:
            </span>
            <button
              type="button"
              aria-pressed={selectedMod === 'all'}
              onClick={() => setSelectedMod('all')}
              className={`shrink-0 cursor-pointer rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                selectedMod === 'all'
                  ? 'border-teal-400 bg-teal-500 font-black text-slate-950 shadow-md shadow-teal-500/20'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              Todos ({articles.filter((a) => !!a.model_3d_url).length})
            </button>
            {mods.map((modName) => {
              const modCount = articles.filter((a) => a.boss_mod_name === modName).length;
              return (
                <button
                  key={modName}
                  type="button"
                  aria-pressed={selectedMod === modName}
                  onClick={() => setSelectedMod(modName)}
                  className={`shrink-0 cursor-pointer rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                    selectedMod === modName
                      ? 'border-teal-400 bg-teal-500 font-black text-slate-950 shadow-md shadow-teal-500/20'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {modName} ({modCount})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1 text-xs font-medium text-slate-400">
          <span>
            Mostrando <strong className="tabular-nums text-white">{filteredArticles.length}</strong>{' '}
            de <span className="tabular-nums">{articles.length}</span> entradas
          </span>
          {(searchTerm || selectedMod !== 'all' || selectedTab !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSelectedTab('all');
                setSelectedMod('all');
                setSearchTerm('');
              }}
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
              {filteredArticles.map((article, idx) => {
                const is3D = !!article.model_3d_url;
                const visuals = getCardVisuals(article);
                const TagIcon = visuals.icon;

                return (
                  <motion.div
                    key={article.slug}
                    layout
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.3) }}
                  >
                    <Link
                      to={`/wiki/${article.slug}`}
                      className={`bg-linear-to-b group relative flex h-full flex-col justify-between rounded-3xl ${visuals.bgGradient} border ${visuals.border} p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 ${visuals.glow}`}
                    >
                      {/* Card Top Pill Row */}
                      <div>
                        <div className="mb-4 flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${visuals.badgeBg}`}
                          >
                            <TagIcon size={12} aria-hidden="true" />
                            <span>{visuals.tag}</span>
                          </span>

                          {is3D ? (
                            <span className="inline-flex items-center gap-1 rounded-lg border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[11px] font-black text-teal-300 shadow-inner">
                              <Sparkles size={11} aria-hidden="true" className="text-teal-400" /> 3D
                            </span>
                          ) : (
                            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-400">
                              Guía
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="mb-1.5 line-clamp-2 text-lg font-black leading-snug tracking-tight text-white transition-colors group-hover:text-teal-300">
                          {article.title}
                        </h3>

                        {/* Mod Name */}
                        {article.boss_mod_name && (
                          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                            <Layers size={13} aria-hidden="true" className="text-teal-500" />
                            <span>{article.boss_mod_name}</span>
                          </div>
                        )}

                        {/* Combat Dashboard Stats */}
                        {is3D && (
                          <div className="my-4 space-y-2 rounded-2xl border border-white/5 bg-black/40 p-3 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 font-medium text-slate-400">
                                <Heart size={13} aria-hidden="true" className="text-red-400" />{' '}
                                Salud
                              </span>
                              <span className="font-mono font-black tabular-nums text-red-300">
                                {article.boss_hp || '100 HP'}
                              </span>
                            </div>

                            {article.boss_location && (
                              <div className="flex items-center justify-between border-t border-white/5 pt-1.5 text-[11px]">
                                <span className="flex items-center gap-1.5 truncate font-medium text-slate-400">
                                  <MapPin
                                    size={12}
                                    aria-hidden="true"
                                    className="shrink-0 text-cyan-400"
                                  />{' '}
                                  Hábitat
                                </span>
                                <span className="max-w-32.5 truncate text-right font-semibold text-slate-300">
                                  {article.boss_location.split('/')[0].trim()}
                                </span>
                              </div>
                            )}

                            {article.boss_kc_reward ? (
                              <div className="flex items-center justify-between border-t border-white/5 pt-1.5 text-[11px]">
                                <span className="flex items-center gap-1.5 font-medium text-slate-400">
                                  <Coins size={12} aria-hidden="true" className="text-amber-400" />{' '}
                                  Botín
                                </span>
                                <span className="font-mono font-black tabular-nums text-amber-300">
                                  +{article.boss_kc_reward} KC
                                </span>
                              </div>
                            ) : null}
                          </div>
                        )}

                        {/* Description preview */}
                        <p className="line-clamp-2 text-xs font-normal leading-relaxed text-slate-400">
                          {article.content?.replace(/#{1,6}\s/g, '').slice(0, 140) ||
                            'Sin descripción disponible.'}
                        </p>
                      </div>

                      {/* Action Button */}
                      <div className="mt-5 border-t border-white/10 pt-3">
                        <div
                          className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-xs font-black transition-all ${visuals.btnClass}`}
                        >
                          <span>{is3D ? 'INSPECCIONAR EN 3D' : 'LEER GUÍA COMPLETA'}</span>
                          <ArrowRight
                            size={14}
                            aria-hidden="true"
                            className="transform transition-transform group-hover:translate-x-1.5"
                          />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <output
              aria-live="polite"
              className="block flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/40 p-8 py-20 text-center backdrop-blur-xl"
            >
              <Search size={52} aria-hidden="true" className="mb-4 text-slate-600" />
              <h3 className="mb-2 text-xl font-bold text-white">
                No se encontraron criaturas o guías
              </h3>
              <p className="mb-6 max-w-sm text-xs text-slate-400">
                Prueba buscando con otros términos o seleccionando otra categoría en los filtros
                superiores.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedTab('all');
                  setSelectedMod('all');
                  setSearchTerm('');
                }}
                className="cursor-pointer rounded-xl bg-teal-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-teal-500/20 transition-colors hover:bg-teal-400"
              >
                Restablecer Filtros
              </button>
            </output>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

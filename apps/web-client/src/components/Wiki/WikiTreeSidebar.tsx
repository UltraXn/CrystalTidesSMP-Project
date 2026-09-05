import React, { useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { 
    Search, ChevronDown, ChevronRight, Skull, Heart, 
    BookOpen, Flame, X, Layers, Box
} from 'lucide-react'
import { WikiArticle } from '../../services/wikiService'

interface WikiTreeSidebarProps {
    articles: WikiArticle[]
    onSelectArticle?: () => void
}

interface CategoryGroup {
    id: string
    title: string
    icon: React.ElementType
    iconColor: string
    articles: WikiArticle[]
}

export default function WikiTreeSidebar({ articles, onSelectArticle }: WikiTreeSidebarProps) {
    const { slug } = useParams()
    const [searchTerm, setSearchTerm] = useState('')
    const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({})

    const toggleCategory = (categoryId: string) => {
        setCollapsedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }))
    }

    // Group articles by category
    const categories: CategoryGroup[] = useMemo(() => {
        const groups: Record<string, WikiArticle[]> = {}

        articles.forEach(art => {
            const cat = art.category || 'otros'
            if (!groups[cat]) groups[cat] = []
            groups[cat].push(art)
        })

        const categoryDefs = [
            { id: 'bosses', title: 'Jefes Supremos & Bosses', icon: Flame, iconColor: 'text-rose-400' },
            { id: 'mobs_hostiles', title: 'Mobs Hostiles Míticos', icon: Skull, iconColor: 'text-purple-400' },
            { id: 'mobs_pacificos', title: 'Fauna & Mascotas', icon: Heart, iconColor: 'text-emerald-400' },
            { id: 'guias_generales', title: 'Guías & Comandos', icon: BookOpen, iconColor: 'text-blue-400' }
        ]

        const result: CategoryGroup[] = []

        categoryDefs.forEach(def => {
            let catArticles: WikiArticle[] = []
            if (def.id === 'guias_generales') {
                catArticles = articles.filter(a => a.category === 'guias_generales' || a.category === 'comandos' || a.category === 'guias_items')
            } else {
                catArticles = groups[def.id] || []
            }

            if (catArticles.length > 0) {
                result.push({
                    id: def.id,
                    title: def.title,
                    icon: def.icon,
                    iconColor: def.iconColor,
                    articles: catArticles
                })
            }
        })

        // Catch any remaining categories
        Object.keys(groups).forEach(catKey => {
            if (catKey !== 'bosses' && catKey !== 'mobs_hostiles' && catKey !== 'mobs_pacificos' && catKey !== 'guias_generales' && catKey !== 'comandos' && catKey !== 'guias_items') {
                result.push({
                    id: catKey,
                    title: catKey.replace(/_/g, ' ').toUpperCase(),
                    icon: Layers,
                    iconColor: 'text-neutral-400',
                    articles: groups[catKey]
                })
            }
        })

        return result
    }, [articles])

    // Filter by search term
    const filteredCategories = useMemo(() => {
        if (!searchTerm.trim()) return categories

        const term = searchTerm.toLowerCase()
        return categories.map(group => {
            const matchedArticles = group.articles.filter(a => 
                a.title.toLowerCase().includes(term) ||
                (a.boss_mod_name || '').toLowerCase().includes(term) ||
                (a.content || '').toLowerCase().includes(term)
            )
            return {
                ...group,
                articles: matchedArticles
            }
        }).filter(group => group.articles.length > 0)
    }, [categories, searchTerm])

    return (
        <aside aria-label="Navegación del compendio Wiki" className="w-full lg:w-80 shrink-0 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-3.5 backdrop-blur-xl shadow-xl sticky top-24 max-h-[calc(100vh-120px)] overflow-hidden">
            {/* Wiki Header in Sidebar */}
            <div className="pb-3 border-b border-neutral-800 flex items-center justify-between">
                <Link to="/wiki" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 group-hover:text-white group-hover:border-neutral-500 transition-colors">
                        <BookOpen size={16} aria-hidden="true" />
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-white group-hover:text-neutral-200 transition-colors">
                            Compendio Wiki
                        </div>
                        <div className="text-[11px] text-neutral-400 font-medium tabular-nums">
                            {articles.length} Entidades & Guías
                        </div>
                    </div>
                </Link>
            </div>

            {/* Tree Search Box */}
            <div className="relative">
                <Search size={14} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                    type="text"
                    aria-label="Filtrar compendio Wiki"
                    placeholder="Filtrar compendio..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-7 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                />
                {searchTerm && (
                    <button 
                        type="button"
                        onClick={() => setSearchTerm('')}
                        aria-label="Limpiar filtro"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer"
                    >
                        <X size={13} aria-hidden="true" />
                    </button>
                )}
            </div>

            {/* Accordion / Category Tree */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar text-xs">
                {filteredCategories.length === 0 ? (
                    <div role="status" aria-live="polite" className="text-center py-8 text-neutral-500 text-xs">
                        No hay artículos coincidentes
                    </div>
                ) : (
                    filteredCategories.map(group => {
                        const Icon = group.icon
                        const isCollapsed = !!collapsedCategories[group.id] && !searchTerm

                        return (
                            <div key={group.id} className="space-y-1">
                                {/* Category Header Button */}
                                <button
                                    type="button"
                                    onClick={() => toggleCategory(group.id)}
                                    aria-expanded={!isCollapsed}
                                    aria-controls={`wiki-category-${group.id}`}
                                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-neutral-950/60 hover:bg-neutral-800 text-left font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer border border-neutral-800/80"
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon size={14} aria-hidden="true" className={group.iconColor} />
                                        <span className="text-[11px] uppercase tracking-wider">{group.title}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-neutral-500">
                                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-900 font-mono font-semibold tabular-nums">
                                            {group.articles.length}
                                        </span>
                                        {isCollapsed ? <ChevronRight size={13} aria-hidden="true" /> : <ChevronDown size={13} aria-hidden="true" />}
                                    </div>
                                </button>

                                {/* Article List */}
                                {!isCollapsed && (
                                    <div id={`wiki-category-${group.id}`} className="space-y-0.5 pl-1">
                                        {group.articles.map(art => {
                                            const isActive = slug === art.slug
                                            const is3D = !!art.model_3d_url
                                            const isBoss = group.id === 'bosses'
                                            const isHostile = group.id === 'mobs_hostiles'
                                            const isCompanion = group.id === 'mobs_pacificos'

                                            // Soft theme styling for active items
                                            let activeClasses = 'bg-neutral-800 text-white font-semibold border border-neutral-700'
                                            let activeTagClasses = 'bg-neutral-700 text-neutral-200 border-neutral-600'

                                            if (isBoss) {
                                                activeClasses = 'bg-rose-950/40 text-rose-100 font-semibold border border-rose-900/60'
                                                activeTagClasses = 'bg-rose-900/50 text-rose-200 border-rose-800/60'
                                            } else if (isHostile) {
                                                activeClasses = 'bg-purple-950/40 text-purple-100 font-semibold border border-purple-900/60'
                                                activeTagClasses = 'bg-purple-900/50 text-purple-200 border-purple-800/60'
                                            } else if (isCompanion) {
                                                activeClasses = 'bg-emerald-950/40 text-emerald-100 font-semibold border border-emerald-900/60'
                                                activeTagClasses = 'bg-emerald-900/50 text-emerald-200 border-emerald-800/60'
                                            }

                                            return (
                                                <Link
                                                    key={art.id}
                                                    to={`/wiki/${art.slug}`}
                                                    onClick={onSelectArticle}
                                                    aria-current={isActive ? 'page' : undefined}
                                                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-[11px] ${
                                                        isActive
                                                            ? activeClasses
                                                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                                                    }`}
                                                    title={art.title}
                                                >
                                                    <span className="truncate">
                                                        {art.title}
                                                    </span>

                                                    {is3D && (
                                                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold shrink-0 ml-1.5 flex items-center gap-1 border ${
                                                            isActive
                                                                ? activeTagClasses
                                                                : 'bg-neutral-950/60 text-neutral-500 border-neutral-800 group-hover:text-neutral-300'
                                                        }`}>
                                                            <Box size={10} aria-hidden="true" />
                                                            <span>3D</span>
                                                        </span>
                                                    )}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {/* Portal Link */}
            <div className="pt-2 border-t border-neutral-800">
                <Link
                    to="/wiki"
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-semibold transition-colors text-center"
                >
                    <BookOpen size={14} aria-hidden="true" className="text-neutral-400" />
                    <span>Portal Principal de la Wiki</span>
                </Link>
            </div>
        </aside>
    )
}

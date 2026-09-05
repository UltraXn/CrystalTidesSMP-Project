import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Plus, Search, Filter, X, Box, Layers, RotateCcw } from "lucide-react"
import { WikiArticle, WIKI_CATEGORIES } from "../../services/wikiService"
import WikiArticleList from "./Wiki/WikiArticleList"
import WikiArticleFormModal from "./Wiki/WikiArticleFormModal"
import ConfirmationModal from "../UI/ConfirmationModal"
import { 
    useWikiArticles, 
    useCreateWikiArticle, 
    useUpdateWikiArticle, 
    useDeleteWikiArticle 
} from "../../hooks/useAdminData"

interface WikiManagerProps {
    mockArticles?: WikiArticle[];
}

export default function WikiManager({ mockArticles }: WikiManagerProps = {}) {
    const { t } = useTranslation()
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedMod, setSelectedMod] = useState<string>("all")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [has3dOnly, setHas3dOnly] = useState<boolean>(false)

    // TanStack Query Hooks
    const { data: fetchArticlesData = [], isLoading: loading } = useWikiArticles();
    const createMutation = useCreateWikiArticle();
    const updateMutation = useUpdateWikiArticle();
    const deleteMutation = useDeleteWikiArticle();

    const articles = mockArticles || (Array.isArray(fetchArticlesData) ? fetchArticlesData : (fetchArticlesData as { data?: WikiArticle[] })?.data || []);

    // Form State
    const [isEditing, setIsEditing] = useState(false)
    const [currentArticle, setCurrentArticle] = useState<Partial<WikiArticle> | null>(null)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [deleteArticleId, setDeleteArticleId] = useState<number | null>(null)

    // Extract unique Mods list from articles + saved custom mods
    const savedCustomMods = JSON.parse(localStorage.getItem('crystaltides_custom_mods') || '[]');
    const availableMods = Array.from(
        new Set([
            ...articles
                .map((a: WikiArticle) => a.boss_mod_name)
                .filter((mod): mod is string => Boolean(mod?.trim())),
            ...savedCustomMods
        ])
    ).sort((a, b) => a.localeCompare(b));

    const handleSave = async (formData: Partial<WikiArticle>) => {
        if (!formData.title || !formData.slug || !formData.content) return

        const payload = {
            ...formData,
            title: formData.title,
            slug: formData.slug,
            content: formData.content,
            category: formData.category || 'general',
            description: formData.description || formData.content.substring(0, 100),
        } as WikiArticle & { description: string };

        if (editingId) {
            updateMutation.mutate({ id: editingId, payload }, {
                onSuccess: () => setIsEditing(false)
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => setIsEditing(false)
            });
        }
    }

    const handleDeleteClick = (id: number) => {
        setDeleteArticleId(id);
    };

    const handleConfirmDelete = () => {
        if (!deleteArticleId) return;
        deleteMutation.mutate(deleteArticleId, {
            onSuccess: () => {
                setDeleteArticleId(null);
            },
            onError: (err) => {
                alert(err instanceof Error ? err.message : 'Error al eliminar el artículo');
            }
        });
    };

    const startEdit = (article: WikiArticle) => {
        setCurrentArticle(article)
        setEditingId(article.id)
        setIsEditing(true)
    }

    const startNew = () => {
        setCurrentArticle(null)
        setEditingId(null)
        setIsEditing(true)
    }

    const resetFilters = () => {
        setSearchTerm("");
        setSelectedMod("all");
        setSelectedCategory("all");
        setHas3dOnly(false);
    };

    const filteredArticles = articles.filter((a: WikiArticle) => {
        const matchesSearch = 
            a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            a.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (a.boss_mod_name || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesMod = selectedMod === "all" || a.boss_mod_name === selectedMod;
        const matchesCategory = selectedCategory === "all" || a.category === selectedCategory;
        const matches3d = !has3dOnly || Boolean(a.model_3d_url);

        return matchesSearch && matchesMod && matchesCategory && matches3d;
    });

    const isFiltered = searchTerm !== "" || selectedMod !== "all" || selectedCategory !== "all" || has3dOnly;

    return (
        <div className="wiki-manager">
            {/* Header & Main Actions */}
            <div className="manager-header wiki-header" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className="search-box-wrapper" style={{ flex: 1, minWidth: '280px' }}>
                        <div className="search-box">
                            <Search className="search-icon" size={18} aria-hidden="true" />
                            <input 
                                aria-label={t('admin.wiki.search_placeholder', 'Buscar por título, slug o mod')} 
                                type="search" 
                                placeholder={t('admin.wiki.search_placeholder', 'Buscar por título, slug o mod...')} 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="button" className="btn-primary" onClick={startNew} style={{ whiteSpace: 'nowrap' }}>
                        <Plus size={16} aria-hidden="true" /> {t('admin.wiki.create_btn')}
                    </button>
                </div>

                {/* Mod & Category Filters Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0ea5e9', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <Filter size={14} /> Filtros:
                    </div>

                    {/* Mod Filter Selector & Management Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Layers size={13} style={{ color: '#aaa' }} />
                        <select
                            value={selectedMod}
                            onChange={(e) => setSelectedMod(e.target.value)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '6px',
                                padding: '0.4rem 0.7rem',
                                color: '#fff',
                                fontSize: '0.8rem',
                                outline: 'none'
                            }}
                        >
                            <option value="all" style={{ background: '#111' }}>📦 Todos los Mods ({availableMods.length})</option>
                            {availableMods.map((modName) => (
                                <option key={modName} value={modName} style={{ background: '#111' }}>
                                    {modName}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => {
                                const newMod = prompt("Escribe el nombre del nuevo Mod para registrar como filtro en el servidor (ej. Twilight Forest, Alex's Mobs, Create Mod):");
                                if (newMod?.trim()) {
                                    const modName = newMod.trim();
                                    const saved = JSON.parse(localStorage.getItem('crystaltides_custom_mods') || '[]');
                                    if (!saved.includes(modName)) {
                                        const updated = [...saved, modName];
                                        localStorage.setItem('crystaltides_custom_mods', JSON.stringify(updated));
                                    }
                                    setSelectedMod(modName);
                                }
                            }}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.4rem 0.6rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                background: 'rgba(14, 165, 233, 0.15)',
                                border: '1px solid rgba(14, 165, 233, 0.3)',
                                color: '#38bdf8',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                            title="Agregar un nuevo filtro de Mod al servidor"
                        >
                            <Plus size={13} /> + Mod
                        </button>
                    </div>

                    {/* Category Filter Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '6px',
                                padding: '0.4rem 0.7rem',
                                color: '#fff',
                                fontSize: '0.8rem',
                                outline: 'none'
                            }}
                        >
                            <option value="all" style={{ background: '#111' }}>🏷️ Todas las Categorías</option>
                            {WIKI_CATEGORIES.map((cat) => (
                                <option key={cat.id} value={cat.id} style={{ background: '#111' }}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 3D Model Toggle Filter */}
                    <button
                        type="button"
                        onClick={() => setHas3dOnly(!has3dOnly)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.4rem 0.7rem',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 'bold',
                            border: '1px solid',
                            borderColor: has3dOnly ? '#ef4444' : 'rgba(255,255,255,0.15)',
                            background: has3dOnly ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                            color: has3dOnly ? '#fca5a5' : '#aaa',
                            cursor: 'pointer'
                        }}
                    >
                        <Box size={13} /> Solo Renders 3D
                    </button>

                    {/* Reset Filters Button */}
                    {isFiltered && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.4rem 0.6rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#ef4444',
                                cursor: 'pointer',
                                marginLeft: 'auto'
                            }}
                            title="Limpiar todos los filtros"
                        >
                            <RotateCcw size={12} /> Limpiar ({filteredArticles.length}/{articles.length})
                        </button>
                    )}
                </div>

                {/* Filter Badges Pills */}
                {isFiltered && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {selectedMod !== "all" && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(14, 165, 233, 0.15)', border: '1px solid rgba(14, 165, 233, 0.3)', color: '#38bdf8', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                Mod: {selectedMod}
                                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedMod("all")} />
                            </span>
                        )}
                        {selectedCategory !== "all" && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#c084fc', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                Categoría: {WIKI_CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory}
                                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory("all")} />
                            </span>
                        )}
                        {has3dOnly && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                Solo 3D
                                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setHas3dOnly(false)} />
                            </span>
                        )}
                    </div>
                )}
            </div>

            <WikiArticleList 
                articles={filteredArticles}
                loading={loading}
                onEdit={startEdit}
                onDelete={handleDeleteClick}
            />

            <WikiArticleFormModal 
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                onSave={handleSave}
                initialData={currentArticle}
                isEditing={!!editingId}
                saving={createMutation.isPending || updateMutation.isPending}
            />

            <ConfirmationModal
                isOpen={!!deleteArticleId}
                onClose={() => setDeleteArticleId(null)}
                onConfirm={handleConfirmDelete}
                title="Eliminar Artículo de la Wiki"
                message="¿Estás seguro de que deseas eliminar este artículo permanentemente? Esta acción removerá la entidad y sus datos de Supabase."
                confirmText="Eliminar Artículo"
                cancelText="Cancelar"
                isDanger={true}
                isLoading={deleteMutation.isPending}
            />
        </div>
    )
}

import { useState, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { FaPlus, FaSearch } from "react-icons/fa"
import { getWikiArticles, createWikiArticle, updateWikiArticle, deleteWikiArticle, WikiArticle } from "../../services/wikiService"
import WikiArticleList from "./Wiki/WikiArticleList"
import WikiArticleFormModal from "./Wiki/WikiArticleFormModal"

interface WikiManagerProps {
    mockArticles?: WikiArticle[];
}

export default function WikiManager({ mockArticles }: WikiManagerProps = {}) {
    const { t } = useTranslation()
    const [articles, setArticles] = useState<WikiArticle[]>(mockArticles || [])
    const [loading, setLoading] = useState(!mockArticles)
    const [searchTerm, setSearchTerm] = useState("")

    // Form State
    const [isEditing, setIsEditing] = useState(false)
    const [currentArticle, setCurrentArticle] = useState<Partial<WikiArticle> | null>(null)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [saving, setSaving] = useState(false)

    const fetchArticles = useCallback(async () => {
        if (mockArticles) return;
        setLoading(true)
        try {
            const data = await getWikiArticles()
            setArticles(data)
        } catch (error) {
            console.error("Error loading wiki articles:", error)
        } finally {
            setLoading(false)
        }
    }, [mockArticles])

    useEffect(() => {
        fetchArticles()
    }, [fetchArticles])

    const handleSave = async (formData: Partial<WikiArticle>) => {
        if (!formData.title || !formData.slug || !formData.content) return

        setSaving(true)
        try {
            if (editingId) {
                await updateWikiArticle(editingId, formData)
            } else {
                await createWikiArticle(formData)
            }
            setIsEditing(false)
            fetchArticles()
        } catch (error) {
            console.error("Error saving article:", error)
            alert("No se pudo guardar el artículo. Revisa el slug (debe ser único).")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm(t('admin.wiki.delete_confirm'))) return
        try {
            await deleteWikiArticle(id)
            fetchArticles()
        } catch (error) {
            console.error("Error deleting article:", error)
        }
    }

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

    const filteredArticles = articles.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="wiki-manager">
             <div className="manager-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="search-box" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '8px', 
                        border: '1px solid rgba(255, 255, 255, 0.1)' 
                    }}>
                        <FaSearch className="text-white/20" style={{ color: 'rgba(255,255,255,0.4)' }} />
                        <input 
                            type="text" 
                            placeholder={t('admin.wiki.search_placeholder')} 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ background: 'none', border: 'none', color: '#fff', outline: 'none' }}
                        />
                    </div>
                </div>
                <button className="btn-primary" onClick={startNew}>
                    <FaPlus /> {t('admin.wiki.create_btn')}
                </button>
            </div>

            <WikiArticleList 
                articles={filteredArticles}
                loading={loading}
                onEdit={startEdit}
                onDelete={handleDelete}
            />

            <WikiArticleFormModal 
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                onSave={handleSave}
                initialData={currentArticle}
                isEditing={!!editingId}
                saving={saving}
            />
        </div>
    )
}

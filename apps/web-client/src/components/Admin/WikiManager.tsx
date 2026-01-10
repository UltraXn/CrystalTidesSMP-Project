import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Plus, Search } from "lucide-react"
import { WikiArticle } from "../../services/wikiService"
import WikiArticleList from "./Wiki/WikiArticleList"
import WikiArticleFormModal from "./Wiki/WikiArticleFormModal"
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

    // TanStack Query Hooks
    const { data: fetchArticlesData = [], isLoading: loading } = useWikiArticles();
    const createMutation = useCreateWikiArticle();
    const updateMutation = useUpdateWikiArticle();
    const deleteMutation = useDeleteWikiArticle();

    const articles = mockArticles || fetchArticlesData;

    // Form State
    const [isEditing, setIsEditing] = useState(false)
    const [currentArticle, setCurrentArticle] = useState<Partial<WikiArticle> | null>(null)
    const [editingId, setEditingId] = useState<number | null>(null)

    const handleSave = async (formData: Partial<WikiArticle>) => {
        if (!formData.title || !formData.slug || !formData.content) return

        if (editingId) {
            updateMutation.mutate({ id: editingId, payload: formData }, {
                onSuccess: () => setIsEditing(false)
            });
        } else {
            createMutation.mutate(formData, {
                onSuccess: () => setIsEditing(false)
            });
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm(t('admin.wiki.delete_confirm'))) return
        deleteMutation.mutate(id);
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

    const filteredArticles = articles.filter((a: WikiArticle) => 
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
                        <Search className="text-white/20" style={{ color: 'rgba(255,255,255,0.4)' }} />
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
                    <Plus /> {t('admin.wiki.create_btn')}
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
                saving={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    )
}

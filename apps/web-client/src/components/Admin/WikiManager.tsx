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

import { useHasPermission } from "../../utils/rolePermissions"
import PermissionDenied from "./PermissionDenied"

interface WikiManagerProps {
    mockArticles?: WikiArticle[];
}

export default function WikiManager({ mockArticles }: WikiManagerProps = {}) {
    // RBAC
    const hasPermission = useHasPermission('MANAGE_WIKI');

    const { t } = useTranslation()
    const [searchTerm, setSearchTerm] = useState("")

    // TanStack Query Hooks
    const { data: fetchArticlesData = [], isLoading: loading } = useWikiArticles();
    const createMutation = useCreateWikiArticle();
    const updateMutation = useUpdateWikiArticle();
    const deleteMutation = useDeleteWikiArticle();

    const articles = mockArticles || (Array.isArray(fetchArticlesData) ? fetchArticlesData : []);

    // Form State
    const [isEditing, setIsEditing] = useState(false)
    const [currentArticle, setCurrentArticle] = useState<Partial<WikiArticle> | null>(null)
    const [editingId, setEditingId] = useState<number | null>(null)

    const handleSave = async (formData: Partial<WikiArticle>) => {
        if (!formData.title || !formData.slug || !formData.content) return

        // Ensure required fields for API
        const payload = {
            ...formData,
            title: formData.title, // TS knows these are defined due to early return check
            slug: formData.slug,
            content: formData.content,
            category: formData.category || 'general',
            description: formData.description || formData.content.substring(0, 100), // Priority: Explicit > Auto-generated
        } as WikiArticle & { description: string }; // Assert strict description to satisfy WikiPayload

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

    if (!hasPermission) {
        return (
            <PermissionDenied 
                message="No tienes permiso para gestionar la wiki."
                requiredRole="helper"
            />
        );
    }

    return (
        <div className="wiki-manager">
            <div className="manager-header wiki-header">
                <div className="search-box-wrapper">
                    <div className="search-box">
                        <Search className="search-icon" size={18} />
                        <input 
                            type="text" 
                            placeholder={t('admin.wiki.search_placeholder')} 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
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

import { useState } from "react"
import { Plus, Edit, Trash2, Search, TriangleAlert } from "lucide-react"
import { useTranslation } from "react-i18next"
import Loader from "../UI/Loader"
import NewsForm from "./NewsForm"
import { NewsFormValues } from "../../schemas/news"
import { User } from "@supabase/supabase-js";
import { 
    useAdminNews, 
    useCreateNews, 
    useUpdateNews, 
    useDeleteNews 
} from "../../hooks/useAdminData"

interface NewsPost extends NewsFormValues {
    id?: number;
    created_at?: string;
    username?: string;
}

interface AdminNewsProps {
    user: User | null;
}

export default function AdminNews({ user }: AdminNewsProps) {
    const { t } = useTranslation()
    const [searchTerm, setSearchTerm] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [currentPost, setCurrentPost] = useState<NewsPost | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

    // TanStack Query Hooks
    const { data: news = [], isLoading: loading } = useAdminNews();
    const createMutation = useCreateNews();
    const updateMutation = useUpdateNews();
    const deleteMutation = useDeleteNews();

    const handleEdit = (post: NewsPost) => {
        setCurrentPost(post)
        setIsEditing(true)
    }

    const handleNew = () => {
        setCurrentPost({ 
            title: "", 
            title_en: "", 
            category: "General", 
            content: "", 
            content_en: "", 
            status: "Draft",
            image: "" 
        })
        setIsEditing(true)
    }

    const executeDelete = async () => {
        if (!deleteConfirm || !user) return;
        const username = user.user_metadata?.full_name || user.email || 'Admin';
        
        deleteMutation.mutate({ id: deleteConfirm, userId: user.id, username }, {
            onSuccess: () => setDeleteConfirm(null)
        });
    }

    const handleSave = async (data: NewsFormValues) => {
        const username = user?.user_metadata?.full_name || user?.email || 'Admin';
        
        if (data.id) {
            updateMutation.mutate({ 
                id: data.id, 
                payload: { ...data, username, user_id: user?.id } 
            }, {
                onSuccess: () => {
                    setIsEditing(false);
                    setCurrentPost(null);
                }
            });
        } else {
            createMutation.mutate({
                ...data,
                author_id: user?.id,
                username
            }, {
                onSuccess: () => {
                    setIsEditing(false);
                    setCurrentPost(null);
                }
            });
        }
    }

    const filteredNews = news.filter((post: NewsPost) => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isEditing && currentPost) {
        return (
            <NewsForm 
                initialData={currentPost}
                onSave={handleSave}
                onCancel={() => {
                    setIsEditing(false)
                    setCurrentPost(null)
                }}
                user={user}
            />
        )
    }

    return (
        <div className="news-manager-container">
            <div className="news-header">
                <div className="news-search-wrapper">
                    <Search className="news-search-icon" />
                    <input 
                        type="text" 
                        placeholder={t('admin.news.search_ph')} 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="news-search-input"
                    />
                </div>
                <button className="btn-primary poll-new-btn" onClick={handleNew}>
                    <Plus size={14} /> {t('admin.news.write_btn')}
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '8rem', display: 'flex', justifyContent: 'center' }}>
                    <Loader />
                </div>
            ) : filteredNews.length === 0 ? (
                <div className="poll-empty-state">
                    <div className="poll-empty-icon-wrapper">
                        <Search size={48} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#fff', marginBottom: '0.75rem' }}>{t('admin.news.no_news')}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '400px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
                           No se han encontrado noticias que coincidan con tu búsqueda o aún no hay entradas.
                        </p>
                        <button className="btn-primary" onClick={handleNew} style={{ padding: '1rem 2.5rem' }}>
                            <Plus style={{ marginRight: '10px' }} /> {t('admin.news.write_btn')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="news-cards-grid">
                    {filteredNews.map((post: NewsPost) => (
                        <div key={post.id} className="news-card-premium">
                            <div className="news-card-image-wrapper">
                                <img 
                                    src={post.image || "/images/ui/logo.webp"} 
                                    className="news-card-image" 
                                    alt={post.title} 
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/images/ui/logo.webp";
                                    }}
                                />
                                <div className="news-card-overlay"></div>
                                <span className="news-card-badge">
                                    {post.category}
                                </span>
                                <span className="news-card-status" style={{
                                    color: post.status === "Published" ? "#4ade80" : "#fbbf24",
                                    background: post.status === "Published" ? "rgba(74, 222, 128, 0.2)" : "rgba(251, 191, 36, 0.2)",
                                    backdropFilter: 'blur(10px)',
                                    border: `1px solid ${post.status === "Published" ? "rgba(74, 222, 128, 0.4)" : "rgba(251, 191, 36, 0.4)"}`
                                }}>
                                    {post.status === "Published" ? t('admin.news.form.published') : t('admin.news.form.draft')}
                                </span>
                            </div>

                            <div className="news-card-content">
                                <h4 className="news-card-title">{post.title}</h4>
                                <div className="news-card-meta">
                                    <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : '-'}</span>
                                    <span>•</span>
                                    <span>{post.username || 'Admin'}</span>
                                </div>
                                
                                <div className="news-card-footer">
                                    <button
                                        onClick={() => handleEdit(post)}
                                        className="event-btn-action"
                                        title={t('admin.news.edit_title')}
                                    >
                                        <Edit />
                                    </button>
                                    <button
                                        onClick={() => post.id && setDeleteConfirm(post.id)}
                                        className="event-btn-action delete"
                                        title={t('admin.news.delete_tooltip')}
                                    >
                                        <Trash2 />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="sync-modal-overlay">
                    <div className="sync-modal-content" style={{ maxWidth: '450px', textAlign: 'center', padding: '3.5rem' }}>
                        <div className="modal-accent-line" style={{ background: 'linear-gradient(90deg, transparent, #ef4444, transparent)' }}></div>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 2rem',
                            fontSize: '2.5rem'
                        }}>
                            <TriangleAlert />
                        </div>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.75rem', fontWeight: '900', color: '#fff' }}>{t('admin.news.delete_modal.title')}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '1rem' }}>
                            {t('admin.news.delete_modal.desc')}
                        </p>
                        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center' }}>
                            <button 
                                className="modal-btn-secondary" 
                                onClick={() => setDeleteConfirm(null)}
                                style={{ flex: 1, height: '54px' }}
                            >
                                {t('admin.news.delete_modal.cancel')}
                            </button>
                            <button 
                                className="modal-btn-primary" 
                                onClick={executeDelete}
                                disabled={deleteMutation.isPending}
                                style={{ 
                                    flex: 1, 
                                    background: '#ef4444', 
                                    color: '#fff',
                                    height: '54px',
                                    boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)'
                                }}
                            >
                                {deleteMutation.isPending ? t('common.deleting') : t('admin.news.delete_modal.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

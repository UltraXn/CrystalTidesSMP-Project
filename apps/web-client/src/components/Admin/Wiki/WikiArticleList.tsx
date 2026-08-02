import { Edit, Trash2, Book, Globe, Tag, Box, Layers } from "lucide-react"
import { useTranslation } from "react-i18next"
import { WikiArticle, WIKI_CATEGORIES } from "../../../services/wikiService"
import Loader from "../../UI/Loader"

interface WikiArticleListProps {
    articles: WikiArticle[];
    loading: boolean;
    onEdit: (article: WikiArticle) => void;
    onDelete: (id: number) => void;
}

export default function WikiArticleList({ articles, loading, onEdit, onDelete }: WikiArticleListProps) {
    const { t } = useTranslation();

    if (loading) {
        return <Loader text={t('admin.wiki.loading')} />;
    }

    if (articles.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.4, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>
                <Book size={48} style={{ marginBottom: '1rem', color: '#888' }} />
                <p style={{ fontSize: '0.95rem', color: '#aaa' }}>{t('admin.wiki.no_articles')}</p>
            </div>
        );
    }

    return (
        <div className="article-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.2rem'
        }}>
            {articles.map(article => {
                const categoryObj = WIKI_CATEGORIES.find(c => c.id === article.category);
                const categoryName = categoryObj ? categoryObj.name : article.category;
                const categoryIcon = categoryObj ? categoryObj.icon : '🏷️';

                return (
                    <div key={article.id} className="article-card" style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        borderRadius: '14px',
                        padding: '1.2rem',
                        transition: "all 0.2s ease-in-out",
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.4)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    }}
                    >
                        {/* Header Badges & Actions */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#38bdf8', background: 'rgba(14, 165, 233, 0.12)', border: '1px solid rgba(14, 165, 233, 0.25)', padding: '2px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <span>{categoryIcon}</span>
                                    <span>{categoryName}</span>
                                </span>

                                {article.boss_mod_name && (
                                    <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: '#e0e7ff', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '2px 7px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <Layers size={10} /> {article.boss_mod_name}
                                    </span>
                                )}

                                {article.model_3d_url && (
                                    <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#fca5a5', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 6px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                        <Box size={10} /> 3D
                                    </span>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '0.3rem', marginLeft: 'auto' }}>
                                <button aria-label="Action" type="button" onClick={() => onEdit(article)} style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }} className="hover:text-amber-400">
                                    <Edit size={13} />
                                </button>
                                <button aria-label="Action" type="button" onClick={() => onDelete(article.id)} style={{ padding: '0.4rem', background: 'rgba(239,68,68,0.1)', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', cursor: 'pointer' }} className="hover:text-red-400">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>

                        {/* Title & Slug */}
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '0.3rem', color: '#fff', lineHeight: '1.3' }}>{article.title}</h3>
                        <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.8rem', fontFamily: 'monospace' }}>/{article.slug}</p>

                        {/* Card Footer Info */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#666', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.6rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Globe size={12} /> {t('admin.wiki.public')}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Tag size={12} /> {article.content.length} {t('admin.wiki.char_count')}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

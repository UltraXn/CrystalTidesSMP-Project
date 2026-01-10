import { Edit, Trash2, Book, Globe, Tag } from "lucide-react"
import { useTranslation } from "react-i18next"
import { WikiArticle } from "../../../services/wikiService"
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
            <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.3 }}>
                <Book size={48} style={{ marginBottom: '1rem' }} />
                <p>{t('admin.wiki.no_articles')}</p>
            </div>
        );
    }

    return (
        <div className="article-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
        }}>
            {articles.map(article => (
                <div key={article.id} className="article-card" style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent, #0ea5e9)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--accent, #0ea5e9)', background: 'rgba(22, 140, 128, 0.1)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                            {article.category}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => onEdit(article)} style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7 }} className="hover:text-amber-400">
                                <Edit size={14} />
                            </button>
                            <button onClick={() => onDelete(article.id)} style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7 }} className="hover:text-red-400">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#fff' }}>{article.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>/{article.slug}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#666' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Globe /> {t('admin.wiki.public')}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Tag /> {article.content.length} {t('admin.wiki.char_count')}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

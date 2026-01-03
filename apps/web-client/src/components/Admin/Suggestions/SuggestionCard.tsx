import { useTranslation } from 'react-i18next';
import { FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import { Suggestion, getTypeColor, getStatusColor, getTypeIcon } from './types';

interface SuggestionCardProps {
    suggestion: Suggestion;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onUpdateStatus: (id: number, status: string) => void;
    onDelete: (id: number) => void;
}

export default function SuggestionCard({ suggestion: s, isExpanded, onToggleExpand, onUpdateStatus, onDelete }: SuggestionCardProps) {
    const { t } = useTranslation();
    const typeStyle = getTypeColor(s.type);
    const statusStyle = getStatusColor(s.status || 'pending');

    return (
        <div className="admin-card-hover suggestion-card" style={{ 
            background: 'linear-gradient(90deg, rgba(30, 30, 30, 0.9), rgba(20, 20, 20, 0.95))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.05)', // Neutral border
            borderLeft: `4px solid ${statusStyle.text}`, // Left accent border
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex', 
            alignItems: 'center', // Align items vertically center
            gap: '20px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
        }}>
            
            {/* 1. User Info Section */}
            <div className="suggestion-user" style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
                <img 
                    src={`https://mc-heads.net/avatar/${s.nickname}/64`} 
                    alt={s.nickname}
                    style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#1a1a1a' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '0.95rem', fontWeight: 'bold' }}>{s.nickname}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#888' }}>
                        {new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* 2. Type Badge */}
           <div className="suggestion-type" style={{ width: '140px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ 
                    padding: '4px 10px', borderRadius: '20px', 
                    background: typeStyle.bg, color: typeStyle.text, border: `1px solid ${typeStyle.border}`,
                    fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    whiteSpace: 'nowrap'
                }}>
                    {getTypeIcon(s.type)} {t(`admin.suggestions.types.${s.type.toLowerCase()}`, s.type)}
                </div>
           </div>

            {/* 3. Message Content (Flexible) */}
            <div className="suggestion-content" style={{ flex: 1, padding: '0 1rem', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ 
                    color: '#e2e8f0', fontSize: '0.9rem', lineHeight: '1.5',
                    fontFamily: '"Inter", sans-serif',
                    maxHeight: isExpanded ? 'none' : '42px', // Approx 2 lines
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: isExpanded ? undefined : 2,
                    WebkitBoxOrient: 'vertical',
                }}>
                    {s.message}
                </div>
                {s.message.length > 100 && (
                    <div 
                        onClick={onToggleExpand}
                        style={{ 
                            color: 'var(--accent)', fontSize: '0.75rem', cursor: 'pointer', marginTop: '4px', 
                            fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}
                    >
                        {isExpanded ? t('admin.suggestions.show_less', 'Ver menos') : t('admin.suggestions.read_more', 'Leer más')}
                    </div>
                )}
            </div>
             
            {/* 4. Status Badge */}
             <div className="suggestion-status" style={{ width: '100px', display: 'flex', justifyContent: 'center' }}>
                <span style={{ 
                    fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', 
                    background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}`,
                    fontWeight: 'bold', textTransform: 'uppercase'
                }}>
                    {t(`admin.suggestions.status.${s.status || 'pending'}`)}
                </span>
            </div>

            {/* 5. Actions */}
            <div className="suggestion-actions" style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', minWidth: '160px', justifyContent: 'flex-end'
            }}>
                {(s.status !== 'approved' && s.status !== 'implemented') && (
                    <button 
                        className="btn-action-icon btn-approve" 
                        title={t('admin.actions.approve', 'Aprobar')}
                        onClick={() => onUpdateStatus(s.id, 'approved')}
                        style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px' }}
                    >
                        <FaCheck size={14} />
                    </button>
                )}
                {(s.status !== 'rejected') && (
                    <button 
                        className="btn-action-icon btn-reject" 
                        title={t('admin.actions.reject', 'Rechazar')}
                        onClick={() => onUpdateStatus(s.id, 'rejected')}
                        style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px' }}
                    >
                        <FaTimes size={14} />
                    </button>
                )}
                
                <button 
                    onClick={() => onDelete(s.id)} 
                    className="btn-ghost-delete"
                    title="Eliminar"
                    style={{ width: '32px', height: '32px' }}
                >
                    <FaTrash size={14} />
                </button>
            </div>
        </div>
    );
}

// Inline styles for actions - ideally move to a CSS module or shared components
export const SuggestionStyles = `
    /* Base Styles */
    .admin-card-hover:hover {
        background: rgba(30, 30, 30, 0.95) !important;
        transform: translateY(-4px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        border-color: rgba(255,255,255,0.15) !important;
    }
    .btn-action-icon {
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }
    .btn-approve {
        background: rgba(34, 197, 94, 0.1);
        color: #4ade80;
        border: 1px solid rgba(34, 197, 94, 0.2);
    }
    .btn-approve:hover {
        background: rgba(34, 197, 94, 0.2);
        box-shadow: 0 0 10px rgba(34, 197, 94, 0.1);
    }
    .btn-reject {
        background: rgba(248, 113, 113, 0.1);
        color: #f87171;
        border: 1px solid rgba(248, 113, 113, 0.2);
    }
    .btn-reject:hover {
        background: rgba(248, 113, 113, 0.2);
        box-shadow: 0 0 10px rgba(248, 113, 113, 0.1);
    }
    .btn-ghost-delete {
        background: transparent;
        border: none;
        color: #666;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
    }
    .btn-ghost-delete:hover {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
    }

    /* Responsive Layout */
    .suggestions-wrapper {
        display: flex;
        gap: 2rem;
        align-items: flex-start;
    }
    
    @media (max-width: 900px) {
        .suggestions-wrapper {
            flex-direction: column;
            gap: 1rem;
        }
        .suggestions-sidebar {
            width: 100% !important;
            position: static !important;
            margin-bottom: 1rem;
        }
        .suggestion-card {
            flex-direction: column;
            align-items: stretch !important;
            gap: 16px !important;
        }
        .suggestion-user {
            min-width: auto !important;
            width: 100%;
            justify-content: space-between;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            padding-bottom: 12px;
        }
        .suggestion-type {
            width: 100% !important;
            justify-content: flex-start !important;
        }
        .suggestion-content {
            border: none !important;
            padding: 0 !important;
            margin: 4px 0;
        }
        .suggestion-status {
            width: 100% !important;
            justify-content: flex-start !important;
            margin-top: 4px;
        }
        .suggestion-actions {
            min-width: auto !important;
            justify-content: flex-end !important;
            border-top: 1px solid rgba(255,255,255,0.05);
            padding-top: 12px;
        }
    }
`;

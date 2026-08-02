import { useTranslation } from 'react-i18next';
import { Check, X, Trash2 } from 'lucide-react';
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
            transition: "color 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
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
                    <button
                        type="button"
                        onClick={onToggleExpand}
                        style={{
                            background: 'none', border: 'none', padding: 0,
                            color: 'var(--accent)', fontSize: '0.75rem', cursor: 'pointer', marginTop: '4px', 
                            fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}
                    >
                        {isExpanded ? t('admin.suggestions.show_less', 'Ver menos') : t('admin.suggestions.read_more', 'Leer más')}
                    </button>
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
                    <button aria-label="Action" type="button" 
                        className="btn-action-icon btn-approve" 
                        title={t('admin.actions.approve', 'Aprobar')}
                        onClick={() => onUpdateStatus(s.id, 'approved')}
                        style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px' }}
                    >
                        <Check size={14} />
                    </button>
                )}
                {(s.status !== 'rejected') && (
                    <button aria-label="Action" type="button" 
                        className="btn-action-icon btn-reject" 
                        title={t('admin.actions.reject', 'Rechazar')}
                        onClick={() => onUpdateStatus(s.id, 'rejected')}
                        style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px' }}
                    >
                        <X size={14} />
                    </button>
                )}
                
                <button type="button" 
                    onClick={() => onDelete(s.id)} 
                    className="btn-ghost-delete"
                    title="Eliminar"
                    style={{ width: '32px', height: '32px' }}
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
}



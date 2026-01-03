import { FaPoll, FaStopCircle, FaEdit, FaTrash, FaChartBar, FaPlus } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { Poll } from './types';

interface PollActiveCardProps {
    poll: Poll | null;
    onEdit: (poll: Poll) => void;
    onDelete: (id: number) => void;
    onClose: (id: number) => void;
    onCreate?: () => void;
}

export default function PollActiveCard({ poll, onEdit, onDelete, onClose, onCreate }: PollActiveCardProps) {
    const { t } = useTranslation();

    if (!poll) {
        return (
            <div className="poll-empty-state">
                <div className="poll-empty-icon-wrapper">
                    <FaPoll size={48} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#fff', marginBottom: '0.75rem' }}>{t('admin.polls.no_active')}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '400px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
                        {t('admin.polls.no_active_desc', 'No hay encuestas activas en este momento. ¡Crea una para interactuar con la comunidad!')}
                    </p>
                    {onCreate && (
                        <button onClick={onCreate} className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
                            <FaPlus style={{ marginRight: '10px' }} /> {t('admin.polls.create_now_btn')}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="poll-active-card">
            <div className="poll-card-accent"></div>
            {/* Decorative elements */}
            <div className="deco-blob-1"></div>
            <div className="deco-blob-2"></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2.5rem' }}>
                    <div>
                        <div className="poll-active-badge">
                            <div className="status-dot-pulse"></div>
                            {t('admin.polls.active_title')}
                        </div>
                        <h2 className="poll-h2">
                            {poll.title}
                        </h2>
                        <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.4)', fontWeight: '800', letterSpacing: '0.5px' }}>
                            {t('admin.polls.ends_in', 'Finaliza en')}: <span style={{ color: 'var(--accent)' }}>{poll.closesIn}</span>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            onClick={() => onEdit(poll)}
                            className="poll-btn-action"
                            title={t('admin.polls.edit_btn')}
                        >
                            <FaEdit size={18} />
                        </button>
                        <button 
                            onClick={() => onDelete(poll.id)}
                            className="poll-btn-action delete"
                            title={t('admin.polls.delete_tooltip')}
                        >
                            <FaTrash size={18} />
                        </button>
                    </div>
                </div>
                
                <p className="poll-question">
                    {poll.question}
                </p>

                <div style={{ display:'flex', flexDirection:'column', gap:'1.75rem', marginBottom:'3.5rem' }}>
                    {poll.options && Array.isArray(poll.options) && poll.options.map((opt, idx) => (
                        <div key={opt.id || idx} className="poll-option-bar">
                            {/* Progress Fill */}
                            <div className="poll-option-fill" style={{ width: `${opt.percent || 0}%` }}></div>

                            {/* Progress Line */}
                            <div className="poll-option-line" style={{ width: `${opt.percent || 0}%` }}></div>

                            {/* Content */}
                            <div className="poll-option-content">
                                <span className="poll-option-label">{opt.label}</span>
                                <div className="poll-option-stats">
                                    <span className="poll-votes-count">{opt.votes} {t('admin.polls.votes')}</span>
                                    <span className="poll-percent">{opt.percent}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="poll-active-footer">
                    <div className="poll-total-votes">
                        <FaChartBar size={20} />
                        {t('admin.polls.total_votes', {count: poll.totalVotes})}
                    </div>
                    <button 
                        onClick={() => onClose(poll.id)} 
                        className="poll-btn-close" 
                    >
                        <FaStopCircle size={20} /> {t('admin.polls.close_btn')}
                    </button>
                </div>
            </div>
        </div>
    );
}

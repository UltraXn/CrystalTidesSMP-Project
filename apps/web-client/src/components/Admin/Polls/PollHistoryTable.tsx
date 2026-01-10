import { Trash2, Square, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Loader from "../../UI/Loader";
import { Poll } from './types';

interface PollHistoryTableProps {
    polls: Poll[];
    loading: boolean;
    page: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
    onDelete: (id: number) => void;
    onClose: (id: number) => void;
}

export default function PollHistoryTable({ polls, loading, page, totalPages, onPageChange, onDelete, onClose }: PollHistoryTableProps) {
    const { t } = useTranslation();

    return (
        <div className="poll-history-container">
            <div className="poll-table-header">
                <History size={24} style={{ color: 'var(--accent)' }} />
                <h3>{t('admin.polls.history_title')}</h3>
            </div>
            
            {loading ? (
                <div style={{ padding: '4rem 0' }}>
                    <Loader 
                        text={t('admin.polls.loading_history')}
                        style={{ height: 'auto', minHeight: '150px' }} 
                    />
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>{t('admin.polls.table.title')}</th>
                                <th>{t('admin.polls.table.date')}</th>
                                <th>{t('admin.polls.table.votes')}</th>
                                <th>{t('admin.polls.table.status')}</th>
                                <th style={{ textAlign: 'right' }}>{t('admin.polls.table.actions', 'Acciones')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(polls) && polls.map(poll => (
                                <tr key={poll.id}>
                                    <td style={{ fontWeight: '800', color: '#fff', fontSize: '1.05rem' }}>{poll.title}</td>
                                    <td style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
                                        {poll.created_at ? new Date(poll.created_at).toLocaleDateString() : '-'}
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: '900', color: 'var(--accent)' }}>{poll.totalVotes}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginLeft: '6px', textTransform: 'uppercase' }}>{t('admin.polls.votes')}</span>
                                    </td>
                                    <td>
                                        <span className={`status-chip ${poll.is_active ? 'active' : 'inactive'}`} style={{
                                            background: poll.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                            color: poll.is_active ? '#4ade80' : 'rgba(255,255,255,0.3)',
                                            border: `1px solid ${poll.is_active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
                                        }}>
                                            {poll.is_active ? t('admin.polls.status_chip.active') : t('admin.polls.status_chip.closed')}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                            {poll.is_active && (
                                                <button 
                                                    onClick={() => onClose(poll.id)}
                                                    title={t('admin.polls.close_btn')}
                                                    className="poll-btn-action"
                                                >
                                                    <Square size={16} fill="currentColor" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => onDelete(poll.id)}
                                                title={t('admin.polls.delete_tooltip')}
                                                className="poll-btn-action delete"
                                            >
                                                <Trash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {polls.length === 0 && (
                                <tr><td colSpan={5} style={{textAlign:'center', padding:'6rem', color: 'rgba(255,255,255,0.2)', fontWeight: '700'}}>{t('admin.polls.no_history')}</td></tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
                            <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="poll-tab-btn" style={{ padding: '0.5rem 1rem' }}>&lt;</button>
                            <span style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.4)', fontWeight: '800' }}>{t('admin.polls.pagination', { page, total: totalPages })}</span>
                            <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="poll-tab-btn" style={{ padding: '0.5rem 1rem' }}>&gt;</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

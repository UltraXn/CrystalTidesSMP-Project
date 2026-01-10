import { useState, useEffect } from "react"
import { Globe, Gamepad2, User, Search, Filter, Calendar } from 'lucide-react'
import { useTranslation } from "react-i18next"
import Loader from "../UI/Loader"
import { useAuditLogs } from "../../hooks/useAdminData"

interface LogEntry {
    id: string;
    created_at: number | string;
    username: string;
    action: string;
    details: string;
    source: 'web' | 'game';
}

interface AuditLogProps {
    mockLogs?: LogEntry[];
    mockTotal?: number;
}

interface HistoryProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
}

function History({ size = 24, ...props }: HistoryProps) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="m12 7 0 5 3 3" />
        </svg>
    )
}

export default function AuditLog({ mockLogs, mockTotal }: AuditLogProps = {}) {
    const { t } = useTranslation()
    const [filterSource, setFilterSource] = useState('all')
    const [page, setPage] = useState(1)
    const [limit] = useState(50)
    const [search, setSearch] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    // TanStack Query Hook
    const { data: fetchLogsData, isLoading: loading } = useAuditLogs(
        page, 
        limit, 
        searchTerm, 
        filterSource
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(search);
            setPage(1); // Reset to first page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const logs = mockLogs || fetchLogsData?.data || [];
    const totalCount = mockTotal !== undefined ? mockTotal : (fetchLogsData?.total || 0);
    const totalPages = Math.ceil(totalCount / limit) || 1;

    const getSourceIcon = (source: string) => {
        if (source === 'game') return <Gamepad2 size={16} />
        return <Globe size={16} />
    }

    const formatDate = (date: number | string) => {
        const d = new Date(date)
        return d.toLocaleString()
    }

    return (
        <div className="audit-log-container">
            <div className="audit-log-header">
                <div>
                    <h3>{t('admin.audit.title')}</h3>
                    <p>{t('admin.audit.subtitle')}</p>
                </div>

                <div className="audit-log-controls">
                    <div className="audit-search-box">
                        <Search size={18} />
                        <input 
                            type="text" 
                            placeholder={t('admin.audit.search_placeholder')} 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="audit-filters-bar">
                <div className="filter-group">
                    <Filter size={16} />
                    <button 
                        className={`filter-btn ${filterSource === 'all' ? 'active' : ''}`}
                        onClick={() => { setFilterSource('all'); setPage(1); }}
                    >
                        {t('admin.audit.source_all')}
                    </button>
                    <button 
                        className={`filter-btn ${filterSource === 'web' ? 'active' : ''}`}
                        onClick={() => { setFilterSource('web'); setPage(1); }}
                    >
                        <Globe size={14} /> {t('admin.audit.source_web')}
                    </button>
                    <button 
                        className={`filter-btn ${filterSource === 'game' ? 'active' : ''}`}
                        onClick={() => { setFilterSource('game'); setPage(1); }}
                    >
                        <Gamepad2 size={14} /> {t('admin.audit.source_game')}
                    </button>
                </div>

                <div className="pagination-summary">
                    {t('admin.audit.showing', { count: logs.length, total: totalCount })}
                </div>
            </div>

            {loading ? (
                <div className="audit-loading-state">
                    <Loader />
                </div>
            ) : logs.length === 0 ? (
                <div className="audit-empty-state">
                    <div className="empty-icon-circle">
                        <History size={48} />
                    </div>
                    <h4>{t('admin.audit.no_logs_found')}</h4>
                    <p>{t('admin.audit.try_adjust_filters')}</p>
                </div>
            ) : (
                <div className="audit-table-wrapper">
                    <table className="audit-table">
                        <thead>
                            <tr>
                                <th>{t('admin.audit.table_date')}</th>
                                <th>{t('admin.audit.table_user')}</th>
                                <th>{t('admin.audit.table_source')}</th>
                                <th>{t('admin.audit.table_action')}</th>
                                <th>{t('admin.audit.table_details')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log: LogEntry) => (
                                <tr key={log.id} className="audit-row">
                                    <td className="cell-date">
                                        <div className="date-main">
                                            <Calendar size={14} />
                                            {formatDate(log.created_at)}
                                        </div>
                                    </td>
                                    <td className="cell-user">
                                        <div className="user-info">
                                            <User size={14} />
                                            <span>{log.username}</span>
                                        </div>
                                    </td>
                                    <td className="cell-source">
                                        <span className={`source-badge ${log.source}`}>
                                            {getSourceIcon(log.source)}
                                            {t(`admin.audit.source_${log.source}`)}
                                        </span>
                                    </td>
                                    <td className="cell-action">
                                        <span className="action-tag">{log.action}</span>
                                    </td>
                                    <td className="cell-details">
                                        <div className="details-text" title={log.details}>
                                            {log.details}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div className="audit-pagination">
                    <button 
                        disabled={page === 1} 
                        onClick={() => setPage(page - 1)}
                        className="pagination-btn"
                    >
                        {t('common.previous')}
                    </button>
                    <div className="pagination-pages">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let p = page - 2 + i;
                            if (p < 1) p = i + 1;
                            if (p > totalPages) return null;
                            return (
                                <button 
                                    key={p}
                                    className={`page-num ${page === p ? 'active' : ''}`}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </button>
                            )
                        })}
                    </div>
                    <button 
                        disabled={page === totalPages} 
                        onClick={() => setPage(page + 1)}
                        className="pagination-btn"
                    >
                        {t('common.next')}
                    </button>
                </div>
            )}
        </div>
    )
}


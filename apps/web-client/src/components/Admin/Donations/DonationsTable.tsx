
import { FaEdit, FaTrash, FaGlobe, FaTimes, FaDonate, FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Loader from "../../UI/Loader";
import { Donation } from "./types";

interface DonationsTableProps {
    donations: Donation[];
    loading: boolean;
    onEdit: (donation: Donation) => void;
    onDelete: (id: number) => void;
    page: number;
    totalPages: number;
    setPage: (page: number | ((prev: number) => number)) => void;
}

export default function DonationsTable({ 
    donations, 
    loading, 
    onEdit, 
    onDelete, 
    page, 
    totalPages, 
    setPage 
}: DonationsTableProps) {
    const { t } = useTranslation();

    if (loading && donations.length === 0) {
        return (
            <div className="empty-donations">
                 <Loader />
            </div>
        );
    }

    if (donations.length === 0) {
        return (
            <div className="empty-donations">
                <div className="empty-icon-pulse">
                    <FaDonate />
                </div>
                <h4 style={{ color: '#fff', margin: 0 }}>{t('admin.donations.empty')}</h4>
                <p style={{ color: 'rgba(255,255,255,0.3)', maxWidth: '300px', margin: 0 }}>
                    No hay registros de donaciones que coincidan con tu búsqueda.
                </p>
            </div>
        );
    }

    return (
        <div className="donations-table-wrapper">
             <div style={{ flex: 1, overflowX: 'auto' }}>
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>{t('admin.tickets.table.user')}</th>
                            <th>{t('admin.donations.form.message')}</th>
                            <th>{t('admin.donations.form.amount')}</th>
                            <th>{t('admin.tickets.table.date')}</th>
                            <th>{t('admin.tickets.table.status')}</th>
                            <th style={{ textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {donations.map(donation => (
                            <tr key={donation.id}>
                                <td>
                                    <div className="donor-cell">
                                        <div className="donor-mini-avatar">
                                            {donation.from_name ? donation.from_name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div className="donor-name-link">
                                            <span className="donor-name-text">{donation.from_name || t('admin.donations.anonymous')}</span>
                                            <span className="donor-email-text">{donation.buyer_email || '---'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className={`message-cell ${!donation.message ? 'empty' : ''}`}>
                                        {donation.message || t('admin.donations.no_msg')}
                                    </div>
                                </td>
                                <td>
                                    <div className={`donation-amount-badge ${Number(donation.amount) >= 50 ? 'high' : ''}`}>
                                        {donation.currency} {Number(donation.amount || 0).toFixed(2)}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: 600 }}>
                                        <FaCalendarAlt size={12} />
                                        {donation.created_at ? new Date(donation.created_at).toLocaleDateString() : '---'}
                                    </div>
                                </td>
                                <td>
                                    <span className={`visibility-badge ${donation.is_public ? 'public' : 'private'}`}>
                                        {donation.is_public ? <FaGlobe size={10} /> : <FaTimes size={10} />}
                                        {donation.is_public ? t('admin.donations.public') : t('admin.donations.private')}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                                        <button onClick={() => onEdit(donation)} className="donor-btn-action edit" title={t('admin.polls.edit_btn')}>
                                            <FaEdit size={14} />
                                        </button>
                                        <button onClick={() => onDelete(donation.id)} className="donor-btn-action delete" title={t('admin.donors.delete_btn')}>
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="premium-pagination">
                    <button 
                        className="page-btn" 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <FaChevronLeft size={12} />
                    </button>
                    <div className="page-info">
                        PAGINA <span>{page}</span> DE <span>{totalPages}</span>
                    </div>
                    <button 
                        className="page-btn" 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        <FaChevronRight size={12} />
                    </button>
                </div>
            )}
        </div>
    );
}

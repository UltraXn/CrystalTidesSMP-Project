import React from 'react';
import { FaUsers, FaDiscord, FaTwitch, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { StaffCardData } from './StaffFormModal';

interface StaffSyncModalProps {
    isOpen: boolean;
    foundStaff: StaffCardData[];
    onClose: () => void;
    onConfirm: () => void;
}

export default function StaffSyncModal({ isOpen, foundStaff, onClose, onConfirm }: StaffSyncModalProps) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="sync-modal-overlay">
            <div className="sync-modal-content">
                {/* Decorative Top Line */}
                <div className="modal-accent-line"></div>

                <div className="sync-modal-header">
                    <div className="sync-modal-icon">
                        <FaUsers />
                    </div>
                    <h3>{t('admin.staff.confirm_modal.title')}</h3>
                    <p>
                        <span dangerouslySetInnerHTML={{ __html: t('admin.staff.confirm_modal.detected_msg', { count: foundStaff.length, interpolation: { escapeValue: false } }) }}></span> <br/>
                        <span className="warning-text">{t('admin.staff.confirm_modal.warning')}</span>
                    </p>
                </div>

                <div className="sync-list-container">
                    {foundStaff.map((s, i) => (
                        <div key={i} className="sync-item-row">
                            <div className="sync-avatar-status">
                                <img 
                                    src={s.image?.startsWith('http') ? s.image : `https://mc-heads.net/avatar/${s.name}/56`}
                                    onError={(e) => e.currentTarget.src = `https://mc-heads.net/avatar/MHF_Steve/56`}
                                    alt={s.name}
                                />
                                <div className="status-dot-mini"></div>
                            </div>
                            
                            <div className="sync-item-info">
                                <div className="sync-item-name">{s.name}</div>
                                <div className="staff-role-badge" style={{ color: s.color, background: `${s.color}15`, border: `1px solid ${s.color}20` }}>
                                    {s.role}
                                </div>
                            </div>

                            <div className="sync-socials-preview">
                                {s.socials?.discord && <div title={s.socials.discord} className="social-pill discord"><FaDiscord size={14} /></div>} 
                                {s.socials?.twitch && <div title={s.socials.twitch} className="social-pill twitch"><FaTwitch size={14} /></div>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="modal-footer-premium">
                    <button 
                        onClick={onClose} 
                        className="modal-btn-secondary"
                    >
                        {t('admin.staff.confirm_modal.cancel')}
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="modal-btn-primary" 
                    >
                        <FaCheckCircle style={{ marginRight: '8px' }} /> {t('admin.staff.confirm_modal.save')}
                    </button>
                </div>
            </div>
        </div>
    );
}


import { Users, CheckCircle } from 'lucide-react';
const DiscordIcon = ({ size = 14 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
        <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.653 0 2.039 2.039 0 0 0-.417-.833.051.051 0 0 0-.052-.025c-1.125.194-2.209.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z"/>
    </svg>
);
const TwitchIcon = ({ size = 14 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
        <path d="M3.857 0 1 2.857v10.286h3.429V16l2.857-2.857H9.57L14.714 8V0H3.857zm9.714 7.429-2.285 2.285H9l-2 2v-2H4.429V1.143h9.142v6.286z"/>
        <path d="M11.857 3.143h-1.143V5.714h1.143V3.143zm-3.143 0H7.571V5.714h1.143V3.143z"/>
    </svg>
);
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
                        <Users />
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
                                {s.socials?.discord && <div title={s.socials.discord} className="social-pill discord"><DiscordIcon size={14} /></div>} 
                                {s.socials?.twitch && <div title={s.socials.twitch} className="social-pill twitch"><TwitchIcon size={14} /></div>}
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
                        <CheckCircle style={{ marginRight: '8px' }} /> {t('admin.staff.confirm_modal.save')}
                    </button>
                </div>
            </div>
        </div>
    );
}

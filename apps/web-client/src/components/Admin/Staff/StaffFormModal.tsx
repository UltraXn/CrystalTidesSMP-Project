import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save, UserPen } from 'lucide-react';

const DiscordIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
        <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.653 0 2.039 2.039 0 0 0-.417-.833.051.051 0 0 0-.052-.025c-1.125.194-2.209.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z"/>
    </svg>
);

const TwitchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
        <path d="M3.857 0 1 2.857v10.286h3.429V16l2.857-2.857H9.57L14.714 8V0H3.857zm9.714 7.429-2.285 2.285H9l-2 2v-2H4.429V1.143h9.142v6.286z"/>
        <path d="M11.857 3.143h-1.143V5.714h1.143V3.143zm-3.143 0H7.571V5.714h1.143V3.143z"/>
    </svg>
);

const TwitterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
        <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/>
    </svg>
);

const YoutubeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
        <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z"/>
    </svg>
);
import MinecraftAvatar from "../../UI/MinecraftAvatar";
import Loader from "../../UI/Loader";

export interface StaffCardData {
    id: number | string;
    name: string;
    mc_nickname?: string;
    role: string;
    role_en?: string;
    image: string;
    color: string;
    description: string;
    description_en?: string;
    socials?: {
        twitter?: string;
        discord?: string;
        youtube?: string;
        twitch?: string;
    };
    isNew?: boolean;
}

interface StaffFormModalProps {
    userData: StaffCardData | null;
    isNew: boolean;
    onClose: () => void;
    onSave: (data: StaffCardData) => void;
    saving: boolean;
}

export default function StaffFormModal({ userData, isNew, onClose, onSave, saving }: StaffFormModalProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<StaffCardData>({
        id: 0,
        name: '',
        role: 'Usuario',
        description: '',
        image: '',
        color: '#db7700',
        socials: { twitter: '', discord: '', youtube: '', twitch: '' }
    });

    const PRESET_ROLES = useMemo(() => [
        { value: 'Neroferno', label: t('admin.staff.roles.neroferno', 'Neroferno'), color: '#8b5cf6', badge: '/ranks/rank-neroferno.png' },
        { value: 'Killuwu', label: t('admin.staff.roles.killuwu', 'Killuwu'), color: '#0ea5e9', badge: '/ranks/rank-killu.png' },
        { value: 'Developer', label: t('admin.staff.roles.developer', 'Developer'), color: '#ec4899', badge: '/ranks/developer.png' },
        { value: 'Admin', label: t('admin.staff.roles.admin', 'Admin'), color: '#ef4444', badge: '/ranks/admin.png' },
        { value: 'Moderator', label: t('admin.staff.roles.moderator', 'Moderator'), color: '#21cb20', badge: '/ranks/moderator.png' },
        { value: 'Helper', label: t('admin.staff.roles.helper', 'Helper'), color: '#6bfa16', badge: '/ranks/helper.png' },
        { value: 'Staff', label: 'Staff', color: '#89c606', badge: '/ranks/staff.png' },
        { value: 'Usuario', label: t('admin.staff.roles.user', 'Usuario'), color: '#db7700', badge: '/ranks/user.png' },
        { value: 'Custom', label: t('admin.staff.roles.custom', 'Custom'), color: '#ffffff', badge: null }
    ], [t]);

    useEffect(() => {

        if (userData) {
            // Only update if ID changed to avoid loops, or relying on parent to handle key
            // Ideally parent should key on userData.id
            setFormData(prev => prev.id === userData.id ? prev : userData);
        } else if (isNew) {
            setFormData(prev => prev.id === 0 ? {
                id: Date.now(),
                name: '',
                role: 'Usuario',
                description: '',
                image: '',
                color: '#db7700',
                socials: { twitter: '', discord: '', youtube: '', twitch: '' }
            } : prev);
        }
    }, [userData, isNew]);

    const handleChange = (field: keyof StaffCardData, value: string | number | boolean | object) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSocialChange = (network: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            socials: { ...prev.socials, [network]: value }
        }));
    };
    
    // Helper for specific handle changes if needed
    const onRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRole = PRESET_ROLES.find(r => r.value === e.target.value);
        if (selectedRole) {
            setFormData(prev => ({
                ...prev,
                role: selectedRole.value === 'Custom' ? '' : selectedRole.value,
                color: selectedRole.value === 'Custom' ? prev.color : selectedRole.color
            }));
        } else {
             handleChange('role', e.target.value);
        }
    };

    const getRoleBadge = (roleName: string) => {
        const role = PRESET_ROLES.find(r => r.value === roleName);
        return role?.badge;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!userData && !isNew) return null;

    return (
        <div className="staff-form-container">
            <div className="staff-form-header">
                    <h4>
                    <UserPen style={{ marginRight: '8px', color: 'var(--accent)' }} />
                    {isNew ? t('admin.staff.form.new_title') : t('admin.staff.form.edit_title')}
                    {formData.name && <span className="preview-label">- {formData.name}</span>}
                    </h4>
                    <button onClick={onClose} className="btn-close-mini"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="staff-form-grid">
                
                {/* Left Column: Preview & Avatar */}
                <div className="staff-form-preview">
                    <div className="staff-avatar-ring" style={{ borderColor: formData.color, boxShadow: `0 0 30px ${formData.color}30` }}>
                        <div className="staff-avatar-content">
                            <MinecraftAvatar 
                                src={formData.image || formData.mc_nickname || formData.name} 
                                alt="Preview" 
                                size={120}
                            />
                        </div>
                    </div>
                    <div className="staff-preview-info">
                        <div className="preview-name">{formData.name || t('admin.staff.form.preview_name')}</div>
                        {getRoleBadge(formData.role) ? (
                            <div className="preview-badge-wrapper">
                                <img src={getRoleBadge(formData.role) || undefined} alt={formData.role} />
                            </div>
                        ) : (
                            <div className="staff-role-badge" style={{ color: formData.color, background: `${formData.color}15` }}>
                                {formData.role || t('admin.staff.form.preview_role')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Inputs */}
                <div className="staff-form-inputs">
                    <div className="full-width">
                        <label className="admin-label-premium">{t('admin.staff.form.name_label')}</label>
                        <input 
                            className="admin-input-premium" 
                            required 
                            value={formData.name} 
                            onChange={e => handleChange('name', e.target.value)} 
                            placeholder={t('admin.staff.form.name_ph')}
                        />
                    </div>

                    <div className="full-width">
                        <label className="admin-label-premium">Nick MC (Opcional - Para Skin/Status)</label>
                        <input 
                            className="admin-input-premium" 
                            value={formData.mc_nickname || ''} 
                            onChange={e => handleChange('mc_nickname', e.target.value)} 
                            placeholder="Ej: Neroferno (Dejar vacío si es igual al nombre)"
                        />
                    </div>

                    <div>
                        <label className="admin-label-premium">{t('admin.staff.form.role_label')}</label>
                        <select 
                            className="admin-select-premium" 
                            value={PRESET_ROLES.some(r => r.value === formData.role) ? formData.role : 'Custom'} 
                            onChange={onRoleChange}
                        >
                            {PRESET_ROLES.map(role => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                        </select>
                        {!PRESET_ROLES.some(r => r.value === formData.role && r.value !== 'Custom') && (
                            <input 
                                className="admin-input-premium" 
                                style={{ marginTop: '0.5rem' }}
                                value={formData.role} 
                                onChange={e => handleChange('role', e.target.value)}
                                placeholder={t('admin.staff.form.custom_role_ph')}
                            />
                        )}
                    </div>

                    <div>
                        <label className="admin-label-premium">{t('admin.staff.form.color_label')}</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <input 
                                    type="color" 
                                    value={formData.color} 
                                    onChange={e => handleChange('color', e.target.value)} 
                                    style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', cursor: 'pointer', border: 'none' }} 
                                />
                            </div>
                            <span style={{ color: '#aaa', fontFamily: 'monospace', fontWeight: '800' }}>{formData.color.toUpperCase()}</span>
                        </div>
                    </div>

                    <div className="full-width">
                        <label className="admin-label-premium">{t('admin.staff.form.avatar_label')}</label>
                        <input 
                            className="admin-input-premium" 
                            value={formData.image} 
                            onChange={e => handleChange('image', e.target.value)} 
                            placeholder={t('admin.staff.form.avatar_ph', "Nick de Minecraft o URL de imagen")} 
                        />
                        <div className="input-tip-premium">
                            {t('admin.staff.avatar_tip', 'Usa un Nickname (Premium) o una URL directa al avatar/cabeza.')}
                        </div>
                    </div>

                    <div className="full-width">
                        <label className="admin-label-premium">{t('admin.staff.form.bio_label')}</label>
                        <textarea 
                            className="admin-textarea-premium" 
                            rows={3} 
                            value={formData.description} 
                            onChange={e => handleChange('description', e.target.value)} 
                            placeholder={t('admin.staff.form.bio_ph')}
                        />
                    </div>
                    
                    <div>
                        <label className="admin-label-premium"><DiscordIcon /> Discord (User/IDs)</label>
                        <input 
                            className="admin-input-premium" 
                            value={formData.socials?.discord || ''} 
                            onChange={e => handleSocialChange('discord', e.target.value)} 
                            placeholder="Usuario o IDs" 
                        />
                    </div>
                    <div>
                        <label className="admin-label-premium"><TwitchIcon /> Twitch (User)</label>
                        <input 
                            className="admin-input-premium" 
                            value={formData.socials?.twitch || ''} 
                            onChange={e => handleSocialChange('twitch', e.target.value)} 
                            placeholder="twitch.tv/..." 
                        />
                    </div>
                    <div>
                        <label className="admin-label-premium"><TwitterIcon /> Twitter (Link)</label>
                        <input 
                            className="admin-input-premium" 
                            value={formData.socials?.twitter || ''} 
                            onChange={e => handleSocialChange('twitter', e.target.value)} 
                            placeholder="https://x.com/..." 
                        />
                    </div>
                    <div>
                        <label className="admin-label-premium"><YoutubeIcon /> YouTube (Link)</label>
                        <input 
                            className="admin-input-premium" 
                            value={formData.socials?.youtube || ''} 
                            onChange={e => handleSocialChange('youtube', e.target.value)} 
                            placeholder="https://youtube.com/..." 
                        />
                    </div>

                    <div className="staff-form-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>{t('admin.staff.form.cancel')}</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? <Loader style={{ width: '20px', height: '20px' }} /> : <><Save style={{ marginRight: '8px' }} size={16} /> {t('admin.staff.form.save_changes')}</>}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaSave, FaDiscord, FaTwitch, FaTwitter, FaYoutube, FaUserEdit } from 'react-icons/fa';
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    <FaUserEdit style={{ marginRight: '8px', color: 'var(--accent)' }} />
                    {isNew ? t('admin.staff.form.new_title') : t('admin.staff.form.edit_title')}
                    {formData.name && <span className="preview-label">- {formData.name}</span>}
                    </h4>
                    <button onClick={onClose} className="btn-close-mini"><FaTimes /></button>
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
                        <label className="admin-label-premium"><FaDiscord /> Discord (User/IDs)</label>
                        <input 
                            className="admin-input-premium" 
                            value={formData.socials?.discord || ''} 
                            onChange={e => handleSocialChange('discord', e.target.value)} 
                            placeholder="Usuario o IDs" 
                        />
                    </div>
                    <div>
                        <label className="admin-label-premium"><FaTwitch /> Twitch (User)</label>
                        <input 
                            className="admin-input-premium" 
                            value={formData.socials?.twitch || ''} 
                            onChange={e => handleSocialChange('twitch', e.target.value)} 
                            placeholder="twitch.tv/..." 
                        />
                    </div>
                    <div>
                        <label className="admin-label-premium"><FaTwitter /> Twitter (Link)</label>
                        <input 
                            className="admin-input-premium" 
                            value={formData.socials?.twitter || ''} 
                            onChange={e => handleSocialChange('twitter', e.target.value)} 
                            placeholder="https://x.com/..." 
                        />
                    </div>
                    <div>
                        <label className="admin-label-premium"><FaYoutube /> YouTube (Link)</label>
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
                            {saving ? <Loader style={{ width: '20px', height: '20px' }} /> : <><FaSave style={{ marginRight: '8px' }} /> {t('admin.staff.form.save_changes')}</>}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCrown, FaTimes, FaSpinner, FaGlobe, FaCheckCircle } from 'react-icons/fa';
import { supabase } from '../../../services/supabaseClient';
import { getAuthHeaders } from '../../../services/adminAuth';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface Donor {
    id: string; 
    name: string;
    skinUrl: string;
    description: string;
    description_en?: string;
    ranks: string[];
    isPremium?: boolean;
}

interface DonorFormModalProps {
    donor: Donor | null;
    isNew: boolean;
    onClose: () => void;
    onSave: (donor: Donor) => void;
    saving: boolean;
}

const AVAILABLE_RANKS = [
    { id: 'donador', label: 'Donador', img: '/ranks/rank-donador.png' },
    { id: 'fundador', label: 'Fundador', img: '/ranks/rank-fundador.png' },
    { id: 'killu', label: 'Killu', img: '/ranks/rank-killu.png' },
    { id: 'neroferno', label: 'Neroferno', img: '/ranks/rank-neroferno.png' },
    { id: 'developer', label: 'Developer', img: '/ranks/developer.png' },
    { id: 'admin', label: 'Admin', img: '/ranks/admin.png' },
    { id: 'mod', label: 'Moderator', img: '/ranks/moderator.png' },
    { id: 'helper', label: 'Helper', img: '/ranks/helper.png' },
    { id: 'staff', label: 'Staff', img: '/ranks/staff.png' },
];

export default function DonorFormModal({ donor, isNew, onClose, onSave, saving }: DonorFormModalProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Donor>({
        id: '',
        name: '',
        skinUrl: '',
        description: '',
        description_en: '',
        ranks: ['donador'],
        isPremium: false
    });
    const [translating, setTranslating] = useState(false);

    useEffect(() => {
        if (donor) {
            setFormData(donor);
        }
    }, [donor]);

    const handleTranslate = async (text: string, toLang: 'es' | 'en', field: 'description' | 'description_en') => {
        if (!text) return;
        setTranslating(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_URL}/translation`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify({ text, targetLang: toLang })
            });
            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, [field]: data.translatedText }));
            }
        } catch (e) {
            console.error("Translation fail", e);
            // Error handling could be passed up via callback if needed, 
            // but for now logging is sufficient as UI feedback is limited in this scope
        } finally {
            setTranslating(false);
        }
    };

    const handleSubmit = () => {
        // Validation could be added here
        onSave(formData);
    };

    if (!donor) return null;

    return (
        <div className="sync-modal-overlay">
            <div className="sync-modal-content" style={{ maxWidth: '850px' }}>
                <div className="modal-accent-line"></div>
                
                <div className="poll-form-header">
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', fontSize: '1.5rem', fontWeight: '900' }}>
                        <FaCrown style={{ color: 'var(--accent)' }} />
                        {isNew ? t('admin.donors.new_title') : t('admin.donors.edit_title')}
                    </h3>
                    <button onClick={onClose} className="btn-close-mini">
                        <FaTimes />
                    </button>
                </div>
                
                <div className="poll-form-body" style={{ overflowY: 'auto', maxHeight: '70vh', padding: '0.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {/* Left Side: Basic Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label className="admin-label-premium">{t('admin.donors.form.nick')}</label>
                                <input 
                                    className="admin-input-premium" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder={t('admin.donors.form.nick_ph')}
                                />
                            </div>

                            <div className="form-group">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <input 
                                        type="checkbox" 
                                        id="isPremiumDonor"
                                        checked={formData.isPremium || false}
                                        onChange={e => setFormData({...formData, isPremium: e.target.checked})}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="isPremiumDonor" style={{ cursor: 'pointer', fontSize: '0.95rem', color: '#fff', fontWeight: 700 }}>
                                        {t('admin.donors.form.is_premium')}
                                    </label>
                                </div>
                            </div>

                            {!formData.isPremium && (
                                <div className="form-group">
                                    <label className="admin-label-premium">{t('admin.donors.form.skin_url')}</label>
                                    <input 
                                        className="admin-input-premium" 
                                        value={formData.skinUrl} 
                                        onChange={e => setFormData({...formData, skinUrl: e.target.value})}
                                        placeholder={t('admin.donors.form.skin_ph')}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem' }}>
                                        {t('admin.donors.form.skin_hint')}
                                    </p>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="admin-label-premium">{t('admin.donors.form.ranks')}</label>
                                <div className="donor-ranks-selector">
                                    {AVAILABLE_RANKS.map(rank => {
                                        const isSelected = formData.ranks.includes(rank.id);
                                        return (
                                            <div 
                                                key={rank.id}
                                                onClick={() => {
                                                    const newRanks = isSelected 
                                                        ? formData.ranks.filter(r => r !== rank.id)
                                                        : [...formData.ranks, rank.id];
                                                    setFormData({...formData, ranks: newRanks});
                                                }}
                                                className={`rank-select-item ${isSelected ? 'active' : ''}`}
                                            >
                                                <img src={rank.img} alt={rank.label} />
                                                <span>{rank.label}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Descriptions & Preview */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label className="admin-label-premium">{t('admin.donors.form.desc')}</label>
                                    <button 
                                        className="btn-secondary" 
                                        style={{ fontSize: '0.7rem', height: '28px', padding: '0 10px' }}
                                        onClick={() => handleTranslate(formData.description, 'en', 'description_en')}
                                        disabled={translating || !formData.description}
                                    >
                                        {translating ? <FaSpinner className="spin" /> : <FaGlobe />} {t('admin.donors.form.translate_en')}
                                    </button>
                                </div>
                                <textarea 
                                    className="admin-textarea-premium" 
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    placeholder={t('admin.donors.form.desc_ph')}
                                    rows={3}
                                />
                            </div>

                            <div className="form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label className="admin-label-premium">{t('admin.donors.form.desc_en')}</label>
                                    <button 
                                        className="btn-secondary" 
                                        style={{ fontSize: '0.7rem', height: '28px', padding: '0 10px' }}
                                        onClick={() => handleTranslate(formData.description_en || '', 'es', 'description')}
                                        disabled={translating || !formData.description_en}
                                    >
                                        {translating ? <FaSpinner className="spin" /> : <FaGlobe />} {t('admin.donors.form.translate_es')}
                                    </button>
                                </div>
                                <textarea 
                                    className="admin-textarea-premium" 
                                    value={formData.description_en || ''} 
                                    onChange={e => setFormData({...formData, description_en: e.target.value})}
                                    placeholder={t('admin.donors.form.desc_en_ph')}
                                    rows={3}
                                />
                            </div>

                            <div className="donor-preview-pane">
                                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Preview</span>
                                <div className="donor-card-premium" style={{ width: '100%', pointerEvents: 'none', background: 'rgba(255,255,255,0.02)' }}>
                                    <div className="donor-card-header">
                                        <div className="donor-avatar-wrapper">
                                            <img 
                                                className="donor-avatar"
                                                src={formData.isPremium ? `https://mc-heads.net/avatar/${formData.name}/64` : formData.skinUrl} 
                                                alt="preview"
                                                onError={(e) => e.currentTarget.src = `https://mc-heads.net/avatar/Steve/64`}
                                            />
                                        </div>
                                        <div className="donor-info">
                                            <h4 className="donor-name">{formData.name || 'New Donor'}</h4>
                                            <div className="donor-ranks">
                                                {formData.ranks.map(r => (
                                                    <span key={r} className="donor-rank-badge">{r}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="donor-description" style={{ fontSize: '0.8rem' }}>"{formData.description || 'Description goes here...'}"</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="poll-form-footer" style={{ marginTop: '2rem' }}>
                        <button className="btn-secondary" onClick={onClose}>{t('admin.donors.form.cancel')}</button>
                        <button className="modal-btn-primary" onClick={handleSubmit} disabled={saving} style={{ height: '50px', padding: '0 2.5rem' }}>
                            {saving ? <FaSpinner className="spin" /> : <><FaCheckCircle /> {t('admin.donors.form.save')}</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

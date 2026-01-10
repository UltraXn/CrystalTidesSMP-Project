import React, { useState, useEffect } from "react";
import { CircleDollarSign, X, User, Mail, Clock, CheckCircle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Donation } from "./types";

interface DonationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (donation: Donation) => Promise<void>;
    initialData: Donation | null;
    saving?: boolean;
}

export default function DonationFormModal({ isOpen, onClose, onSave, initialData, saving }: DonationFormModalProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Donation>({
        id: 0,
        amount: 0,
        currency: 'USD',
        from_name: '',
        message: '',
        is_public: true,
        buyer_email: '',
        created_at: new Date().toISOString()
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            // Reset for new entry
            setFormData({
                id: 0,
                amount: 0,
                currency: 'USD',
                from_name: '',
                message: '',
                is_public: true,
                buyer_email: '',
                created_at: new Date().toISOString()
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Error saving donation:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="sync-modal-overlay">
            <div className="sync-modal-content" style={{ maxWidth: '700px' }}>
                <div className="modal-accent-line"></div>
                
                <div className="poll-form-header">
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', fontSize: '1.5rem', fontWeight: '900' }}>
                        <CircleDollarSign style={{ color: 'var(--accent)' }} />
                        {formData.id ? t('admin.donations.edit_title') : t('admin.donations.new_btn')}
                    </h3>
                    <button onClick={onClose} className="btn-close-mini">
                        <X />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="poll-form-body">
                    <div className="donation-form-grid">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label className="admin-label-premium">
                                    <User size={12} /> {t('admin.donations.form.donor_name')}
                                </label>
                                <input 
                                    className="admin-input-premium" 
                                    value={formData.from_name} 
                                    onChange={e => setFormData({...formData, from_name: e.target.value})}
                                    placeholder={t('admin.donations.form.name_ph')}
                                />
                            </div>

                            <div className="form-group">
                                <label className="admin-label-premium">
                                    <Mail size={12} /> {t('admin.donations.form.email_label')}
                                </label>
                                <input 
                                    className="admin-input-premium" 
                                    value={formData.buyer_email || ''} 
                                    onChange={e => setFormData({...formData, buyer_email: e.target.value})}
                                    placeholder="email@ejemplo.com"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="admin-label-premium">{t('admin.donations.form.amount')}</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        className="admin-input-premium" 
                                        value={formData.amount} 
                                        onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="admin-label-premium">{t('admin.donations.form.currency')}</label>
                                    <select 
                                        className="admin-select-premium" 
                                        value={formData.currency} 
                                        onChange={e => setFormData({...formData, currency: e.target.value})}
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="MXN">MXN</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label className="admin-label-premium">{t('admin.donations.form.message')}</label>
                                <textarea 
                                    className="admin-textarea-premium" 
                                    rows={4}
                                    value={formData.message} 
                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                    placeholder="Escribe un mensaje..."
                                />
                            </div>

                            <div className="form-group">
                                <div 
                                    className={`custom-checkbox-premium ${formData.is_public ? 'checked' : ''}`}
                                    onClick={() => setFormData({...formData, is_public: !formData.is_public})}
                                >
                                    <div className="checkbox-visual">
                                        {formData.is_public && <CheckCircle />}
                                    </div>
                                    <label className="checkbox-label-text">
                                        {t('admin.donations.form.is_public')}
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="admin-label-premium">
                                    <Clock size={12} /> {t('admin.tickets.table.date')}
                                </label>
                                <input 
                                    type="datetime-local"
                                    className="admin-input-premium" 
                                    value={formData.created_at ? new Date(formData.created_at).toISOString().slice(0, 16) : ''} 
                                    onChange={e => setFormData({...formData, created_at: new Date(e.target.value).toISOString()})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="poll-form-footer">
                        <button type="button" className="modal-btn-secondary" onClick={onClose}>{t('admin.donations.form.cancel')}</button>
                        <button type="submit" className="modal-btn-primary" disabled={saving || isSubmitting}>
                            {(saving || isSubmitting) ? <Loader2 className="spin" /> : <><CheckCircle /> {t('admin.donations.form.save')}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

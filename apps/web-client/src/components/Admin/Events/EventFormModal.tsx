import { useState } from "react";
import { Dices, Languages, Loader2, Edit, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../../services/supabaseClient";
import { getAuthHeaders } from "../../../services/adminAuth";
import { Event } from "./types";

interface EventFormModalProps {
    onClose: () => void;
    onSave: (e: React.FormEvent) => Promise<void>;
    currentEvent: Event;
    setCurrentEvent: React.Dispatch<React.SetStateAction<Event | null>>;
    API_URL: string;
    saving?: boolean;
}

export default function EventFormModal({ onClose, onSave, currentEvent, setCurrentEvent, API_URL, saving }: EventFormModalProps) {
    const { t } = useTranslation();
    const [translating, setTranslating] = useState<string | null>(null);

    const handleTranslate = async (text: string, field: 'title' | 'description') => {
        if (!text) return;
        setTranslating(field);
        try {
            const { data: { session } } = await supabase.auth.getSession();
             const res = await fetch(`${API_URL}/translation`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(session?.access_token || null)
                },
                body: JSON.stringify({ text, targetLang: 'en' })
            });
            if (res.ok) {
                const data = await res.json();
                const translated = data.translatedText || '';
                setCurrentEvent(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        [field === 'title' ? 'title_en' : 'description_en']: translated
                    };
                });
            }
        } catch (e) { console.error(e); }
        finally { setTranslating(null); }
    };

    return (
        <div className="event-form-container">
             <div className="event-header">
                <h3>{currentEvent.id ? t('admin.events.edit_title') : t('admin.events.create_title')}</h3>
                <button className="btn-secondary" onClick={onClose} style={{ borderRadius: '12px', height: '42px' }}>
                    {t('admin.events.cancel')}
                </button>
            </div>

            <div className="poll-active-card" style={{ marginTop: '2rem', padding: '3rem' }}>
                <div className="modal-accent-line"></div>
                <form onSubmit={onSave} className="event-form-grid">
                    
                    <div className="event-form-section">
                        <h4><Dices /> {t('admin.events.form_extras.info_basic', 'Información Básica')}</h4>
                        
                        <div className="form-group">
                            <label className="admin-label-premium">{t('admin.events.form_extras.title_es')}</label>
                            <input
                                type="text"
                                className="admin-input-premium"
                                value={currentEvent.title}
                                onChange={e => setCurrentEvent(prev => prev ? { ...prev, title: e.target.value } : null)}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap: 'wrap', gap: '0.5rem'}}>
                                <label className="admin-label-premium">{t('admin.events.form_extras.title_en')}</label>
                                <button type="button" className="btn-secondary" style={{fontSize:'0.7rem', padding:'0.3rem 0.8rem', height: 'auto'}} onClick={() => handleTranslate(currentEvent.title, 'title')} disabled={translating === 'title'}>
                                    {translating === 'title' ? <Loader2 className="spin"/> : <><Languages /> {t('admin.events.form_extras.translate_btn')}</>}
                                </button>
                            </div>
                            <input
                                type="text"
                                className="admin-input-premium"
                                value={currentEvent.title_en || ''}
                                onChange={e => setCurrentEvent(prev => prev ? { ...prev, title_en: e.target.value } : null)}
                                placeholder="Event Title"
                            />
                        </div>

                        <div className="event-selectors-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
                            <div className="form-group">
                                <label className="admin-label-premium">{t('admin.events.form.type')}</label>
                                <select
                                    className="admin-select-premium"
                                    value={currentEvent.type}
                                    onChange={e => setCurrentEvent(prev => prev ? { ...prev, type: e.target.value } : null)}
                                >
                                    <option value="hammer">{t('admin.events.form.types.hammer')}</option>
                                    <option value="dice">{t('admin.events.form.types.dice')}</option>
                                    <option value="map">{t('admin.events.form.types.map')}</option>
                                    <option value="running">{t('admin.events.form.types.running')}</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="admin-label-premium">{t('admin.events.form.status')}</label>
                                <select
                                    className="admin-select-premium"
                                    value={currentEvent.status}
                                    onChange={e => setCurrentEvent(prev => prev ? { ...prev, status: e.target.value } : null)}
                                >
                                    <option value="soon">{t('admin.events.form.statuses.soon')}</option>
                                    <option value="active">{t('admin.events.form.statuses.active')}</option>
                                    <option value="finished">{t('admin.events.form.statuses.finished')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="event-form-section">
                        <h4><Edit /> {t('admin.events.form_extras.description', 'Descripción Detallada')}</h4>
                        
                        <div className="form-group">
                            <label className="admin-label-premium">{t('admin.events.form_extras.desc_es')}</label>
                             <textarea
                                className="admin-textarea-premium"
                                rows={4}
                                value={currentEvent.description}
                                onChange={e => setCurrentEvent(prev => prev ? { ...prev, description: e.target.value } : null)}
                                required
                            ></textarea>
                        </div>
                        
                        <div className="form-group">
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap: 'wrap', gap: '0.5rem'}}>
                                <label className="admin-label-premium">{t('admin.events.form_extras.desc_en')}</label>
                                <button type="button" className="btn-secondary" style={{fontSize:'0.7rem', padding:'0.3rem 0.8rem', height: 'auto'}} onClick={() => handleTranslate(currentEvent.description, 'description')} disabled={translating === 'description'}>
                                    {translating === 'description' ? <Loader2 className="spin"/> : <><Languages /> {t('admin.events.form_extras.translate_btn')}</>}
                                </button>
                            </div>
                            <textarea
                                className="admin-textarea-premium"
                                rows={4}
                                value={currentEvent.description_en || ''}
                                onChange={e => setCurrentEvent(prev => prev ? { ...prev, description_en: e.target.value } : null)}
                                placeholder="Event Description"
                            ></textarea>
                        </div>
                    </div>

                    <div className="event-form-footer" style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button type="button" onClick={onClose} className="modal-btn-secondary" style={{ flex: '1 1 auto', minWidth: '140px', height: '54px', padding: '0 2rem' }}>
                            {t('admin.events.cancel')}
                        </button>
                        <button type="submit" className="modal-btn-primary" disabled={saving} style={{ flex: '1 1 auto', minWidth: '140px', height: '54px', padding: '0 2rem' }}>
                            {saving ? <Loader2 className="spin" /> : <><CheckCircle size={18} /> {currentEvent.id ? t('admin.events.form.save') : t('admin.events.form.create')}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

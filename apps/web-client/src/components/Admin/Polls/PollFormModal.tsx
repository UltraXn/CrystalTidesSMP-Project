import { useState, useEffect, useCallback } from 'react';
import { BarChart3, X, Plus, Loader2, Languages, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Poll } from './types';

interface PollFormModalProps {
    onClose: () => void;
    onSubmit: (e: React.FormEvent, data: { title: string, titleEn: string, question: string, questionEn: string, options: {label: string, labelEn: string}[], daysDuration: number }) => Promise<void>;
    poll?: Poll | null;
    creating: boolean;
    buttonSuccess: boolean;
    hasActivePoll: boolean;
    onTranslate: (text: string, targetField: string, index?: number) => void;
    translatingField: string | null;
    translatedValues: { title?: string, question?: string, option?: {idx: number, val: string} };
}

export default function PollFormModal({ onClose, onSubmit, poll, creating, buttonSuccess, hasActivePoll, onTranslate, translatingField, translatedValues }: PollFormModalProps) {
    const { t } = useTranslation();
    const isEdit = !!poll;

    const [title, setTitle] = useState('');
    const [titleEn, setTitleEn] = useState('');
    const [question, setQuestion] = useState('');
    const [questionEn, setQuestionEn] = useState('');
    const [options, setOptions] = useState<{label: string, labelEn: string}[]>([{label: '', labelEn: ''}, {label: '', labelEn: ''}]);
    const [daysDuration, setDaysDuration] = useState(7);

    const updateOption = useCallback((idx: number, field: 'label' | 'labelEn', val: string) => {
        setOptions(prev => {
            const newOpts = [...prev];
            newOpts[idx] = { ...newOpts[idx], [field]: val };
            return newOpts;
        });
    }, []);

    const removeOption = useCallback((idx: number) => {
        setOptions(prev => prev.filter((_, i) => i !== idx));
    }, []);

    // Initial load
    useEffect(() => {
        if (poll) {
             if (poll.title !== title) setTitle(poll.title);
             if ((poll.title_en || '') !== titleEn) setTitleEn(poll.title_en || '');
             if (poll.question !== question) setQuestion(poll.question);
             if ((poll.question_en || '') !== questionEn) setQuestionEn(poll.question_en || '');
             
             // Always reset options for simplicity when poll changes
             const mappedOptions = poll.options.map(o => ({
                 label: o.label,
                 labelEn: o.label_en || ''
             }));
             while (mappedOptions.length < 2) mappedOptions.push({ label: '', labelEn: '' });
             
             setOptions(mappedOptions);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [poll]); 

    // Translation updates
    useEffect(() => {
        if (translatedValues.title && translatedValues.title !== titleEn) setTitleEn(translatedValues.title);
        if (translatedValues.question && translatedValues.question !== questionEn) setQuestionEn(translatedValues.question);
        if (translatedValues.option) {
             const { idx, val } = translatedValues.option;
             updateOption(idx, 'labelEn', val);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [translatedValues, updateOption]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(e, {
            title, 
            titleEn, 
            question, 
            questionEn, 
            options, 
            daysDuration
        });
    };

    return (
        <div className="sync-modal-overlay">
            <div className="sync-modal-content poll-modal-content" style={{ maxWidth: '750px' }}>
                <div className="modal-accent-line"></div>
                
                <div className="poll-form-header">
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', fontSize: '1.5rem', fontWeight: '900' }}>
                        <BarChart3 style={{ color: 'var(--accent)' }} />
                        {isEdit ? t('admin.polls.edit_title', 'Editar Encuesta') : t('admin.polls.create_title')}
                    </h3>
                    <button onClick={onClose} className="btn-close-mini">
                        <X />
                    </button>
                </div>
                
                <div className="poll-form-body" style={{ overflowY: 'auto', maxHeight: '75vh' }}>
                    <form onSubmit={handleSubmit} className="poll-form-container">
                        
                        <div className="poll-form-row">
                            <div className="form-group">
                                <label className="admin-label-premium">{t('admin.polls.form_extras.title_es')}</label>
                                <input className="admin-input-premium" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('admin.polls.form.title_ph')} required />
                            </div>
                            <div className="form-group">
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                     <label className="admin-label-premium">{t('admin.polls.form_extras.title_en')}</label>
                                     <button type="button" onClick={() => onTranslate(title, 'title')} className="btn-secondary" style={{fontSize:'0.7rem', padding:'0.2rem 0.6rem', marginBottom:'0.5rem'}} disabled={translatingField === 'title'}>
                                         {translatingField === 'title' ? <Loader2 className="spin"/> : <><Languages /> {t('admin.polls.form_extras.translate')}</>}
                                     </button>
                                </div>
                                <input className="admin-input-premium" value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="Poll Title" />
                            </div>
                        </div>
                        
                        <div className="poll-form-row">
                            <div className="form-group">
                                <label className="admin-label-premium">{t('admin.polls.form_extras.question_es')}</label>
                                <textarea className="admin-textarea-premium" value={question} onChange={e => setQuestion(e.target.value)} placeholder={t('admin.polls.form.question_ph')} required rows={3}></textarea>
                            </div>
                            <div className="form-group">
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                     <label className="admin-label-premium">{t('admin.polls.form_extras.question_en')}</label>
                                     <button type="button" onClick={() => onTranslate(question, 'question')} className="btn-secondary" style={{fontSize:'0.7rem', padding:'0.2rem 0.6rem', marginBottom:'0.5rem'}} disabled={translatingField === 'question'}>
                                         {translatingField === 'question' ? <Loader2 className="spin"/> : <><Languages /> {t('admin.polls.form_extras.translate')}</>}
                                     </button>
                                </div>
                                <textarea className="admin-textarea-premium" value={questionEn} onChange={e => setQuestionEn(e.target.value)} placeholder="Poll Question" rows={3}></textarea>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="admin-label-premium">{t('admin.polls.form.options')}</label>
                            <div className="poll-options-grid">
                                {options.map((opt, idx) => (
                                    <div key={idx} className="poll-option-edit-card">
                                        <div className="poll-option-index">{idx + 1}</div>
                                        
                                        <div className="poll-option-inputs">
                                            <input 
                                                className="admin-input-premium" 
                                                value={opt.label} 
                                                onChange={e => updateOption(idx, 'label', e.target.value)} 
                                                placeholder={t('admin.polls.form_extras.option_es')}
                                                required
                                            />
                                            <div style={{display:'flex', gap:'10px'}}>
                                                 <input 
                                                     className="admin-input-premium" 
                                                     value={opt.labelEn} 
                                                     onChange={e => updateOption(idx, 'labelEn', e.target.value)} 
                                                     placeholder={t('admin.polls.form_extras.option_en')}
                                                 />
                                                 <button type="button" onClick={() => onTranslate(opt.label, 'options', idx)} className="btn-secondary" style={{padding:'0 1rem', borderRadius: '12px'}} disabled={translatingField === `option-${idx}`}>
                                                     {translatingField === `option-${idx}` ? <Loader2 className="spin"/> : <Languages size={18} />}
                                                 </button>
                                            </div>
                                        </div>

                                        {options.length > 2 && (
                                            <button 
                                                type="button" 
                                                onClick={() => removeOption(idx)} 
                                                className="poll-btn-action delete"
                                                style={{ height: '42px' }}
                                                title={t('admin.polls.form_extras.delete_option')}
                                            >
                                                <X />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={() => setOptions([...options, {label: '', labelEn: ''}])} className="btn-secondary" style={{marginTop:'1.5rem', width:'100%', height: '50px', borderRadius: '16px', fontWeight: '800'}}>
                                <Plus style={{ marginRight: '10px' }} /> {t('admin.polls.form.add_option')}
                            </button>
                        </div>

                        <div className="poll-form-row">
                            <div className="form-group">
                                <label className="admin-label-premium">{t('admin.polls.form.duration')} ({t('admin.polls.form.days', 'días')})</label>
                                <input className="admin-input-premium" type="number" min="1" max="30" value={daysDuration} onChange={e => setDaysDuration(parseInt(e.target.value))} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                 {hasActivePoll && !isEdit && (
                                    <div style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(250, 204, 21, 0.2)', fontSize: '0.85rem', fontWeight: '700', lineHeight: '1.4' }}>
                                        {t('admin.polls.form.warning_active')}
                                    </div>
                                 )}
                            </div>
                        </div>

                        <div className="poll-form-footer">
                            <button type="button" onClick={onClose} className="btn-secondary" style={{ height: '50px', padding: '0 2rem' }}>
                                {t('admin.polls.form_extras.cancel')}
                            </button>
                            <button type="submit" className="modal-btn-primary" style={{ height: '50px', padding: '0 2.5rem', background: buttonSuccess ? '#22c55e' : ''}} disabled={creating || buttonSuccess}>
                                {creating ? <Loader2 className="spin" /> : buttonSuccess ? (
                                    <><Check /> {t('admin.polls.form.success')}</>
                                ) : (
                                    <><Check /> {isEdit ? t('admin.polls.form.update', 'Actualizar') : t('admin.polls.form.submit')}</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

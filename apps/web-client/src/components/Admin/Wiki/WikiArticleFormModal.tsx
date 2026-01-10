import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Save, X } from "lucide-react"
import { useTranslation } from "react-i18next"
import { TFunction } from "i18next"
import { WikiArticle } from "../../../services/wikiService"
import Loader from "../../UI/Loader"

interface WikiArticleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (article: Partial<WikiArticle>) => Promise<void>;
    initialData: Partial<WikiArticle> | null;
    isEditing: boolean;
    saving: boolean;
}


// Internal component to handle form state and logic
function WikiArticleForm({ 
    initialData, 
    onSave, 
    onClose, 
    isEditing, 
    saving, 
    t 
}: { 
    initialData: Partial<WikiArticle> | null, 
    onSave: (article: Partial<WikiArticle>) => Promise<void>, 
    onClose: () => void, 
    isEditing: boolean, 
    saving: boolean,
    t: TFunction
}) {
    const [formData, setFormData] = useState<Partial<WikiArticle>>(initialData || {
        title: "",
        slug: "",
        content: "",
        category: "General"
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSave(formData)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: '#555', marginBottom: '0.5rem', letterSpacing: '1px' }}>{t('admin.wiki.title_label')}</label>
                    <input 
                        type="text" 
                        required
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        placeholder={t('admin.wiki.title_placeholder')}
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.8rem 1rem', color: '#fff', outline: 'none' }}
                    />
                </div>
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: '#555', marginBottom: '0.5rem', letterSpacing: '1px' }}>{t('admin.wiki.slug_label')}</label>
                    <input 
                        type="text" 
                        required
                        value={formData.slug} 
                        onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                        placeholder={t('admin.wiki.slug_placeholder')}
                        style={{ width: '100%', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.8rem 1rem', color: '#fff', outline: 'none' }}
                    />
                </div>
            </div>

            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: '#555', marginBottom: '0.5rem', letterSpacing: '1px' }}>{t('admin.wiki.category_label')}</label>
                <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    style={{ width: '100%', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.8rem 1rem', color: '#fff', outline: 'none' }}
                >
                    <option value="General">{t('admin.wiki.categories.general')}</option>
                    <option value="Mecánicas">{t('admin.wiki.categories.mechanics')}</option>
                    <option value="Economía">{t('admin.wiki.categories.economy')}</option>
                    <option value="Comandos">{t('admin.wiki.categories.commands')}</option>
                    <option value="Rangos">{t('admin.wiki.categories.ranks')}</option>
                </select>
            </div>

            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: '#555', marginBottom: '0.5rem', letterSpacing: '1px' }}>{t('admin.wiki.content_label')}</label>
                <textarea 
                    required
                    rows={12}
                    value={formData.content} 
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    style={{ width: '100%', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.8rem 1rem', color: '#fff', outline: 'none', fontFamily: 'monospace', fontSize: '0.9rem' }}
                    placeholder={t('admin.wiki.content_placeholder')}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={onClose} style={{ padding: '0.8rem 2rem', color: '#666', background: 'transparent', border: 'none', cursor: 'pointer' }}>{t('admin.wiki.cancel')}</button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '0.8rem 3rem' }}>
                    {saving ? <Loader /> : <>{isEditing ? <><Save style={{marginRight: '8px'}} /> {t('admin.wiki.update_btn')}</> : <><Save style={{marginRight: '8px'}} /> {t('admin.wiki.publish_btn')}</>}</>}
                </button>
            </div>
        </form>
    );
}

export default function WikiArticleFormModal({ isOpen, onClose, onSave, initialData, isEditing, saving }: WikiArticleFormModalProps) {
    const { t } = useTranslation()

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="form-overlay"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(5px)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem'
                    }}
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="form-container"
                        style={{
                            background: '#111',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '20px',
                            width: '100%',
                            maxWidth: '1000px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            padding: '2.5rem'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{color: '#fff', margin: 0}}>{isEditing ? t('admin.wiki.edit_title') : t('admin.wiki.new_title')}</h2>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        {/* 
                            Key forces a fresh instance when opening/switching articles (create vs edit). 
                            This ensures state is initialized from initialData prop without needing useEffect sync.
                        */}
                        <WikiArticleForm 
                            key={initialData ? `edit-${initialData.slug}` : 'create-new'}
                            initialData={initialData}
                            onSave={onSave}
                            onClose={onClose}
                            isEditing={isEditing}
                            saving={saving}
                            t={t}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

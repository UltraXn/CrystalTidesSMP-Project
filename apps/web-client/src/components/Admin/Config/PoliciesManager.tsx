import { useState, useEffect, useMemo } from 'react'
import { Save, AlertTriangle, Shield, FileText, RefreshCw, Check, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Loader from '../../UI/Loader'
import { 
    usePolicies, 
    useUpdatePolicy, 
    useTranslateText, 
    Policy 
} from '../../../hooks/useAdminData'

export default function PoliciesManager() {
    const { t } = useTranslation()
    
    // TanStack Query Hooks
    const { data: policiesRaw, isLoading: loading } = usePolicies()
    const updatePolicyMutation = useUpdatePolicy()
    const translateMutation = useTranslateText()

    const policies = useMemo(() => policiesRaw || [], [policiesRaw])
    const [selectedSlug, setSelectedSlug] = useState<string>('privacy')
    const [editLang, setEditLang] = useState<'es' | 'en'>('es')
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    // Form state
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [titleEn, setTitleEn] = useState('')
    const [contentEn, setContentEn] = useState('')

    const currentPolicy = useMemo(() => 
        policies.find((p: Policy) => p.slug === selectedSlug) || null
    , [policies, selectedSlug])

    // Sync form with selected policy
    useEffect(() => {
        if (currentPolicy) {
            // Defer state updates to avoid synchronous setState warning during render
            Promise.resolve().then(() => {
                setTitle(currentPolicy.title || '')
                setContent(currentPolicy.content || '')
                setTitleEn(currentPolicy.title_en || '')
                setContentEn(currentPolicy.content_en || '')
            });
        }
    }, [currentPolicy])

    const handleAutoTranslate = async () => {
        if (!title || !content) return
        try {
            setMessage(null)
            const [tTitle, tContent] = await Promise.all([
                translateMutation.mutateAsync({ text: title, targetLang: 'en' }),
                translateMutation.mutateAsync({ text: content, targetLang: 'en' })
            ])
            setTitleEn(tTitle)
            setContentEn(tContent)
            setMessage({ text: t('admin.settings.policies.translate_success', 'Traducido con éxito. Revisa el contenido.'), type: 'success' })
        } catch (error) {
            console.error(error)
            setMessage({ text: t('admin.settings.policies.translate_error', 'Error al traducir.'), type: 'error' })
        }
    }

    const handleSave = async () => {
        if (!selectedSlug) return
        setMessage(null)
        
        const payload = {
            title,
            content,
            title_en: titleEn,
            content_en: contentEn
        }

        updatePolicyMutation.mutate({ slug: selectedSlug, payload }, {
            onSuccess: () => {
                setMessage({ text: t('admin.settings.policies.save_success', 'Política actualizada con éxito'), type: 'success' })
            },
            onError: () => {
                setMessage({ text: t('admin.settings.policies.save_error', 'Error al guardar la política'), type: 'error' })
            }
        })
    }

    const handleReset = () => {
        if (currentPolicy) {
            setTitle(currentPolicy.title || '')
            setContent(currentPolicy.content || '')
            setTitleEn(currentPolicy.title_en || '')
            setContentEn(currentPolicy.content_en || '')
            setMessage(null)
        }
    }

    if (loading && policies.length === 0) return <div style={{ padding: '2rem', textAlign: 'center' }}><Loader /></div>

    const saving = updatePolicyMutation.isPending
    const translating = translateMutation.isPending

    return (
        <div className="policies-manager">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                
                {/* Sidebar Selector */}
                <div style={{ 
                    background: 'rgba(10, 10, 15, 0.4)', 
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px', 
                    padding: '1.5rem', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    height: 'fit-content',
                    textAlign: 'center'
                }}>
                    <h4 style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '1px', fontWeight: '800' }}>
                        {t('admin.settings.policies.select_title', 'Documentos Legales')}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {policies.map((p: Policy) => (
                            <button
                                key={p.slug}
                                onClick={() => setSelectedSlug(p.slug)}
                                className="hover-lift"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    padding: '1rem',
                                    border: selectedSlug === p.slug ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '16px',
                                    background: selectedSlug === p.slug ? 'rgba(var(--accent-rgb), 0.1)' : 'rgba(255,255,255,0.02)',
                                    color: selectedSlug === p.slug ? '#fff' : 'rgba(255,255,255,0.6)',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    fontWeight: selectedSlug === p.slug ? '800' : '500',
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    width: '100%'
                                }}
                            >
                                <div style={{ 
                                    color: selectedSlug === p.slug ? 'var(--accent)' : 'inherit',
                                    display: 'flex'
                                }}>
                                    {p.slug === 'privacy' ? <Shield size={18} /> : <FileText size={18} />}
                                </div>
                                <span style={{ letterSpacing: '0.5px' }}>{p.slug.toUpperCase()}</span>
                                {selectedSlug === p.slug && (
                                    <div style={{ position: 'absolute', right: '1rem', width: '6px', height: '6px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent)' }}></div>
                                )}
                            </button>
                        ))}
                    </div>
                    
                    <div style={{ marginTop: '2rem', padding: '1.2rem', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.15)', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '10px', color: '#fbbf24', marginBottom: '0.8rem', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertTriangle />
                            <strong style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>LIVE EDITING</strong>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: '1.5' }}>
                            {t('admin.settings.policies.warning', 'Los cambios se reflejan inmediatamente en la web pública.')}
                        </p>
                    </div>
                </div>

                {/* Editor Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {currentPolicy ? (
                        <>
                            <div className="admin-card" style={{ margin: 0, padding: '2rem', background: 'rgba(10, 10, 15, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px' }}>
                                
                                {/* Language Tabs */}
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '1rem', 
                                    marginBottom: '2rem', 
                                    borderBottom: '1px solid rgba(255,255,255,0.1)', 
                                    paddingBottom: '1rem', 
                                    alignItems: 'center',
                                    flexWrap: 'wrap' 
                                }}>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        <button 
                                            onClick={() => setEditLang('es')}
                                            style={{
                                                background: 'none', border: 'none',
                                                color: editLang === 'es' ? '#fff' : 'rgba(255,255,255,0.4)',
                                                fontWeight: editLang === 'es' ? '800' : '500',
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                borderBottom: editLang === 'es' ? '2px solid var(--accent)' : '2px solid transparent',
                                                paddingBottom: '0.5rem',
                                                transition: 'all 0.2s',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.2rem' }}>🇪🇸</span> Español (Principal)
                                        </button>
                                        <button 
                                            onClick={() => setEditLang('en')}
                                            style={{
                                                background: 'none', border: 'none',
                                                color: editLang === 'en' ? '#fff' : 'rgba(255,255,255,0.4)',
                                                fontWeight: editLang === 'en' ? '800' : '500',
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                borderBottom: editLang === 'en' ? '2px solid var(--accent)' : '2px solid transparent',
                                                paddingBottom: '0.5rem',
                                                transition: 'all 0.2s',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.2rem' }}>🇺🇸</span> English (Translation)
                                        </button>
                                    </div>
                                    
                                    {editLang === 'en' && (
                                        <button
                                            onClick={handleAutoTranslate}
                                            disabled={translating || !title || !content}
                                            style={{
                                                marginLeft: 'auto',
                                                background: 'rgba(var(--accent-rgb), 0.1)',
                                                border: '1px solid rgba(var(--accent-rgb), 0.3)',
                                                color: 'var(--accent)',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontWeight: '600',
                                                fontSize: '0.85rem',
                                                transition: 'all 0.2s',
                                                flexShrink: 0
                                            }}
                                            className="hover-lift"
                                        >
                                            {translating ? (
                                                <RefreshCw size={16} className="infinite-rotate" />
                                            ) : (
                                                <Globe size={16} />
                                            )}
                                            {t('admin.settings.policies.auto_translate', 'Traducir con IA')}
                                        </button>
                                    )}
                                </div>

                                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                    <label style={{ display: 'block', marginBottom: '0.8rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {t('admin.settings.policies.field_title', 'Título del Documento')} ({editLang.toUpperCase()})
                                    </label>
                                    <input
                                        className="admin-input-premium"
                                        value={editLang === 'es' ? title : titleEn}
                                        onChange={(e) => editLang === 'es' ? setTitle(e.target.value) : setTitleEn(e.target.value)}
                                        placeholder={editLang === 'en' ? "Privacy Policy" : "Política de Privacidad"}
                                        style={{ width: '100%', fontSize: '1.3rem', fontWeight: '800', padding: '1rem', textAlign: 'center' }}
                                    />
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                        <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {t('admin.settings.policies.field_content', 'Contenido (Markdown)')} ({editLang.toUpperCase()})
                                        </label>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--accent)', background: 'rgba(var(--accent-rgb), 0.1)', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>Markdown Soportado</span>
                                    </div>
                                    <div className="custom-scrollbar" style={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                        <textarea
                                            className="admin-textarea"
                                            value={editLang === 'es' ? content : contentEn}
                                            onChange={(e) => editLang === 'es' ? setContent(e.target.value) : setContentEn(e.target.value)}
                                            rows={20}
                                            placeholder={editLang === 'en' ? "Write the policy content in English here..." : "Escribe el contenido aquí..."}
                                            style={{ 
                                                width: '100%', 
                                                fontFamily: '"JetBrains Mono", monospace', 
                                                fontSize: '0.95rem', 
                                                lineHeight: '1.6', 
                                                background: 'rgba(0,0,0,0.3)',
                                                border: 'none',
                                                padding: '1.5rem',
                                                color: '#e0e0e0',
                                                outline: 'none',
                                                resize: 'vertical'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
                                <div style={{ flex: '1 1 100%', order: 2, minHeight: '24px' }}>
                                    {message && (
                                        <div style={{ 
                                            color: message.type === 'success' ? '#4ade80' : '#ef4444', 
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            fontWeight: '600',
                                            animation: 'fadeIn 0.3s'
                                        }}>
                                            {message.type === 'success' ? <Check /> : <AlertTriangle />} {message.text}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', width: '100%', order: 1 }}>
                                    <button 
                                        className="hover-lift" 
                                        onClick={handleReset}
                                        disabled={loading || saving}
                                        style={{ 
                                            flex: 1,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'rgba(255,255,255,0.8)',
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <RefreshCw className={loading ? 'infinite-rotate' : ''} size={18} /> {t('admin.common.reset', 'Restablecer')}
                                    </button>
                                    <button 
                                        className="modal-btn-primary hover-lift" 
                                        onClick={handleSave}
                                        disabled={saving || loading || !title.trim() || !content.trim()}
                                        style={{ 
                                            flex: 2,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                                            padding: '1rem', borderRadius: '12px' 
                                        }}
                                    >
                                        {saving ? (
                                            <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '14px', height: '14px', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span> Guardando...</>
                                        ) : (
                                            <><Save size={18} /> {t('admin.common.save', 'Guardar Cambios')}</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10, 10, 15, 0.4)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Loader />
                        </div>
                    )}
                </div>
                <style>{`
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                    .infinite-rotate { animation: spin 1s linear infinite; }
                    .admin-textarea:focus { box-shadow: inset 0 0 0 1px var(--accent); }
                `}</style>
            </div>
        </div>
    )
}

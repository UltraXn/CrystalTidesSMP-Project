import { useState, useEffect, useRef, useMemo, useReducer, useCallback } from 'react'
import { Save, AlertTriangle, Shield, FileText, RefreshCw, Check, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import "../../../styles/admin/policies_manager.css"
import Loader from '../../UI/Loader'
import { 
    usePolicies, 
    useUpdatePolicy, 
    useTranslateText, 
    Policy 
} from '../../../hooks/useAdminData'

const STYLES = {
    transition: 'color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s',
    glassBg: 'rgba(10, 10, 15, 0.4)',
    borderSubtle: '1px solid rgba(255,255,255,0.05)',
    accentColor: 'var(--accent)',
    accentBgSubtle: 'rgba(var(--accent-rgb), 0.1)',
    textMuted: 'rgba(255,255,255,0.6)',
    textDim: 'rgba(255,255,255,0.4)',
    textLabel: 'rgba(255,255,255,0.5)',
} as const

interface FormState {
    title: string
    content: string
    titleEn: string
    contentEn: string
}

type FormAction = 
    | { type: 'SET_FORM'; payload: FormState }
    | { type: 'UPDATE_FIELD'; field: keyof FormState; value: string }
    | { type: 'SET_TRANSLATIONS'; titleEn: string; contentEn: string }

const formReducer = (state: FormState, action: FormAction): FormState => {
    switch (action.type) {
        case 'SET_FORM':
            return action.payload
        case 'UPDATE_FIELD':
            return { ...state, [action.field]: action.value }
        case 'SET_TRANSLATIONS':
            return { ...state, titleEn: action.titleEn, contentEn: action.contentEn }
        default:
            return state
    }
}

interface PolicySidebarProps {
    policies: Policy[]
    selectedSlug: string
    onSelectPolicy: (slug: string) => void
}

function PolicySidebar({ policies, selectedSlug, onSelectPolicy }: PolicySidebarProps) {
    const { t } = useTranslation()

    return (
        <div style={{ 
            background: STYLES.glassBg, 
            backdropFilter: 'blur(10px)',
            borderRadius: '20px', 
            padding: '1.5rem', 
            border: STYLES.borderSubtle,
            height: 'fit-content',
            textAlign: 'center'
        }}>
            <h4 style={{ 
                color: STYLES.textDim, 
                fontSize: '0.8rem', 
                textTransform: 'uppercase', 
                marginBottom: '1.5rem', 
                letterSpacing: '1px', 
                fontWeight: '800' 
            }}>
                {t('admin.settings.policies.select_title', 'Documentos Legales')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {policies.map((p: Policy) => {
                    const isSelected = selectedSlug === p.slug
                    return (
                        <button
                            type="button"
                            key={p.slug}
                            onClick={() => onSelectPolicy(p.slug)}
                            className="hover-lift"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                padding: '1rem',
                                border: isSelected ? '1px solid var(--accent)' : STYLES.borderSubtle,
                                borderRadius: '16px',
                                background: isSelected ? STYLES.accentBgSubtle : 'rgba(255,255,255,0.02)',
                                color: isSelected ? '#fff' : STYLES.textMuted,
                                cursor: 'pointer',
                                textAlign: 'center',
                                fontWeight: isSelected ? '800' : '500',
                                transition: STYLES.transition,
                                position: 'relative',
                                overflow: 'hidden',
                                width: '100%'
                            }}
                        >
                            <div style={{ color: isSelected ? STYLES.accentColor : 'inherit', display: 'flex' }}>
                                {p.slug === 'privacy' ? <Shield size={18} /> : <FileText size={18} />}
                            </div>
                            <span style={{ letterSpacing: '0.5px' }}>{p.slug.toUpperCase()}</span>
                            {isSelected && (
                                <div style={{ 
                                    position: 'absolute', 
                                    right: '1rem', 
                                    width: '6px', 
                                    height: '6px', 
                                    background: STYLES.accentColor, 
                                    borderRadius: '50%', 
                                    boxShadow: '0 0 10px var(--accent)' 
                                }} />
                            )}
                        </button>
                    )
                })}
            </div>
            
            <div style={{ 
                marginTop: '2rem', 
                padding: '1.2rem', 
                background: 'rgba(245, 158, 11, 0.08)', 
                borderRadius: '16px', 
                border: '1px solid rgba(245, 158, 11, 0.15)', 
                textAlign: 'center' 
            }}>
                <div style={{ display: 'flex', gap: '10px', color: '#fbbf24', marginBottom: '0.8rem', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle />
                    <strong style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>LIVE EDITING</strong>
                </div>
                <p style={{ fontSize: '0.85rem', color: STYLES.textMuted, margin: 0, lineHeight: '1.5' }}>
                    {t('admin.settings.policies.warning', 'Los cambios se reflejan inmediatamente en la web pública.')}
                </p>
            </div>
        </div>
    )
}

interface PolicyLanguageTabsProps {
    editLang: 'es' | 'en'
    onSelectLang: (lang: 'es' | 'en') => void
    onAutoTranslate: () => void
    translating: boolean
    canTranslate: boolean
}

function PolicyLanguageTabs({ editLang, onSelectLang, onAutoTranslate, translating, canTranslate }: PolicyLanguageTabsProps) {
    const { t } = useTranslation()

    const getTabStyle = (lang: 'es' | 'en') => ({
        background: 'none',
        border: 'none',
        color: editLang === lang ? '#fff' : STYLES.textDim,
        fontWeight: editLang === lang ? '800' : '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: editLang === lang ? '2px solid var(--accent)' : '2px solid transparent',
        paddingBottom: '0.5rem',
        transition: STYLES.transition,
        whiteSpace: 'nowrap' as const
    })

    return (
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
                    type="button" 
                    onClick={() => onSelectLang('es')}
                    style={getTabStyle('es')}
                >
                    <span style={{ fontSize: '1.2rem' }}>🇪🇸</span> Español (Principal)
                </button>
                <button 
                    type="button" 
                    onClick={() => onSelectLang('en')}
                    style={getTabStyle('en')}
                >
                    <span style={{ fontSize: '1.2rem' }}>🇺🇸</span> English (Translation)
                </button>
            </div>
            
            {editLang === 'en' && (
                <button 
                    type="button"
                    onClick={onAutoTranslate}
                    disabled={translating || !canTranslate}
                    style={{
                        marginLeft: 'auto',
                        background: STYLES.accentBgSubtle,
                        border: '1px solid rgba(var(--accent-rgb), 0.3)',
                        color: STYLES.accentColor,
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        transition: STYLES.transition,
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
    )
}

interface PolicyEditorFormProps {
    editLang: 'es' | 'en'
    titleValue: string
    contentValue: string
    onTitleChange: (val: string) => void
    onContentChange: (val: string) => void
}

function PolicyEditorForm({ editLang, titleValue, contentValue, onTitleChange, onContentChange }: PolicyEditorFormProps) {
    const { t } = useTranslation()
    const isEn = editLang === 'en'

    return (
        <>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <label 
                    htmlFor="policy-doc-title" 
                    style={{ 
                        display: 'block', 
                        marginBottom: '0.8rem', 
                        color: STYLES.textLabel, 
                        fontSize: '0.85rem', 
                        fontWeight: '700', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.5px' 
                    }}
                >
                    {t('admin.settings.policies.field_title', 'Título del Documento')} ({editLang.toUpperCase()})
                </label>
                <input 
                    id="policy-doc-title"
                    className="admin-input-premium"
                    value={titleValue}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder={isEn ? "Privacy Policy" : "Política de Privacidad"}
                    style={{ width: '100%', fontSize: '1.3rem', fontWeight: '800', padding: '1rem', textAlign: 'center' }}
                />
            </div>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <label 
                        htmlFor="policy-doc-content" 
                        style={{ 
                            color: STYLES.textLabel, 
                            fontSize: '0.85rem', 
                            fontWeight: '700', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.5px' 
                        }}
                    >
                        {t('admin.settings.policies.field_content', 'Contenido (Markdown)')} ({editLang.toUpperCase()})
                    </label>
                    <span style={{ 
                        fontSize: '0.75rem', 
                        color: STYLES.accentColor, 
                        background: STYLES.accentBgSubtle, 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontWeight: 'bold' 
                    }}>
                        Markdown Soportado
                    </span>
                </div>
                <div className="custom-scrollbar" style={{ borderRadius: '16px', border: STYLES.borderSubtle, overflow: 'hidden' }}>
                    <textarea 
                        id="policy-doc-content"
                        className="admin-textarea"
                        value={contentValue}
                        onChange={(e) => onContentChange(e.target.value)}
                        rows={20}
                        placeholder={isEn ? "Write the policy content in English here..." : "Escribe el contenido aquí..."}
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
        </>
    )
}

interface PolicyFooterActionsProps {
    message: { text: string; type: 'success' | 'error' } | null
    loading: boolean
    saving: boolean
    canSave: boolean
    onReset: () => void
    onSave: () => void
}

function PolicyFooterActions({ message, loading, saving, canSave, onReset, onSave }: PolicyFooterActionsProps) {
    const { t } = useTranslation()

    return (
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
                    type="button" 
                    className="hover-lift" 
                    onClick={onReset}
                    disabled={loading || saving}
                    style={{ 
                        flex: 1,
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px',
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
                    type="button" 
                    className="modal-btn-primary hover-lift" 
                    onClick={onSave}
                    disabled={saving || loading || !canSave}
                    style={{ 
                        flex: 2,
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        padding: '1rem', 
                        borderRadius: '12px' 
                    }}
                >
                    {saving ? (
                        <>
                            <span 
                                className="spinner-border spinner-border-sm" 
                                role="status" 
                                aria-hidden="true" 
                                style={{ 
                                    width: '14px', 
                                    height: '14px', 
                                    border: '2px solid rgba(0,0,0,0.2)', 
                                    borderTopColor: '#000', 
                                    borderRadius: '50%', 
                                    animation: 'spin 1s linear infinite' 
                                }} 
                            /> 
                            Guardando...
                        </>
                    ) : (
                        <><Save size={18} /> {t('admin.common.save', 'Guardar Cambios')}</>
                    )}
                </button>
            </div>
        </div>
    )
}

export default function PoliciesManager() {
    const { t } = useTranslation()
    
    const { data: policiesRaw, isLoading: loading } = usePolicies()
    const updatePolicyMutation = useUpdatePolicy()
    const translateMutation = useTranslateText()

    const policies = useMemo(() => policiesRaw || [], [policiesRaw])
    const [selectedSlug, setSelectedSlug] = useState<string>('privacy')
    const [editLang, setEditLang] = useState<'es' | 'en'>('es')
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    const [formState, dispatchForm] = useReducer(formReducer, {
        title: '',
        content: '',
        titleEn: '',
        contentEn: ''
    })
    const { title, content, titleEn, contentEn } = formState

    const setTitle = (val: string) => dispatchForm({ type: 'UPDATE_FIELD', field: 'title', value: val })
    const setContent = (val: string) => dispatchForm({ type: 'UPDATE_FIELD', field: 'content', value: val })
    const setTitleEn = (val: string) => dispatchForm({ type: 'UPDATE_FIELD', field: 'titleEn', value: val })
    const setContentEn = (val: string) => dispatchForm({ type: 'UPDATE_FIELD', field: 'contentEn', value: val })

    const currentPolicy = useMemo(() => 
        policies.find((p: Policy) => p.slug === selectedSlug) || null
    , [policies, selectedSlug])

    const syncFormFromPolicy = useCallback((policy: Policy | null) => {
        if (!policy) return
        dispatchForm({
            type: 'SET_FORM',
            payload: {
                title: policy.title || '',
                content: policy.content || '',
                titleEn: policy.title_en || '',
                contentEn: policy.content_en || ''
            }
        })
    }, [])

    const hasInitialSynced = useRef(false)
    useEffect(() => {
        if (!hasInitialSynced.current && currentPolicy) {
            syncFormFromPolicy(currentPolicy)
            hasInitialSynced.current = true
        }
    }, [currentPolicy, syncFormFromPolicy])

    const handleSelectPolicy = (slug: string) => {
        setSelectedSlug(slug)
        const policy = policies.find((p: Policy) => p.slug === slug) || null
        syncFormFromPolicy(policy)
    }

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

    const handleSave = () => {
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
        if (!currentPolicy) return
        setTitle(currentPolicy.title || '')
        setContent(currentPolicy.content || '')
        setTitleEn(currentPolicy.title_en || '')
        setContentEn(currentPolicy.content_en || '')
        setMessage(null)
    }

    if (loading && policies.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <Loader />
            </div>
        )
    }

    const saving = updatePolicyMutation.isPending
    const translating = translateMutation.isPending
    const isEditingEs = editLang === 'es'
    const activeTitle = isEditingEs ? title : titleEn
    const activeContent = isEditingEs ? content : contentEn
    const handleTitleChange = isEditingEs ? setTitle : setTitleEn
    const handleContentChange = isEditingEs ? setContent : setContentEn
    const canSave = Boolean(title.trim() && content.trim())

    return (
        <div className="policies-manager">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <PolicySidebar 
                    policies={policies}
                    selectedSlug={selectedSlug}
                    onSelectPolicy={handleSelectPolicy}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {currentPolicy ? (
                        <>
                            <div 
                                className="admin-card" 
                                style={{ 
                                    margin: 0, 
                                    padding: '2rem', 
                                    background: STYLES.glassBg, 
                                    backdropFilter: 'blur(20px)', 
                                    border: STYLES.borderSubtle, 
                                    borderRadius: '24px' 
                                }}
                            >
                                <PolicyLanguageTabs 
                                    editLang={editLang}
                                    onSelectLang={setEditLang}
                                    onAutoTranslate={handleAutoTranslate}
                                    translating={translating}
                                    canTranslate={Boolean(title && content)}
                                />

                                <PolicyEditorForm 
                                    editLang={editLang}
                                    titleValue={activeTitle}
                                    contentValue={activeContent}
                                    onTitleChange={handleTitleChange}
                                    onContentChange={handleContentChange}
                                />
                            </div>

                            <PolicyFooterActions 
                                message={message}
                                loading={loading}
                                saving={saving}
                                canSave={canSave}
                                onReset={handleReset}
                                onSave={handleSave}
                            />
                        </>
                    ) : (
                        <div style={{ 
                            height: '400px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            background: STYLES.glassBg, 
                            borderRadius: '24px', 
                            border: STYLES.borderSubtle 
                        }}>
                            <Loader />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, X, Plus, CheckCircle2, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import Section from '../components/Layout/Section'
import { useTranslation } from 'react-i18next'

interface PendingImage {
    blob: Blob;
    preview: string;
    name: string;
}

const API_URL = import.meta.env.VITE_API_URL

export default function CreateThread() {
    const { user } = useAuth()
    const { t } = useTranslation()
    const navigate = useNavigate()
    
    // Thread Data
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [categoryId, setCategoryId] = useState('2') // Default General
    
    // Poll Data
    const [showPoll, setShowPoll] = useState(false)
    const [pollQuestion, setPollQuestion] = useState('')
    const [pollOptions, setPollOptions] = useState(['Si', 'No'])
    const [discordLink, setDiscordLink] = useState('')
    const [isDiscordPoll, setIsDiscordPoll] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    // State for deferred upload
    const [pendingImage, setPendingImage] = useState<PendingImage | null>(null)

    // Utility to compress image to WebP
    const compressImage = async (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.src = URL.createObjectURL(file)
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                
                // Max dimension rule (1920px)
                const MAX_SIZE = 1920
                let width = img.width
                let height = img.height
                
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width
                        width = MAX_SIZE
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height
                        height = MAX_SIZE
                    }
                }

                canvas.width = width
                canvas.height = height
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height)
                }
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob) 
                    } else {
                        reject(new Error("Compression failed"))
                    }
                }, 'image/webp', 0.8) // 0.8 Quality = Great balance
            }
            img.onerror = (err) => reject(err)
        })
    }

    const handleImageSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 20 * 1024 * 1024) {
            return alert("La imagen es demasiado pesada. Máximo 20MB.")
        }

        try {
            // Compress immediately but DO NOT upload yet
            const compressedBlob = await compressImage(file)
            
            // Create a local preview
            const previewUrl = URL.createObjectURL(compressedBlob)
            
            setPendingImage({
                blob: compressedBlob,
                preview: previewUrl,
                name: file.name
            })

            // Clear input
            e.target.value = ''

        } catch (error) {
            console.error("Compression Error:", error)
            alert("Error al procesar la imagen.")
        }
    }

    const clearPendingImage = () => {
        if(pendingImage?.preview) URL.revokeObjectURL(pendingImage.preview)
        setPendingImage(null)
    }

    const uploadPendingImage = async () => {
        if (!pendingImage) return null

        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.webp`
        const { error } = await supabase.storage
            .from('forum-uploads')
            .upload(fileName, pendingImage.blob, {
                contentType: 'image/webp',
                cacheControl: '3600',
                upsert: false
            })

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
            .from('forum-uploads')
            .getPublicUrl(fileName)
            
        return publicUrl
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if(!user) return alert(t('create_thread.form.error_login'))
        setSubmitting(true)
        
        try {
            let finalContent = content

            // 1. Upload Image if exists
            if (pendingImage) {
                const imageUrl = await uploadPendingImage()
                if (imageUrl) {
                    finalContent += `\n\n![Imagen](${imageUrl})`
                }
            }

            // 2. Prepare Poll Data
            const pollData = showPoll ? {
                enabled: true,
                question: isDiscordPoll ? "Encuesta de Discord" : pollQuestion,
                options: isDiscordPoll ? [] : pollOptions.filter(o => o.trim() !== ''),
                discord_link: isDiscordPoll ? discordLink : null,
                closes_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            } : null

            // 3. Create Thread
            const body = {
                category_id: parseInt(categoryId),
                title,
                content: finalContent,
                user_data: {
                    id: user.id || 'anonymous', 
                    name: user?.user_metadata?.username || user?.email?.split('@')[0] || "Usuario",
                    avatar: user?.user_metadata?.avatar_url,
                    role: user?.user_metadata?.role || 'user'
                },
                poll_data: pollData
            }

            const res = await fetch(`${API_URL}/forum/threads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if(res.ok) {
                const data = await res.json()
                navigate(`/forum/thread/topic/${data.id}`)
            } else {
                alert(t('create_thread.form.error_create'))
            }
        } catch(err) { 
            console.error(err)
            const message = err instanceof Error ? err.message : String(err)
            alert("Error al crear el tema o subir la imagen: " + message)
        } finally {
            setSubmitting(false)
        }
    }


    const updateOption = (idx: number, val: string) => {
        const newOpts = [...pollOptions]
        newOpts[idx] = val
        setPollOptions(newOpts)
    }

    return (
        <Section title={t('create_thread.title')}>
            <Section>
                <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(0,0,0,0.4)', padding: '2rem', borderRadius: '12px' }}>
                    
                    {/* Category Select */}
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>{t('create_thread.form.category')}</label>
                        <select 
                            className="form-input" 
                            value={categoryId} 
                            onChange={e => setCategoryId(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '6px' }}
                        >
                            <option value="2" style={{ background: '#222', color: '#fff' }}>{t('forum_page.categories.general.title')}</option>
                            <option value="3" style={{ background: '#222', color: '#fff' }}>{t('forum_page.categories.support.title')}</option>
                            <option value="4" style={{ background: '#222', color: '#fff' }}>{t('forum_page.categories.offtopic.title')}</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>{t('create_thread.form.title')}</label>
                        <input 
                            className="form-input" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            placeholder={t('create_thread.form.title_placeholder')} 
                            required 
                            style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #444', borderRadius: '6px' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#ccc' }}>
                            {t('create_thread.form.content')}
                            { !pendingImage && (
                                <label className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <ImageIcon size={14} /> {t('create_thread.form.attach_image')}
                                    <input type="file" accept="image/*" onChange={handleImageSelection} style={{ display: 'none' }} />
                                </label>
                            )}
                        </label>
                        <textarea 
                            className="form-input" 
                            value={content} 
                            onChange={e => setContent(e.target.value)} 
                            placeholder={t('create_thread.form.content_placeholder')} 
                            required 
                            rows={8}
                            style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #444', borderRadius: '6px', resize: 'vertical' }}
                        />
                        
                        {/* Pending Image Preview */}
                        {pendingImage && (
                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--accent)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <img src={pendingImage.preview} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>{t('create_thread.form.image_attached')}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#ccc' }}>{t('create_thread.form.upload_preview_hint')}</span>
                                    </div>
                                </div>
                                <button type="button" onClick={clearPendingImage} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <X size={16} /> {t('create_thread.form.remove_image')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Poll Section Toggle */}
                    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: showPoll ? '1px solid var(--accent)' : '1px dashed #444' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowPoll(!showPoll)}>
                            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: showPoll ? 'var(--accent)' : '#aaa' }}>
                                <BarChart3 size={18} /> {t('create_thread.form.add_poll')}
                            </h4>
                            <div className={`checkbox ${showPoll ? 'active' : ''}`} style={{ width: '20px', height: '20px', border: '1px solid #666', borderRadius: '4px', background: showPoll ? 'var(--accent)' : 'transparent' }}>
                                {showPoll && <CheckCircle2 size={14} color="#000" style={{ margin: '2px' }} />}
                            </div>
                        </div>

                        {showPoll && (
                            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #444', paddingTop: '1.5rem' }}>
                                
                                {/* Discord Option */}
                                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input type="checkbox" checked={isDiscordPoll} onChange={e => setIsDiscordPoll(e.target.checked)} id="discordCheck" />
                                    <label htmlFor="discordCheck" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDiscordPoll ? '#5865F2' : '#ccc' }}>
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg> {t('create_thread.form.discord_poll')}
                                    </label>
                                </div>

                                {isDiscordPoll ? (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>{t('create_thread.form.discord_link_label')}</label>
                                        <input 
                                            value={discordLink} 
                                            onChange={e => setDiscordLink(e.target.value)} 
                                            placeholder="https://discord.com/channels/..." 
                                            style={{ width: '100%', padding: '0.7rem', background: '#222', border: '1px solid #555', color: '#fff', borderRadius: '4px' }}
                                        />
                                        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                                            {t('create_thread.form.discord_hint')}
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>{t('create_thread.form.poll_question')}</label>
                                        <input 
                                            value={pollQuestion} 
                                            onChange={e => setPollQuestion(e.target.value)} 
                                            placeholder="¿Pregunta?" 
                                            style={{ width: '100%', padding: '0.7rem', background: '#222', border: '1px solid #555', color: '#fff', borderRadius: '4px', marginBottom: '1rem' }}
                                        />
                                        
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>{t('create_thread.form.options')}</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {pollOptions.map((opt, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <input 
                                                        value={opt} 
                                                        onChange={e => updateOption(idx, e.target.value)} 
                                                        placeholder={`Opción ${idx + 1}`}
                                                        style={{ flexGrow: 1, padding: '0.6rem', background: '#222', border: '1px solid #555', color: '#fff', borderRadius: '4px' }}
                                                    />
                                                    {pollOptions.length > 2 && (
                                                    <button type="button" onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))} className="btn-icon delete" style={{ background: '#333', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 1rem' }}>
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => setPollOptions([...pollOptions, ''])} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem' }}>
                                                <Plus size={14} /> {t('create_thread.form.add_option')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} disabled={submitting}>
                        {submitting ? t('create_thread.form.submitting') : t('create_thread.form.submit')}
                    </button>
                    
                </form>
            </Section>
        </Section>
    )
}

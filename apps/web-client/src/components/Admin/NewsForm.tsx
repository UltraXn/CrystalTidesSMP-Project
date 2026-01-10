import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Image, Loader2, AlertTriangle, Languages } from "lucide-react"
import { useTranslation } from "react-i18next"
import { supabase } from "../../services/supabaseClient"
import { newsSchema, NewsFormValues } from "../../schemas/news"

import { User } from "@supabase/supabase-js";

interface NewsFormProps {
    initialData?: NewsFormValues;
    onSave: (data: NewsFormValues) => Promise<void>;
    onCancel: () => void;
    user: User | null;
}

export default function NewsForm({ initialData, onSave, onCancel }: NewsFormProps) {
    const { t } = useTranslation()
    const contentFileInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [translating, setTranslating] = useState(false)
    
    const API_URL = import.meta.env.VITE_API_URL || '/api'; 

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<NewsFormValues>({
        resolver: zodResolver(newsSchema),
        defaultValues: initialData || {
            title: "", 
            title_en: "", 
            category: "General", 
            content: "", 
            content_en: "", 
            status: "Draft",
            image: ""
        }
    })

    // Watch fields for translation buttons
    const title = watch("title");
    const title_en = watch("title_en");
    const content = watch("content");
    const content_en = watch("content_en");


    const convertFileToWebP = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const img = new Image()
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    canvas.width = img.width
                    canvas.height = img.height
                    const ctx = canvas.getContext('2d')
                    if (!ctx) {
                        reject(new Error('No canvas context'))
                        return
                    }
                    ctx.drawImage(img, 0, 0)
                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob)
                        else reject(new Error('Conversion failed'))
                    }, 'image/webp', 0.8)
                }
                img.onerror = reject
                img.src = e.target?.result as string
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            setUploading(true)
            setUploadError(null)
            
            const webpBlob = await convertFileToWebP(file)
            const fileName = `news/${Date.now()}.webp`
            
            const { error: uploadError } = await supabase.storage
                .from('forum-uploads')
                .upload(fileName, webpBlob, {
                     contentType: 'image/webp'
                })

            if (uploadError) {
                if (uploadError.message.includes("Bucket not found")) {
                     throw new Error(t('admin.news.upload_error_bucket'))
                }
                throw uploadError
            }

            const { data } = supabase.storage.from('forum-uploads').getPublicUrl(fileName)
            return data.publicUrl
        } catch (error: unknown) {
            console.error('Error uploading image:', error)
            setUploadError((error as Error).message || t('admin.news.upload_error_unknown'))
            return null
        } finally {
            setUploading(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return
        const file = e.target.files[0]
        const url = await uploadImage(file)
        if (url) {
            setValue("image", url, { shouldValidate: true })
        }
    }

    const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return
        const file = e.target.files[0]
        const url = await uploadImage(file)
        if (url) {
            const currentContent = watch("content") || ""
            const imageMarkdown = `\n![Imagen](${url})\n`
            setValue("content", currentContent + imageMarkdown, { shouldValidate: true })
        }
        if (contentFileInputRef.current) contentFileInputRef.current.value = ''
    }

    const handleTranslate = async (text: string, toLang: 'es' | 'en', field: 'title' | 'content' | 'title_en' | 'content_en') => {
        if (!text) return
        setTranslating(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const res = await fetch(`${API_URL}/translation`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text, targetLang: toLang })
            })
            const data = await res.json()
            if (data.success) {
                setValue(field, data.translatedText, { shouldValidate: true })
            }
        } catch (error) {
            console.error("Translation fail", error)
        } finally {
            setTranslating(false)
        }
    }

    return (
        <div className="news-form-container">
            <div className="news-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: 900, color: '#fff' }}>
                    {initialData?.id ? t('admin.news.edit_title') : t('admin.news.create_title')}
                </h3>
                <button className="btn-secondary" onClick={onCancel} style={{ borderRadius: '12px', height: '42px', flex: '1 1 auto', minWidth: '120px' }}>
                    {t('admin.news.cancel')}
                </button>
            </div>

            <div className="poll-active-card" style={{ padding: '3rem', maxWidth: '100%', borderRadius: '32px' }}>
                <div className="modal-accent-line"></div>
                <form onSubmit={handleSubmit(onSave)} className="news-form-grid">
                    
                    {/* LEFT COLUMN: Spanish & Settings */}
                    <div className="news-form-section">
                        <h4><img src="/images/ui/logo.webp" width="20" style={{ verticalAlign: 'middle', marginRight: '8px' }} /> {t('admin.news.form_extras.config_es', 'Contenido en Español')}</h4>
                        
                        <div className="form-group">
                            <label className="admin-label-premium">{t('admin.news.form.title')}</label>
                            <input
                                type="text"
                                className="admin-input-premium"
                                {...register("title")}
                                placeholder="Escribe un título impactante..."
                            />
                            {errors.title && <span style={{color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, marginTop: '5px', display: 'block'}}>{errors.title.message}</span>}
                            
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                <button
                                    type="button"
                                    className="btn-translate-premium"
                                    onClick={() => handleTranslate(title, 'en', 'title_en')}
                                    disabled={translating || !title}
                                >
                                    {translating ? <Loader2 className="spin" /> : <Languages />} {t('admin.news.translate_to_en_title')}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="admin-label-premium">{t('admin.news.form.content')}</label>
                            <div style={{ position: 'relative' }}>
                                <textarea
                                    className="admin-textarea-premium"
                                    rows={12}
                                    {...register("content")}
                                    placeholder="Desarrolla la noticia aquí..."
                                ></textarea>
                                <button 
                                    type="button" 
                                    onClick={() => contentFileInputRef.current?.click()} 
                                    className="btn-translate-premium" 
                                    style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}
                                    disabled={uploading}
                                >
                                    <Image /> {t('admin.news.insert_image')}
                                </button>
                                <input 
                                    type="file" 
                                    ref={contentFileInputRef} 
                                    style={{display: 'none'}} 
                                    accept="image/*" 
                                    onChange={handleContentImageUpload}
                                />
                            </div>
                            {errors.content && <span style={{color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, marginTop: '5px', display: 'block'}}>{errors.content.message}</span>}
                            
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                <button
                                    type="button"
                                    className="btn-translate-premium"
                                    onClick={() => handleTranslate(content, 'en', 'content_en')}
                                    disabled={translating || !content}
                                >
                                    {translating ? <Loader2 className="spin" /> : <Languages />} {t('admin.news.translate_to_en_content')}
                                </button>
                            </div>
                        </div>

                        <div className="news-selectors-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
                            <div className="form-group">
                                <label className="admin-label-premium">{t('admin.news.form.category')}</label>
                                <select className="admin-select-premium" {...register("category")}>
                                    <option value="General">General</option>
                                    <option value="Evento">Evento</option>
                                    <option value="Update">Update</option>
                                    <option value="Sistema">Sistema</option>
                                    <option value="Comunidad">Comunidad</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="admin-label-premium">{t('admin.news.form.status')}</label>
                                <select className="admin-select-premium" {...register("status")}>
                                    <option value="Draft">{t('admin.news.form.draft')}</option>
                                    <option value="Published">{t('admin.news.form.published')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: English & Image */}
                    <div className="news-form-section">
                        <h4><Languages /> {t('admin.news.form_extras.config_en', 'English Version')}</h4>

                        <div className="form-group">
                            <label className="admin-label-premium">{t('admin.news.form.title')} {t('admin.news.english_suffix')}</label>
                            <input
                                type="text"
                                className="admin-input-premium"
                                {...register("title_en")}
                                placeholder="Catchy title in English..."
                            />
                            {errors.title_en && <span style={{color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, marginTop: '5px', display: 'block'}}>{errors.title_en.message}</span>}
                            
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                <button
                                    type="button"
                                    className="btn-translate-premium"
                                    onClick={() => handleTranslate(title_en || '', 'es', 'title')}
                                    disabled={translating || !title_en}
                                >
                                    {translating ? <Loader2 className="spin" /> : <Languages />} {t('admin.news.translate_to_es_title')}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="admin-label-premium">{t('admin.news.form.content')} {t('admin.news.english_suffix')}</label>
                            <textarea
                                className="admin-textarea-premium"
                                rows={12}
                                {...register("content_en")}
                                placeholder="Develop the news content in English..."
                            ></textarea>
                            {errors.content_en && <span style={{color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, marginTop: '5px', display: 'block'}}>{errors.content_en.message}</span>}
                            
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                <button
                                    type="button"
                                    className="btn-translate-premium"
                                    onClick={() => handleTranslate(content_en || '', 'es', 'content')}
                                    disabled={translating || !content_en}
                                >
                                    {translating ? <Loader2 className="spin" /> : <Languages />} {t('admin.news.translate_to_es_content')}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="admin-label-premium">{t('admin.news.form.image')}</label>
                            <div className="news-img-preview-wrapper" style={{ marginBottom: '1rem' }}>
                                {watch("image") ? (
                                    <img src={watch("image")} className="news-img-preview" alt="Preview" />
                                ) : (
                                    <div style={{ textAlign: 'center', opacity: 0.3 }}>
                                        <Image size={40} style={{ marginBottom: '10px' }} />
                                        <p style={{ fontSize: '0.8rem', fontWeight: 800 }}>SIN IMAGEN PORTADA</p>
                                    </div>
                                )}
                                {uploading && (
                                    <div className="news-upload-loading">
                                        <Loader2 className="spin" size={24} />
                                        <span>SUBIENDO...</span>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    type="text"
                                    className="admin-input-premium"
                                    placeholder="https://su-imagen.webp"
                                    {...register("image")}
                                    style={{ flex: 1 }}
                                />
                                <button 
                                    type="button"
                                    className="modal-btn-primary"
                                    style={{ width: '54px', height: '54px', borderRadius: '14px', flexShrink: 0 }}
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'image/*';
                                        input.onchange = (e: Event) => handleImageUpload(e as unknown as React.ChangeEvent<HTMLInputElement>);
                                        input.click();
                                    }}
                                    disabled={uploading}
                                >
                                    <Image size={20} />
                                </button>
                            </div>
                            {uploadError && (
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <AlertTriangle /> {uploadError}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="news-form-footer" style={{ gridColumn: '1 / -1', marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2.5rem', flexWrap: 'wrap' }}>
                        <button type="button" onClick={onCancel} className="modal-btn-secondary" style={{ flex: '1 1 auto', minWidth: '140px', height: '54px', padding: '0 2rem' }}>
                            {t('admin.news.cancel')}
                        </button>
                        <button type="submit" className="modal-btn-primary" style={{ flex: '1 1 auto', minWidth: '140px', height: '54px', padding: '0 2rem' }} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="spin" /> : (initialData?.id ? t('admin.news.form.save') : t('admin.news.form.publish'))}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

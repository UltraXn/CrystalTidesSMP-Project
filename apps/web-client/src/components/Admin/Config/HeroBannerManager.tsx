import { useState, useRef } from 'react';
import { Image, Plus, Trash2, Edit2, Check, Link, Loader2, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../services/supabaseClient';

interface HeroSlide {
    id?: number;
    image: string;
    title: string;
    text: string;
    buttonText: string;
    link: string;
}

interface HeroBannerManagerProps {
    settings: {
        hero_slides?: string | HeroSlide[];
    };
    onUpdate: (key: string, value: string) => void;
    saving: string | null;
}

const DEFAULT_SLIDES = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1599939571322-792a326991f2?q=80&w=2574',
        title: 'Bienvenidos a CrystalTides',
        text: 'Únete a la aventura RPG más inmersiva de Minecraft.',
        buttonText: 'Jugar Ahora',
        link: '/play'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1627850604058-52e40de1b847?q=80&w=2673',
        title: 'Nueva Temporada: Frostbite',
        text: 'Explora las tierras heladas y derrota al Rey Lich.',
        buttonText: 'Ver Detalles',
        link: '/news/frostbite'
    }
];

// Helper to generate IDs outside of component render scope to satisfy strict linter
const generateId = () => Date.now();

export default function HeroBannerManager({ settings, onUpdate, saving }: HeroBannerManagerProps) {
    const { t } = useTranslation();
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [activeEditIndex, setActiveEditIndex] = useState<number | null>(null);
    const [prevSlidesStr, setPrevSlidesStr] = useState<string | null>(null);
    
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState<HeroSlide>({
        id: 0,
        image: '',
        title: '',
        text: '',
        buttonText: '',
        link: ''
    });

    // Pattern: Adjust state during render when props change
    const slidesStr = settings?.hero_slides ? (typeof settings.hero_slides === 'string' ? settings.hero_slides : JSON.stringify(settings.hero_slides)) : null;

    if (slidesStr !== prevSlidesStr) {
        setPrevSlidesStr(slidesStr);
        if (slidesStr) {
            try {
                const parsed = JSON.parse(slidesStr);
                setSlides(Array.isArray(parsed) ? (parsed as HeroSlide[]) : (DEFAULT_SLIDES as HeroSlide[]));
            } catch { setSlides(DEFAULT_SLIDES as HeroSlide[]); }
        } else {
            setSlides(DEFAULT_SLIDES as HeroSlide[]);
        }
    }

    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            setUploading(true);
            
            // Generate filename based on timestamp
            const fileExt = file.name.split('.').pop() || 'png';
            const fileName = `hero-banners/${Date.now()}.${fileExt}`;

            // Helper to convert to WebP (Simplified version without canvas for now if accept="image/*" or direct upload)
            // Ideally we use the same canvas logic as AdminNews but for brevity let's try direct upload first or simplified.
            // Let's perform a direct upload of the file for now to ensure it works, user can optimize if needed.
            // Actually, let's use the file type.
            
            const { error: uploadError } = await supabase.storage
                .from('forum-uploads') // Using same bucket for now
                .upload(fileName, file, {
                     contentType: file.type
                });

            if (uploadError) throw uploadError;

            const { data: publicData } = supabase.storage.from('forum-uploads').getPublicUrl(fileName);
            return publicData.publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            alert("Error al subir imagen");
            return null;
        } finally {
            setUploading(false);
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const url = await uploadImage(file);
        if (url) {
            setFormData(prev => ({ ...prev, image: url }));
        }
    };

    const handleEdit = (index: number) => {
        setActiveEditIndex(index);
        setFormData(slides[index]);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setActiveEditIndex(null);
        setFormData({ id: 0, image: '', title: '', text: '', buttonText: '', link: '' });
        setIsEditing(true);
    };

    const handleDelete = (index: number) => {
        if(!window.confirm(t('admin.settings.hero.delete_confirm'))) return;
        const newSlides = slides.filter((_, i) => i !== index);
        saveSlides(newSlides);
    };

    const handleFormSave = () => {
        const newSlides = [...slides];
        if (activeEditIndex !== null) {
            newSlides[activeEditIndex] = { ...formData };
        } else {
            newSlides.push({ ...formData, id: generateId() });
        }
        saveSlides(newSlides);
        setIsEditing(false);
    };

    const saveSlides = (newSlides: HeroSlide[]) => {
        setSlides(newSlides);
        onUpdate('hero_slides', JSON.stringify(newSlides));
    };

    if (isEditing) {
        return (
            <div style={{ animation: 'fadeIn 0.3s' }}>
                 <h3 style={{ marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    {activeEditIndex !== null ? t('admin.settings.hero.edit_slide') : t('admin.settings.hero.new_slide')}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="admin-label">{t('admin.settings.hero.image_url')}</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input className="admin-input" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." style={{ flex: 1 }} />
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                onChange={handleFileChange} 
                                accept="image/*"
                            />
                            <button 
                                className="btn-secondary" 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
                            >
                                {uploading ? <Loader2 className="spin" /> : <Upload />} Subir
                            </button>
                        </div>
                        {formData.image && <img src={formData.image} alt="Preview" style={{ width: '100%', height: '150px', objectFit: 'cover', marginTop: '0.5rem', borderRadius: '4px', opacity: 0.7 }} />}
                    </div>
                    <div>
                        <label className="admin-label">{t('admin.settings.hero.title_label')}</label>
                        <input className="admin-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ej: Nueva Temporada" />
                    </div>
                    <div>
                        <label className="admin-label">{t('admin.settings.hero.subtitle_label')}</label>
                        <input className="admin-input" value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} placeholder="Descripción corta..." />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                        <div>
                            <label className="admin-label">{t('admin.settings.hero.btn_text')}</label>
                            <input className="admin-input" value={formData.buttonText} onChange={e => setFormData({...formData, buttonText: e.target.value})} placeholder="Ej: Jugar Ahora" />
                        </div>
                        <div>
                            <label className="admin-label">{t('admin.settings.hero.btn_link')}</label>
                            <input className="admin-input" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} placeholder="/tienda o https://..." />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                        <button className="btn-primary" onClick={handleFormSave} disabled={saving === 'hero_slides'}>
                           <Check /> {saving === 'hero_slides' ? t('admin.settings.saving') : t('admin.settings.hero.save_btn')}
                        </button>
                        <button className="btn-secondary" onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: '1px solid #444' }}>
                           {t('admin.settings.hero.cancel_btn')}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <Image /> {t('admin.settings.hero.title')}
                </h3>
                <button onClick={handleCreate} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                    <Plus /> {t('admin.settings.hero.new_slide')}
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {slides.map((slide, i) => (
                    <div key={slide.id || i} style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid #333',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        position: 'relative',
                        display: 'flex'
                    }}>
                        {/* Image Preview */}
                        <div style={{ width: '120px', height: '100px', flexShrink: 0 }}>
                            <img src={slide.image} alt={slide.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        
                        {/* Check info */}
                        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <h4 style={{ margin: '0 0 0.3rem', fontSize: '1rem' }}>{slide.title}</h4>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>{slide.text}</p>
                            {slide.buttonText && (
                                <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Link size={10} /> {slide.buttonText} ({slide.link})
                                </span>
                            )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid #333' }}>
                            <button onClick={() => handleEdit(i)} style={{ flex: 1, padding: '0 1rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', borderBottom: '1px solid #333' }}>
                                <Edit2 />
                            </button>
                            <button onClick={() => handleDelete(i)} style={{ flex: 1, padding: '0 1rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                <Trash2 />
                            </button>
                        </div>
                    </div>
                ))}
                
                {slides.length === 0 && (
                     <div style={{ textAlign: 'center', padding: '2rem', color: '#666', border: '1px dashed #444', borderRadius: '8px' }}>
                        {t('admin.settings.hero.no_slides')}
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState } from 'react';
import { FaImage, FaPlus, FaTrash, FaEdit, FaCheck, FaLink } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface HeroSlide {
    id?: number;
    image: string;
    title: string;
    text: string;
    buttonText: string;
    link: string;
}

interface HeroBannerManagerProps {
    settings: any;
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
    
    // Form State
    const [formData, setFormData] = useState<HeroSlide>({
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
                setSlides(Array.isArray(parsed) ? parsed : DEFAULT_SLIDES);
            } catch { setSlides(DEFAULT_SLIDES); }
        } else {
            setSlides(DEFAULT_SLIDES);
        }
    }

    const handleEdit = (index: number) => {
        setActiveEditIndex(index);
        setFormData(slides[index]);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setActiveEditIndex(null);
        setFormData({ image: '', title: '', text: '', buttonText: '', link: '' });
        setIsEditing(true);
    };

    const handleDelete = (index: number) => {
        if(!window.confirm('¿Borrar este slide?')) return;
        const newSlides = slides.filter((_, i) => i !== index);
        saveSlides(newSlides);
    };

    const handleFormSave = () => {
        let newSlides = [...slides];
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
            <div className="admin-card">
                 <h3 style={{ marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    {activeEditIndex !== null ? 'Editar Slide' : 'Nuevo Slide'}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="admin-label">URL de la Imagen (Fondo)</label>
                        <input className="admin-input" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." />
                        {formData.image && <img src={formData.image} alt="Preview" style={{ width: '100%', height: '150px', objectFit: 'cover', marginTop: '0.5rem', borderRadius: '4px', opacity: 0.7 }} />}
                    </div>
                    <div>
                        <label className="admin-label">Título Principal</label>
                        <input className="admin-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ej: Nueva Temporada" />
                    </div>
                    <div>
                        <label className="admin-label">Subtítulo / Descripción</label>
                        <input className="admin-input" value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} placeholder="Descripción corta..." />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="admin-label">Texto del Botón</label>
                            <input className="admin-input" value={formData.buttonText} onChange={e => setFormData({...formData, buttonText: e.target.value})} placeholder="Ej: Jugar Ahora" />
                        </div>
                        <div>
                            <label className="admin-label">Enlace del Botón</label>
                            <input className="admin-input" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} placeholder="/tienda o https://..." />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button className="btn-primary" onClick={handleFormSave} disabled={saving === 'hero_slides'}>
                           <FaCheck /> {saving === 'hero_slides' ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                        <button className="btn-secondary" onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: '1px solid #444' }}>
                           Cancelar
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <FaImage /> {t('admin.settings.banner.title', 'Banners Home')}
                </h3>
                <button onClick={handleCreate} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                    <FaPlus /> Nuevo Slide
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
                                    <FaLink size={10} /> {slide.buttonText} ({slide.link})
                                </span>
                            )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid #333' }}>
                            <button onClick={() => handleEdit(i)} style={{ flex: 1, padding: '0 1rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', borderBottom: '1px solid #333' }}>
                                <FaEdit />
                            </button>
                            <button onClick={() => handleDelete(i)} style={{ flex: 1, padding: '0 1rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
                
                {slides.length === 0 && (
                     <div style={{ textAlign: 'center', padding: '2rem', color: '#666', border: '1px dashed #444', borderRadius: '8px' }}>
                        No hay banners activos.
                    </div>
                )}
            </div>
        </div>
    );
}

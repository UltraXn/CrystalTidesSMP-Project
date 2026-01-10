import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Edit2, X, MapPin, Ghost, Users } from 'lucide-react';
import ConfirmationModal from '../../UI/ConfirmationModal';
import { getLocations, createLocation, updateLocation, deleteLocation, WorldLocation, LocationAuthor } from '../../../services/locationService';
import { supabase } from '../../../services/supabaseClient';
import { useTranslation } from 'react-i18next';
import Loader from '../../UI/Loader';

const AUTHOR_ROLES = [
    'architect',
    'co_founder',
    'staff',
    'team',
    'builder',
    'developer'
];

export default function LocationsManager() {
    const { t } = useTranslation();
    const [locations, setLocations] = useState<WorldLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<WorldLocation>>({
        title: '',
        description: '',
        long_description: '',
        coords: '0, 0, 0',
        image_url: '',
        is_coming_soon: false,
        authors: [],
        sort_order: 0
    });

    const [newAuthor, setNewAuthor] = useState<LocationAuthor>({ name: '', role: 'architect' });

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        setLoading(true);
        try {
            const data = await getLocations();
            setLocations(data);
        } catch (error) {
            console.error('Error fetching locations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.description) {
            alert(t('locations_manager.form.error_fields', 'Por favor completa los campos básicos'));
            return;
        }

        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) return;

            if (editingId) {
                await updateLocation(editingId, formData, token);
            } else {
                await createLocation(formData as Omit<WorldLocation, 'id'>, token);
            }

            resetForm();
            await fetchLocations();
        } catch (error) {
            console.error('Error saving location:', error);
            alert(t('locations_manager.form.error_save', 'Error al guardar'));
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (loc: WorldLocation) => {
        setFormData(loc);
        setEditingId(loc.id);
        setIsCreating(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            long_description: '',
            coords: '0, 0, 0',
            image_url: '',
            is_coming_soon: false,
            authors: [],
            sort_order: 0
        });
        setEditingId(null);
        setIsCreating(false);
    };

    const addAuthor = () => {
        if (!newAuthor.name) return;
        const currentAuthors = formData.authors || [];
        setFormData({ ...formData, authors: [...currentAuthors, newAuthor] });
        setNewAuthor({ name: '', role: 'architect' });
    };

    const removeAuthor = (idx: number) => {
        const currentAuthors = [...(formData.authors || [])];
        currentAuthors.splice(idx, 1);
        setFormData({ ...formData, authors: currentAuthors });
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) return;

            await deleteLocation(deleteConfirmId, token);
            setDeleteConfirmId(null);
            await fetchLocations();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    if (loading) return (
        <div style={{ padding: '5rem 0' }}>
            <Loader text={t('locations_manager.loading', "Sincronizando Lore...")} />
        </div>
    );

    return (
        <div className="locations-manager-container animate-fade-in">
            <style>{`
                .locations-manager-container {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                .manager-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1.5rem;
                }
                .editor-card {
                    margin: 0;
                    padding: 2.5rem;
                    background: rgba(10, 10, 15, 0.4);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                }
                .input-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                }
                .author-controls {
                    display: flex;
                    gap: 1rem;
                }
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 3rem;
                    padding-top: 2rem;
                    border-top: 1px solid rgba(255,255,255,0.05);
                }

                @media (max-width: 768px) {
                    .manager-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .editor-card {
                        padding: 1.5rem;
                    }
                    .author-controls {
                        flex-direction: column;
                    }
                    .author-controls > * {
                        width: 100% !important;
                    }
                    .form-actions {
                        flex-direction: column-reverse;
                    }
                    .form-actions button {
                        width: 100%;
                        padding: 1rem !important;
                    }
                }
            `}</style>

            {/* Header Section */}
            <div className="manager-header">
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <MapPin style={{ color: 'var(--accent)' }} /> {t('locations_manager.title', 'Gestor de Lugares y Lore')}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>{t('locations_manager.subtitle', 'Administra los puntos de interés y la historia del mundo.')}</p>
                </div>
                {!isCreating && (
                    <button 
                        onClick={() => setIsCreating(true)} 
                        className="modal-btn-primary hover-lift"
                        style={{ padding: '0.8rem 1.5rem', borderRadius: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        <Plus /> {t('locations_manager.create_btn', 'Nuevo Lugar')}
                    </button>
                )}
            </div>

            {/* Creation Form */}
            {isCreating && (
                <div className="admin-card editor-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {editingId ? <><Edit2 style={{ color: '#facc15' }} /> {t('locations_manager.edit_title', 'Editar Registro')}</> : <><Plus style={{ color: 'var(--accent)' }} /> {t('locations_manager.create_title', 'Nuevo Registro')}</>}
                        </h4>
                        <button onClick={resetForm} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="form-grid">
                        
                        <div className="input-row">
                            {/* Inputs Section */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.8rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: '700' }}>
                                        {t('locations_manager.form.title', 'Título de la Localización')}
                                    </label>
                                    <input 
                                        className="admin-input-premium" 
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        placeholder={t('locations_manager.form.title_ph', 'Ej: Gran Biblioteca de Cristal')}
                                        style={{ width: '100%', padding: '1rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.8rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: '700' }}>
                                        {t('locations_manager.form.coords', 'Coordenadas')}
                                    </label>
                                    <input 
                                        className="admin-input-premium" 
                                        value={formData.coords}
                                        onChange={e => setFormData({...formData, coords: e.target.value})}
                                        placeholder={t('locations_manager.form.coords_ph', '0, 64, 0')}
                                        style={{ width: '100%', padding: '1rem', fontFamily: 'monospace' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.8rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: '700' }}>
                                        {t('locations_manager.form.image', 'URL de la Imagen')}
                                    </label>
                                    <input 
                                        className="admin-input-premium" 
                                        value={formData.image_url || ''}
                                        onChange={e => setFormData({...formData, image_url: e.target.value})}
                                        placeholder="https://..."
                                        style={{ width: '100%', padding: '1rem' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.8rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: '700' }}>
                                            {t('locations_manager.form.order', 'Orden')}
                                        </label>
                                        <input 
                                            type="number"
                                            className="admin-input-premium" 
                                            value={formData.sort_order}
                                            onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                                            style={{ width: '100%', padding: '1rem' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between', 
                                            background: formData.is_coming_soon ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255,255,255,0.03)', 
                                            padding: '0.8rem 1rem', 
                                            borderRadius: '12px',
                                            border: formData.is_coming_soon ? '1px solid rgba(76, 175, 80, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                                            width: '100%',
                                            height: '50px'
                                        }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: formData.is_coming_soon ? '#4ade80' : 'rgba(255,255,255,0.4)' }}>
                                                {t('locations_manager.secret', 'Secret?')}
                                            </span>
                                            <label className="switch" style={{ transform: 'scale(0.8)' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.is_coming_soon}
                                                    onChange={(e) => setFormData({...formData, is_coming_soon: e.target.checked})}
                                                />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: '700' }}>
                                {t('locations_manager.form.desc', 'Descripción Corta (Resumen)')}
                            </label>
                            <input 
                                className="admin-input-premium" 
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                style={{ width: '100%', padding: '1rem' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: '700' }}>
                                {t('locations_manager.form.lore', 'Historia / Lore Detallado')}
                            </label>
                            <textarea 
                                className="admin-textarea-premium" 
                                rows={5}
                                value={formData.long_description}
                                onChange={e => setFormData({...formData, long_description: e.target.value})}
                                style={{ width: '100%', padding: '1.2rem', borderRadius: '16px' }}
                            />
                        </div>

                        {/* Authors Section */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <label style={{ display: 'block', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: '700' }}>
                                <Users style={{ marginRight: '8px' }} /> {t('locations_manager.form.authors', 'Arquitectos / Autores')}
                            </label>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1.5rem' }}>
                                {formData.authors?.map((auth, idx) => (
                                    <div key={idx} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px', 
                                        background: 'rgba(59, 130, 246, 0.1)', 
                                        padding: '0.4rem 0.8rem', 
                                        borderRadius: '50px', 
                                        border: '1px solid rgba(59, 130, 246, 0.2)' 
                                    }}>
                                        <img src={`https://minotar.net/helm/${auth.name}/24.png`} alt="" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
                                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>{auth.name}</span>
                                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#60a5fa', fontWeight: '900' }}>{auth.role}</span>
                                        <button onClick={() => removeAuthor(idx)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex' }}>
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="author-controls">
                                <input 
                                    className="admin-input-premium" 
                                    placeholder={t('locations_manager.form.author_nick', 'Nick del Autor')}
                                    value={newAuthor.name}
                                    onChange={e => setNewAuthor({...newAuthor, name: e.target.value})}
                                    style={{ flexGrow: 1, padding: '0.8rem' }}
                                />
                                <select 
                                    className="admin-select-premium"
                                    value={newAuthor.role}
                                    onChange={e => setNewAuthor({...newAuthor, role: e.target.value})}
                                    style={{ width: '140px', padding: '0.8rem' }}
                                >
                                    {AUTHOR_ROLES.map(r => <option key={r} value={r} style={{ background: '#0b0b10' }}>{r}</option>)}
                                </select>
                                <button onClick={addAuthor} className="modal-btn-primary hover-lift" style={{ padding: '0 1.2rem', borderRadius: '12px' }}>
                                    <Plus />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button onClick={resetForm} style={{ padding: '1rem 2rem', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: '700', cursor: 'pointer', border: 'none' }}>
                            {t('admin.locations.form.cancel', 'Cancelar')}
                        </button>
                        <button 
                            onClick={handleSave} 
                            disabled={saving}
                            className="modal-btn-primary hover-lift"
                            style={{ padding: '1rem 3rem', borderRadius: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}
                        >
                            {saving ? t('admin.locations.form.saving', 'Guardando...') : <><Save /> {t('admin.locations.form.save', 'Guardar Registro')}</>}
                        </button>
                    </div>
                </div>
            )}

            {/* Grid List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {locations.map(loc => (
                    <div key={loc.id} className="admin-card hover-lift" style={{ 
                        margin: 0, 
                        overflow: 'hidden',
                        background: 'rgba(10, 10, 15, 0.4)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '24px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                            {loc.is_coming_soon ? (
                                <div style={{ height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
                                    <Ghost size={40} />
                                    <span style={{ fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', marginTop: '10px' }}>Protocol Mystery</span>
                                </div>
                            ) : (
                                <img src={loc.image_url || ''} alt={loc.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                            )}
                            <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleEdit(loc)} style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                                    <Edit2 size={14} />
                                </button>
                                <button onClick={() => setDeleteConfirmId(loc.id)} style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '10px', backdropFilter: 'blur(10px)', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div style={{ position: 'absolute', bottom: '15px', left: '15px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                {loc.coords}
                            </div>
                        </div>
                        <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <h5 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>{loc.title}</h5>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5', fontStyle: 'italic' }}>{loc.description}</p>
                            
                            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ display: 'flex', marginLeft: '5px' }}>
                                        {loc.authors?.slice(0, 3).map((auth, i) => (
                                            <img 
                                                key={i} 
                                                src={`https://minotar.net/helm/${auth.name}/24.png`} 
                                                style={{ width: '24px', height: '24px', borderRadius: '4px', border: '2px solid #0a0a0f', marginLeft: '-8px' }} 
                                                title={auth.name} 
                                                alt="" 
                                            />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: '700' }}>#{loc.sort_order}</span>
                                </div>
                                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontWeight: '900', textTransform: 'uppercase' }}>
                                    {t('admin.locations.lore_entry', 'Entrada de Lore')}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmationModal 
                isOpen={!!deleteConfirmId}
                title={t('admin.locations.delete_modal.title', "Eliminar Registro de Lore")}
                message={t('admin.locations.delete_modal.msg', "¿Estás seguro de que quieres borrar este lugar? La historia asociada se perderá permanentemente.")}
                onConfirm={confirmDelete}
                onClose={() => setDeleteConfirmId(null)}
                isDanger={true}
            />
        </div>
    );
}

import { useState, useEffect } from 'react';
import { FaSave, FaPlus, FaTrash, FaTrophy, FaImage, FaCloudUploadAlt, FaSpinner } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import Loader from "../UI/Loader";
import PremiumConfirm from "../UI/PremiumConfirm";
import { MEDAL_ICONS } from '../../utils/MedalIcons';
import { supabase } from '../../services/supabaseClient';
import { getAuthHeaders } from '../../services/adminAuth';

const API_URL = import.meta.env.VITE_API_URL;

interface Medal {
    id: number;
    name: string;
    description: string;
    icon: string;
    color: string;
    image_url?: string;
}

interface GamificationSettings {
    medal_definitions?: string | Medal[];
    [key: string]: unknown;
}

export default function GamificationManager() {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<GamificationSettings>({});
    const [saving, setSaving] = useState<string | null>(null);
    const [medals, setMedals] = useState<Medal[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<number | null>(null);
    
    // Modal state
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, medalId: number | null }>({
        isOpen: false,
        medalId: null
    });

    // Fetch settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const headers = getAuthHeaders(session?.access_token || null);
                
                const res = await fetch(`${API_URL}/settings`, { headers });
                const data = await res.json();
                setSettings(data);
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // Sync medals when settings change
    useEffect(() => {
        if (settings?.medal_definitions) {
            const defs = settings.medal_definitions;
            try {
                const parsed = typeof defs === 'string' ? JSON.parse(defs) : defs;
                setMedals(Array.isArray(parsed) ? parsed : []);
            } catch { 
                setMedals([]); 
            }
        }
    }, [settings.medal_definitions]);

    const onUpdate = async (key: string, newValue: string) => {
        setSaving(key);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const headers = { 
                'Content-Type': 'application/json',
                ...getAuthHeaders(session?.access_token || null)
            };

            const res = await fetch(`${API_URL}/settings/${key}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ value: newValue })
            });

            if (!res.ok) throw new Error('Failed to update settings');

            setSettings((prev: GamificationSettings) => ({ ...prev, [key]: newValue }));
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(null);
        }
    };

    const handleAdd = () => {
        setMedals([...medals, { 
            id: Date.now(), 
            name: t('admin.gamification.medals.new_medal_default'), 
            description: t('admin.gamification.medals.desc_default'), 
            icon: 'FaMedal', 
            color: '#fbbf24' 
        }]);
    };

    const handleDeleteClick = (id: number) => {
        setConfirmDelete({ isOpen: true, medalId: id });
    };

    const executeDelete = () => {
        if (confirmDelete.medalId) {
            setMedals(medals.filter(m => m.id !== confirmDelete.medalId));
        }
        setConfirmDelete({ isOpen: false, medalId: null });
    };

    const handleChange = (id: number, field: keyof Medal, value: string) => {
        setMedals(medals.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handleSave = () => {
        onUpdate('medal_definitions', JSON.stringify(medals));
    };

    const handleImageUpload = async (medalId: number, file: File) => {
        setUploading(medalId);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${medalId}-${Date.now()}.${fileExt}`;
            const filePath = `items/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('medals')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('medals')
                .getPublicUrl(filePath);

            setMedals(prev => prev.map(m => m.id === medalId ? { ...m, image_url: publicUrl, icon: 'FaImage' } : m));
        } catch (error) {
            console.error('Error uploading image:', error);
            alert(t('common.error_uploading', 'Error al subir la imagen'));
        } finally {
            setUploading(null);
        }
    };

    const removeImage = (medalId: number) => {
        setMedals(prev => prev.map(m => m.id === medalId ? { ...m, image_url: undefined, icon: 'FaMedal' } : m));
    };

    // Helper to render icon or image component dynamically
    const renderVisual = (medal: Medal) => {
        if (medal.image_url) {
            return (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                        src={medal.image_url} 
                        alt={medal.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} 
                    />
                    <button 
                        onClick={(e) => { e.stopPropagation(); removeImage(medal.id); }}
                        style={{ 
                            position: 'absolute', 
                            top: '-8px', 
                            right: '-8px', 
                            background: '#ef4444', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '50%', 
                            width: '20px', 
                            height: '20px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '10px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}
                    >
                        <FaTrash />
                    </button>
                </div>
            );
        }
        const Icon = MEDAL_ICONS[medal.icon as keyof typeof MEDAL_ICONS] || MEDAL_ICONS.FaMedal;
        return <Icon />;
    };

    if (loading) {
        return (
            <div style={{ padding: '8rem', display: 'flex', justifyContent: 'center' }}>
                <Loader />
            </div>
        );
    }

    return (
        <div className="gamification-manager-container">
            <div className="gamification-header">
                <h3 style={{ margin: 0, display:'flex', alignItems:'center', gap:'1rem', fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
                    <div style={{ padding: '8px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '12px', display: 'flex' }}>
                        <FaTrophy style={{ color: '#fbbf24' }} />
                    </div>
                    {t('admin.gamification.medals.title')}
                </h3>
                <button onClick={handleSave} className="poll-new-btn btn-primary" disabled={saving === 'medal_definitions'} style={{ height: '48px', padding: '0 2rem' }}>
                    {saving === 'medal_definitions' ? <FaSave className="spin" /> : <FaSave />}
                    {saving === 'medal_definitions' ? t('admin.gamification.medals.saving') : t('admin.gamification.medals.save')}
                </button>
            </div>

            <div className="gamification-grid">
                {medals.map((medal) => (
                    <div key={medal.id} className="medal-card-premium">
                        <div className="medal-card-accent" style={{ background: medal.color }}></div>
                        
                        <button 
                            onClick={() => handleDeleteClick(medal.id)}
                            className="medal-delete-btn"
                            title={t('common.delete', 'Eliminar')}
                        >
                            <FaTrash size={14} />
                        </button>

                        <div className="medal-visual-section">
                            <div className="medal-icon-preview-wrapper" style={{ color: medal.color, boxShadow: `0 10px 30px ${medal.color}20`, position: 'relative' }}>
                                {uploading === medal.id ? <FaSpinner className="spin" size={24} /> : renderVisual(medal)}
                                <div className="medal-color-picker-wrapper" style={{ background: medal.color }}>
                                    <input 
                                        type="color" 
                                        value={medal.color} 
                                        onChange={(e) => handleChange(medal.id, 'color', e.target.value)} 
                                    />
                                </div>
                            </div>

                            <div className="medal-info-section">
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <input 
                                        className="admin-input-premium" 
                                        value={medal.name} 
                                        onChange={(e) => handleChange(medal.id, 'name', e.target.value)}
                                        placeholder={t('admin.gamification.medals.name_placeholder')}
                                        style={{ padding: '0.6rem 1rem', fontSize: '1rem', fontWeight: 800, flex: 1, marginBottom: 0 }}
                                    />
                                    <label className="btn-icon-premium" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <FaCloudUploadAlt color={medal.image_url ? '#10b981' : '#aaa'} />
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            style={{ display: 'none' }} 
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) handleImageUpload(medal.id, e.target.files[0]);
                                            }}
                                        />
                                    </label>
                                </div>
                                <textarea 
                                    className="admin-textarea-premium" 
                                    value={medal.description} 
                                    onChange={(e) => handleChange(medal.id, 'description', e.target.value)}
                                    placeholder={t('admin.gamification.medals.desc_placeholder')}
                                    rows={2}
                                    style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', minHeight: '60px' }}
                                />
                            </div>
                        </div>

                        {/* Icon Selector Grid */}
                        <div className="medal-icon-selector">
                            {Object.keys(MEDAL_ICONS).map(iconKey => (
                                <button 
                                    key={iconKey}
                                    onClick={() => handleChange(medal.id, 'icon', iconKey)}
                                    className={`icon-select-btn ${medal.icon === iconKey ? 'active' : ''}`}
                                    title={iconKey}
                                >
                                    {/* Re-using renderVisual logic but locally for icons list */}
                                    {(() => {
                                        const Icon = MEDAL_ICONS[iconKey as keyof typeof MEDAL_ICONS] || MEDAL_ICONS.FaMedal;
                                        return <Icon />;
                                    })()}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Add Button Premium Card */}
                <div className="medal-add-card" onClick={handleAdd}>
                    <div className="medal-add-icon-wrapper">
                        <FaPlus />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {t('admin.gamification.medals.create_btn')}
                    </span>
                </div>
            </div>

            <PremiumConfirm 
                isOpen={confirmDelete.isOpen}
                title={t('admin.gamification.medals.delete_title', '¿Borrar medalla?')}
                message={t('admin.gamification.medals.delete_confirm', '¿Estás seguro de que deseas eliminar esta medalla? Esta acción no se puede deshacer.')}
                confirmLabel={t('common.delete', 'Eliminar')}
                onConfirm={executeDelete}
                onCancel={() => setConfirmDelete({ isOpen: false, medalId: null })}
                variant="danger"
            />
        </div>
    );
}


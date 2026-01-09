import { useState, useEffect } from 'react';
import { FaSave, FaPlus, FaTrash, FaTrophy, FaCloudUploadAlt, FaSpinner } from 'react-icons/fa';
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

interface Achievement {
    id: string | number;
    name: string;
    description: string;
    criteria: string;
    icon: string;
    image_url?: string;
    color?: string;
}

interface GamificationSettings {
    medal_definitions?: string | Medal[];
    achievement_definitions?: string | Achievement[];
    [key: string]: unknown;
}

const DEFAULT_ACHIEVEMENTS = [
    { id: "dweller", name: "Habitante de la Marea", description: "Vincula tu cuenta de Discord y únete a la pecerita.", criteria: "Cuenta de Discord vinculada", icon: "🌊" },
    { id: "magnate", name: "Magnate de Cristal", description: "La fortuna sonríe a los audaces.", criteria: "+5,000 KilluCoins", icon: "💎" },
    { id: "architect", name: "Arquitecto Terrenal", description: "Construye el futuro bloque a bloque.", criteria: "+1,000 Bloques Colocados", icon: "🏗️" },
    { id: "deep_miner", name: "Minero Profundo", description: "Extrae las riquezas de las profundidades.", criteria: "+1,000 Bloques Minados", icon: "⛏️" },
    { id: "guardian", name: "Guardián del Abismo", description: "Demuestra tu fuerza en combate.", criteria: "+10 Kills", icon: "⚔️" },
    { id: "time_traveler", "name": "Viajero Temporal", "description": "Tu constancia trasciende el tiempo.", "criteria": "+50 Horas de juego", "icon": "⏳" },
    { id: "patron", name: "Mecenas de las Mareas", description: "Apoya el sostenimiento del reino.", criteria: "Rango Donador o Fundador", icon: "👑" }
];

export default function GamificationManager() {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<GamificationSettings>({});
    const [saving, setSaving] = useState<string | null>(null);
    const [medals, setMedals] = useState<Medal[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<number | string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, medalId: number | string | null, type: 'medal' | 'achievement' | null }>({
        isOpen: false,
        medalId: null,
        type: null
    });

    const [activeTab, setActiveTab] = useState<'medals' | 'achievements'>('medals');
    const [achievements, setAchievements] = useState<Achievement[]>([]);

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

    // Sync data when settings change
    useEffect(() => {
        if (settings) {
            // Medals
            if (settings.medal_definitions) {
                const defs = settings.medal_definitions;
                try {
                    const parsed = typeof defs === 'string' ? JSON.parse(defs) : defs;
                    setMedals(Array.isArray(parsed) ? parsed : []);
                } catch { setMedals([]); }
            }

            // Achievements
            if (settings.achievement_definitions) {
                const defs = settings.achievement_definitions;
                try {
                    const parsed = typeof defs === 'string' ? JSON.parse(defs) : defs;
                    setAchievements(Array.isArray(parsed) ? parsed : []);
                } catch { setAchievements([]); }
            } else {
                // Initialize with defaults if empty
                setAchievements(DEFAULT_ACHIEVEMENTS);
            }
        }
    }, [settings]);

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

    // --- Medal Handlers ---
    const handleAddMedal = () => {
        setMedals([...medals, { 
            id: Date.now(), 
            name: t('admin.gamification.medals.new_medal_default'), 
            description: t('admin.gamification.medals.desc_default'), 
            icon: 'FaMedal', 
            color: '#fbbf24' 
        }]);
    };

    const handleDeleteMedalClick = (id: number) => {
        setConfirmDelete({ isOpen: true, medalId: id, type: 'medal' });
    };

    const handleChangeMedal = (id: number, field: keyof Medal, value: string) => {
        setMedals(medals.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handleSaveMedals = () => {
        onUpdate('medal_definitions', JSON.stringify(medals));
    };

    // --- Achievement Handlers ---
    const handleAddAchievement = () => {
        setAchievements([...achievements, {
            id: `custom_${Date.now()}`,
            name: "Nuevo Logro",
            description: "Descripción del logro",
            criteria: "Criterio de desbloqueo",
            icon: "🏆"
        }]);
    };

    const handleDeleteAchievementClick = (id: string) => {
        setConfirmDelete({ isOpen: true, medalId: id, type: 'achievement' });
    };

    const handleChangeAchievement = (id: string, field: string, value: string) => {
        setAchievements(achievements.map(a => a.id === id ? { ...a, [field]: value } : a));
    };

    const handleSaveAchievements = () => {
        onUpdate('achievement_definitions', JSON.stringify(achievements));
    };


    const executeDelete = () => {
        if (confirmDelete.type === 'medal' && typeof confirmDelete.medalId === 'number') {
            setMedals(medals.filter(m => m.id !== confirmDelete.medalId));
        } else if (confirmDelete.type === 'achievement') {
            setAchievements(achievements.filter(a => a.id !== confirmDelete.medalId));
        }
        setConfirmDelete({ isOpen: false, medalId: null, type: null });
    };


    const handleImageUpload = async (id: number | string, file: File, type: 'medal' | 'achievement') => {
        // Use a composite key for uploading state if needed, or just the ID since they shouldn't overlap in a way that breaks UI (one spinning is fine)
        setUploading(typeof id === 'number' ? id : 999); // Hacky for loading state on string IDs? Let's fix loading state type.
        // Actually, let's just use a separate loading state or cast it. 
        // For now, let's assume setUploading accepts number only? The state is `number | null`. 
        // I should update the state type for uploading to `number | string | null`.
        
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${type}-${id}-${Date.now()}.${fileExt}`;
            const filePath = `items/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('medals')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('medals')
                .getPublicUrl(filePath);

            if (type === 'medal') {
                setMedals(prev => prev.map(m => m.id === id ? { ...m, image_url: publicUrl, icon: 'FaImage' } : m));
            } else {
                setAchievements(prev => prev.map(a => a.id === id ? { ...a, image_url: publicUrl } : a));
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert(t('common.error_uploading', 'Error al subir la imagen'));
        } finally {
            setUploading(null);
        }
    };

    const removeImage = (id: number | string, type: 'medal' | 'achievement') => {
        if (type === 'medal') {
            setMedals(prev => prev.map(m => m.id === id ? { ...m, image_url: undefined, icon: 'FaMedal' } : m));
        } else {
            setAchievements(prev => prev.map(a => a.id === id ? { ...a, image_url: undefined } : a));
        }
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
                        onClick={(e) => { e.stopPropagation(); removeImage(medal.id, 'medal'); }}
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
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <button 
                    onClick={() => setActiveTab('medals')}
                    style={{ 
                        background: activeTab === 'medals' ? 'var(--accent)' : 'transparent', 
                        color: activeTab === 'medals' ? '#fff' : 'var(--muted)',
                        border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 
                    }}
                >
                    🏅 Medallas
                </button>
                <button 
                    onClick={() => setActiveTab('achievements')}
                    style={{ 
                        background: activeTab === 'achievements' ? 'var(--accent)' : 'transparent', 
                        color: activeTab === 'achievements' ? '#fff' : 'var(--muted)',
                        border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 
                    }}
                >
                    🏆 Logros
                </button>
            </div>

            {activeTab === 'medals' && (
                <>
                    <div className="gamification-header">
                        <h3 style={{ margin: 0, display:'flex', alignItems:'center', gap:'1rem', fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
                            <div style={{ padding: '8px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '12px', display: 'flex' }}>
                                <FaTrophy style={{ color: '#fbbf24' }} />
                            </div>
                            {t('admin.gamification.medals.title')}
                        </h3>
                        <button onClick={handleSaveMedals} className="poll-new-btn btn-primary" disabled={saving === 'medal_definitions'} style={{ height: '48px', padding: '0 2rem' }}>
                            {saving === 'medal_definitions' ? <FaSave className="spin" /> : <FaSave />}
                            {saving === 'medal_definitions' ? t('admin.gamification.medals.saving') : t('admin.gamification.medals.save')}
                        </button>
                    </div>

                    <div className="gamification-grid">
                        {medals.map((medal) => (
                            <div key={medal.id} className="medal-card-premium">
                                <div className="medal-card-accent" style={{ background: medal.color }}></div>
                                
                                <div className="medal-visual-section">
                                    <div className="medal-icon-preview-wrapper" style={{ color: medal.color, boxShadow: `0 10px 30px ${medal.color}20`, position: 'relative' }}>
                                        {uploading === medal.id ? <FaSpinner className="spin" size={24} /> : renderVisual(medal)}
                                        <div className="medal-color-picker-wrapper" style={{ background: medal.color }}>
                                            <input 
                                                type="color" 
                                                value={medal.color} 
                                                onChange={(e) => handleChangeMedal(medal.id, 'color', e.target.value)} 
                                            />
                                        </div>
                                    </div>

                                    <div className="medal-info-section">
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <input 
                                                className="admin-input-premium" 
                                                value={medal.name} 
                                                onChange={(e) => handleChangeMedal(medal.id, 'name', e.target.value)}
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
                                                        if (e.target.files?.[0]) handleImageUpload(medal.id, e.target.files[0], 'medal');
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        <textarea 
                                            className="admin-textarea-premium" 
                                            value={medal.description} 
                                            onChange={(e) => handleChangeMedal(medal.id, 'description', e.target.value)}
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
                                            onClick={() => handleChangeMedal(medal.id, 'icon', iconKey)}
                                            className={`icon-select-btn ${medal.icon === iconKey ? 'active' : ''}`}
                                            title={iconKey}
                                        >
                                            {(() => {
                                                const Icon = MEDAL_ICONS[iconKey as keyof typeof MEDAL_ICONS] || MEDAL_ICONS.FaMedal;
                                                return <Icon />;
                                            })()}
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => handleDeleteMedalClick(medal.id)}
                                    style={{ 
                                        position: 'absolute', 
                                        bottom: '1rem', 
                                        left: '1rem', 
                                        background: 'rgba(239, 68, 68, 0.1)', 
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                        color: '#ef4444',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        zIndex: 5
                                    }}
                                    className="hover-lift"
                                    title={t('common.delete', 'Eliminar')}
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        ))}

                        {/* Add Button Premium Card */}
                        <div className="medal-add-card" onClick={handleAddMedal}>
                            <div className="medal-add-icon-wrapper">
                                <FaPlus />
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {t('admin.gamification.medals.create_btn')}
                            </span>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'achievements' && (
                <>
                    <div className="gamification-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(15, 15, 20, 0.95)', backdropFilter: 'blur(10px)', paddingBottom: '1rem', paddingTop: '1rem', marginTop: '-1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, display:'flex', alignItems:'center', gap:'1rem', fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
                            <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', display: 'flex' }}>
                                <FaTrophy style={{ color: '#10b981' }} />
                            </div>
                            Gestión de Logros
                        </h3>
                        <button onClick={handleSaveAchievements} className="poll-new-btn btn-primary" disabled={saving === 'achievement_definitions'} style={{ height: '48px', padding: '0 2rem' }}>
                            {saving === 'achievement_definitions' ? <FaSave className="spin" /> : <FaSave />}
                            {saving === 'achievement_definitions' ? "Guardando..." : "Guardar Logros"}
                        </button>
                    </div>

                    <div className="gamification-grid">
                        {achievements.map((achievement) => (
                            <div key={achievement.id} className="medal-card-premium">
                                <div className="medal-card-accent" style={{ background: achievement.color || '#10b981' }}></div>
                                
                                <div className="medal-visual-section">
                                    <div className="medal-icon-preview-wrapper" style={{ color: achievement.color || '#10b981', boxShadow: `0 10px 30px ${achievement.color || '#10b981'}20`, position: 'relative' }}>
                                        {uploading === achievement.id ? <FaSpinner className="spin" size={24} /> : (
                                            achievement.image_url ? (
                                                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <img 
                                                        src={achievement.image_url} 
                                                        alt={achievement.name} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} 
                                                    />
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); removeImage(achievement.id, 'achievement'); }}
                                                        style={{ 
                                                            position: 'absolute', top: '-8px', right: '-8px', 
                                                            background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', 
                                                            width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            cursor: 'pointer', fontSize: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                                        }}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '2.5rem' }}>{achievement.icon}</div>
                                            )
                                        )}
                                        
                                        {!achievement.image_url && (
                                            <div className="medal-color-picker-wrapper" style={{ justifyContent: 'center', display: 'flex' }}>
                                                <input 
                                                    type="text" 
                                                    value={achievement.icon} 
                                                    onChange={(e) => handleChangeAchievement(String(achievement.id), 'icon', e.target.value)} 
                                                    style={{ width: '40px', textAlign: 'center', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem' }}
                                                    maxLength={2}
                                                />
                                            </div>
                                        )}

                                        <div className="medal-color-picker-wrapper" style={{ background: achievement.color || '#10b981', left: '-12px', bottom: '0px', right: 'auto', transform: 'none' }}>
                                            <input 
                                                type="color" 
                                                value={achievement.color || '#10b981'} 
                                                onChange={(e) => handleChangeAchievement(String(achievement.id), 'color', e.target.value)} 
                                            />
                                        </div>
                                    </div>

                                <div className="medal-info-section">
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2px' }}>
                                            <label style={{ fontSize: '0.7rem', color: '#666', flex: 1, display: 'flex', alignItems: 'center' }}>ID: {achievement.id}</label>
                                            <label 
                                                className="btn-icon-premium hover-glow" 
                                                style={{ 
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', 
                                                    background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--accent)';
                                                    e.currentTarget.style.boxShadow = '0 0 10px var(--accent)';
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                                    e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                <FaCloudUploadAlt color={achievement.image_url ? '#10b981' : '#fff'} size={14} />
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    style={{ display: 'none' }} 
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) handleImageUpload(achievement.id, e.target.files[0], 'achievement');
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    <input 
                                        className="admin-input-premium" 
                                        value={achievement.name} 
                                        onChange={(e) => handleChangeAchievement(String(achievement.id), 'name', e.target.value)}
                                        placeholder="Nombre del Logro"
                                        style={{ padding: '0.6rem 1rem', fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}
                                    />
                                    <input 
                                        className="admin-input-premium" 
                                        value={achievement.criteria} 
                                        onChange={(e) => handleChangeAchievement(String(achievement.id), 'criteria', e.target.value)}
                                        placeholder="Criterio (ej: +50 horas)"
                                        style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', marginBottom: '0.5rem', color: 'var(--accent)' }}
                                    />
                                    <textarea 
                                        className="admin-textarea-premium" 
                                        value={achievement.description} 
                                        onChange={(e) => handleChangeAchievement(String(achievement.id), 'description', e.target.value)}
                                        placeholder="Descripción..."
                                        rows={2}
                                        style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', minHeight: '50px' }}
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={() => handleDeleteAchievementClick(String(achievement.id))}
                                style={{ 
                                        position: 'absolute', 
                                        bottom: '1rem', 
                                        left: '1rem', 
                                        background: 'rgba(239, 68, 68, 0.1)', 
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                        color: '#ef4444',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        zIndex: 5
                                    }}
                                    className="hover-lift"
                                    title="Eliminar Logro"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        ))}

                        {/* Add Button */}
                        <div className="medal-add-card" onClick={handleAddAchievement}>
                            <div className="medal-add-icon-wrapper">
                                <FaPlus />
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                CREAR LOGRO
                            </span>
                        </div>
                    </div>
                </>
            )}

            <PremiumConfirm 
                isOpen={confirmDelete.isOpen}
                title={confirmDelete.type === 'medal' ? t('admin.gamification.medals.delete_title', '¿Borrar medalla?') : '¿Borrar Logro?'}
                message={t('admin.gamification.medals.delete_confirm', '¿Estás seguro?')}
                confirmLabel={t('common.delete', 'Eliminar')}
                onConfirm={executeDelete}
                onCancel={() => setConfirmDelete({ isOpen: false, medalId: null, type: null })}
                variant="danger"
            />
        </div>
    );
}


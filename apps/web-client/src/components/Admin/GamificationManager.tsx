import { useState } from 'react';
import { Plus, Trash2, Trophy, Medal as MedalIcon, Pencil, Check, X, Languages } from 'lucide-react';

import { useTranslation } from 'react-i18next';
import Loader from "../UI/Loader";
import PremiumConfirm from "../UI/PremiumConfirm";
import ImageUploader from "../UI/ImageUploader";
import { MEDAL_ICONS } from '../../utils/MedalIcons';
import { 
    useAdminSettings, 
    useUpdateSiteSetting 
} from '../../hooks/useAdminData';


interface Medal {
    id: number;
    name: string;
    description: string;
    name_en?: string; // New field
    description_en?: string; // New field
    icon: string;
    color: string;
    image_url?: string;
}

interface Achievement {
    id: string | number;
    name: string;
    description: string;
    name_en?: string; // New field
    description_en?: string; // New field
    criteria: string;
    criteria_en?: string; // New field
    icon: string;
    image_url?: string;
    color?: string;
}

// --- Sub-Components ---

// Helper for real translation
async function translateText(text: string): Promise<string> {
    if (!text || text.trim() === '') return '';
    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=es|en`);
        if (!response.ok) return text; // Fallback to original
        const data = await response.json();
        return data.responseData?.translatedText || text;
    } catch (error) {
        console.error("Translation failed:", error);
        return text; // Fallback to original
    }
}

const MedalCard = ({ medal, onSave, onDelete }: { medal: Medal, onSave: (m: Medal) => void, onDelete: () => void }) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);

    const [isTranslating, setIsTranslating] = useState(false);
    const [prevMedal, setPrevMedal] = useState<Medal>(medal);
    const [formData, setFormData] = useState<Medal>(medal);

    if (medal !== prevMedal) {
        setPrevMedal(medal);
        setFormData(medal);
    }



    const handleSave = () => {
        onSave(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(medal);
        setIsEditing(false);
    };

    const handleChange = (field: keyof Medal, value: Medal[keyof Medal]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAutoTranslate = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsTranslating(true);
        try {
            const nameEn = !formData.name_en ? await translateText(formData.name) : formData.name_en;
            const descEn = !formData.description_en ? await translateText(formData.description) : formData.description_en;
            
            setFormData(prev => ({
                ...prev,
                name_en: nameEn,
                description_en: descEn
            }));
        } catch (err) {
            console.error(err);
        } finally {
            setIsTranslating(false);
        }
    };
    
    // ... render return ... (UI changes for loader in next chunk, or implied if logic is clean)

    return (
        <div className="medal-editor-card card-premium">
            <div className="card-header">
                {isEditing ? (
                    <ImageUploader 
                        currentImage={formData.image_url}
                        onImageUploaded={(url) => handleChange('image_url', url)}
                        bucketName="medals"
                    />
                ) : (
                    <div 
                        className="image-preview" 
                        style={{ 
                            width: 64, height: 64, borderRadius: 12, 
                            background: 'rgba(255,255,255,0.05)', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', overflow: 'hidden' 
                        }}
                    >
                        {medal.image_url ? (
                            <img src={medal.image_url} alt={medal.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <MedalIcon size={24} style={{ opacity: 0.3 }} />
                        )}
                    </div>
                )}

                <div className="icon-selector-group">
                    <div className="icon-selector">
                        {(() => {
                            const IconComp = MEDAL_ICONS[(isEditing ? formData.icon : medal.icon) as keyof typeof MEDAL_ICONS] || MedalIcon;
                            return <IconComp size={20} style={{ color: isEditing ? formData.color : medal.color }} />;
                        })()}
                        <select 
                            aria-label={t('admin.gamification.select_icon', 'Icono de la medalla')} 
                            value={isEditing ? formData.icon : medal.icon} 
                            onChange={(e) => handleChange('icon', e.target.value)}
                            disabled={!isEditing}
                            style={{ cursor: isEditing ? 'pointer' : 'default' }}
                        >
                            {Object.keys(MEDAL_ICONS).map(iconName => (
                                <option key={iconName} value={iconName}>{iconName}</option>
                            ))}
                        </select>
                    </div>
                    <input 
                        aria-label={t('admin.gamification.select_color', 'Color de la medalla')} 
                        type="color" 
                        value={isEditing ? formData.color : medal.color} 
                        onChange={(e) => handleChange('color', e.target.value)}
                        className="color-picker"
                        disabled={!isEditing}
                        style={{ cursor: isEditing ? 'pointer' : 'default', opacity: isEditing ? 1 : 0.7 }}
                    />
                </div>

                <div className="action-buttons">
                    {isEditing ? (
                        <>
                            <button 
                                aria-label={t('common.save', 'Guardar medalla')} 
                                type="button" 
                                className="save-btn" 
                                onClick={handleSave} 
                                title="Guardar"
                            >
                                <Check size={18} aria-hidden="true" />
                            </button>
                            <button 
                                aria-label={t('common.cancel', 'Cancelar edición de medalla')} 
                                type="button" 
                                className="cancel-btn" 
                                onClick={handleCancel} 
                                title="Cancelar"
                            >
                                <X size={18} aria-hidden="true" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                aria-label={t('common.edit', 'Editar medalla')} 
                                type="button" 
                                className="edit-btn" 
                                onClick={() => setIsEditing(true)} 
                                title="Editar"
                            >
                                <Pencil size={18} aria-hidden="true" />
                            </button>
                            <button 
                                aria-label={t('common.delete', 'Eliminar medalla')} 
                                type="button" 
                                className="delete-btn" 
                                onClick={onDelete} 
                                title="Eliminar"
                            >
                                <Trash2 size={18} aria-hidden="true" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="card-body">
                {/* Spanish Fields */}
                <input 
                    aria-label={t('admin.gamification.name_es', 'Nombre de la medalla en español')} 
                    type="text" 
                    value={isEditing ? formData.name : medal.name} 
                    placeholder="Nombre (ES)"
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="input-premium"
                    readOnly={!isEditing}
                    style={{ opacity: isEditing ? 1 : 0.8 }}
                />
                <textarea 
                    aria-label={t('admin.gamification.desc_es', 'Descripción de la medalla en español')} 
                    value={isEditing ? formData.description : medal.description} 
                    placeholder="Descripción (ES)"
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="textarea-premium"
                    readOnly={!isEditing}
                    style={{ opacity: isEditing ? 1 : 0.8 }}
                />


                {/* English Fields (Only visible in edit) */}
                {isEditing && (
                    <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>VERSION INGLÉS</div>
                            <button 
                                aria-label={t('admin.gamification.auto_translate', 'Traducir medalla automáticamente al inglés')} 
                                type="button" 
                                onClick={handleAutoTranslate}
                                disabled={isTranslating}
                                style={{ 
                                    background: 'none', border: 'none', cursor: isTranslating ? 'wait' : 'pointer', 
                                    color: 'var(--accent)', fontSize: '0.7rem', display: 'flex', 
                                    alignItems: 'center', gap: '4px', opacity: isTranslating ? 0.5 : 0.8
                                }}
                                title="Traducir Automatically (via MyMemory API)"
                            >
                                <Languages size={12} className={isTranslating ? "animate-spin" : ""} aria-hidden="true" /> 
                                {isTranslating ? "Translating..." : "Auto-Translate"}
                            </button>
                        </div>
                        <input 
                            aria-label={t('admin.gamification.name_en', 'Nombre de la medalla en inglés')} 
                            type="text" 
                            value={formData.name_en || ''} 
                            placeholder="Name (EN)"
                            onChange={(e) => handleChange('name_en', e.target.value)}
                            className="input-premium"
                            style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}
                        />
                        <textarea 
                            aria-label={t('admin.gamification.desc_en', 'Descripción de la medalla en inglés')} 
                            value={formData.description_en || ''} 
                            placeholder="Description (EN)"
                            onChange={(e) => handleChange('description_en', e.target.value)}
                            className="textarea-premium"
                            style={{ fontSize: '0.85rem' }}
                        />
                    </div>
                )}

                {isEditing && (
                    <input 
                        aria-label={t('admin.gamification.image_url', 'URL manual de imagen de la medalla')}
                        type="text"
                        placeholder="O URL manual imagen..."
                        value={formData.image_url || ''}
                        onChange={(e) => handleChange('image_url', e.target.value)}
                        className="input-premium url-input-small"
                    />
                )}
            </div>


        </div>
    );
};

const AchievementCard = ({ achievement, onSave, onDelete }: { achievement: Achievement, onSave: (a: Achievement) => void, onDelete: () => void }) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);

    const [isTranslating, setIsTranslating] = useState(false);
    const [prevAchievement, setPrevAchievement] = useState<Achievement>(achievement);
    const [formData, setFormData] = useState<Achievement>(achievement);

    if (achievement !== prevAchievement) {
        setPrevAchievement(achievement);
        setFormData(achievement);
    }


    const handleSave = () => {
        onSave(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(achievement);
        setIsEditing(false);
    };

    const handleChange = (field: keyof Achievement, value: Achievement[keyof Achievement]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAutoTranslate = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsTranslating(true);
        try {
            const nameEn = !formData.name_en ? await translateText(formData.name) : formData.name_en;
            const descEn = !formData.description_en ? await translateText(formData.description) : formData.description_en;
            const critEn = !formData.criteria_en ? await translateText(formData.criteria) : formData.criteria_en;

            setFormData(prev => ({
                ...prev,
                name_en: nameEn,
                description_en: descEn,
                criteria_en: critEn
            }));
        } catch (err) {
            console.error(err);
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className="achievement-editor-row card-premium">
            <div className="achievement-media-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {isEditing ? (
                    <ImageUploader 
                        currentImage={formData.image_url}
                        onImageUploaded={(url) => handleChange('image_url', url)}
                        bucketName="medals"
                    />
                ) : (
                    <div 
                        className="image-preview" 
                        style={{ 
                            width: 64, height: 64, borderRadius: 12, 
                            background: 'rgba(255,255,255,0.05)', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', overflow: 'hidden' 
                        }}
                    >
                        {achievement.image_url ? (
                            <img src={achievement.image_url} alt={achievement.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <Trophy size={24} style={{ opacity: 0.3 }} />
                        )}
                    </div>
                )}
                <input 
                    aria-label={t('admin.gamification.icon_input', 'Icono o emoji del logro')} 
                    type="text" 
                    value={isEditing ? formData.icon : achievement.icon} 
                    onChange={(e) => handleChange('icon', e.target.value)}
                    className="icon-emoji-input"
                    placeholder="Icono"
                    readOnly={!isEditing}
                    style={{ opacity: isEditing ? 1 : 0.8, cursor: isEditing ? 'text' : 'default' }}
                />
            </div>
            
            <div className="achievement-details">
                <div className="row">
                    <input 
                        aria-label={t('admin.gamification.achievement_name_es', 'Nombre del logro en español')} 
                        type="text"
                        value={isEditing ? formData.name : achievement.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="input-premium"
                        placeholder="Nombre (ES)"
                        readOnly={!isEditing}
                        style={{ opacity: isEditing ? 1 : 0.8 }}
                    />
                    <input 
                        aria-label={t('admin.gamification.criteria_es', 'Criterio del logro en español')} 
                        type="text"
                        value={isEditing ? formData.criteria : achievement.criteria}
                        onChange={(e) => handleChange('criteria', e.target.value)}
                        className="input-premium criteria"
                        placeholder="Criterio (ES)"
                        readOnly={!isEditing}
                        style={{ opacity: isEditing ? 1 : 0.8 }}
                    />
                </div>
                <textarea 
                    aria-label={t('admin.gamification.achievement_desc_es', 'Descripción del logro en español')} 
                    value={isEditing ? formData.description : achievement.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="textarea-premium"
                    placeholder="Descripción (ES)"
                    readOnly={!isEditing}
                    style={{ opacity: isEditing ? 1 : 0.8 }}
                />
                
                {/* English Fields (Only visible in edit) */}
                {isEditing && (
                    <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>VERSION INGLÉS</div>
                            <button 
                                aria-label={t('admin.gamification.auto_translate', 'Traducir logro automáticamente al inglés')} 
                                type="button" 
                                onClick={handleAutoTranslate}
                                disabled={isTranslating}
                                style={{ 
                                    background: 'none', border: 'none', cursor: isTranslating ? 'wait' : 'pointer', 
                                    color: 'var(--accent)', fontSize: '0.7rem', display: 'flex', 
                                    alignItems: 'center', gap: '4px', opacity: isTranslating ? 0.5 : 0.8
                                }}
                                title="Traducir Automatically (via MyMemory API)"
                            >
                                <Languages size={12} className={isTranslating ? "animate-spin" : ""} aria-hidden="true" /> 
                                {isTranslating ? "Translating..." : "Auto-Translate"}
                            </button>
                        </div>
                        <div className="row" style={{ marginTop: '0.25rem' }}>
                            <input 
                                aria-label={t('admin.gamification.achievement_name_en', 'Nombre del logro en inglés')} 
                                type="text"
                                value={formData.name_en || ''}
                                onChange={(e) => handleChange('name_en', e.target.value)}
                                className="input-premium"
                                placeholder="Name (EN)"
                                style={{ fontSize: '0.9rem' }}
                            />
                            <input 
                                aria-label={t('admin.gamification.criteria_en', 'Criterio del logro en inglés')} 
                                type="text"
                                value={formData.criteria_en || ''}
                                onChange={(e) => handleChange('criteria_en', e.target.value)}
                                className="input-premium criteria"
                                placeholder="Criteria (EN)"
                                style={{ fontSize: '0.9rem' }}
                            />
                        </div>
                        <textarea 
                            aria-label={t('admin.gamification.achievement_desc_en', 'Descripción del logro en inglés')} 
                            value={formData.description_en || ''}
                            onChange={(e) => handleChange('description_en', e.target.value)}
                            className="textarea-premium"
                            placeholder="Description (EN)"
                            style={{ fontSize: '0.85rem' }}
                        />
                    </div>
                )}
            </div>

            <div className="achievement-actions action-buttons" style={{ flexDirection: 'column' }}>
                {isEditing ? (
                    <>
                        <button 
                            aria-label={t('common.save', 'Guardar logro')} 
                            type="button" 
                            className="save-btn" 
                            onClick={handleSave} 
                            title="Guardar"
                        >
                            <Check size={18} aria-hidden="true" />
                        </button>
                        <button 
                            aria-label={t('common.cancel', 'Cancelar edición de logro')} 
                            type="button" 
                            className="cancel-btn" 
                            onClick={handleCancel} 
                            title="Cancelar"
                        >
                            <X size={18} aria-hidden="true" />
                        </button>
                    </>
                ) : (
                    <>
                        <button 
                            aria-label={t('common.edit', 'Editar logro')} 
                            type="button" 
                            className="edit-btn" 
                            onClick={() => setIsEditing(true)} 
                            title="Editar"
                        >
                            <Pencil size={18} aria-hidden="true" />
                        </button>
                        <button 
                            aria-label={t('common.delete', 'Eliminar logro')} 
                            type="button" 
                            className="delete-btn" 
                            onClick={onDelete} 
                            title="Eliminar"
                        >
                            <Trash2 size={18} aria-hidden="true" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// --- Main Component ---

export default function GamificationManager() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'medals' | 'achievements'>('medals');
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, medalId: number | string | null, type: 'medal' | 'achievement' | null }>({
        isOpen: false,
        medalId: null,
        type: null
    });

    const { data: adminSettings, isLoading: loading } = useAdminSettings();
    const updateSettingMutation = useUpdateSiteSetting();

    const medals = adminSettings?.medals || [];
    const achievements = adminSettings?.achievements || [];

    const handleUpdateDefinitions = async (type: 'medal' | 'achievement', newList: (Medal | Achievement)[]) => {
        const key = type === 'medal' ? 'medal_definitions' : 'achievement_definitions';
        updateSettingMutation.mutate({
            key,
            value: JSON.stringify(newList)
        });
    }

    const handleAdd = () => {
        if (activeTab === 'medals') {
            const newMedal: Medal = {
                id: Date.now(),
                name: "Nueva Medalla",
                description: "Descripción de la medalla",
                icon: "shield",
                color: "#ffffff"
            };
            handleUpdateDefinitions('medal', [...medals, newMedal]);
        } else {
            const newAchievement: Achievement = {
                id: `manual_${Date.now()}`,
                name: "Nuevo Logro",
                description: "Descripción del logro",
                criteria: "Criterio de obtención",
                icon: "⭐"
            };
            handleUpdateDefinitions('achievement', [...achievements, newAchievement]);
        }
    }

    const confirmDeletion = () => {
        if (!confirmDelete.medalId || !confirmDelete.type) return;
        
        if (confirmDelete.type === 'medal') {
            handleUpdateDefinitions('medal', medals.filter((m: Medal) => m.id !== confirmDelete.medalId));
        } else {
            handleUpdateDefinitions('achievement', achievements.filter((a: Achievement) => a.id !== confirmDelete.medalId));
        }
        setConfirmDelete({ isOpen: false, medalId: null, type: null });
    }

    const handleDeleteClick = (id: number | string, type: 'medal' | 'achievement') => {
        setConfirmDelete({ isOpen: true, medalId: id, type: type });
    }

    const handleSaveItem = (item: Medal | Achievement, type: 'medal' | 'achievement') => {
        if (type === 'medal') {
            const m = item as Medal;
            const textLists = medals.map((old: Medal) => old.id === m.id ? m : old);
            handleUpdateDefinitions('medal', textLists);
        } else {
            const a = item as Achievement;
            const textLists = achievements.map((old: Achievement) => old.id === a.id ? a : old);
            handleUpdateDefinitions('achievement', textLists);
        }
    }

    if (loading) return (
        <div style={{ padding: '8rem', display: 'flex', justifyContent: 'center' }}>
            <Loader />
        </div>
    );

    return (
        <div className="gamification-container">
            <div className="gamification-header">
                <div className="gamification-tabs" role="tablist" aria-label={t('admin.gamification.tabs', 'Secciones de gamificación')}>
                    <button type="button" 
                        role="tab"
                        aria-selected={activeTab === 'medals'}
                        className={`tab-btn ${activeTab === 'medals' ? 'active' : ''}`}
                        onClick={() => setActiveTab('medals')}
                    >
                        <MedalIcon size={18} aria-hidden="true" /> {t('admin.gamification.medals_tab')}
                    </button>
                    <button type="button" 
                        role="tab"
                        aria-selected={activeTab === 'achievements'}
                        className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
                        onClick={() => setActiveTab('achievements')}
                    >
                        <Trophy size={18} aria-hidden="true" /> {t('admin.gamification.achievements_tab')}
                    </button>
                </div>
                <button type="button" 
                    className="btn-primary" 
                    onClick={(e) => {
                        e.preventDefault(); 
                        handleAdd();
                    }}
                >
                    <Plus size={16} aria-hidden="true" /> 
                    {activeTab === 'medals' ? t('admin.gamification.add_medal') : t('admin.gamification.add_achievement')}
                </button>
            </div>

            <div className="gamification-content">
                {activeTab === 'medals' ? (
                    <div className="medals-grid">
                        {medals.map((medal: Medal) => (
                            <MedalCard 
                                key={medal.id} 
                                medal={medal} 
                                onSave={(m) => handleSaveItem(m, 'medal')}
                                onDelete={() => handleDeleteClick(medal.id, 'medal')}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="achievements-list">
                        {achievements.map((achievement: Achievement) => (
                            <AchievementCard 
                                key={achievement.id}
                                achievement={achievement}
                                onSave={(a) => handleSaveItem(a, 'achievement')}
                                onDelete={() => handleDeleteClick(achievement.id, 'achievement')}
                            />
                        ))}
                    </div>
                )}
            </div>

            <PremiumConfirm 
                isOpen={confirmDelete.isOpen}
                onCancel={() => setConfirmDelete({ isOpen: false, medalId: null, type: null })}
                onConfirm={confirmDeletion}
                title={t('admin.gamification.delete_title')}
                message={t('admin.gamification.delete_desc')}
            />
        </div>
    );
}


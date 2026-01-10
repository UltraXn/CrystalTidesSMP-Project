import { useState } from 'react';
import { Plus, Trash2, Trophy, Medal as MedalIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Loader from "../UI/Loader";
import PremiumConfirm from "../UI/PremiumConfirm";
import { MEDAL_ICONS } from '../../utils/MedalIcons';
import { 
    useAdminSettings, 
    useUpdateSiteSetting 
} from '../../hooks/useAdminData';

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

export default function GamificationManager() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'medals' | 'achievements'>('medals');
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, medalId: number | string | null, type: 'medal' | 'achievement' | null }>({
        isOpen: false,
        medalId: null,
        type: null
    });

    // TanStack Query Hooks
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

    const handleDelete = () => {
        if (!confirmDelete.medalId || !confirmDelete.type) return;
        
        if (confirmDelete.type === 'medal') {
            handleUpdateDefinitions('medal', medals.filter((m: Medal) => m.id !== confirmDelete.medalId));
        } else {
            handleUpdateDefinitions('achievement', achievements.filter((a: Achievement) => a.id !== confirmDelete.medalId));
        }
        setConfirmDelete({ isOpen: false, medalId: null, type: null });
    }

    const handleEdit = (id: number | string, field: string, value: string) => {
        if (activeTab === 'medals') {
            const newList = medals.map((m: Medal) => m.id === id ? { ...m, [field]: value } : m);
            handleUpdateDefinitions('medal', newList);
        } else {
            const newList = achievements.map((a: Achievement) => a.id === id ? { ...a, [field]: value } : a);
            handleUpdateDefinitions('achievement', newList);
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
                <div className="gamification-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'medals' ? 'active' : ''}`}
                        onClick={() => setActiveTab('medals')}
                    >
                        <MedalIcon size={18} /> {t('admin.gamification.medals_tab')}
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
                        onClick={() => setActiveTab('achievements')}
                    >
                        <Trophy size={18} /> {t('admin.gamification.achievements_tab')}
                    </button>
                </div>
                <button className="btn-primary" onClick={handleAdd}>
                    <Plus size={16} /> {activeTab === 'medals' ? t('admin.gamification.add_medal') : t('admin.gamification.add_achievement')}
                </button>
            </div>

            <div className="gamification-content">
                {activeTab === 'medals' ? (
                    <div className="medals-grid">
                        {medals.map((medal: Medal) => (
                            <div key={medal.id} className="medal-editor-card card-premium">
                                <div className="card-header">
                                    <div className="icon-selector">
                                        {(() => {
                                            const IconComp = MEDAL_ICONS[medal.icon as keyof typeof MEDAL_ICONS] || MedalIcon;
                                            return <IconComp size={20} />;
                                        })()}
                                        <select 
                                            value={medal.icon} 
                                            onChange={(e) => handleEdit(medal.id, 'icon', e.target.value)}
                                        >
                                            {Object.keys(MEDAL_ICONS).map(iconName => (
                                                <option key={iconName} value={iconName}>{iconName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <input 
                                        type="color" 
                                        value={medal.color} 
                                        onChange={(e) => handleEdit(medal.id, 'color', e.target.value)}
                                        className="color-picker"
                                    />
                                    <button 
                                        className="delete-btn"
                                        onClick={() => setConfirmDelete({ isOpen: true, medalId: medal.id, type: 'medal' })}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="card-body">
                                    <input 
                                        type="text" 
                                        value={medal.name} 
                                        placeholder="Nombre"
                                        onChange={(e) => handleEdit(medal.id, 'name', e.target.value)}
                                        className="input-premium"
                                    />
                                    <textarea 
                                        value={medal.description} 
                                        placeholder="Descripción"
                                        onChange={(e) => handleEdit(medal.id, 'description', e.target.value)}
                                        className="textarea-premium"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="achievements-list">
                        {achievements.map((achievement: Achievement) => (
                            <div key={achievement.id} className="achievement-editor-row card-premium">
                                <div className="achievement-icon-wrapper">
                                    <input 
                                        type="text" 
                                        value={achievement.icon} 
                                        onChange={(e) => handleEdit(achievement.id, 'icon', e.target.value)}
                                        className="icon-emoji-input"
                                    />
                                </div>
                                <div className="achievement-details">
                                    <div className="row">
                                        <input 
                                            type="text"
                                            value={achievement.name}
                                            onChange={(e) => handleEdit(achievement.id, 'name', e.target.value)}
                                            className="input-premium"
                                            placeholder="Nombre del Logro"
                                        />
                                        <input 
                                            type="text"
                                            value={achievement.criteria}
                                            onChange={(e) => handleEdit(achievement.id, 'criteria', e.target.value)}
                                            className="input-premium criteria"
                                            placeholder="Criterio (Interno)"
                                        />
                                    </div>
                                    <textarea 
                                        value={achievement.description}
                                        onChange={(e) => handleEdit(achievement.id, 'description', e.target.value)}
                                        className="textarea-premium"
                                        placeholder="Descripción del logro"
                                    />
                                </div>
                                <div className="achievement-actions">
                                    <button 
                                        className="delete-btn"
                                        onClick={() => setConfirmDelete({ isOpen: true, medalId: achievement.id, type: 'achievement' })}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <PremiumConfirm 
                isOpen={confirmDelete.isOpen}
                onCancel={() => setConfirmDelete({ isOpen: false, medalId: null, type: null })}
                onConfirm={handleDelete}
                title={t('admin.gamification.delete_title')}
                message={t('admin.gamification.delete_desc')}
            />
        </div>
    );
}

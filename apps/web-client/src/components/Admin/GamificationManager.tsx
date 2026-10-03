import { useState, type CSSProperties, type MouseEvent } from 'react';
import {
  Plus,
  Trash2,
  Trophy,
  Medal as MedalIcon,
  Pencil,
  Check,
  X,
  Languages,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Loader from '../UI/Loader';
import PremiumConfirm from '../UI/PremiumConfirm';
import ImageUploader from '../UI/ImageUploader';
import { MEDAL_ICONS } from '../../utils/MedalIcons';
import { useAdminSettings, useUpdateSiteSetting } from '../../hooks/useAdminData';

// --- Interfaces ---

interface Medal {
  id: number;
  name: string;
  description: string;
  name_en?: string;
  description_en?: string;
  icon: string;
  color: string;
  image_url?: string;
}

interface Achievement {
  id: string | number;
  name: string;
  description: string;
  name_en?: string;
  description_en?: string;
  criteria: string;
  criteria_en?: string;
  icon: string;
  image_url?: string;
  color?: string;
}

type GamificationType = 'medal' | 'achievement';
type ActiveTab = 'medals' | 'achievements';

interface ConfirmDeleteState {
  isOpen: boolean;
  medalId: number | string | null;
  type: GamificationType | null;
}

interface MedalCardProps {
  medal: Medal;
  onSave: (m: Medal) => void;
  onDelete: () => void;
}

interface AchievementCardProps {
  achievement: Achievement;
  onSave: (a: Achievement) => void;
  onDelete: () => void;
}

// --- Constants ---

const CONSTANTS = {
  BUCKET_MEDALS: 'medals',
  TYPE_MEDAL: 'medal' as const,
  TYPE_ACHIEVEMENT: 'achievement' as const,
  TAB_MEDALS: 'medals' as const,
  TAB_ACHIEVEMENTS: 'achievements' as const,
  KEY_MEDAL_DEFS: 'medal_definitions',
  KEY_ACHIEVEMENT_DEFS: 'achievement_definitions',
  DEFAULT_COLOR: '#ffffff',
  DEFAULT_ICON: 'shield',
  DEFAULT_ACHIEVEMENT_ICON: '⭐',
  PREVIEW_BG: 'rgba(255,255,255,0.05)',
  BORDER_SEPARATOR: '1px solid rgba(255,255,255,0.1)',
  TRANSLATE_TITLE: 'Traducir Automatically (via MyMemory API)',
  VERSION_EN_LABEL: 'VERSION INGLÉS',
  INPUT_PREMIUM: 'input-premium',
  TEXTAREA_PREMIUM: 'textarea-premium',
} as const;

const PREVIEW_STYLE: CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: 12,
  background: CONSTANTS.PREVIEW_BG,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
};

const PREVIEW_IMG_STYLE: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

// --- Pure Helpers ---

async function translateText(text: string): Promise<string> {
  if (!text || text.trim() === '') return '';
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=es|en`,
    );
    if (!response.ok) return text;
    const data = await response.json();
    return data.responseData?.translatedText || text;
  } catch (error) {
    console.error('Translation failed:', error);
    return text;
  }
}

const MedalIconDisplay = ({
  iconName,
  size = 20,
  style,
}: {
  iconName: string;
  size?: number;
  style?: CSSProperties;
}) => {
  const Icon = MEDAL_ICONS[iconName as keyof typeof MEDAL_ICONS] || MedalIcon;
  return <Icon size={size} style={style} />;
};

// --- Common UI Components ---

interface AutoTranslateButtonProps {
  isTranslating: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  ariaLabel: string;
}

const AutoTranslateButton = ({
  isTranslating,
  onClick,
  ariaLabel,
}: Readonly<AutoTranslateButtonProps>) => {
  return (
    <button
      aria-label={ariaLabel}
      type="button"
      onClick={onClick}
      disabled={isTranslating}
      style={{
        background: 'none',
        border: 'none',
        cursor: isTranslating ? 'wait' : 'pointer',
        color: 'var(--accent)',
        fontSize: '0.7rem',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        opacity: isTranslating ? 0.5 : 0.8,
      }}
      title={CONSTANTS.TRANSLATE_TITLE}
    >
      <Languages size={12} className={isTranslating ? 'animate-spin' : ''} aria-hidden="true" />
      {isTranslating ? 'Translating...' : 'Auto-Translate'}
    </button>
  );
};

// --- Medal Sub-Components ---

interface MedalCardViewProps {
  medal: Medal;
  onEdit: () => void;
  onDelete: () => void;
}

const MedalCardView = ({ medal, onEdit, onDelete }: Readonly<MedalCardViewProps>) => {
  const { t } = useTranslation();

  return (
    <div className="medal-editor-card card-premium">
      <div className="card-header">
        <div className="image-preview" style={PREVIEW_STYLE}>
          {medal.image_url ? (
            <img src={medal.image_url} alt={medal.name} style={PREVIEW_IMG_STYLE} />
          ) : (
            <MedalIcon size={24} style={{ opacity: 0.3 }} />
          )}
        </div>

        <div className="icon-selector-group">
          <div className="icon-selector">
            <MedalIconDisplay iconName={medal.icon} size={20} style={{ color: medal.color }} />
            <select
              aria-label={t('admin.gamification.select_icon', 'Icono de la medalla')}
              value={medal.icon}
              disabled
              style={{ cursor: 'default' }}
            >
              {Object.keys(MEDAL_ICONS).map((iconName) => (
                <option key={iconName} value={iconName}>
                  {iconName}
                </option>
              ))}
            </select>
          </div>
          <input
            aria-label={t('admin.gamification.select_color', 'Color de la medalla')}
            type="color"
            value={medal.color}
            disabled
            className="color-picker"
            style={{ cursor: 'default', opacity: 0.7 }}
          />
        </div>

        <div className="action-buttons">
          <button
            aria-label={t('common.edit', 'Editar medalla')}
            type="button"
            className="edit-btn"
            onClick={onEdit}
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
        </div>
      </div>

      <div className="card-body">
        <input
          aria-label={t('admin.gamification.name_es', 'Nombre de la medalla en español')}
          type="text"
          value={medal.name}
          placeholder="Nombre (ES)"
          readOnly
          className={CONSTANTS.INPUT_PREMIUM}
          style={{ opacity: 0.8 }}
        />
        <textarea
          aria-label={t('admin.gamification.desc_es', 'Descripción de la medalla en español')}
          value={medal.description}
          placeholder="Descripción (ES)"
          readOnly
          className={CONSTANTS.TEXTAREA_PREMIUM}
          style={{ opacity: 0.8 }}
        />
      </div>
    </div>
  );
};

interface MedalCardEditProps {
  medal: Medal;
  onSave: (m: Medal) => void;
  onCancel: () => void;
}

const MedalCardEdit = ({ medal, onSave, onCancel }: Readonly<MedalCardEditProps>) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Medal>(medal);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleChange = <K extends keyof Medal>(field: K, value: Medal[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAutoTranslate = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsTranslating(true);
    try {
      const nameEn = !formData.name_en ? await translateText(formData.name) : formData.name_en;
      const descEn = !formData.description_en
        ? await translateText(formData.description)
        : formData.description_en;
      setFormData((prev) => ({ ...prev, name_en: nameEn, description_en: descEn }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="medal-editor-card card-premium">
      <div className="card-header">
        <ImageUploader
          currentImage={formData.image_url}
          onImageUploaded={(url) => handleChange('image_url', url)}
          bucketName={CONSTANTS.BUCKET_MEDALS}
        />

        <div className="icon-selector-group">
          <div className="icon-selector">
            <MedalIconDisplay
              iconName={formData.icon}
              size={20}
              style={{ color: formData.color }}
            />
            <select
              aria-label={t('admin.gamification.select_icon', 'Icono de la medalla')}
              value={formData.icon}
              onChange={(e) => handleChange('icon', e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              {Object.keys(MEDAL_ICONS).map((iconName) => (
                <option key={iconName} value={iconName}>
                  {iconName}
                </option>
              ))}
            </select>
          </div>
          <input
            aria-label={t('admin.gamification.select_color', 'Color de la medalla')}
            type="color"
            value={formData.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="color-picker"
            style={{ cursor: 'pointer', opacity: 1 }}
          />
        </div>

        <div className="action-buttons">
          <button
            aria-label={t('common.save', 'Guardar medalla')}
            type="button"
            className="save-btn"
            onClick={() => onSave(formData)}
            title="Guardar"
          >
            <Check size={18} aria-hidden="true" />
          </button>
          <button
            aria-label={t('common.cancel', 'Cancelar edición de medalla')}
            type="button"
            className="cancel-btn"
            onClick={onCancel}
            title="Cancelar"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="card-body">
        <input
          aria-label={t('admin.gamification.name_es', 'Nombre de la medalla en español')}
          type="text"
          value={formData.name}
          placeholder="Nombre (ES)"
          onChange={(e) => handleChange('name', e.target.value)}
          className={CONSTANTS.INPUT_PREMIUM}
          style={{ opacity: 1 }}
        />
        <textarea
          aria-label={t('admin.gamification.desc_es', 'Descripción de la medalla en español')}
          value={formData.description}
          placeholder="Descripción (ES)"
          onChange={(e) => handleChange('description', e.target.value)}
          className={CONSTANTS.TEXTAREA_PREMIUM}
          style={{ opacity: 1 }}
        />

        <div
          style={{
            marginTop: '0.5rem',
            borderTop: CONSTANTS.BORDER_SEPARATOR,
            paddingTop: '0.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <div
              style={{
                fontSize: '0.7rem',
                color: '#666',
                textTransform: 'uppercase',
                fontWeight: 'bold',
              }}
            >
              {CONSTANTS.VERSION_EN_LABEL}
            </div>
            <AutoTranslateButton
              ariaLabel={t(
                'admin.gamification.auto_translate',
                'Traducir medalla automáticamente al inglés',
              )}
              isTranslating={isTranslating}
              onClick={handleAutoTranslate}
            />
          </div>
          <input
            aria-label={t('admin.gamification.name_en', 'Nombre de la medalla en inglés')}
            type="text"
            value={formData.name_en || ''}
            placeholder="Name (EN)"
            onChange={(e) => handleChange('name_en', e.target.value)}
            className={CONSTANTS.INPUT_PREMIUM}
            style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}
          />
          <textarea
            aria-label={t('admin.gamification.desc_en', 'Descripción de la medalla en inglés')}
            value={formData.description_en || ''}
            placeholder="Description (EN)"
            onChange={(e) => handleChange('description_en', e.target.value)}
            className={CONSTANTS.TEXTAREA_PREMIUM}
            style={{ fontSize: '0.85rem' }}
          />
        </div>

        <input
          aria-label={t('admin.gamification.image_url', 'URL manual de imagen de la medalla')}
          type="text"
          placeholder="O URL manual imagen..."
          value={formData.image_url || ''}
          onChange={(e) => handleChange('image_url', e.target.value)}
          className="input-premium url-input-small"
        />
      </div>
    </div>
  );
};

const MedalCard = ({ medal, onSave, onDelete }: Readonly<MedalCardProps>) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <MedalCardEdit
        medal={medal}
        onSave={(updated) => {
          onSave(updated);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return <MedalCardView medal={medal} onEdit={() => setIsEditing(true)} onDelete={onDelete} />;
};

// --- Achievement Sub-Components ---

interface AchievementCardViewProps {
  achievement: Achievement;
  onEdit: () => void;
  onDelete: () => void;
}

const AchievementCardView = ({
  achievement,
  onEdit,
  onDelete,
}: Readonly<AchievementCardViewProps>) => {
  const { t } = useTranslation();

  return (
    <div className="achievement-editor-row card-premium">
      <div
        className="achievement-media-wrapper"
        style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
      >
        <div className="image-preview" style={PREVIEW_STYLE}>
          {achievement.image_url ? (
            <img src={achievement.image_url} alt={achievement.name} style={PREVIEW_IMG_STYLE} />
          ) : (
            <Trophy size={24} style={{ opacity: 0.3 }} />
          )}
        </div>
        <input
          aria-label={t('admin.gamification.icon_input', 'Icono o emoji del logro')}
          type="text"
          value={achievement.icon}
          className="icon-emoji-input"
          placeholder="Icono"
          readOnly
          style={{ opacity: 0.8, cursor: 'default' }}
        />
      </div>

      <div className="achievement-details">
        <div className="row">
          <input
            aria-label={t('admin.gamification.achievement_name_es', 'Nombre del logro en español')}
            type="text"
            value={achievement.name}
            className={CONSTANTS.INPUT_PREMIUM}
            placeholder="Nombre (ES)"
            readOnly
            style={{ opacity: 0.8 }}
          />
          <input
            aria-label={t('admin.gamification.criteria_es', 'Criterio del logro en español')}
            type="text"
            value={achievement.criteria}
            className="input-premium criteria"
            placeholder="Criterio (ES)"
            readOnly
            style={{ opacity: 0.8 }}
          />
        </div>
        <textarea
          aria-label={t(
            'admin.gamification.achievement_desc_es',
            'Descripción del logro en español',
          )}
          value={achievement.description}
          className={CONSTANTS.TEXTAREA_PREMIUM}
          placeholder="Descripción (ES)"
          readOnly
          style={{ opacity: 0.8 }}
        />
      </div>

      <div className="achievement-actions action-buttons" style={{ flexDirection: 'column' }}>
        <button
          aria-label={t('common.edit', 'Editar logro')}
          type="button"
          className="edit-btn"
          onClick={onEdit}
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
      </div>
    </div>
  );
};

interface AchievementCardEditProps {
  achievement: Achievement;
  onSave: (a: Achievement) => void;
  onCancel: () => void;
}

const AchievementCardEdit = ({
  achievement,
  onSave,
  onCancel,
}: Readonly<AchievementCardEditProps>) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Achievement>(achievement);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleChange = <K extends keyof Achievement>(field: K, value: Achievement[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAutoTranslate = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsTranslating(true);
    try {
      const nameEn = !formData.name_en ? await translateText(formData.name) : formData.name_en;
      const descEn = !formData.description_en
        ? await translateText(formData.description)
        : formData.description_en;
      const critEn = !formData.criteria_en
        ? await translateText(formData.criteria)
        : formData.criteria_en;

      setFormData((prev) => ({
        ...prev,
        name_en: nameEn,
        description_en: descEn,
        criteria_en: critEn,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="achievement-editor-row card-premium">
      <div
        className="achievement-media-wrapper"
        style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
      >
        <ImageUploader
          currentImage={formData.image_url}
          onImageUploaded={(url) => handleChange('image_url', url)}
          bucketName={CONSTANTS.BUCKET_MEDALS}
        />
        <input
          aria-label={t('admin.gamification.icon_input', 'Icono o emoji del logro')}
          type="text"
          value={formData.icon}
          onChange={(e) => handleChange('icon', e.target.value)}
          className="icon-emoji-input"
          placeholder="Icono"
          style={{ opacity: 1, cursor: 'text' }}
        />
      </div>

      <div className="achievement-details">
        <div className="row">
          <input
            aria-label={t('admin.gamification.achievement_name_es', 'Nombre del logro en español')}
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={CONSTANTS.INPUT_PREMIUM}
            placeholder="Nombre (ES)"
            style={{ opacity: 1 }}
          />
          <input
            aria-label={t('admin.gamification.criteria_es', 'Criterio del logro en español')}
            type="text"
            value={formData.criteria}
            onChange={(e) => handleChange('criteria', e.target.value)}
            className="input-premium criteria"
            placeholder="Criterio (ES)"
            style={{ opacity: 1 }}
          />
        </div>
        <textarea
          aria-label={t(
            'admin.gamification.achievement_desc_es',
            'Descripción del logro en español',
          )}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className={CONSTANTS.TEXTAREA_PREMIUM}
          placeholder="Descripción (ES)"
          style={{ opacity: 1 }}
        />

        <div
          style={{
            marginTop: '0.5rem',
            borderTop: CONSTANTS.BORDER_SEPARATOR,
            paddingTop: '0.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <div
              style={{
                fontSize: '0.7rem',
                color: '#666',
                textTransform: 'uppercase',
                fontWeight: 'bold',
              }}
            >
              {CONSTANTS.VERSION_EN_LABEL}
            </div>
            <AutoTranslateButton
              ariaLabel={t(
                'admin.gamification.auto_translate',
                'Traducir logro automáticamente al inglés',
              )}
              isTranslating={isTranslating}
              onClick={handleAutoTranslate}
            />
          </div>
          <div className="row" style={{ marginTop: '0.25rem' }}>
            <input
              aria-label={t('admin.gamification.achievement_name_en', 'Nombre del logro en inglés')}
              type="text"
              value={formData.name_en || ''}
              onChange={(e) => handleChange('name_en', e.target.value)}
              className={CONSTANTS.INPUT_PREMIUM}
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
            aria-label={t(
              'admin.gamification.achievement_desc_en',
              'Descripción del logro en inglés',
            )}
            value={formData.description_en || ''}
            onChange={(e) => handleChange('description_en', e.target.value)}
            className={CONSTANTS.TEXTAREA_PREMIUM}
            placeholder="Description (EN)"
            style={{ fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div className="achievement-actions action-buttons" style={{ flexDirection: 'column' }}>
        <button
          aria-label={t('common.save', 'Guardar logro')}
          type="button"
          className="save-btn"
          onClick={() => onSave(formData)}
          title="Guardar"
        >
          <Check size={18} aria-hidden="true" />
        </button>
        <button
          aria-label={t('common.cancel', 'Cancelar edición de logro')}
          type="button"
          className="cancel-btn"
          onClick={onCancel}
          title="Cancelar"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

const AchievementCard = ({ achievement, onSave, onDelete }: Readonly<AchievementCardProps>) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <AchievementCardEdit
        achievement={achievement}
        onSave={(updated) => {
          onSave(updated);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <AchievementCardView
      achievement={achievement}
      onEdit={() => setIsEditing(true)}
      onDelete={onDelete}
    />
  );
};

// --- Main Component ---

export default function GamificationManager() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ActiveTab>(CONSTANTS.TAB_MEDALS);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState>({
    isOpen: false,
    medalId: null,
    type: null,
  });

  const { data: adminSettings, isLoading: loading } = useAdminSettings();
  const updateSettingMutation = useUpdateSiteSetting();

  const medals: Medal[] = adminSettings?.medals || [];
  const achievements: Achievement[] = adminSettings?.achievements || [];

  const handleUpdateDefinitions = (type: GamificationType, newList: (Medal | Achievement)[]) => {
    const key =
      type === CONSTANTS.TYPE_MEDAL ? CONSTANTS.KEY_MEDAL_DEFS : CONSTANTS.KEY_ACHIEVEMENT_DEFS;
    updateSettingMutation.mutate({
      key,
      value: JSON.stringify(newList),
    });
  };

  const handleAdd = () => {
    if (activeTab === CONSTANTS.TAB_MEDALS) {
      const newMedal: Medal = {
        id: Date.now(),
        name: 'Nueva Medalla',
        description: 'Descripción de la medalla',
        icon: CONSTANTS.DEFAULT_ICON,
        color: CONSTANTS.DEFAULT_COLOR,
      };
      handleUpdateDefinitions(CONSTANTS.TYPE_MEDAL, [...medals, newMedal]);
      return;
    }

    const newAchievement: Achievement = {
      id: `manual_${Date.now()}`,
      name: 'Nuevo Logro',
      description: 'Descripción del logro',
      criteria: 'Criterio de obtención',
      icon: CONSTANTS.DEFAULT_ACHIEVEMENT_ICON,
    };
    handleUpdateDefinitions(CONSTANTS.TYPE_ACHIEVEMENT, [...achievements, newAchievement]);
  };

  const confirmDeletion = () => {
    if (!confirmDelete.medalId || !confirmDelete.type) return;

    if (confirmDelete.type === CONSTANTS.TYPE_MEDAL) {
      handleUpdateDefinitions(
        CONSTANTS.TYPE_MEDAL,
        medals.filter((m: Medal) => m.id !== confirmDelete.medalId),
      );
    } else {
      handleUpdateDefinitions(
        CONSTANTS.TYPE_ACHIEVEMENT,
        achievements.filter((a: Achievement) => a.id !== confirmDelete.medalId),
      );
    }
    setConfirmDelete({ isOpen: false, medalId: null, type: null });
  };

  const handleDeleteClick = (id: number | string, type: GamificationType) => {
    setConfirmDelete({ isOpen: true, medalId: id, type });
  };

  const handleSaveMedal = (m: Medal) => {
    const updatedList = medals.map((old: Medal) => (old.id === m.id ? m : old));
    handleUpdateDefinitions(CONSTANTS.TYPE_MEDAL, updatedList);
  };

  const handleSaveAchievement = (a: Achievement) => {
    const updatedList = achievements.map((old: Achievement) => (old.id === a.id ? a : old));
    handleUpdateDefinitions(CONSTANTS.TYPE_ACHIEVEMENT, updatedList);
  };

  if (loading) {
    return (
      <div style={{ padding: '8rem', display: 'flex', justifyContent: 'center' }}>
        <Loader />
      </div>
    );
  }

  return (
    <div className="gamification-container">
      <div className="gamification-header">
        <div
          className="gamification-tabs"
          role="tablist"
          aria-label={t('admin.gamification.tabs', 'Secciones de gamificación')}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === CONSTANTS.TAB_MEDALS}
            className={`tab-btn ${activeTab === CONSTANTS.TAB_MEDALS ? 'active' : ''}`}
            onClick={() => setActiveTab(CONSTANTS.TAB_MEDALS)}
          >
            <MedalIcon size={18} aria-hidden="true" /> {t('admin.gamification.medals_tab')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === CONSTANTS.TAB_ACHIEVEMENTS}
            className={`tab-btn ${activeTab === CONSTANTS.TAB_ACHIEVEMENTS ? 'active' : ''}`}
            onClick={() => setActiveTab(CONSTANTS.TAB_ACHIEVEMENTS)}
          >
            <Trophy size={18} aria-hidden="true" /> {t('admin.gamification.achievements_tab')}
          </button>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={(e) => {
            e.preventDefault();
            handleAdd();
          }}
        >
          <Plus size={16} aria-hidden="true" />
          {activeTab === CONSTANTS.TAB_MEDALS
            ? t('admin.gamification.add_medal')
            : t('admin.gamification.add_achievement')}
        </button>
      </div>

      <div className="gamification-content">
        {activeTab === CONSTANTS.TAB_MEDALS ? (
          <div className="medals-grid">
            {medals.map((medal: Medal) => (
              <MedalCard
                key={medal.id}
                medal={medal}
                onSave={handleSaveMedal}
                onDelete={() => handleDeleteClick(medal.id, CONSTANTS.TYPE_MEDAL)}
              />
            ))}
          </div>
        ) : (
          <div className="achievements-list">
            {achievements.map((achievement: Achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                onSave={handleSaveAchievement}
                onDelete={() => handleDeleteClick(achievement.id, CONSTANTS.TYPE_ACHIEVEMENT)}
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

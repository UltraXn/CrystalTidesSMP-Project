import { useState, useCallback } from 'react';
import {
  Waves,
  Ghost,
  TreePine,
  Check,
  Users,
  Save,
  ChevronDown,
  Settings,
  Megaphone,
  Image,
  Gavel,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ConfirmationModal from '../UI/ConfirmationModal';
import { useTranslation } from 'react-i18next';
import Loader from '../UI/Loader';

import {
  useSiteSettings,
  useUpdateSiteSetting,
  SiteSettings as HookSiteSettings,
} from '../../hooks/useAdminData';

import BroadcastManager from './Config/BroadcastManager';
import HeroBannerManager, { HeroSlide } from './Config/HeroBannerManager';
import RulesEditor from './Config/RulesEditor';
import DonorsManager from './DonorsManager';
import PoliciesManager from './Config/PoliciesManager';

// Define the settings interface to cover all known keys
const THEME_SETTING_KEY = 'theme';
const TEXT_MUTED_COLOR = 'rgba(255,255,255,0.5)';

interface Rule {
  id: number;
  title: string;
  description: string;
}

// NOTE: interface extension (not Omit) — Omit collapses the hook's index
// signature `[key: string]: unknown` and loses all named properties.
interface SiteSettings extends HookSiteSettings {
  server_rules?: string | Rule[];
  hero_slides: string | HeroSlide[];
}

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

const EVENT_MAP: Record<string, string> = {
  theme: 'themeChanged',
  broadcast_config: 'broadcastChanged',
  maintenance_mode: 'maintenanceChanged',
};

function useSiteConfigManager(user: User | null, t: (key: string) => string) {
  const { data: fetchedSettings, isLoading: loading } = useSiteSettings();
  const updateSettingMutation = useUpdateSiteSetting();

  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceTarget, setMaintenanceTarget] = useState(false);
  const [localSettings, setLocalSettings] = useState<Partial<SiteSettings>>({});

  const settings: SiteSettings = {
    theme: 'default',
    maintenance_mode: 'false',
    broadcast_config: '',
    hero_slides: '',
    recruitment_status: 'false',
    recruitment_link: '',
    ...((fetchedSettings || {}) as Partial<SiteSettings>),
    ...localSettings,
  };

  const handleUpdate = useCallback(
    async (key: string, value: string | boolean) => {
      const username = user?.user_metadata?.full_name || user?.email || 'Admin';

      updateSettingMutation.mutate(
        {
          key,
          value,
          username,
          userId: user?.id,
        },
        {
          onSuccess: () => {
            setLocalSettings((prev) => {
              const next = { ...prev };
              delete next[key];
              return next;
            });

            const eventName = EVENT_MAP[key];
            if (eventName) {
              window.dispatchEvent(new CustomEvent(eventName, { detail: String(value) }));
            }
          },
          onError: () => {
            alert(t('admin.settings.error_save'));
          },
        },
      );
    },
    [user, updateSettingMutation, t],
  );

  return {
    loading,
    settings,
    handleUpdate,
    showMaintenanceModal,
    setShowMaintenanceModal,
    maintenanceTarget,
    setMaintenanceTarget,
    updateSettingMutation,
    setLocalSettings,
  };
}

function ThemeSelectionCard({
  theme,
  isPending,
  pendingKey,
  onSelectTheme,
  t,
}: Readonly<{
  theme: string;
  isPending: boolean;
  pendingKey?: string;
  onSelectTheme: (theme: string) => void;
  t: (key: string) => string;
}>) {
  return (
    <div
      className="admin-card"
      style={{
        background: 'rgba(10, 10, 15, 0.4)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '1.5rem',
        margin: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ flex: '1 1 200px' }}>
          <h3
            style={{
              marginBottom: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '1.1rem',
              fontWeight: '800',
            }}
          >
            <div
              style={{
                padding: '6px',
                background: 'rgba(0, 188, 212, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Waves style={{ color: '#00bcd4' }} />
            </div>
            {t('admin.settings.theme.title')}
          </h3>
          <p style={{ color: TEXT_MUTED_COLOR, margin: 0, fontSize: '0.85rem' }}>
            {t('admin.settings.theme.desc')}
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.8rem',
        }}
      >
        <ThemeCard
          active={theme === 'default'}
          onClick={() => onSelectTheme('default')}
          icon={<Waves size={24} color="#00bcd4" />}
          title={t('admin.settings.theme.default')}
          color="#00bcd4"
          loading={isPending && pendingKey === THEME_SETTING_KEY}
        />
        <ThemeCard
          active={theme === 'halloween'}
          onClick={() => onSelectTheme('halloween')}
          icon={<Ghost size={24} color="#ff7518" />}
          title={t('admin.settings.theme.halloween')}
          color="#ff7518"
          loading={isPending && pendingKey === THEME_SETTING_KEY}
        />
        <ThemeCard
          active={theme === 'christmas'}
          onClick={() => onSelectTheme('christmas')}
          icon={<TreePine size={24} color="#ef4444" />}
          title={t('admin.settings.theme.christmas')}
          color="#ef4444"
          loading={isPending && pendingKey === THEME_SETTING_KEY}
        />
      </div>
    </div>
  );
}

function MaintenanceCard({
  maintenanceMode,
  onToggle,
  t,
}: Readonly<{
  maintenanceMode: boolean;
  onToggle: () => void;
  t: ReturnType<typeof useTranslation>['t'];
}>) {
  return (
    <div
      className="admin-card"
      style={{
        background: maintenanceMode ? 'rgba(239, 68, 68, 0.05)' : 'rgba(10, 10, 15, 0.4)',
        backdropFilter: 'blur(20px)',
        border: maintenanceMode
          ? '1px solid rgba(239, 68, 68, 0.3)'
          : '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '1.5rem',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      <div style={{ flex: '1' }}>
        <h3
          style={{
            marginBottom: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '1rem',
            fontWeight: '800',
          }}
        >
          <div
            style={{
              padding: '6px',
              background: maintenanceMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Settings style={{ color: maintenanceMode ? '#ef4444' : '#fff' }} />
          </div>
          {t('admin.settings.maintenance_label')}
        </h3>
        <p
          style={{
            color: maintenanceMode ? '#fca5a5' : TEXT_MUTED_COLOR,
            margin: 0,
            fontSize: '0.8rem',
          }}
        >
          {maintenanceMode
            ? 'El sitio está inaccesible para usuarios normales.'
            : 'El sitio está activo y visible.'}
        </p>
      </div>

      <label className="switch" style={{ margin: 0 }}>
        <input
          aria-label={t('admin.settings.maintenance.toggle', 'Alternar modo mantenimiento')}
          type="checkbox"
          checked={maintenanceMode}
          onChange={() => {}}
          onClick={(e) => {
            e.preventDefault();
            onToggle();
          }}
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
}

export default function SiteConfig() {
  const { t } = useTranslation();
  const { user } = useAuth() as { user: User | null };

  const {
    loading,
    settings,
    handleUpdate,
    showMaintenanceModal,
    setShowMaintenanceModal,
    maintenanceTarget,
    setMaintenanceTarget,
    updateSettingMutation,
    setLocalSettings,
  } = useSiteConfigManager(user, t);

  if (loading)
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '5rem',
          background: 'rgba(0,0,0,0.1)',
          borderRadius: '12px',
        }}
      >
        <Loader text="" style={{ height: 'auto', minHeight: '120px' }} />
      </div>
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '3rem' }}>
      {/* 1. SECCIÓN GENERAL (Tema, Mantenimiento, Reclutamiento) */}
      <ConfigSection
        title={t('admin.settings.sections.general')}
        icon={<Settings />}
        defaultOpen={true}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* TEMA + MANTENIMIENTO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <ThemeSelectionCard
              theme={settings.theme}
              isPending={updateSettingMutation.isPending}
              pendingKey={updateSettingMutation.variables?.key}
              onSelectTheme={(theme) => handleUpdate(THEME_SETTING_KEY, theme)}
              t={t}
            />
            <MaintenanceCard
              maintenanceMode={settings.maintenance_mode === 'true'}
              onToggle={() => {
                const nextState = settings.maintenance_mode !== 'true';
                setMaintenanceTarget(nextState);
                setShowMaintenanceModal(true);
              }}
              t={t}
            />
          </div>

          {/* RECLUTAMIENTO */}
          <div
            className="admin-card"
            style={{
              background: 'rgba(10, 10, 15, 0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '24px',
              padding: '1.5rem',
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <h3
              style={{
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '1.1rem',
                fontWeight: '800',
              }}
            >
              <div
                style={{
                  padding: '6px',
                  background: 'rgba(76, 175, 80, 0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users style={{ color: '#4CAF50' }} />
              </div>
              {t('admin.settings.recruitment.title')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background:
                    settings.recruitment_status === 'true'
                      ? 'rgba(76, 175, 80, 0.1)'
                      : 'rgba(239, 68, 68, 0.05)',
                  padding: '1.25rem',
                  borderRadius: '16px',
                  border:
                    settings.recruitment_status === 'true'
                      ? '1px solid rgba(76, 175, 80, 0.2)'
                      : '1px solid rgba(239, 68, 68, 0.1)',
                }}
              >
                <div>
                  <span
                    style={{
                      display: 'block',
                      fontWeight: '800',
                      fontSize: '1.1rem',
                      color: settings.recruitment_status === 'true' ? '#4CAF50' : '#ef4444',
                      marginBottom: '4px',
                    }}
                  >
                    {settings.recruitment_status === 'true'
                      ? t('admin.settings.recruitment.status_open')
                      : t('admin.settings.recruitment.status_closed')}
                  </span>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: TEXT_MUTED_COLOR,
                      fontWeight: '600',
                    }}
                  >
                    {t('admin.settings.recruitment.status_label')}
                  </span>
                </div>
                <label className="switch">
                  <input
                    aria-label={t(
                      'admin.settings.recruitment.toggle',
                      'Alternar estado de reclutamiento',
                    )}
                    type="checkbox"
                    checked={settings.recruitment_status === 'true'}
                    onChange={(e) => handleUpdate('recruitment_status', String(e.target.checked))}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div>
                <label
                  htmlFor="recruitment-link"
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '0.85rem',
                    color: TEXT_MUTED_COLOR,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {t('admin.settings.recruitment.link_label')}
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    id="recruitment-link"
                    className="admin-input-premium"
                    value={settings.recruitment_link || ''}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({ ...prev, recruitment_link: e.target.value }))
                    }
                    placeholder={t('admin.settings.recruitment.link_ph')}
                    style={{ height: '48px', padding: '0 1rem', borderRadius: '12px' }}
                  />
                  <button
                    aria-label={t(
                      'admin.settings.save_recruitment_link',
                      'Guardar enlace de reclutamiento',
                    )}
                    type="button"
                    className="modal-btn-primary hover-lift"
                    disabled={
                      updateSettingMutation.isPending &&
                      updateSettingMutation.variables?.key === 'recruitment_link'
                    }
                    onClick={() =>
                      handleUpdate('recruitment_link', settings.recruitment_link || '')
                    }
                    style={{
                      width: '48px',
                      padding: 0,
                      height: '48px',
                      borderRadius: '12px',
                      minWidth: '48px',
                      justifyContent: 'center',
                    }}
                  >
                    <Save size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ConfigSection>

      {/* 2. BROADCAST (Alertas) */}
      <ConfigSection title={t('admin.settings.sections.broadcast')} icon={<Megaphone />}>
        <BroadcastManager
          settings={settings}
          onUpdate={handleUpdate}
          saving={updateSettingMutation.isPending ? updateSettingMutation.variables?.key : null}
        />
      </ConfigSection>

      {/* 3. HERO BANNER */}
      <ConfigSection title={t('admin.settings.sections.hero')} icon={<Image />}>
        <HeroBannerManager
          settings={settings}
          onUpdate={handleUpdate}
          saving={updateSettingMutation.isPending ? updateSettingMutation.variables?.key : null}
        />
      </ConfigSection>

      {/* 4. REGLAS */}
      <ConfigSection title={t('admin.settings.sections.rules')} icon={<Gavel />}>
        <RulesEditor />
      </ConfigSection>

      {/* 5. DONADORES */}
      <ConfigSection title={t('admin.settings.sections.donors')} icon={<Users />}>
        <DonorsManager />
      </ConfigSection>

      {/* 8. POLÍTICAS LEGALES */}
      <ConfigSection
        title={t('admin.settings.sections.policies', 'Políticas del Sitio')}
        icon={<Shield />}
      >
        <PoliciesManager />
      </ConfigSection>

      <ConfirmationModal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        onConfirm={() => {
          handleUpdate('maintenance_mode', String(maintenanceTarget));
          setShowMaintenanceModal(false);
        }}
        title={
          maintenanceTarget
            ? t('admin.settings.maintenance_modal.title_on')
            : t('admin.settings.maintenance_modal.title_off')
        }
        message={
          maintenanceTarget
            ? t('admin.settings.maintenance_modal.msg_on')
            : t('admin.settings.maintenance_modal.msg_off')
        }
        confirmText={
          maintenanceTarget
            ? t('admin.settings.maintenance_modal.confirm_on')
            : t('admin.settings.maintenance_modal.confirm_off')
        }
        cancelText={t('admin.settings.maintenance_modal.cancel')}
        isDanger={maintenanceTarget}
      />
    </div>
  );
}

interface ConfigSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function ConfigSection({ title, icon, children, defaultOpen = false }: ConfigSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: 'rgba(10, 10, 15, 0.4)',
        backdropFilter: 'blur(10px)',
        border: isOpen
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        overflow: 'hidden',
        transition:
          'color 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isOpen ? '0 10px 30px rgba(0,0,0,0.2)' : 'none',
      }}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={`${isOpen ? 'Colapsar' : 'Expandir'} sección ${title}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: isOpen ? 'rgba(255,255,255,0.02)' : 'transparent',
          border: 'none',
          color: isOpen ? '#fff' : 'rgba(255,255,255,0.8)',
          cursor: 'pointer',
          fontSize: '1.1rem',
          fontWeight: '800',
          transition: 'color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s',
          borderBottom: isOpen ? '1px solid rgba(255,255,255,0.05)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              color: isOpen ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
              transition: 'color 0.3s',
              fontSize: '1.3rem',
              display: 'flex',
            }}
          >
            {icon}
          </div>
          <span style={{ letterSpacing: '0.5px' }}>{title}</span>
        </div>
        <div
          style={{
            background: isOpen ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
            color: isOpen ? '#000' : '#fff',
            width: '32px',
            height: '32px',
            minWidth: '32px',
            minHeight: '32px',
            flexShrink: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.3s, background-color 0.3s, border-color 0.3s, opacity 0.3s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          }}
        >
          <ChevronDown size={14} />
        </div>
      </button>

      {isOpen && <div style={{ padding: '2rem', animation: 'fadeIn 0.3s' }}>{children}</div>}
    </div>
  );
}

interface ThemeCardProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  color: string;
  loading: boolean;
}

function ThemeCard({ active, onClick, icon, title, color, loading }: Readonly<ThemeCardProps>) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        background: active
          ? `linear-gradient(135deg, ${color}22, transparent)`
          : 'rgba(255,255,255,0.03)',
        border: active ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '1.5rem 1rem',
        textAlign: 'center',
        cursor: 'pointer',
        transition:
          'color 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: loading && !active ? 0.5 : 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}
      className="hover-lift"
    >
      {active && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: color,
            background: `rgba(${Number.parseInt(color.slice(1, 3), 16)}, ${Number.parseInt(color.slice(3, 5), 16)}, ${Number.parseInt(color.slice(5, 7), 16)}, 0.2)`,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
          }}
        >
          <Check />
        </div>
      )}
      <div
        style={{
          transform: active ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.3s',
          filter: active ? `drop-shadow(0 0 10px ${color})` : 'grayscale(1)',
          opacity: active ? 1 : 0.6,
        }}
      >
        {icon}
      </div>
      <h4
        style={{
          color: active ? '#fff' : TEXT_MUTED_COLOR,
          margin: 0,
          fontSize: '0.9rem',
          fontWeight: '700',
          transition: 'color 0.3s',
        }}
      >
        {title}
      </h4>
    </div>
  );
}

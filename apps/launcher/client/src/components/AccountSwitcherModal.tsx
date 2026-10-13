import React, { useState } from 'react';
import { MorphIcon } from 'morphicons/react';
import { X, LogOut, Settings, Plus } from 'lucide';
import { useAuth, SavedAccount } from '../services/authContext';
import { getSettings, saveSettings } from '../services/settingsService';
import { RoleBadge } from './RoleBadge';

export interface AccountSwitcherModalProps {
  onClose: () => void;
  onNavigateSettings: () => void;
  /** "modal" (default) = popup flotante. "inline" = vista de página completa en el nav. */
  mode?: 'modal' | 'inline';
}

type InternalSwitcherProps = Omit<AccountSwitcherModalProps, 'mode'>;

const ITEM_STYLES = {
  compact: {
    avatarSize: 28,
    padding: '8px 10px',
    borderRadius: 10,
    titleSize: 12.5,
    subSize: 9.5,
    gap: 10,
    badgeSize: 9,
    badgePadding: '2px 7px',
    badgeRadius: 5,
    iconSize: 13,
  },
  standard: {
    avatarSize: 36,
    padding: '12px 14px',
    borderRadius: 12,
    titleSize: 14,
    subSize: 10.5,
    gap: 12,
    badgeSize: 9.5,
    badgePadding: '3px 8px',
    badgeRadius: 6,
    iconSize: 14,
  },
} as const;

const AVATAR_PREF_STYLES = {
  compact: {
    containerRadius: 10,
    containerPadding: '5px 8px 5px 12px',
    titleSize: 11,
    boxRadius: 7,
    boxPadding: 2,
    boxGap: 2,
    btnRadius: 5,
    btnPadding: '3px 8px',
    btnFontSize: 10.5,
  },
  standard: {
    containerRadius: 12,
    containerPadding: '10px 14px',
    titleSize: 12,
    boxRadius: 8,
    boxPadding: 3,
    boxGap: 3,
    btnRadius: 6,
    btnPadding: '4px 10px',
    btnFontSize: 11,
  },
} as const;

const CRYSTAL_CARD_STYLES = {
  compact: {
    avatarSize: 36,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    labelSize: 9.5,
    innerGap: 10,
    avatarRadius: 9,
    usernameSize: 13,
    emailSize: 11,
    syncTextSize: 11.5,
    btnFontSize: 11,
    btnRadius: 7,
    btnPadding: '4px 10px',
  },
  standard: {
    avatarSize: 48,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    labelSize: 11,
    innerGap: 12,
    avatarRadius: 12,
    usernameSize: 16,
    emailSize: 12,
    syncTextSize: 12,
    btnFontSize: 12,
    btnRadius: 8,
    btnPadding: '6px 14px',
  },
} as const;

type CrystalCardStyleConfig = (typeof CRYSTAL_CARD_STYLES)[keyof typeof CRYSTAL_CARD_STYLES];

const validateGuestNick = (nick: string): string | null => {
  const trimmed = nick.trim();
  if (!trimmed || trimmed.length < 3) {
    return 'Mínimo 3 caracteres';
  }
  if (!/^\w+$/.test(trimmed)) {
    return 'Solo letras, números y _';
  }
  return null;
};

const useAvatarPreference = () => {
  const [avatarPref, setAvatarPref] = useState<'web' | 'minecraft'>(
    () => getSettings().avatarPreference ?? 'web',
  );

  const toggleAvatarPref = (pref: 'web' | 'minecraft') => {
    setAvatarPref(pref);
    saveSettings({ avatarPreference: pref });
    window.dispatchEvent(new Event('crystaltides_settings_updated'));
  };

  return { avatarPref, toggleAvatarPref };
};

const AccountBadgeOrRemove: React.FC<{
  isActive: boolean;
  compact: boolean;
  onRemove: () => void;
}> = ({ isActive, compact, onRemove }) => {
  const conf = compact ? ITEM_STYLES.compact : ITEM_STYLES.standard;
  if (isActive) {
    return (
      <span
        style={{
          fontSize: conf.badgeSize,
          fontWeight: 800,
          backgroundColor: 'rgba(45,212,191,0.16)',
          border: '1px solid rgba(45,212,191,0.35)',
          color: '#2DD4BF',
          padding: conf.badgePadding,
          borderRadius: conf.badgeRadius,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        Activo
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onRemove}
      title="Quitar perfil"
      style={{
        background: 'none',
        border: 'none',
        color: 'rgba(255,255,255,0.3)',
        cursor: 'pointer',
        padding: 4,
        display: 'flex',
        transition: 'color 120ms ease',
      }}
    >
      <MorphIcon icon={X} size={conf.iconSize} color="currentColor" strokeWidth={2.2} />
    </button>
  );
};

interface AccountItemProps {
  acc: SavedAccount;
  isActive: boolean;
  compact?: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

const AccountItem: React.FC<AccountItemProps> = ({
  acc,
  isActive,
  compact = false,
  onSelect,
  onRemove,
}) => {
  const conf = compact ? ITEM_STYLES.compact : ITEM_STYLES.standard;
  const typeLabel = acc.type === 'microsoft' ? 'Microsoft' : 'Invitado';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: conf.padding,
        borderRadius: conf.borderRadius,
        backgroundColor: isActive ? 'rgba(45,212,191,0.08)' : 'rgba(255,255,255,0.025)',
        border: isActive
          ? '1.5px solid rgba(45,212,191,0.35)'
          : '1.5px solid rgba(255,255,255,0.06)',
        transition: 'all 140ms ease',
      }}
    >
      <button
        type="button"
        disabled={isActive}
        onClick={() => onSelect(acc.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: conf.gap,
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: isActive ? 'default' : 'pointer',
          flex: 1,
          textAlign: 'left',
          color: 'inherit',
        }}
      >
        <img
          src={`https://mc-heads.net/avatar/${acc.username}/${conf.avatarSize}`}
          alt="Head"
          style={{
            width: conf.avatarSize,
            height: conf.avatarSize,
            borderRadius: compact ? 6 : 9,
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          onError={(e) => {
            e.currentTarget.src = '/logo.png';
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: conf.titleSize,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.85)',
            }}
          >
            {acc.username}
          </span>
          <span
            style={{
              fontSize: conf.subSize,
              color: isActive ? '#2DD4BF' : 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            {typeLabel}
          </span>
        </div>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 6 : 8 }}>
        <AccountBadgeOrRemove
          isActive={isActive}
          compact={compact}
          onRemove={() => onRemove(acc.id)}
        />
      </div>
    </div>
  );
};

interface AddGuestFormProps {
  onSave: (nick: string) => Promise<void> | void;
  compact?: boolean;
}

const AddGuestForm: React.FC<AddGuestFormProps> = ({ onSave, compact = false }) => {
  const [nick, setNick] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const validationError = validateGuestNick(nick);
    if (validationError) {
      setError(validationError);
      return;
    }
    await onSave(nick.trim());
    setNick('');
    setError(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: compact ? '8px 10px' : '10px 12px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(45, 212, 191, 0.25)',
        borderRadius: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img
          src={`https://mc-heads.net/avatar/${nick.trim() || 'Steve'}/24`}
          alt="Preview"
          style={{ width: 22, height: 22, borderRadius: 5 }}
          onError={(e) => {
            e.currentTarget.src = '/logo.png';
          }}
        />
        <input
          type="text"
          value={nick}
          onChange={(e) => {
            setNick(e.target.value);
            setError(null);
          }}
          placeholder="Nickname invitado..."
          maxLength={16}
          autoFocus
          style={{
            flex: 1,
            height: compact ? 28 : 32,
            borderRadius: compact ? 6 : 7,
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#FFFFFF',
            fontSize: compact ? 11.5 : 12,
            padding: compact ? '0 8px' : '0 10px',
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={handleSave}
          style={{
            height: compact ? 28 : 32,
            padding: compact ? '0 10px' : '0 12px',
            borderRadius: compact ? 6 : 7,
            backgroundColor: '#2DD4BF',
            border: 'none',
            color: '#051614',
            fontSize: compact ? 11 : 12,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Guardar
        </button>
      </div>
      {error && <span style={{ fontSize: compact ? 10 : 10.5, color: '#EF4444' }}>{error}</span>}
    </div>
  );
};

interface AvatarPrefControlProps {
  avatarPref: 'web' | 'minecraft';
  onToggle: (pref: 'web' | 'minecraft') => void;
  compact?: boolean;
}

const getPrefBtnStyle = (
  isActive: boolean,
  isMc: boolean,
  btnRadius: number,
  btnPadding: string,
  btnFontSize: number,
): React.CSSProperties => {
  if (isActive) {
    if (isMc) {
      return {
        backgroundColor: 'rgba(45,212,191,0.16)',
        border: '1px solid rgba(45,212,191,0.3)',
        color: '#2DD4BF',
        fontSize: btnFontSize,
        fontWeight: 700,
        borderRadius: btnRadius,
        padding: btnPadding,
        cursor: 'pointer',
        transition: 'all 120ms ease',
      };
    }
    return {
      backgroundColor: 'rgba(255,255,255,0.12)',
      border: '1px solid rgba(255,255,255,0.18)',
      color: '#FFFFFF',
      fontSize: btnFontSize,
      fontWeight: 700,
      borderRadius: btnRadius,
      padding: btnPadding,
      cursor: 'pointer',
      transition: 'all 120ms ease',
    };
  }
  return {
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    color: 'rgba(255,255,255,0.45)',
    fontSize: btnFontSize,
    fontWeight: 700,
    borderRadius: btnRadius,
    padding: btnPadding,
    cursor: 'pointer',
    transition: 'all 120ms ease',
  };
};

const AvatarPrefControl: React.FC<AvatarPrefControlProps> = ({
  avatarPref,
  onToggle,
  compact = false,
}) => {
  const conf = compact ? AVATAR_PREF_STYLES.compact : AVATAR_PREF_STYLES.standard;
  const isWeb = avatarPref === 'web';
  const isMc = avatarPref === 'minecraft';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: conf.containerRadius,
        padding: conf.containerPadding,
      }}
    >
      <span style={{ fontSize: conf.titleSize, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
        Avatar en barra:
      </span>
      <div
        style={{
          display: 'flex',
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderRadius: conf.boxRadius,
          padding: conf.boxPadding,
          border: '1px solid rgba(255,255,255,0.06)',
          gap: conf.boxGap,
        }}
      >
        <button
          type="button"
          onClick={() => onToggle('web')}
          style={getPrefBtnStyle(isWeb, false, conf.btnRadius, conf.btnPadding, conf.btnFontSize)}
        >
          Web
        </button>
        <button
          type="button"
          onClick={() => onToggle('minecraft')}
          style={getPrefBtnStyle(isMc, true, conf.btnRadius, conf.btnPadding, conf.btnFontSize)}
        >
          Minecraft
        </button>
      </div>
    </div>
  );
};

const CrystalSyncedView: React.FC<{
  session: NonNullable<ReturnType<typeof useAuth>['crystalSession']>;
  currentSession: ReturnType<typeof useAuth>['currentSession'];
  avatarPref: 'web' | 'minecraft';
  conf: CrystalCardStyleConfig;
}> = ({ session, currentSession, avatarPref, conf }) => {
  const avatarUrl =
    avatarPref === 'minecraft' && currentSession?.username
      ? `https://mc-heads.net/avatar/${currentSession.username}/${conf.avatarSize}`
      : (session.avatarUrl ?? '/logo.png');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: conf.innerGap }}>
      <img
        src={avatarUrl}
        style={{
          width: conf.avatarSize,
          height: conf.avatarSize,
          borderRadius: conf.avatarRadius,
          objectFit: 'cover',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
        alt="Avatar"
        onError={(e) => {
          e.currentTarget.src = '/logo.png';
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
        <span
          style={{
            fontSize: conf.usernameSize,
            fontWeight: 700,
            color: '#FFFFFF',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {session.username}
        </span>
        <span
          style={{
            fontSize: conf.emailSize,
            color: 'rgba(255,255,255,0.45)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {session.email}
        </span>
      </div>
    </div>
  );
};

const CrystalUnsyncedView: React.FC<{
  onLink: () => void;
  conf: CrystalCardStyleConfig;
}> = ({ onLink, conf }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <span style={{ fontSize: conf.syncTextSize, color: 'rgba(255,255,255,0.4)' }}>
      Sin sincronizar
    </span>
    <button
      type="button"
      onClick={onLink}
      style={{
        background: 'rgba(45,212,191,0.12)',
        border: '1px solid rgba(45,212,191,0.25)',
        color: '#2DD4BF',
        fontSize: conf.btnFontSize,
        fontWeight: 700,
        borderRadius: conf.btnRadius,
        padding: conf.btnPadding,
        cursor: 'pointer',
      }}
    >
      Vincular
    </button>
  </div>
);

interface CrystalAccountCardProps {
  crystalSession: ReturnType<typeof useAuth>['crystalSession'];
  currentSession: ReturnType<typeof useAuth>['currentSession'];
  avatarPref: 'web' | 'minecraft';
  onLink: () => void;
  compact?: boolean;
}

const CrystalAccountCard: React.FC<CrystalAccountCardProps> = ({
  crystalSession,
  currentSession,
  avatarPref,
  onLink,
  compact = false,
}) => {
  const conf = compact ? CRYSTAL_CARD_STYLES.compact : CRYSTAL_CARD_STYLES.standard;

  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.025)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: conf.borderRadius,
        padding: conf.padding,
        display: 'flex',
        flexDirection: 'column',
        gap: conf.gap,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: conf.labelSize,
            fontWeight: 800,
            color: '#2DD4BF',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Cuenta CrystalTides
        </span>
        {crystalSession && <RoleBadge role={crystalSession.role} size="sm" />}
      </div>
      {crystalSession ? (
        <CrystalSyncedView
          session={crystalSession}
          currentSession={currentSession}
          avatarPref={avatarPref}
          conf={conf}
        />
      ) : (
        <CrystalUnsyncedView onLink={onLink} conf={conf} />
      )}
    </div>
  );
};

const InlineAccountSwitcher: React.FC<InternalSwitcherProps> = ({
  onClose,
  onNavigateSettings,
}) => {
  const {
    currentSession,
    crystalSession,
    savedAccounts,
    selectAccount,
    removeAccount,
    loginGuest,
    logout,
  } = useAuth();

  const [showAddOffline, setShowAddOffline] = useState(false);
  const { avatarPref, toggleAvatarPref } = useAvatarPreference();

  const handleAddGuest = async (nick: string) => {
    await loginGuest(nick);
    setShowAddOffline(false);
  };

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        height: '100%',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 20,
          paddingBottom: 14,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#2DD4BF',
            boxShadow: '0 0 10px #2DD4BF',
          }}
        />
        <span style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          Cuentas &amp; Sesión
        </span>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
        {/* Left: Perfiles de Minecraft */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            borderRadius: 16,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: 'rgba(255,255,255,0.45)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Perfiles de Minecraft
            </span>
            <button
              type="button"
              onClick={() => setShowAddOffline(!showAddOffline)}
              style={{
                background: 'rgba(45,212,191,0.10)',
                border: '1px solid rgba(45,212,191,0.22)',
                color: '#2DD4BF',
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 7,
                padding: '4px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 120ms ease',
              }}
            >
              <MorphIcon
                icon={showAddOffline ? X : Plus}
                size={11}
                color="currentColor"
                strokeWidth={2.5}
              />
              <span>{showAddOffline ? 'Cancelar' : 'Añadir Invitado'}</span>
            </button>
          </div>

          {showAddOffline && <AddGuestForm onSave={handleAddGuest} />}

          {/* Accounts list */}
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1 }}
          >
            {savedAccounts && savedAccounts.length > 0 ? (
              savedAccounts.map((acc: SavedAccount) => (
                <AccountItem
                  key={acc.id}
                  acc={acc}
                  isActive={currentSession?.id === acc.id}
                  onSelect={selectAccount}
                  onRemove={removeAccount}
                />
              ))
            ) : (
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.35)',
                  textAlign: 'center',
                  padding: '20px 0',
                }}
              >
                Sin cuentas guardadas
              </div>
            )}
          </div>
        </div>

        {/* Right: CrystalTides Account + Preferences + Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CrystalAccountCard
            crystalSession={crystalSession}
            currentSession={currentSession}
            avatarPref={avatarPref}
            onLink={onNavigateSettings}
          />

          <AvatarPrefControl avatarPref={avatarPref} onToggle={toggleAvatarPref} />

          {/* Bottom Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                logout();
              }}
              style={{
                flex: 1,
                height: 40,
                backgroundColor: 'rgba(239,68,68,0.07)',
                border: '1px solid rgba(239,68,68,0.22)',
                color: '#F87171',
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 10,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                transition: 'all 140ms ease',
              }}
            >
              <MorphIcon icon={LogOut} size={14} color="#F87171" strokeWidth={2.2} />
              <span>Cerrar Sesión</span>
            </button>
            <button
              type="button"
              onClick={onNavigateSettings}
              style={{
                height: 40,
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 600,
                padding: '0 18px',
                borderRadius: 10,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                transition: 'all 140ms ease',
              }}
            >
              <MorphIcon icon={Settings} size={14} color="#FFFFFF" strokeWidth={2} />
              <span>Ajustes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModalAccountSwitcher: React.FC<InternalSwitcherProps> = ({ onClose, onNavigateSettings }) => {
  const {
    currentSession,
    crystalSession,
    savedAccounts,
    selectAccount,
    removeAccount,
    loginGuest,
    logout,
  } = useAuth();

  const [showAddOffline, setShowAddOffline] = useState(false);
  const { avatarPref, toggleAvatarPref } = useAvatarPreference();

  const handleSelectAccount = (id: string) => {
    selectAccount(id);
    onClose();
  };

  const handleAddGuest = async (nick: string) => {
    await loginGuest(nick);
    setShowAddOffline(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: 'default',
        }}
      />

      {/* Popover Card anchored right below user greeting in top header */}
      <div
        style={{
          position: 'fixed',
          left: 92,
          top: 92,
          width: 340,
          backgroundColor: 'rgba(8, 10, 15, 0.96)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          borderRadius: 18,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85), 0 0 32px rgba(45, 212, 191, 0.05)',
          zIndex: 1000,
          padding: '16px 18px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          userSelect: 'none',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          animation: 'authModeFadeIn 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 4,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#2DD4BF',
                boxShadow: '0 0 8px #2DD4BF',
              }}
            />
            <span
              style={{ fontSize: 13, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}
            >
              Cuentas &amp; Sesión
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'rgba(255, 255, 255, 0.45)',
              cursor: 'pointer',
              borderRadius: 8,
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 140ms ease',
            }}
          >
            <MorphIcon icon={X} size={13} color="currentColor" strokeWidth={2.2} />
          </button>
        </div>

        {/* Avatar Source Preference Segmented Control */}
        <AvatarPrefControl avatarPref={avatarPref} onToggle={toggleAvatarPref} compact />

        {/* Section 1: CrystalTides Web Account */}
        <CrystalAccountCard
          crystalSession={crystalSession}
          currentSession={currentSession}
          avatarPref={avatarPref}
          onLink={() => {
            onClose();
            onNavigateSettings();
          }}
          compact
        />

        {/* Section 2: Minecraft Profiles List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 2px',
            }}
          >
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 800,
                color: 'rgba(255, 255, 255, 0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Perfiles de Minecraft
            </span>
            <button
              type="button"
              onClick={() => setShowAddOffline(!showAddOffline)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2DD4BF',
                fontSize: 10.5,
                fontWeight: 700,
                cursor: 'pointer',
                padding: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'opacity 120ms ease',
              }}
            >
              <MorphIcon
                icon={showAddOffline ? X : Plus}
                size={11}
                color="currentColor"
                strokeWidth={2.5}
              />
              <span>{showAddOffline ? 'Cancelar' : 'Añadir Invitado'}</span>
            </button>
          </div>

          {/* Expandable Add Guest Input */}
          {showAddOffline && <AddGuestForm onSave={handleAddGuest} compact />}

          {/* Accounts List Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              maxHeight: 160,
              overflowY: 'auto',
              paddingRight: 2,
            }}
          >
            {(savedAccounts ?? []).length > 0 ? (
              (savedAccounts ?? []).map((acc: SavedAccount) => (
                <AccountItem
                  key={acc.id}
                  acc={acc}
                  isActive={currentSession?.id === acc.id}
                  compact
                  onSelect={handleSelectAccount}
                  onRemove={removeAccount}
                />
              ))
            ) : (
              <div
                style={{
                  fontSize: 11.5,
                  color: 'rgba(255, 255, 255, 0.35)',
                  textAlign: 'center',
                  padding: '12px 0',
                }}
              >
                Sin cuentas guardadas
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            style={{
              flex: 1,
              height: 36,
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.22)',
              color: '#F87171',
              fontSize: 11.5,
              fontWeight: 700,
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 140ms ease',
            }}
          >
            <MorphIcon icon={LogOut} size={13} color="#F87171" strokeWidth={2.2} />
            <span>Cerrar Sesión</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateSettings();
            }}
            style={{
              height: 36,
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              color: '#FFFFFF',
              fontSize: 11.5,
              fontWeight: 600,
              padding: '0 14px',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 140ms ease',
            }}
          >
            <MorphIcon icon={Settings} size={12} color="#FFFFFF" strokeWidth={2} />
            <span>Ajustes</span>
          </button>
        </div>
      </div>
    </>
  );
};

export const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({
  mode = 'modal',
  onClose,
  onNavigateSettings,
}) => {
  if (mode === 'inline') {
    return <InlineAccountSwitcher onClose={onClose} onNavigateSettings={onNavigateSettings} />;
  }
  return <ModalAccountSwitcher onClose={onClose} onNavigateSettings={onNavigateSettings} />;
};

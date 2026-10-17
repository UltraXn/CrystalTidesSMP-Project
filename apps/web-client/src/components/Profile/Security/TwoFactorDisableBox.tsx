import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import Loader from '../../UI/Loader';

interface TwoFactorDisableBoxProps {
  token: string;
  onTokenChange: (value: string) => void;
  onDisable: () => void;
  loading: boolean;
}

export function TwoFactorDisableBox({
  token,
  onTokenChange,
  onDisable,
  loading,
}: Readonly<TwoFactorDisableBoxProps>) {
  const { t } = useTranslation();
  const hasCode = token.length === 6;

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <input
        aria-label={t('account.security.2fa_disable_code_label', 'Current 2FA code')}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="000000"
        value={token}
        onChange={(e) => onTokenChange(e.target.value.replace(/\D/g, ''))}
        style={{
          padding: '0.8rem',
          borderRadius: '6px',
          border: '1px solid #444',
          background: '#222',
          color: '#fff',
          fontSize: '1.1rem',
          width: '120px',
          textAlign: 'center',
          letterSpacing: '2px',
        }}
      />
      <button
        type="button"
        onClick={onDisable}
        disabled={loading || !hasCode}
        style={{
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '0.8rem 1.5rem',
          borderRadius: '8px',
          cursor: hasCode ? 'pointer' : 'not-allowed',
          opacity: hasCode ? 1 : 0.6,
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          justifyContent: 'center',
        }}
      >
        {loading ? (
          <Loader minimal />
        ) : (
          <>
            <Trash2 size={14} /> {t('account.security.disable_2fa', 'Disable 2FA')}
          </>
        )}
      </button>
    </div>
  );
}

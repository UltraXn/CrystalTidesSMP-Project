import { useTranslation } from 'react-i18next';
import { Shield, Trash2 } from 'lucide-react';
import Loader from '../../UI/Loader';
import { useTwoFactorAuth, UseTwoFactorAuthOptions } from './useTwoFactorAuth';
import { TwoFactorSetupBox } from './TwoFactorSetupBox';

export type TwoFactorSetupProps = UseTwoFactorAuthOptions;

export default function TwoFactorSetup(props: Readonly<TwoFactorSetupProps> = {}) {
  const { t } = useTranslation();
  const {
    enabled,
    loading,
    confirming,
    setupData,
    token,
    setToken,
    error,
    success,
    setSuccess,
    handleSetup,
    handleEnable,
    handleDisable,
  } = useTwoFactorAuth(props);

  if (loading) return <Loader />;

  return (
    <div
      className="security-card"
      style={{
        background: 'rgba(255,255,255,0.03)',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div
          style={{
            background: 'rgba(59, 130, 246, 0.2)',
            color: '#3b82f6',
            padding: '10px',
            borderRadius: '50%',
          }}
        >
          <Shield size={20} />
        </div>
        <div>
          <h3 style={{ margin: 0, color: '#fff' }}>
            {t('account.security.2fa_title', 'Two-Factor Authentication')}
          </h3>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: '0.9rem' }}>
            {enabled
              ? t('account.security.2fa_active', 'Your account is secured with 2FA.')
              : t(
                  'account.security.2fa_inactive',
                  'Add an extra layer of security to your account.',
                )}
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            color: '#ef4444',
            background: 'rgba(239, 68, 68, 0.1)',
            padding: '0.8rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          style={{
            color: '#10b981',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '0.8rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.9rem',
          }}
        >
          {success}
        </div>
      )}

      {!enabled && !setupData && (
        <button
          type="button"
          onClick={handleSetup}
          disabled={loading}
          className="btn-primary"
          style={{
            background: 'var(--accent)',
            color: '#000',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0.8rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%',
            transition: 'color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? <Loader minimal /> : t('account.security.setup_2fa', 'Setup 2FA')}
        </button>
      )}

      {!enabled && setupData && (
        <TwoFactorSetupBox
          setupData={setupData}
          token={token}
          onTokenChange={setToken}
          confirming={confirming}
          onEnable={handleEnable}
          onCopySecret={() => {
            navigator.clipboard.writeText(setupData.secret);
            setSuccess(t('account.security.copied', 'Copiado!'));
            setTimeout(() => setSuccess(''), 2000);
          }}
        />
      )}

      {enabled && (
        <button
          type="button"
          onClick={handleDisable}
          disabled={loading}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '0.8rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
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
      )}
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import { Copy, Key } from 'lucide-react';
import Loader from '../../UI/Loader';

interface TwoFactorSetupBoxProps {
  setupData: { secret: string; qrCode: string };
  token: string;
  onTokenChange: (val: string) => void;
  confirming: boolean;
  onEnable: () => void;
  onCopySecret: () => void;
}

export function TwoFactorSetupBox({
  setupData,
  token,
  onTokenChange,
  confirming,
  onEnable,
  onCopySecret,
}: Readonly<TwoFactorSetupBoxProps>) {
  const { t } = useTranslation();

  return (
    <div
      className="setup-box animate-fade-in"
      style={{
        marginTop: '1rem',
        background: 'rgba(0,0,0,0.2)',
        padding: '1.5rem',
        borderRadius: '8px',
      }}
    >
      <h4 style={{ color: '#fff', marginBottom: '1rem' }}>
        1. {t('account.security.scan_qr', 'Scan QR Code')}
      </h4>
      <div
        style={{
          position: 'relative',
          background: '#fff',
          padding: '10px',
          borderRadius: '12px',
          width: 'fit-content',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          margin: '0 auto',
        }}
      >
        <img
          src={setupData.qrCode}
          alt="2FA QR"
          style={{ width: '180px', height: '180px', display: 'block' }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '44px',
            height: '44px',
            background: '#fff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            border: '2px solid #fff',
          }}
        >
          <img
            src="/images/ui/logo.webp"
            alt="LT"
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '1rem',
        }}
      >
        <p
          style={{
            color: '#aaa',
            fontSize: '0.85rem',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Key size={12} /> {t('account.security.cant_scan', "Can't scan the QR code?")}
        </p>

        <button
          type="button"
          onClick={onCopySecret}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0,0,0,0.3)',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px dashed rgba(255,255,255,0.2)',
            cursor: 'pointer',
            transition: 'color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s',
          }}
          className="group hover:border-white/40 hover:bg-white/5"
        >
          <code
            style={{
              color: 'var(--accent)',
              fontSize: '0.9rem',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
            }}
          >
            {setupData.secret}
          </code>
          <Copy
            size={12}
            style={{ color: '#666' }}
            className="transition-colors group-hover:text-white"
          />
        </button>
      </div>

      <h4 style={{ color: '#fff', marginBottom: '1rem' }}>
        2. {t('account.security.enter_code', 'Enter Code')}
      </h4>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          aria-label="Input field"
          type="text"
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
          onClick={onEnable}
          disabled={confirming || token.length !== 6}
          className="btn-primary"
          style={{
            background: 'var(--accent)',
            color: '#000',
            fontWeight: 'bold',
            padding: '0.8rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            cursor: confirming || token.length !== 6 ? 'not-allowed' : 'pointer',
            transition: 'color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s',
            opacity: confirming || token.length !== 6 ? 0.6 : 1,
          }}
        >
          {confirming ? <Loader minimal /> : t('account.security.activate', 'Activate')}
        </button>
      </div>
    </div>
  );
}

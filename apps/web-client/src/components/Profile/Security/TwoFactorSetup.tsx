import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Trash2, Copy, Key } from 'lucide-react';
import { use2FAStatus, useSetup2FA, useEnable2FA, useDisable2FA } from '../../../hooks/useAccountData';
import Loader from '../../UI/Loader';

interface TwoFactorSetupProps {
    mockEnabled?: boolean;
    mockLoading?: boolean;
    mockSetupData?: { secret: string; qrCode: string } | null;
    onSetup?: () => Promise<{ success: boolean; data?: { secret: string; qrCode: string }; error?: string }>;
    onEnable?: (token: string, secret: string) => Promise<{ success: boolean; error?: string }>;
    onDisable?: () => Promise<{ success: boolean; error?: string }>;
}

export default function TwoFactorSetup({ 
    mockEnabled, 
    mockLoading, 
    mockSetupData,
    onSetup,
    onEnable,
    onDisable 
}: TwoFactorSetupProps = {}) {
    const { t } = useTranslation();
    
    // TanStack Query
    const { data: statusData, isLoading: loadingStatus } = use2FAStatus();
    const { mutate: setup2FAMutation, isPending: isSettingUp } = useSetup2FA();
    const { mutate: enable2FAMutation, isPending: isVerifying } = useEnable2FA();
    const { mutate: disable2FAMutation, isPending: isDisabling } = useDisable2FA();

    // Local state for transitions and UI feedback
    const [setupData, setSetupData] = useState<{ secret: string; qrCode: string } | null>(mockSetupData ?? null);
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Derived values
    const isActuallyEnabled = statusData?.enabled ?? false;
    const enabled = mockEnabled !== undefined ? mockEnabled : isActuallyEnabled;
    const loading = mockLoading !== undefined ? mockLoading : (loadingStatus || isSettingUp || isDisabling);
    const confirming = isVerifying;

    const handleSetup = async () => {
        setError('');
        
        if (onSetup) {
            try {
                const res = await onSetup();
                if (res.success && res.data) setSetupData(res.data);
                else setError(res.error || 'Failed');
            } catch { setError('Error'); }
            return;
        }

        setup2FAMutation(undefined, {
            onSuccess: (data) => setSetupData(data),
            onError: (err: Error) => setError(err.message)
        });
    };

    const handleEnable = async () => {
        if(!setupData) return;
        setError('');
        
        if (onEnable) {
            try {
                const res = await onEnable(token, setupData.secret);
                if (res.success) {
                    setSetupData(null);
                    setSuccess(t('account.security.2fa_enabled', '2FA Enabled Successfully!'));
                } else setError(res.error || 'Invalid code');
            } catch { setError('Error'); }
            return;
        }

        enable2FAMutation({ token, secret: setupData.secret }, {
            onSuccess: () => {
                setSetupData(null);
                setToken('');
                setSuccess(t('account.security.2fa_enabled', '2FA Enabled Successfully!'));
            },
            onError: (err: Error) => setError(err.message)
        });
    };

    const handleDisable = async () => {
        if(!confirm(t('account.security.2fa_disable_confirm', 'Are you sure you want to disable 2FA?'))) return;
        setError('');
        
        if (onDisable) {
            try {
                const res = await onDisable();
                if (res.success) {
                    setSuccess(t('account.security.2fa_disabled', '2FA Disabled'));
                } else setError(res.error || 'Failed');
            } catch { setError('Error'); }
            return;
        }

        disable2FAMutation(undefined, {
            onSuccess: () => {
                setSuccess(t('account.security.2fa_disabled', '2FA Disabled'));
            },
            onError: (err: Error) => setError(err.message)
        });
    };

    if (loading) return <Loader />;

    return (
        <div className="security-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', padding: '10px', borderRadius: '50%' }}>
                    <Shield size={20} />
                </div>
                <div>
                    <h3 style={{ margin: 0, color: '#fff' }}>{t('account.security.2fa_title', 'Two-Factor Authentication')}</h3>
                    <p style={{ margin: '4px 0 0', color: '#888', fontSize: '0.9rem' }}>
                        {enabled 
                            ? t('account.security.2fa_active', 'Your account is secured with 2FA.') 
                            : t('account.security.2fa_inactive', 'Add an extra layer of security to your account.')}
                    </p>
                </div>
            </div>

            {error && <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            {success && <div style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{success}</div>}

            {!enabled && !setupData && (
                <button 
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
                        transition: 'all 0.2s',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? <Loader minimal /> : t('account.security.setup_2fa', 'Setup 2FA')}
                </button>
            )}

            {!enabled && setupData && (
                <div className="setup-box animate-fade-in" style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px' }}>
                    <h4 style={{ color: '#fff', marginBottom: '1rem' }}>1. {t('account.security.scan_qr', 'Scan QR Code')}</h4>
                    <div style={{ 
                        position: 'relative', 
                        background: '#fff', 
                        padding: '10px', 
                        borderRadius: '12px', 
                        width: 'fit-content', 
                        marginBottom: '1.5rem',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        margin: '0 auto'
                    }}>
                        <img src={setupData.qrCode} alt="2FA QR" style={{ width: '180px', height: '180px', display: 'block' }} />
                        {/* Centered Logo Overlay */}
                        <div style={{
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
                            border: '2px solid #fff'
                        }}>
                            <img 
                                src="/images/ui/logo.webp" 
                                alt="LT" 
                                style={{ width: '32px', height: '32px', objectFit: 'contain' }} 
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                        <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Key size={12} /> {t('account.security.cant_scan', "Can't scan the QR code?")}
                        </p>
                        
                        <div 
                            onClick={() => {
                                navigator.clipboard.writeText(setupData.secret);
                                setSuccess(t('account.security.copied', 'Copiado!'));
                                setTimeout(() => setSuccess(''), 2000);
                            }}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                background: 'rgba(0,0,0,0.3)', 
                                padding: '8px 12px', 
                                borderRadius: '6px', 
                                border: '1px dashed rgba(255,255,255,0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            className="hover:bg-white/5 hover:border-white/40 group"
                        >
                            <code style={{ color: 'var(--accent)', fontSize: '0.9rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                {setupData.secret}
                            </code>
                            <Copy size={12} style={{ color: '#666' }} className="group-hover:text-white transition-colors" />
                        </div>
                    </div>
                    
                    <h4 style={{ color: '#fff', marginBottom: '1rem' }}>2. {t('account.security.enter_code', 'Enter Code')}</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" 
                            maxLength={6}
                            placeholder="000000"
                            value={token}
                            onChange={e => setToken(e.target.value.replace(/[^0-9]/g, ''))}
                            style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #444', background: '#222', color: '#fff', fontSize: '1.1rem', width: '120px', textAlign: 'center', letterSpacing: '2px' }}
                        />
                        <button 
                            onClick={handleEnable}
                            disabled={confirming || token.length !== 6}
                            className="btn-primary"
                            style={{ 
                                background: 'var(--accent)', 
                                color: '#000', 
                                fontWeight: 'bold',
                                padding: '0.8rem 1.5rem',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: (confirming || token.length !== 6) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                opacity: (confirming || token.length !== 6) ? 0.6 : 1
                            }}
                        >
                            {confirming ? <Loader minimal /> : t('account.security.activate', 'Activate')}
                        </button>
                    </div>
                </div>
            )}

            {enabled && (
                <button 
                    onClick={handleDisable}
                    disabled={loading}
                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                >
                    {loading ? <Loader minimal /> : <><Trash2 size={14} /> {t('account.security.disable_2fa', 'Disable 2FA')}</>}
                </button>
            )}
        </div>
    );
}

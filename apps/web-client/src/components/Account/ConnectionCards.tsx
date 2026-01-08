import React from 'react';
import { FaGamepad, FaDiscord, FaTwitch } from 'react-icons/fa';
import { UserIdentity } from '@supabase/supabase-js';
import Loader from '../UI/Loader';
import { useTranslation } from 'react-i18next';

export interface ConnectionCardsProps {
    isLinked: boolean;
    mcUsername: string | undefined;
    statsDataUsername: string | undefined;
    linkCode: string | null;
    linkLoading: boolean;
    onGenerateCode: () => void;
    discordIdentity?: UserIdentity;
    twitchIdentity?: UserIdentity;
    onLinkProvider: (provider: string) => void;
    onUnlinkProvider: (identity: UserIdentity) => void;
    onUnlinkMinecraft: () => void;
    manualCode?: string;
    onManualCodeChange?: (val: string) => void;
    onVerifyCode?: () => void;
    isVerifying?: boolean;
    discordManualCode?: string;
    onDiscordManualCodeChange?: (val: string) => void;
    onVerifyDiscordCode?: () => void;
    isVerifyingDiscord?: boolean;
}

const ConnectionCards: React.FC<ConnectionCardsProps> = ({
    isLinked,
    mcUsername,
    statsDataUsername,
    linkCode,
    linkLoading,
    onGenerateCode,
    discordIdentity,
    twitchIdentity,
    onLinkProvider,
    onUnlinkProvider,
    onUnlinkMinecraft,
    manualCode,
    onManualCodeChange,
    onVerifyCode,
    isVerifying,
    discordManualCode,
    onDiscordManualCodeChange,
    onVerifyDiscordCode,
    isVerifyingDiscord
}) => {
    const { t } = useTranslation();

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Minecraft Card */}
            <div className="connection-card" style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '20px', 
                padding: '1.8rem', 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: '220px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    {/* Logo Left */}
                    <div style={{ background: '#44bd32', padding: '12px', borderRadius: '50%', color: '#fff', fontSize: '1.2rem', display: 'flex', flexShrink: 0 }}>
                        <FaGamepad />
                    </div>
                    
                    {/* Text Middle */}
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Minecraft</h3>
                        <p style={{ margin: '4px 0 0', color: '#888', fontSize: '0.85rem' }}>{isLinked ? t('account.connections.linked') : t('account.connections.not_linked')}</p>
                    </div>

                    {/* Avatar Right */}
                    {isLinked && (
                        <div style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                            <img 
                                src={`https://mc-heads.net/avatar/${statsDataUsername || mcUsername}`} 
                                alt={mcUsername} 
                                style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'contain', background: 'rgba(0,0,0,0.2)' }} 
                            />
                        </div>
                    )}
                </div>
                
                <div style={{ marginTop: 'auto' }}>
                    {isLinked ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <div className="animate-pop" style={{ 
                                background: 'linear-gradient(45deg, rgba(76, 175, 80, 0.2), rgba(68, 189, 50, 0.3))', 
                                border: '1px solid rgba(76, 175, 80, 0.4)',
                                color: '#4CAF50', 
                                padding: '1rem', 
                                borderRadius: '12px', 
                                textAlign: 'center', 
                                fontWeight: '700',
                                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.1)'
                            }}>
                                <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '4px' }}>✨ {t('account.connections.success_link')} ✨</span>
                                {mcUsername}
                            </div>
                            <button 
                                onClick={onUnlinkMinecraft}
                                style={{ width: '100%', background: 'rgba(231, 76, 60, 0.15)', border: '1px solid rgba(231, 76, 60, 0.3)', color: '#ff6b6b', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(231, 76, 60, 0.25)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(231, 76, 60, 0.15)'}
                            >
                                {t('account.connections.unlink')}
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <p style={{ color: '#aaa', fontSize: '0.9rem', margin: 0, lineHeight: '1.4' }}>
                                {t('account.connections.link_desc')}
                            </p>
                            
                            {!linkCode ? (
                                <>
                                    <button 
                                        onClick={onGenerateCode} 
                                        disabled={linkLoading}
                                        style={{ width: '100%', background: 'var(--accent)', border: 'none', padding: '12px', borderRadius: '8px', color: '#1a1a1a', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', opacity: linkLoading ? 0.7 : 1, boxShadow: '0 4px 15px rgba(var(--accent-rgb), 0.2)' }}
                                    >
                                        {linkLoading ? <Loader minimal /> : t('account.connections.get_code')}
                                    </button>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '5px 0' }}>
                                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                                        <span style={{ fontSize: '0.7rem', color: '#555', fontWeight: 'bold' }}>O USA UN CÓDIGO</span>
                                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                                    </div>

                                    <div className="link-input-group">
                                        <input 
                                            type="text" 
                                            placeholder="CÓDIGO (Ej: 123456)"
                                            value={manualCode}
                                            onChange={(e) => onManualCodeChange?.(e.target.value)}
                                            className="link-input"
                                        />
                                        <button 
                                            onClick={onVerifyCode}
                                            disabled={isVerifying || !manualCode}
                                            className="btn-verify"
                                        >
                                            {isVerifying ? <Loader minimal /> : 'Verificar'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="link-code-box animate-pop" style={{ background: '#222', border: '1px dashed var(--accent)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <p style={{ color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('account.connections.type_in_server')}</p>
                                    <code style={{ display: 'block', background: '#000', color: 'var(--accent)', padding: '0.6rem', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.8rem' }}>/link {linkCode}</code>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Loader text="" />
                                        <span style={{ fontSize: '0.75rem', color: '#888' }}>{t('account.connections.waiting')}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Discord Card */}
            <div className="connection-card discord-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    {/* Logo Left */}
                    <div style={{ background: '#5865F2', padding: '12px', borderRadius: '50%', color: '#fff', fontSize: '1.2rem', display: 'flex', flexShrink: 0 }}>
                        <FaDiscord />
                    </div>

                    {/* Text Middle */}
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Discord</h3>
                        <p style={{ margin: '4px 0 0', color: '#888', fontSize: '0.85rem' }}>
                            {discordIdentity 
                                ? (discordIdentity.identity_data?.full_name || discordIdentity.identity_data?.name || discordIdentity.identity_data?.user_name || t('account.connections.connected')) 
                                : t('account.connections.disconnected')}
                        </p>
                    </div>

                    {/* Avatar Right */}
                    {discordIdentity?.identity_data?.avatar_url && (
                        <div style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                            <img 
                                src={discordIdentity.identity_data.avatar_url} 
                                alt="Discord Avatar" 
                                style={{ width: '100%', height: '100%', borderRadius: '50%' }} 
                            />
                        </div>
                    )}
                </div>
                
                <div style={{ marginTop: 'auto' }}>
                    {discordIdentity ? (
                        <button 
                            onClick={() => onUnlinkProvider(discordIdentity)}
                            style={{ width: '100%', background: 'rgba(231, 76, 60, 0.15)', border: '1px solid rgba(231, 76, 60, 0.3)', color: '#ff6b6b', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(231, 76, 60, 0.25)'}
                            onMouseOut={e => e.currentTarget.style.background = 'rgba(231, 76, 60, 0.15)'}
                        >
                            {t('account.connections.unlink')}
                        </button>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button 
                                onClick={() => onLinkProvider('discord')}
                                style={{ width: '100%', background: '#5865F2', border: 'none', color: '#fff', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(88, 101, 242, 0.3)' }}
                            >
                                {t('account.connections.connect_discord')}
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '5px 0' }}>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                                <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 'bold' }}>{t('account.connections.or_use_link')}</span>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                            </div>

                            <div className="link-input-group">
                                <input 
                                    type="text" 
                                    placeholder={t('account.connections.discord_code_placeholder')}
                                    value={discordManualCode}
                                    onChange={(e) => onDiscordManualCodeChange?.(e.target.value)}
                                    className="link-input"
                                    style={{ border: '1px solid rgba(88, 101, 242, 0.3)' }}
                                />
                                <button 
                                    onClick={onVerifyDiscordCode}
                                    disabled={isVerifyingDiscord || !discordManualCode}
                                    className="btn-verify discord"
                                >
                                    {isVerifyingDiscord ? <Loader minimal /> : t('common.verify', 'Verificar')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Twitch Card */}
            <div className="connection-card" style={{ 
                background: 'rgba(145, 70, 255, 0.05)', 
                border: '1px solid rgba(145, 70, 255, 0.15)', 
                borderRadius: '20px', 
                padding: '1.8rem', 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: '220px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(145, 70, 255, 0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    {/* Logo Left */}
                    <div style={{ background: '#9146FF', padding: '12px', borderRadius: '50%', color: '#fff', fontSize: '1.2rem', display: 'flex', flexShrink: 0 }}>
                        <FaTwitch />
                    </div>

                    {/* Text Middle */}
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Twitch</h3>
                        <p style={{ margin: '4px 0 0', color: '#888', fontSize: '0.85rem' }}>
                            {twitchIdentity 
                                ? (twitchIdentity.identity_data?.full_name || twitchIdentity.identity_data?.name || twitchIdentity.identity_data?.login || t('account.connections.connected')) 
                                : t('account.connections.disconnected')}
                        </p>
                    </div>

                    {/* Avatar Right */}
                    {twitchIdentity?.identity_data?.avatar_url && (
                        <div style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                            <img 
                                src={twitchIdentity.identity_data.avatar_url} 
                                alt="Twitch Avatar" 
                                style={{ width: '100%', height: '100%', borderRadius: '50%' }} 
                            />
                        </div>
                    )}
                </div>
                
                <div style={{ marginTop: 'auto' }}>
                    {twitchIdentity ? (
                        <button 
                            onClick={() => onUnlinkProvider(twitchIdentity)}
                            style={{ width: '100%', background: 'rgba(231, 76, 60, 0.15)', border: '1px solid rgba(231, 76, 60, 0.3)', color: '#ff6b6b', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(231, 76, 60, 0.25)'}
                            onMouseOut={e => e.currentTarget.style.background = 'rgba(231, 76, 60, 0.15)'}
                        >
                            {t('account.connections.unlink')}
                        </button>
                    ) : (
                        <button 
                            onClick={() => onLinkProvider('twitch')}
                            style={{ width: '100%', background: '#9146FF', border: 'none', color: '#fff', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(145, 70, 255, 0.3)' }}
                        >
                            {t('account.connections.connect_twitch')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConnectionCards;

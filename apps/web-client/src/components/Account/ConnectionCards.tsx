import React from 'react';
import { Gamepad2 } from 'lucide-react';
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
    isDiscordLinked?: boolean;
    discordMetadataName?: string;
    discordMetadataAvatar?: string;
    twitchIdentity?: UserIdentity;
    onLinkProvider: (provider: string) => void;
    onUnlinkProvider: (identity: UserIdentity) => void;
    onUnlinkMinecraft: () => void;
    onUnlinkDiscord: () => void;
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
    isDiscordLinked,
    discordMetadataName,
    discordMetadataAvatar,
    twitchIdentity,
    onLinkProvider,
    onUnlinkProvider,
    onUnlinkMinecraft,
    onUnlinkDiscord,
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Minecraft Card */}
            <div className="group relative flex flex-col bg-white/5 border border-green-500/20 rounded-4xl p-8 backdrop-blur-3xl overflow-hidden transition-all hover:bg-white/10 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] hover:-translate-y-1">
                <div className="flex items-center gap-5 mb-8">
                    <div className="relative">
                        {isLinked ? (
                            <img 
                                src={`https://mc-heads.net/avatar/${statsDataUsername || mcUsername}`} 
                                alt={mcUsername}
                                className="w-16 h-16 rounded-2xl object-contain bg-black/40 border-2 border-green-500/30 shadow-2xl"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-400 text-3xl">
                                <Gamepad2 size={32} />
                            </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-[#1a1a1a] p-1.5 rounded-xl border border-white/10 shadow-xl">
                            <img 
                                src="/images/ui/minecraft_logo_icon_168974.png" 
                                alt="MC" 
                                className="w-5 h-5 object-contain" 
                            />
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-white">Minecraft</h3>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                            {isLinked ? mcUsername : t('account.connections.not_linked')}
                        </p>
                    </div>
                </div>

                <div className="mt-auto space-y-4">
                    {isLinked ? (
                        <button 
                            onClick={onUnlinkMinecraft}
                            className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-400 font-black uppercase tracking-widest rounded-2xl hover:bg-red-500/20 active:scale-95 transition-all text-xs"
                        >
                            {t('account.connections.unlink')}
                        </button>
                    ) : (
                        <div className="space-y-4">
                            {!linkCode ? (
                                <>
                                    <button 
                                        onClick={onGenerateCode} 
                                        disabled={linkLoading}
                                        className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-green-400 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5 disabled:opacity-50 text-xs"
                                    >
                                        {linkLoading ? <Loader minimal /> : t('account.connections.get_code')}
                                    </button>

                                    <div className="relative py-2">
                                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                                        <div className="relative flex justify-center text-[10px]"><span className="bg-[#0a0a0a] px-3 font-black text-gray-600 uppercase tracking-widest">O USA UN CÓDIGO</span></div>
                                    </div>

                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="CÓDIGO"
                                            value={manualCode}
                                            onChange={(e) => onManualCodeChange?.(e.target.value)}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-colors"
                                        />
                                        <button 
                                            onClick={onVerifyCode}
                                            disabled={isVerifying || !manualCode}
                                            className="px-6 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest rounded-2xl transition-all disabled:opacity-30 text-[10px]"
                                        >
                                            {isVerifying ? <Loader minimal /> : '✓'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-white/5 border border-dashed border-green-500/40 rounded-3xl p-6 text-center animate-fade-in">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{t('account.connections.type_in_server')}</p>
                                    <code className="block bg-black/60 text-green-400 py-3 rounded-xl text-lg font-black tracking-widest border border-green-500/20 mb-4 shadow-2xl shadow-green-500/10">
                                        /link {linkCode}
                                    </code>
                                    <div className="flex items-center justify-center gap-3">
                                        <Loader minimal />
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('account.connections.waiting')}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Discord Card */}
            <div className="group relative flex flex-col bg-white/5 border border-[#5865F2]/20 rounded-4xl p-8 backdrop-blur-3xl overflow-hidden transition-all hover:bg-white/10 hover:border-[#5865F2]/50 hover:shadow-[0_0_30px_rgba(88,101,242,0.1)] hover:-translate-y-1">
                <div className="flex items-center gap-5 mb-8">
                    <div className="relative">
                        {isDiscordLinked && (discordIdentity?.identity_data?.avatar_url || discordIdentity?.identity_data?.image_url || discordIdentity?.identity_data?.picture || discordMetadataAvatar) ? (
                            <img 
                                src={discordIdentity?.identity_data?.avatar_url || discordIdentity?.identity_data?.image_url || discordIdentity?.identity_data?.picture || discordMetadataAvatar} 
                                alt="Discord"
                                className="w-16 h-16 rounded-full object-cover border-2 border-[#5865F2]/30 shadow-2xl"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-[#5865F2]/20 rounded-full flex items-center justify-center text-[#5865F2] text-3xl">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                                </svg>
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-[#5865F2] p-1.5 rounded-full border-2 border-[#1a1a1a] text-[10px] text-white flex items-center justify-center shadow-lg">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                            </svg>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-white">Discord</h3>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest truncate max-w-[150px]">
                            {isDiscordLinked
                                ? (discordIdentity?.identity_data?.full_name || discordIdentity?.identity_data?.name || discordIdentity?.identity_data?.user_name || discordMetadataName || t('account.connections.connected')) 
                                : t('account.connections.disconnected')}
                        </p>
                    </div>
                </div>
                
                <div className="mt-auto space-y-4">
                    {isDiscordLinked ? (
                        <button 
                            onClick={() => discordIdentity ? onUnlinkProvider(discordIdentity) : onUnlinkDiscord()}
                            className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-400 font-black uppercase tracking-widest rounded-2xl hover:bg-red-500/20 active:scale-95 transition-all text-xs"
                        >
                            {t('account.connections.unlink')}
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <button 
                                onClick={() => onLinkProvider('discord')}
                                className="w-full py-4 bg-[#5865F2] text-white font-black uppercase tracking-widest rounded-2xl hover:bg-[#4752c4] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#5865f2]/10 text-xs"
                            >
                                {t('account.connections.connect_discord')}
                            </button>

                            <div className="relative py-4 flex items-center justify-center">
                                <span className="relative z-10 bg-[#0a0a0a]/50 px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest backdrop-blur-sm rounded-full">
                                    {t('account.connections.or_bot_code', 'O CÓDIGO DE BOT')}
                                </span>
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/5"></div>
                                </div>
                            </div>

                            <div className="relative group/input">
                                <input 
                                    type="text" 
                                    placeholder="CÓDIGO (EJ: AB12CD)"
                                    value={discordManualCode}
                                    onChange={(e) => onDiscordManualCodeChange?.(e.target.value.toUpperCase())}
                                    className="w-full bg-[#111] border border-white/10 rounded-xl pl-4 pr-14 py-3.5 text-sm font-bold text-white placeholder:text-gray-700 outline-none focus:border-[#5865F2]/50 focus:bg-[#161616] focus:shadow-[0_0_20px_rgba(88,101,242,0.1)] transition-all uppercase tracking-widest"
                                />
                                <button 
                                    onClick={onVerifyDiscordCode}
                                    disabled={isVerifyingDiscord || !discordManualCode}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752c4] text-white rounded-lg transition-all disabled:opacity-0 disabled:scale-75 shadow-lg shadow-[#5865F2]/20 hover:shadow-[#5865F2]/40 active:scale-95"
                                >
                                    {isVerifyingDiscord ? <Loader minimal /> : <span className="font-bold text-xs">OK</span>}
                                </button>
                            </div>
                        </div>

                    )}
                </div>
            </div>

            {/* Twitch Card */}
            <div className="group relative flex flex-col bg-white/5 border border-[#9146FF]/20 rounded-4xl p-8 backdrop-blur-3xl overflow-hidden transition-all hover:bg-white/10 hover:border-[#9146FF]/50 hover:shadow-[0_0_30px_rgba(145,70,255,0.1)] hover:-translate-y-1">
                <div className="flex items-center gap-5 mb-8">
                    <div className="relative">
                        {twitchIdentity?.identity_data?.avatar_url ? (
                            <img 
                                src={twitchIdentity.identity_data.avatar_url} 
                                alt="Twitch"
                                className="w-16 h-16 rounded-full object-cover border-2 border-[#9146FF]/30 shadow-2xl"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-[#9146FF]/20 rounded-full flex items-center justify-center text-[#9146FF] text-3xl">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                                </svg>
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-[#9146FF] p-1.5 rounded-full border-2 border-[#1a1a1a] text-[10px] text-white flex items-center justify-center shadow-lg">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                            </svg>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-white">Twitch</h3>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest truncate max-w-[150px]">
                            {twitchIdentity 
                                ? (twitchIdentity.identity_data?.full_name || twitchIdentity.identity_data?.name || twitchIdentity.identity_data?.login || t('account.connections.connected')) 
                                : t('account.connections.disconnected')}
                        </p>
                    </div>
                </div>
                
                <div className="mt-auto">
                    {twitchIdentity ? (
                        <button 
                            onClick={() => onUnlinkProvider(twitchIdentity)}
                            className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-400 font-black uppercase tracking-widest rounded-2xl hover:bg-red-500/20 active:scale-95 transition-all text-xs"
                        >
                            {t('account.connections.unlink')}
                        </button>
                    ) : (
                        <button 
                            onClick={() => onLinkProvider('twitch')}
                            className="w-full py-4 bg-[#9146FF] text-white font-black uppercase tracking-widest rounded-2xl hover:bg-[#772ce8] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#9146ff]/10 text-xs"
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

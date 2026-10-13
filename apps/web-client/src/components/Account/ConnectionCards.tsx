import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, ChevronDown, ChevronUp, Copy, ExternalLink, Check } from 'lucide-react';
import { UserIdentity } from '@supabase/supabase-js';
import Loader from '../UI/Loader';
import { useTranslation } from 'react-i18next';
import {
  openMicrosoftOAuthPopup,
  exchangeMicrosoftAuthCode,
  formatUuidWithHyphens,
  MicrosoftDeviceCode,
} from '../../services/microsoftAuthWeb';

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
  onLinkMicrosoft?: (data: { uuid: string; nick: string }) => void;
}

const CONSTANTS = {
  UNLINK_KEY: 'account.connections.unlink',
  CONNECTED_KEY: 'account.connections.connected',
  DISCONNECTED_KEY: 'account.connections.disconnected',
  UNLINK_BUTTON_CLASS:
    'w-full py-4 bg-red-500/10 border border-red-500/20 text-red-400 font-black uppercase tracking-widest rounded-2xl hover:bg-red-500/20 active:scale-95 transition-colors text-xs',
  CARD_BASE_CLASS:
    'group relative flex flex-col bg-white/5 rounded-4xl p-8 backdrop-blur-3xl overflow-hidden transition-colors hover:bg-white/10 hover:-translate-y-1',
} as const;

function resolveDiscordAvatar(identity?: UserIdentity, metaAvatar?: string): string | undefined {
  const data = identity?.identity_data;
  return data?.avatar_url || data?.image_url || data?.picture || metaAvatar;
}

function resolveDiscordName(identity?: UserIdentity, metaName?: string, fallback = ''): string {
  const data = identity?.identity_data;
  return data?.full_name || data?.name || data?.user_name || metaName || fallback;
}

function resolveTwitchName(identity?: UserIdentity, fallback = ''): string {
  const data = identity?.identity_data;
  return data?.full_name || data?.name || data?.login || fallback;
}

interface MicrosoftDeviceCodeDialogProps {
  deviceCode: MicrosoftDeviceCode;
  copiedCode: boolean;
  statusMsg: string;
  onCopy: () => void;
}

const MicrosoftDeviceCodeDialog: React.FC<Readonly<MicrosoftDeviceCodeDialogProps>> = ({
  deviceCode,
  copiedCode,
  statusMsg,
  onCopy,
}) => (
  <div className="animate-fade-in space-y-3 rounded-3xl border border-emerald-500/40 bg-black/60 p-5 text-center">
    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-300">
      Introduce este código en Microsoft:
    </p>
    <code className="block rounded-xl border border-emerald-500/30 bg-emerald-950/60 py-2.5 text-xl font-black tracking-widest text-emerald-300">
      {deviceCode.user_code}
    </code>
    <button
      aria-label="Action"
      type="button"
      onClick={onCopy}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/20 py-2.5 text-xs font-extrabold text-emerald-300 transition-colors hover:bg-emerald-500/30"
    >
      {copiedCode ? <Check size={14} /> : <Copy size={14} />}
      <span>{copiedCode ? '¡Código copiado!' : 'Copiar e ir a Microsoft'}</span>
      <ExternalLink size={14} />
    </button>
    <div className="flex items-center justify-center gap-2 pt-1 text-[10.5px] text-gray-400">
      <Loader minimal />
      <span>{statusMsg || 'Esperando autorización...'}</span>
    </div>
  </div>
);

interface NoPremiumSectionProps {
  linkCode: string | null;
  linkLoading: boolean;
  manualCode?: string;
  isVerifying?: boolean;
  onGenerateCode: () => void;
  onManualCodeChange?: (val: string) => void;
  onVerifyCode?: () => void;
}

const NoPremiumSection: React.FC<Readonly<NoPremiumSectionProps>> = ({
  linkCode,
  linkLoading,
  manualCode,
  isVerifying,
  onGenerateCode,
  onManualCodeChange,
  onVerifyCode,
}) => {
  const { t } = useTranslation();

  if (linkCode) {
    return (
      <div className="animate-fade-in rounded-3xl border border-dashed border-green-500/40 bg-white/5 p-5 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
          Escribe esto en el chat del servidor:
        </p>
        <code className="mb-3 block rounded-xl border border-green-500/20 bg-black/60 py-2.5 text-base font-black tracking-widest text-green-400 shadow-2xl">
          /link {linkCode}
        </code>
        <div className="flex items-center justify-center gap-2">
          <Loader minimal />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            {t('account.connections.waiting')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mt-3 space-y-4">
      <button
        aria-label="Action"
        type="button"
        onClick={onGenerateCode}
        disabled={linkLoading}
        className="w-full rounded-2xl bg-white/10 py-3 text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-white/20 disabled:opacity-50"
      >
        {linkLoading ? <Loader minimal /> : 'Generar código en servidor (/link)'}
      </button>

      <div className="flex gap-2">
        <input
          aria-label="Input field"
          type="text"
          placeholder="CÓDIGO 6 DÍGITOS"
          value={manualCode}
          onChange={(e) => onManualCodeChange?.(e.target.value)}
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition-colors placeholder:text-gray-600 focus:border-white/20 focus:outline-none"
        />
        <button
          aria-label="Action"
          type="button"
          onClick={onVerifyCode}
          disabled={isVerifying || !manualCode}
          className="rounded-2xl bg-white/10 px-5 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-white/20 disabled:opacity-30"
        >
          {isVerifying ? <Loader minimal /> : '✓'}
        </button>
      </div>
    </div>
  );
};

interface MinecraftCardProps {
  isLinked: boolean;
  mcUsername?: string;
  statsDataUsername?: string;
  linkCode: string | null;
  linkLoading: boolean;
  onGenerateCode: () => void;
  onUnlinkMinecraft: () => void;
  manualCode?: string;
  onManualCodeChange?: (val: string) => void;
  onVerifyCode?: () => void;
  isVerifying?: boolean;
  onLinkMicrosoft?: (data: { uuid: string; nick: string }) => void;
}

const MinecraftCard: React.FC<Readonly<MinecraftCardProps>> = ({
  isLinked,
  mcUsername,
  statsDataUsername,
  linkCode,
  linkLoading,
  onGenerateCode,
  onUnlinkMinecraft,
  manualCode,
  onManualCodeChange,
  onVerifyCode,
  isVerifying,
  onLinkMicrosoft,
}) => {
  const { t } = useTranslation();
  const [msAuthLoading, setMsAuthLoading] = useState(false);
  const [msDeviceCode] = useState<MicrosoftDeviceCode | null>(null);
  const [msStatusMsg, setMsStatusMsg] = useState('');
  const [msErrorMsg, setMsErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showNoPremiumSection, setShowNoPremiumSection] = useState(false);
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);

  const onLinkMicrosoftRef = useRef(onLinkMicrosoft);
  useEffect(() => {
    onLinkMicrosoftRef.current = onLinkMicrosoft;
  }, [onLinkMicrosoft]);

  useEffect(() => {
    if (!popupWindow) return;

    const processAuthCode = async (code: string) => {
      setMsStatusMsg('Autenticando con Microsoft y Xbox Live...');
      try {
        const profile = await exchangeMicrosoftAuthCode(code);
        const formattedUuid = formatUuidWithHyphens(profile.id);
        onLinkMicrosoftRef.current?.({ uuid: formattedUuid, nick: profile.name });
      } catch (err: unknown) {
        console.error('Microsoft popup auth error:', err);
        const msg = err instanceof Error ? err.message : String(err);
        setMsErrorMsg(msg || 'Error al autenticar con Microsoft');
      } finally {
        setMsAuthLoading(false);
        setPopupWindow(null);
      }
    };

    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'MS_AUTH_CODE' && event.data?.code) {
        void processAuthCode(event.data.code);
      }
    };

    window.addEventListener('message', messageHandler);

    const timer = setInterval(() => {
      if (popupWindow.closed) {
        setMsAuthLoading(false);
        setPopupWindow(null);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('message', messageHandler);
    };
  }, [popupWindow]);

  const handleStartMicrosoftLink = () => {
    setMsAuthLoading(true);
    setMsErrorMsg(null);
    setMsStatusMsg('Abriendo ventana de inicio de sesión de Microsoft...');
    setPopupWindow(openMicrosoftOAuthPopup());
  };

  const handleCopyMsCode = () => {
    if (!msDeviceCode) return;
    void navigator.clipboard.writeText(msDeviceCode.user_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    window.open(
      msDeviceCode.verification_uri || 'https://microsoft.com/link',
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <div
      className={`${CONSTANTS.CARD_BASE_CLASS} border border-green-500/20 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]`}
    >
      <div className="mb-8 flex items-center gap-5">
        <div className="relative">
          {isLinked ? (
            <img
              src={`https://mc-heads.net/avatar/${statsDataUsername ?? mcUsername}`}
              alt={mcUsername}
              className="size-16 rounded-2xl border-2 border-green-500/30 bg-black/40 object-contain shadow-2xl"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-2xl bg-green-500/20 text-3xl text-green-400">
              <Gamepad2 size={32} />
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 rounded-xl border border-white/10 bg-[#1a1a1a] p-1.5 shadow-xl">
            <img
              src="/images/ui/minecraft_logo_icon_168974.png"
              alt="MC"
              className="size-5 object-contain"
            />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-black uppercase tracking-tighter text-white">Minecraft</h3>
          <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
            {isLinked ? mcUsername : t('account.connections.not_linked')}
          </p>
        </div>
      </div>

      <div className="mt-auto space-y-4">
        {isLinked ? (
          <button
            type="button"
            onClick={onUnlinkMinecraft}
            className={CONSTANTS.UNLINK_BUTTON_CLASS}
          >
            {t(CONSTANTS.UNLINK_KEY)}
          </button>
        ) : (
          <div className="space-y-4">
            {!msDeviceCode ? (
              <button
                type="button"
                onClick={handleStartMicrosoftLink}
                disabled={msAuthLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-xs font-black uppercase tracking-widest text-black shadow-xl shadow-emerald-500/20 transition-colors hover:scale-[1.02] hover:bg-emerald-400 active:scale-95 disabled:opacity-50"
              >
                {msAuthLoading ? (
                  <Loader minimal />
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 23 23" fill="currentColor">
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                    <span>Vincular Premium (Microsoft)</span>
                  </>
                )}
              </button>
            ) : (
              <MicrosoftDeviceCodeDialog
                deviceCode={msDeviceCode}
                copiedCode={copiedCode}
                statusMsg={msStatusMsg}
                onCopy={handleCopyMsCode}
              />
            )}

            {msErrorMsg && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs font-semibold text-red-400">
                ⚠️ {msErrorMsg}
              </div>
            )}

            <div className="border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => setShowNoPremiumSection(!showNoPremiumSection)}
                aria-expanded={showNoPremiumSection}
                aria-label="Alternar sección de cuenta No-Premium"
                className="flex w-full items-center justify-between p-1 text-[11px] font-bold text-gray-400 transition-colors hover:text-white"
              >
                <span>¿Usas cuenta No-Premium / Offline?</span>
                {showNoPremiumSection ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showNoPremiumSection && (
                <NoPremiumSection
                  linkCode={linkCode}
                  linkLoading={linkLoading}
                  manualCode={manualCode}
                  isVerifying={isVerifying}
                  onGenerateCode={onGenerateCode}
                  onManualCodeChange={onManualCodeChange}
                  onVerifyCode={onVerifyCode}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface DiscordCardProps {
  isDiscordLinked?: boolean;
  discordIdentity?: UserIdentity;
  discordMetadataName?: string;
  discordMetadataAvatar?: string;
  discordManualCode?: string;
  isVerifyingDiscord?: boolean;
  onLinkProvider: (provider: string) => void;
  onUnlinkProvider: (identity: UserIdentity) => void;
  onUnlinkDiscord: () => void;
  onDiscordManualCodeChange?: (val: string) => void;
  onVerifyDiscordCode?: () => void;
}

const DiscordCard: React.FC<Readonly<DiscordCardProps>> = ({
  isDiscordLinked,
  discordIdentity,
  discordMetadataName,
  discordMetadataAvatar,
  discordManualCode,
  isVerifyingDiscord,
  onLinkProvider,
  onUnlinkProvider,
  onUnlinkDiscord,
  onDiscordManualCodeChange,
  onVerifyDiscordCode,
}) => {
  const { t } = useTranslation();
  const avatar = resolveDiscordAvatar(discordIdentity, discordMetadataAvatar);
  const accountName = resolveDiscordName(
    discordIdentity,
    discordMetadataName,
    t(CONSTANTS.CONNECTED_KEY),
  );

  const handleUnlink = () => {
    if (discordIdentity) {
      onUnlinkProvider(discordIdentity);
    } else {
      onUnlinkDiscord();
    }
  };

  return (
    <div
      className={`${CONSTANTS.CARD_BASE_CLASS} border border-[#5865F2]/20 hover:border-[#5865F2]/50 hover:shadow-[0_0_30px_rgba(88,101,242,0.1)]`}
    >
      <div className="mb-8 flex items-center gap-5">
        <div className="relative">
          {isDiscordLinked && avatar ? (
            <img
              src={avatar}
              alt="Discord"
              className="size-16 rounded-full border-2 border-[#5865F2]/30 object-cover shadow-2xl"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-[#5865F2]/20 text-3xl text-[#5865F2]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-8">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full border-2 border-[#1a1a1a] bg-[#5865F2] p-1.5 text-[10px] text-white shadow-lg">
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-black uppercase tracking-tighter text-white">Discord</h3>
          <p className="max-w-37.5 truncate text-sm font-bold uppercase tracking-widest text-gray-500">
            {isDiscordLinked ? accountName : t(CONSTANTS.DISCONNECTED_KEY)}
          </p>
        </div>
      </div>

      <div className="mt-auto space-y-4">
        {isDiscordLinked ? (
          <button type="button" onClick={handleUnlink} className={CONSTANTS.UNLINK_BUTTON_CLASS}>
            {t(CONSTANTS.UNLINK_KEY)}
          </button>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => onLinkProvider('discord')}
              className="w-full rounded-2xl bg-[#5865F2] py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-[#5865f2]/10 transition-colors hover:scale-[1.02] hover:bg-[#4752c4] active:scale-95"
            >
              {t('account.connections.connect_discord')}
            </button>

            <div className="relative flex items-center justify-center py-4">
              <span className="relative z-10 rounded-full bg-[#0a0a0a]/50 px-4 text-[10px] font-black uppercase tracking-widest text-gray-500 backdrop-blur-sm">
                {t('account.connections.or_bot_code', 'O CÓDIGO DE BOT')}
              </span>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
            </div>

            <div className="group/input relative">
              <input
                aria-label="Input field"
                type="text"
                placeholder="CÓDIGO (EJ: AB12CD)"
                value={discordManualCode}
                onChange={(e) => onDiscordManualCodeChange?.(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-white/10 bg-[#111] py-3.5 pl-4 pr-14 text-sm font-bold uppercase tracking-widest text-white outline-none transition-colors placeholder:text-gray-700 focus:border-[#5865F2]/50 focus:bg-[#161616] focus:shadow-[0_0_20px_rgba(88,101,242,0.1)]"
              />
              <button
                type="button"
                onClick={onVerifyDiscordCode}
                disabled={isVerifyingDiscord || !discordManualCode}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[#5865F2] px-3 py-1.5 text-white shadow-lg shadow-[#5865F2]/20 transition-colors hover:bg-[#4752c4] hover:shadow-[#5865F2]/40 active:scale-95 disabled:scale-75 disabled:opacity-0"
              >
                {isVerifyingDiscord ? (
                  <Loader minimal />
                ) : (
                  <span className="text-xs font-bold">OK</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface TwitchCardProps {
  twitchIdentity?: UserIdentity;
  onLinkProvider: (provider: string) => void;
  onUnlinkProvider: (identity: UserIdentity) => void;
}

const TwitchCard: React.FC<Readonly<TwitchCardProps>> = ({
  twitchIdentity,
  onLinkProvider,
  onUnlinkProvider,
}) => {
  const { t } = useTranslation();
  const avatar = twitchIdentity?.identity_data?.avatar_url;
  const accountName = resolveTwitchName(twitchIdentity, t(CONSTANTS.CONNECTED_KEY));

  return (
    <div
      className={`${CONSTANTS.CARD_BASE_CLASS} border border-[#9146FF]/20 hover:border-[#9146FF]/50 hover:shadow-[0_0_30px_rgba(145,70,255,0.1)]`}
    >
      <div className="mb-8 flex items-center gap-5">
        <div className="relative">
          {avatar ? (
            <img
              src={avatar}
              alt="Twitch"
              className="size-16 rounded-full border-2 border-[#9146FF]/30 object-cover shadow-2xl"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-[#9146FF]/20 text-3xl text-[#9146FF]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-8">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
              </svg>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full border-2 border-[#1a1a1a] bg-[#9146FF] p-1.5 text-[10px] text-white shadow-lg">
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
            </svg>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-black uppercase tracking-tighter text-white">Twitch</h3>
          <p className="max-w-37.5 truncate text-sm font-bold uppercase tracking-widest text-gray-500">
            {twitchIdentity ? accountName : t(CONSTANTS.DISCONNECTED_KEY)}
          </p>
        </div>
      </div>

      <div className="mt-auto">
        {twitchIdentity ? (
          <button
            type="button"
            onClick={() => onUnlinkProvider(twitchIdentity)}
            className={CONSTANTS.UNLINK_BUTTON_CLASS}
          >
            {t(CONSTANTS.UNLINK_KEY)}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onLinkProvider('twitch')}
            className="w-full rounded-2xl bg-[#9146FF] py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-[#9146ff]/10 transition-colors hover:scale-[1.02] hover:bg-[#772ce8] active:scale-95"
          >
            {t('account.connections.connect_twitch')}
          </button>
        )}
      </div>
    </div>
  );
};

const ConnectionCards: React.FC<Readonly<ConnectionCardsProps>> = ({
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
  isVerifyingDiscord,
  onLinkMicrosoft,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <MinecraftCard
        isLinked={isLinked}
        mcUsername={mcUsername}
        statsDataUsername={statsDataUsername}
        linkCode={linkCode}
        linkLoading={linkLoading}
        onGenerateCode={onGenerateCode}
        onUnlinkMinecraft={onUnlinkMinecraft}
        manualCode={manualCode}
        onManualCodeChange={onManualCodeChange}
        onVerifyCode={onVerifyCode}
        isVerifying={isVerifying}
        onLinkMicrosoft={onLinkMicrosoft}
      />

      <DiscordCard
        isDiscordLinked={isDiscordLinked}
        discordIdentity={discordIdentity}
        discordMetadataName={discordMetadataName}
        discordMetadataAvatar={discordMetadataAvatar}
        discordManualCode={discordManualCode}
        isVerifyingDiscord={isVerifyingDiscord}
        onLinkProvider={onLinkProvider}
        onUnlinkProvider={onUnlinkProvider}
        onUnlinkDiscord={onUnlinkDiscord}
        onDiscordManualCodeChange={onDiscordManualCodeChange}
        onVerifyDiscordCode={onVerifyDiscordCode}
      />

      <TwitchCard
        twitchIdentity={twitchIdentity}
        onLinkProvider={onLinkProvider}
        onUnlinkProvider={onUnlinkProvider}
      />
    </div>
  );
};

export default ConnectionCards;

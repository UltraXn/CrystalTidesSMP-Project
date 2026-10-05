import { useState } from 'react';
import { m } from 'framer-motion';
import { CheckCircle, Copy } from 'lucide-react';
import Confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';

export interface ServerStatusData {
  online: boolean;
  motd: string;
  version: string;
  players: {
    online: number;
    max: number;
    sample: { name: string; id: string }[];
  };
  icon: string;
  latency?: number;
  error?: string;
}

interface ServerStatusCardProps {
  status: ServerStatusData | null;
  serverIp?: string;
}

function getStatusTheme(isOnline: boolean) {
  if (isOnline) {
    return {
      color: 'var(--success)',
      glowBoxShadow: '0 1px 15px 4px rgba(74, 222, 128, 0.35)',
      border: '2px solid var(--success)',
      badgeBg: 'rgba(74, 222, 128, 0.1)',
      badgeBorder: '1px solid rgba(74, 222, 128, 0.2)',
      progressBg: 'rgba(74, 222, 128, 0.05)',
      progressBorder: 'rgba(74, 222, 128, 0.1)',
      progressGradient: 'from-teal-500 to-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]',
    };
  }
  return {
    color: 'var(--error)',
    glowBoxShadow: '0 1px 15px 4px rgba(239, 68, 68, 0.35)',
    border: '2px solid var(--error)',
    badgeBg: 'rgba(239, 68, 68, 0.1)',
    badgeBorder: '1px solid rgba(239, 68, 68, 0.2)',
    progressBg: 'rgba(239, 68, 68, 0.05)',
    progressBorder: 'rgba(239, 68, 68, 0.1)',
    progressGradient: 'from-red-500 to-rose-600 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
  };
}

interface ServerProgressBarProps {
  playerCount: number;
  maxPlayers: number;
  percentage: number;
  theme: ReturnType<typeof getStatusTheme>;
  label: string;
}

function ServerProgressBar({
  playerCount,
  maxPlayers,
  percentage,
  theme,
  label,
}: Readonly<ServerProgressBarProps>) {
  return (
    <div
      role="progressbar"
      aria-valuenow={playerCount}
      aria-valuemin={0}
      aria-valuemax={maxPlayers}
      aria-label={label}
      className="relative mb-2 h-3 w-full overflow-hidden rounded-full border"
      style={{
        background: theme.progressBg,
        borderColor: theme.progressBorder,
      }}
    >
      <m.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: percentage / 100 }}
        transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
        style={{ transformOrigin: 'left', width: '100%' }}
        className={`bg-linear-to-r h-full ${theme.progressGradient}`}
      />
    </div>
  );
}

export default function ServerStatusCard({
  status,
  serverIp = 'mc.crystaltidesSMP.net',
}: Readonly<ServerStatusCardProps>) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const isOnline = status?.online ?? false;
  const playerCount = status?.players?.online ?? 0;
  const maxPlayers = status?.players?.max ?? 0;
  const percentage = maxPlayers > 0 ? (playerCount / maxPlayers) * 100 : 0;
  const cleanMotd = status?.motd ?? 'Servidor Minecraft';
  const theme = getStatusTheme(isOnline);

  const handleCopy = () => {
    navigator.clipboard.writeText(serverIp);
    setCopied(true);
    Confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      style={{
        background: 'rgba(20, 20, 25, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '24px',
        padding: '2rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40%',
          height: '2.5px',
          background: theme.color,
          borderRadius: '0 0 12px 12px',
          boxShadow: theme.glowBoxShadow,
          opacity: 0.9,
          zIndex: 2,
        }}
      />

      <div className="relative z-10 flex w-full flex-col items-center gap-8 md:flex-row md:items-start">
        <div className="relative">
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '24px',
              background: '#000',
              overflow: 'hidden',
              border: theme.border,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src="/images/server_icon.png"
              alt={cleanMotd}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        <div className="w-full flex-1 text-center md:text-left">
          <div className="mb-4 flex w-full flex-col items-center gap-4 md:flex-row md:justify-between">
            <div>
              <h2 className="flex flex-wrap items-center justify-center gap-2 text-lg font-bold sm:text-xl md:justify-start md:gap-3 md:text-2xl">
                {serverIp}
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label={copied ? t('common.copied') : t('common.copy')}
                  style={{
                    background: copied ? 'var(--success)' : 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition:
                      'color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s',
                  }}
                >
                  {copied ? <CheckCircle aria-hidden="true" /> : <Copy aria-hidden="true" />}
                  <span style={{ fontWeight: 'bold' }}>
                    {copied ? t('common.copied') : t('common.copy')}
                  </span>
                </button>
              </h2>
              <p className="mt-1 text-gray-400">{cleanMotd}</p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <span
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  color: theme.color,
                  background: theme.badgeBg,
                  padding: '0.4rem 1rem',
                  borderRadius: '8px',
                  border: theme.badgeBorder,
                }}
              >
                {isOnline ? t('status.online') : t('status.offline')}
              </span>
            </div>
          </div>

          <ServerProgressBar
            playerCount={playerCount}
            maxPlayers={maxPlayers}
            percentage={percentage}
            theme={theme}
            label={t('status.players')}
          />

          <div className="flex justify-between text-sm text-gray-400">
            <span>
              {t('status.version')}: {status?.version ?? '1.21.1'}
            </span>
            <span className="tabular-nums">
              {t('status.players')}: <strong className="text-white">{playerCount}</strong> /{' '}
              {maxPlayers}
            </span>
          </div>
        </div>
      </div>
    </m.div>
  );
}

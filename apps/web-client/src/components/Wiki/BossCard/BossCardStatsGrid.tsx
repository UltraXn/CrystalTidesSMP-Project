import { Sparkles, Heart, Zap, Shield, Compass } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { BossCardTheme } from './bossCardTheme';

interface BossCardStatsGridProps {
  threatLabel?: string;
  subtitle?: string;
  category?: string;
  bossName: string;
  currentPhaseName?: string;
  description?: string;
  themeStyles: BossCardTheme;
  hpLabel?: string;
  damageLabel?: string;
  speedLabel?: string;
  currentHp: string;
  currentDamage: string;
  armor: string;
  speed: string;
}

export function BossCardStatsGrid({
  threatLabel,
  subtitle,
  category = '',
  bossName,
  currentPhaseName,
  description,
  themeStyles,
  hpLabel,
  damageLabel,
  speedLabel,
  currentHp,
  currentDamage,
  armor,
  speed,
}: Readonly<BossCardStatsGridProps>) {
  const badgeText = threatLabel ?? subtitle ?? category.toUpperCase() ?? 'ENTIDAD OFICIAL';

  return (
    <div>
      <div
        className={`mb-2 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${themeStyles.badgeBg}`}
      >
        <Sparkles size={11} className={themeStyles.accentText} />
        <span>{badgeText}</span>
      </div>

      <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
        {bossName} {currentPhaseName ? `• ${currentPhaseName}` : ''}
      </h2>

      {description && (
        <div className="mt-2 space-y-1 text-xs/relaxed font-normal text-neutral-400 [&_strong]:text-white">
          <ReactMarkdown>{description.replaceAll('\\n', '\n')}</ReactMarkdown>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="space-y-0.5 rounded-xl border border-white/5 bg-neutral-950/70 p-2.5">
          <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
            <Heart size={11} className={themeStyles.accentText} /> {hpLabel ?? 'Salud'}
          </div>
          <div className="font-mono text-xs font-bold text-white">{currentHp}</div>
        </div>

        <div className="space-y-0.5 rounded-xl border border-white/5 bg-neutral-950/70 p-2.5">
          <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
            <Zap size={11} className={themeStyles.accentText} /> {damageLabel ?? 'Ataque'}
          </div>
          <div className="truncate text-xs font-bold text-white">{currentDamage}</div>
        </div>

        <div className="space-y-0.5 rounded-xl border border-white/5 bg-neutral-950/70 p-2.5">
          <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
            <Shield size={11} className="text-neutral-400" /> Armadura
          </div>
          <div className="truncate text-xs font-bold text-white">{armor}</div>
        </div>

        <div className="space-y-0.5 rounded-xl border border-white/5 bg-neutral-950/70 p-2.5">
          <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
            <Compass size={11} className="text-neutral-400" /> {speedLabel ?? 'Velocidad'}
          </div>
          <div className="font-mono text-xs font-bold text-white">{speed}</div>
        </div>
      </div>
    </div>
  );
}

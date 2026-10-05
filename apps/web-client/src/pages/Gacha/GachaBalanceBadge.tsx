import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

interface GachaBalanceBadgeProps {
  killuBalance: number;
}

export function GachaBalanceBadge({ killuBalance }: Readonly<GachaBalanceBadgeProps>) {
  const { t } = useTranslation();

  return (
    <output
      aria-live="polite"
      className="gacha-balance-pill mb-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-2.5 shadow-lg backdrop-blur-md"
    >
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
        <img
          src="/images/killucoin.png"
          alt=""
          aria-hidden="true"
          className="size-5 animate-pulse object-contain [image-rendering:pixelated]"
        />
        <span>{t('gacha.balance_label', 'Saldo Disponible')}</span>
      </div>
      <div className="flex items-center gap-1.5 font-mono text-sm font-extrabold tabular-nums text-amber-300">
        <span>{killuBalance.toLocaleString()}</span>
        <span className="text-[10px] font-black text-amber-400/80">KC</span>
        <Sparkles size={12} aria-hidden="true" className="text-amber-400" />
      </div>
    </output>
  );
}

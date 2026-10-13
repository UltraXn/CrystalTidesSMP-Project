import { MapPin, Award, Coins } from 'lucide-react';
import { BossCardTheme } from './bossCardTheme';

interface BossCardDropsSectionProps {
  locationLabel?: string;
  location: string;
  spawnMethod?: string;
  drops?: string[];
  dropsLabel?: string;
  kcReward?: number;
  bountyLabel?: string;
  themeStyles: BossCardTheme;
}

export function BossCardDropsSection({
  locationLabel,
  location,
  spawnMethod,
  drops,
  dropsLabel,
  kcReward,
  bountyLabel,
  themeStyles,
}: Readonly<BossCardDropsSectionProps>) {
  return (
    <>
      <div className="space-y-1 rounded-xl border border-white/5 bg-neutral-950/70 p-3 text-xs">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-300">
          <MapPin size={12} className={themeStyles.accentText} />{' '}
          {locationLabel ?? 'Ubicación & Método de Aparición'}
        </div>
        <p className="text-[11px] leading-normal text-neutral-400">
          <strong className="text-neutral-200">Hábitat:</strong> {location}
        </p>
        {spawnMethod && (
          <p className="text-[11px] leading-normal text-neutral-400">
            <strong className="text-neutral-200">Aparición:</strong> {spawnMethod}
          </p>
        )}
      </div>

      {drops && drops.length > 0 && (
        <div>
          <h4 className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            <Award className="size-3.5 text-neutral-400" /> {dropsLabel ?? 'Botín & Drops'}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {drops.map((drop) => (
              <span
                key={drop}
                className="flex items-center gap-1.5 rounded-md border border-white/5 bg-neutral-950 px-2 py-0.5 text-[10px] font-medium text-neutral-300"
              >
                <span className="size-1.5 rounded-full bg-neutral-500" />
                {drop}
              </span>
            ))}
          </div>
        </div>
      )}

      {kcReward ? (
        <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
            <Coins size={14} className="text-amber-400" />
            <span>{bountyLabel ?? 'Recompensa de Caza'}</span>
          </div>
          <span className="font-mono text-base font-bold text-amber-300">
            +{kcReward.toLocaleString()} KC
          </span>
        </div>
      ) : null}
    </>
  );
}

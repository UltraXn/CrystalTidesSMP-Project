import { Swords, Play, Zap } from 'lucide-react';
import { BossAttack } from './defaultBossData';
import { BossCardTheme } from './bossCardTheme';

interface BossCardAttacksSectionProps {
  attacks: BossAttack[];
  selectedAttack: BossAttack | null;
  onTriggerAttack: (attack: BossAttack) => void;
  themeStyles: BossCardTheme;
}

export function BossCardAttacksSection({
  attacks,
  selectedAttack,
  onTriggerAttack,
  themeStyles,
}: Readonly<BossCardAttacksSectionProps>) {
  if (!attacks || attacks.length === 0) return null;

  return (
    <div className="space-y-2.5 rounded-xl border border-white/5 bg-neutral-950/80 p-3.5">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-200">
          <Swords size={14} className={themeStyles.accentText} />
          <span>Habilidades & Animaciones 3D</span>
        </div>
        <span className="flex items-center gap-1 rounded-sm border border-white/5 bg-neutral-900 px-2 py-0.5 font-mono text-[10px] text-neutral-400">
          <Play size={9} /> Prueba en 3D
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {attacks.map((attack) => {
          const isSelected = selectedAttack?.name === attack.name;
          return (
            <button
              key={attack.name}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onTriggerAttack(attack)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                isSelected
                  ? themeStyles.activeBtn
                  : 'border-white/5 bg-neutral-900/60 text-neutral-400 hover:bg-neutral-800/80 hover:text-white'
              }`}
            >
              <span className="text-xs" aria-hidden="true">
                ⚔️
              </span>
              <span>{attack.name}</span>
              {attack.damage && (
                <span className="py-0.2 rounded-sm border border-white/5 bg-neutral-950 px-1 font-mono text-[9px] text-neutral-400">
                  {attack.type || 'ATK'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedAttack && (
        <div className="space-y-1 rounded-lg border border-white/5 bg-neutral-900 p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs font-bold text-white">
              <Zap size={12} className={themeStyles.accentText} /> {selectedAttack.name}
            </span>
            <div className="flex gap-1.5">
              <span className="py-0.2 rounded-sm border border-neutral-700 bg-neutral-800 px-1.5 font-mono text-[9px] font-bold uppercase text-neutral-300">
                {selectedAttack.type}
              </span>
              <span className="py-0.2 rounded-sm border border-neutral-700 bg-neutral-800 px-1.5 font-mono text-[9px] font-bold text-neutral-200">
                {selectedAttack.damage}
              </span>
            </div>
          </div>
          <p className="text-[11px] font-normal leading-relaxed text-neutral-400">
            {selectedAttack.description}
          </p>
        </div>
      )}
    </div>
  );
}

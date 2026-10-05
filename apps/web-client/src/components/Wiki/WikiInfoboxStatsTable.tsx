import { Heart, Swords, Shield, Zap, MapPin, Coins } from 'lucide-react';
import { WikiArticle } from '../../services/wikiService';

interface WikiInfoboxStatsTableProps {
  article: WikiArticle;
  activePhase: number;
}

export function WikiInfoboxStatsTable({
  article,
  activePhase,
}: Readonly<WikiInfoboxStatsTableProps>) {
  const hp =
    activePhase === 2 && article.boss_hp_phase_2 ? article.boss_hp_phase_2 : article.boss_hp;
  const damage =
    activePhase === 2 && article.boss_damage_phase_2
      ? article.boss_damage_phase_2
      : article.boss_damage;

  return (
    <div className="space-y-2 text-xs">
      <div className="text-(--accent) border-b border-white/10 pb-1 text-[11px] font-black uppercase tracking-wider">
        Estadísticas & Atributos
      </div>

      <div className="space-y-1.5 divide-y divide-white/5">
        <div className="flex items-center justify-between pt-1.5">
          <span className="font-medium text-white/50">Categoría</span>
          <span className="font-bold capitalize text-white">
            {article.category?.replaceAll('_', ' ') || 'General'}
          </span>
        </div>

        {article.boss_hp && (
          <div className="flex items-center justify-between pt-1.5">
            <span className="flex items-center gap-1.5 font-medium text-white/50">
              <Heart size={13} aria-hidden="true" className="text-red-400" /> Puntos de Vida
            </span>
            <span className="font-mono font-black tabular-nums text-red-300">{hp}</span>
          </div>
        )}

        {article.boss_damage && (
          <div className="flex items-center justify-between pt-1.5">
            <span className="flex items-center gap-1.5 font-medium text-white/50">
              <Swords size={13} aria-hidden="true" className="text-amber-400" /> Poder de Ataque
            </span>
            <span className="max-w-35 truncate text-right font-bold tabular-nums text-amber-200">
              {damage}
            </span>
          </div>
        )}

        {article.boss_armor && (
          <div className="flex items-center justify-between pt-1.5">
            <span className="flex items-center gap-1.5 font-medium text-white/50">
              <Shield size={13} aria-hidden="true" className="text-blue-400" /> Armadura
            </span>
            <span className="max-w-35 truncate text-right font-semibold tabular-nums text-white/90">
              {article.boss_armor}
            </span>
          </div>
        )}

        {article.boss_speed && (
          <div className="flex items-center justify-between pt-1.5">
            <span className="flex items-center gap-1.5 font-medium text-white/50">
              <Zap size={13} aria-hidden="true" className="text-yellow-400" /> Velocidad
            </span>
            <span className="font-mono tabular-nums text-white/80">{article.boss_speed}</span>
          </div>
        )}

        {article.boss_location && (
          <div className="flex items-start justify-between gap-2 pt-1.5">
            <span className="flex shrink-0 items-center gap-1.5 font-medium text-white/50">
              <MapPin size={13} aria-hidden="true" className="text-(--accent)" /> Hábitat
            </span>
            <span className="text-right font-medium text-white/90">{article.boss_location}</span>
          </div>
        )}

        {article.boss_spawn_method && (
          <div className="flex items-start justify-between gap-2 pt-1.5">
            <span className="shrink-0 font-medium text-white/50">Aparición</span>
            <span className="text-right text-[11px] font-medium text-white/80">
              {article.boss_spawn_method}
            </span>
          </div>
        )}

        {article.boss_kc_reward ? (
          <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/10 px-2.5 pb-1 pt-2">
            <span className="flex items-center gap-1.5 text-xs font-black text-amber-400">
              <Coins size={14} aria-hidden="true" /> Recompensa de Caza
            </span>
            <span className="font-mono text-sm font-black tabular-nums text-amber-300">
              +{article.boss_kc_reward} KC
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

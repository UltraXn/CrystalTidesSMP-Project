import { BookOpen, MapPin, Sparkles } from 'lucide-react';
import type { WikiArticle } from '../../services/wikiService';
import WikiBoss3DCard, { WikiBoss3DCardProps } from './WikiBoss3DCard';

interface WikiMobArticleDetailProps {
  article: WikiArticle;
}

function getMobCardProps(article: WikiArticle): WikiBoss3DCardProps {
  return {
    category: article.category,
    modelPath: article.model_3d_url,
    textureUrl: article.texture_url,
    modelPathPhase2: article.model_3d_url_phase_2,
    bossName: article.title,
    subtitle: article.boss_subtitle || article.category || 'Entidad Modificada',
    hp: article.boss_hp || '100 HP',
    hpPhase2: article.boss_hp_phase_2,
    damage: article.boss_damage || 'Ataque Estándar',
    damagePhase2: article.boss_damage_phase_2,
    armor: article.boss_armor || 'Sin Armadura',
    speed: article.boss_speed || 'Velocidad Normal',
    location: article.boss_location || 'Overworld / Estructura',
    spawnMethod: article.boss_spawn_method || 'Generación Natural',
    description: article.content || article.description,
    drops: article.boss_drops || [],
    kcReward: article.boss_kc_reward || 0,
    phases: article.boss_phases,
    phase1Attacks: article.boss_phase_1_attacks,
    phase2Attacks: article.boss_phase_2_attacks,
    cardTheme: article.card_theme,
    threatLabel: article.threat_label,
    hpLabel: article.hp_label,
    damageLabel: article.damage_label,
    speedLabel: article.speed_label,
    locationLabel: article.location_label,
    dropsLabel: article.drops_label,
    bountyLabel: article.bounty_label,
  };
}

export function WikiMobArticleDetail({ article }: Readonly<WikiMobArticleDetailProps>) {
  const cardProps = getMobCardProps(article);

  return (
    <div className="space-y-6">
      <WikiBoss3DCard {...cardProps} />

      <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl md:p-8">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="flex items-center gap-2 text-base font-bold uppercase tracking-wider text-white">
            <BookOpen size={16} className="text-neutral-400" />
            <span>Guía de Combate & Hábitat Detallado</span>
          </h3>
          {article.boss_mod_name && (
            <span className="rounded-sm border border-neutral-800 bg-neutral-950 px-2.5 py-0.5 text-xs font-medium text-neutral-400">
              {article.boss_mod_name}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
          {article.boss_location && (
            <div className="space-y-1 rounded-xl border border-neutral-800/80 bg-neutral-950 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-300">
                <MapPin size={13} className="text-neutral-400" /> Ubicación & Biomas
              </div>
              <div className="font-medium text-neutral-300">{article.boss_location}</div>
            </div>
          )}

          {article.boss_spawn_method && (
            <div className="space-y-1 rounded-xl border border-neutral-800/80 bg-neutral-950 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-300">
                <Sparkles size={13} className="text-neutral-400" /> Invocación / Aparición
              </div>
              <div className="font-medium text-neutral-300">{article.boss_spawn_method}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

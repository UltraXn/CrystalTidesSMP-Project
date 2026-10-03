import { BookOpen, MapPin, Sparkles, Tag, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { WikiArticle } from '../../services/wikiService';
import WikiBoss3DCard from './WikiBoss3DCard';

interface WikiArticleDetailProps {
  article: WikiArticle;
  isMobArticle: boolean;
}

export default function WikiArticleDetail({ article, isMobArticle }: WikiArticleDetailProps) {
  if (isMobArticle) {
    return (
      <div className="space-y-6">
        {/* Full 3D Interactive Boss & Mob Card */}
        <WikiBoss3DCard
          category={article.category}
          modelPath={article.model_3d_url}
          textureUrl={article.texture_url}
          modelPathPhase2={article.model_3d_url_phase_2}
          bossName={article.title}
          subtitle={article.boss_subtitle || article.category || 'Entidad Modificada'}
          hp={article.boss_hp || '100 HP'}
          hpPhase2={article.boss_hp_phase_2}
          damage={article.boss_damage || 'Ataque Estándar'}
          damagePhase2={article.boss_damage_phase_2}
          armor={article.boss_armor || 'Sin Armadura'}
          speed={article.boss_speed || 'Velocidad Normal'}
          location={article.boss_location || 'Overworld / Estructura'}
          spawnMethod={article.boss_spawn_method || 'Generación Natural'}
          description={article.content || article.description}
          drops={article.boss_drops || []}
          kcReward={article.boss_kc_reward || 0}
          phases={article.boss_phases}
          phase1Attacks={article.boss_phase_1_attacks}
          phase2Attacks={article.boss_phase_2_attacks}
          cardTheme={article.card_theme}
          threatLabel={article.threat_label}
          hpLabel={article.hp_label}
          damageLabel={article.damage_label}
          speedLabel={article.speed_label}
          locationLabel={article.location_label}
          dropsLabel={article.drops_label}
          bountyLabel={article.bounty_label}
        />

        {/* Lore & Extra Guides below the 3D showcase */}
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

  /* Standard Server Guide Article (Clean Minimalist Dark) */
  return (
    <div className="space-y-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl md:p-10">
      <header className="space-y-3 border-b border-neutral-800 pb-5">
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5 rounded-sm border border-neutral-700 bg-neutral-800 px-2.5 py-0.5 font-bold capitalize text-neutral-200">
            <Tag size={11} />
            {article.category.replaceAll('_', ' ')}
          </span>
          <span className="ml-auto flex items-center gap-1 text-[11px] text-neutral-500">
            <Clock size={11} />{' '}
            {article.updated_at ? new Date(article.updated_at).toLocaleDateString() : 'Oficial'}
          </span>
        </div>

        <h1 className="text-2xl/tight font-black tracking-tight text-white sm:text-4xl">
          {article.title}
        </h1>
      </header>

      <div className="article-content prose prose-invert max-w-none text-sm/relaxed text-neutral-300 sm:text-base">
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Sparkles, Layers } from 'lucide-react';
import { WikiArticle } from '../../services/wikiService';
import { WikiInfobox3DViewport } from './WikiInfobox3DViewport';
import { WikiInfoboxStatsTable } from './WikiInfoboxStatsTable';
import { WikiInfoboxDropsTable } from './WikiInfoboxDropsTable';

interface WikiInfobox3DProps {
  article: WikiArticle;
}

export default function WikiInfobox3D({ article }: Readonly<WikiInfobox3DProps>) {
  const [activePhase, setActivePhase] = useState<number>(1);
  const hasMultiplePhases = Boolean(
    article.model_3d_url_phase_2 || (article.boss_phases && article.boss_phases.length > 1),
  );

  return (
    <aside
      aria-label={`Ficha técnica de ${article.title}`}
      className="lg:w-84 sticky top-24 w-full shrink-0 space-y-5 self-start rounded-3xl border border-[#168c80]/40 bg-[#0b0c10]/90 p-5 shadow-2xl backdrop-blur-xl"
    >
      <div className="border-b border-white/10 pb-3 text-center">
        <div className="text-(--accent) mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#89d9d1]/40 bg-[#168c80]/20 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest shadow-inner">
          <Sparkles size={11} aria-hidden="true" />
          <span>Ficha de Entidad Oficial</span>
        </div>
        <h2 className="text-lg/tight font-black tracking-tight text-white">{article.title}</h2>
        {article.boss_mod_name && (
          <p className="mt-0.5 flex items-center justify-center gap-1 text-xs font-semibold text-white/60">
            <Layers size={12} aria-hidden="true" className="text-(--accent)" />
            <span>{article.boss_mod_name}</span>
          </p>
        )}
      </div>

      <WikiInfobox3DViewport
        article={article}
        activePhase={activePhase}
        onPhaseChange={setActivePhase}
        hasMultiplePhases={hasMultiplePhases}
      />

      <WikiInfoboxStatsTable article={article} activePhase={activePhase} />

      <WikiInfoboxDropsTable drops={article.boss_drops} />
    </aside>
  );
}

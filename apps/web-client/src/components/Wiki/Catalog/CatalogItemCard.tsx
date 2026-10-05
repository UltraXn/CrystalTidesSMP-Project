import { Link } from 'react-router';
import { m as motion } from 'framer-motion';
import { Sparkles, Layers, Heart, MapPin, Coins, ArrowRight } from 'lucide-react';
import type { WikiArticle } from '../../../services/wikiService';
import { getCardVisuals } from './types';

interface CatalogItemCardProps {
  article: WikiArticle;
  index: number;
}

export default function CatalogItemCard({ article, index }: CatalogItemCardProps) {
  const is3D = !!article.model_3d_url;
  const visuals = getCardVisuals(article);
  const TagIcon = visuals.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
    >
      <Link
        to={`/wiki/${article.slug}`}
        className={`bg-linear-to-b group relative flex h-full flex-col justify-between rounded-3xl ${visuals.bgGradient} border ${visuals.border} p-6 shadow-xl backdrop-blur-xl transition-colors duration-300 hover:-translate-y-2 ${visuals.glow}`}
      >
        {/* Card Top Pill Row */}
        <div>
          <div className="mb-4 flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${visuals.badgeBg}`}
            >
              <TagIcon size={12} aria-hidden="true" />
              <span>{visuals.tag}</span>
            </span>

            {is3D ? (
              <span className="inline-flex items-center gap-1 rounded-lg border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[11px] font-black text-teal-300 shadow-inner">
                <Sparkles size={11} aria-hidden="true" className="text-teal-400" /> 3D
              </span>
            ) : (
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-400">
                Guía
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="mb-1.5 line-clamp-2 text-lg/snug font-black tracking-tight text-white transition-colors group-hover:text-teal-300">
            {article.title}
          </h3>

          {/* Mod Name */}
          {article.boss_mod_name && (
            <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Layers size={13} aria-hidden="true" className="text-teal-500" />
              <span>{article.boss_mod_name}</span>
            </div>
          )}

          {/* Combat Dashboard Stats */}
          {is3D && (
            <div className="my-4 space-y-2 rounded-2xl border border-white/5 bg-black/40 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-400">
                  <Heart size={13} aria-hidden="true" className="text-red-400" /> Salud
                </span>
                <span className="font-mono font-black tabular-nums text-red-300">
                  {article.boss_hp || '100 HP'}
                </span>
              </div>

              {article.boss_location && (
                <div className="flex items-center justify-between border-t border-white/5 pt-1.5 text-[11px]">
                  <span className="flex items-center gap-1.5 truncate font-medium text-slate-400">
                    <MapPin size={12} aria-hidden="true" className="shrink-0 text-cyan-400" />{' '}
                    Hábitat
                  </span>
                  <span className="max-w-32.5 truncate text-right font-semibold text-slate-300">
                    {article.boss_location.split('/')[0].trim()}
                  </span>
                </div>
              )}

              {article.boss_kc_reward ? (
                <div className="flex items-center justify-between border-t border-white/5 pt-1.5 text-[11px]">
                  <span className="flex items-center gap-1.5 font-medium text-slate-400">
                    <Coins size={12} aria-hidden="true" className="text-amber-400" /> Botín
                  </span>
                  <span className="font-mono font-black tabular-nums text-amber-300">
                    +{article.boss_kc_reward} KC
                  </span>
                </div>
              ) : null}
            </div>
          )}

          {/* Description preview */}
          <p className="line-clamp-2 text-xs/relaxed font-normal text-slate-400">
            {article.content?.replace(/#{1,6}\s/g, '').slice(0, 140) ||
              'Sin descripción disponible.'}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-5 border-t border-white/10 pt-3">
          <div
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-xs font-black transition-colors ${visuals.btnClass}`}
          >
            <span>{is3D ? 'INSPECCIONAR EN 3D' : 'LEER GUÍA COMPLETA'}</span>
            <ArrowRight
              size={14}
              aria-hidden="true"
              className="transform transition-transform group-hover:translate-x-1.5"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

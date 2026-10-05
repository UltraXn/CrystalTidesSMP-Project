import { m as motion } from 'framer-motion';
import type { Stage, TimelineItem } from './types';

interface Stage1TimelineProps {
  stage: Stage;
}

export function Stage1Timeline({ stage }: Readonly<Stage1TimelineProps>) {
  if (!stage.timeline) return null;

  return (
    <div className="relative mt-8">
      {/* CENTRAL LUMINESCENT WIRE */}
      <div className="bg-linear-to-b absolute inset-y-4 left-6 w-0.5 from-cyan-500/20 via-cyan-500/60 to-purple-500/20 md:left-1/2 md:-ml-0.5" />

      <div className="space-y-8">
        {stage.timeline.map((item: TimelineItem, idx: number) => {
          const isEven = idx % 2 === 0;
          return (
            <motion.div
              key={`timeline-${item.title}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative flex flex-col md:flex-row ${
                isEven ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* TIMELINE ICON / NODE */}
              <div className="absolute left-6 z-20 flex size-9 -translate-x-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-900 shadow-[0_0_15px_rgba(34,211,238,0.4)] md:left-1/2">
                {item.icon ? (
                  <item.icon size={16} className="text-cyan-400" />
                ) : (
                  <div className="size-2 rounded-full bg-cyan-400" />
                )}
              </div>

              {/* TIMELINE CONTENT CARD */}
              <div className={`ml-14 md:ml-0 md:w-1/2 ${isEven ? 'md:pl-10' : 'md:pr-10'}`}>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-5 shadow-xl backdrop-blur-md transition-colors duration-300 hover:border-cyan-500/40 hover:bg-black/60">
                  <span className="inline-block rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                    {item.date}
                  </span>
                  <h4 className="mt-2 text-base font-bold text-white">{item.title}</h4>
                  <p className="mt-1 text-xs/relaxed text-gray-300">{item.description}</p>

                  {item.features && (
                    <div className="mt-4 border-t border-white/5 pt-3">
                      <span className="block text-[11px] font-semibold text-gray-400">
                        Hitos Clave:
                      </span>
                      <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {item.features.map((feat: string) => (
                          <li
                            key={feat}
                            className="flex items-center gap-1.5 text-xs text-gray-300"
                          >
                            <div className="size-1 rounded-full bg-cyan-400" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { Medal, Lock, Share2 } from 'lucide-react';

export interface AchievementCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  criteria?: string;
  onShare?: () => void;
  color?: string;
}

const AchievementCard = ({
  title,
  description,
  icon,
  unlocked,
  criteria,
  onShare,
  color = '#4CAF50',
}: AchievementCardProps) => (
  <div
    className={`rounded-4xl group relative flex flex-col items-center overflow-hidden p-8 text-center transition-colors duration-500 ${unlocked ? 'border border-white/5 bg-white/5 hover:-translate-y-1 hover:bg-white/10' : 'border border-dashed border-white/10 bg-transparent opacity-60'}`}
    style={{ '--accent-color': color } as React.CSSProperties}
  >
    {/* Background Glow */}
    {unlocked && (
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-10"
        style={{ background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)` }}
      />
    )}

    {/* Status Badges */}
    <div className="absolute right-6 top-6 flex flex-col gap-2">
      {unlocked ? (
        <>
          <div
            className="flex size-9 items-center justify-center rounded-full bg-white/5"
            style={{ color }}
          >
            <Medal size={14} className="drop-shadow-[0_0_8px_currentColor]" />
          </div>
          {onShare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="hover:bg-(--accent-color) flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:scale-110 hover:text-black active:scale-90"
              title="Compartir Logro"
            >
              <Share2 size={12} />
            </button>
          )}
        </>
      ) : (
        <div className="bg-white/2 flex size-9 items-center justify-center rounded-full text-gray-700">
          <Lock size={12} />
        </div>
      )}
    </div>

    {/* Icon Container */}
    <div
      className={`relative mb-6 flex size-20 items-center justify-center rounded-3xl transition-colors duration-500 ${unlocked ? 'border border-white/10 bg-white/5 shadow-2xl group-hover:scale-110' : 'bg-white/2 border border-white/5 opacity-30 shadow-none grayscale'}`}
    >
      <div className="text-4xl">{icon}</div>
      {unlocked && (
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-20 blur-xl"
          style={{ backgroundColor: color }}
        />
      )}
    </div>

    {/* Text Content */}
    <div className="space-y-3">
      <h3
        className={`text-lg font-black uppercase tracking-tighter transition-colors ${unlocked ? 'text-white' : 'text-gray-600'}`}
      >
        {title}
      </h3>
      <p
        className={`mx-auto max-w-[180px] text-xs/relaxed font-medium transition-colors ${unlocked ? 'text-gray-400' : 'text-gray-700'}`}
      >
        {description}
      </p>

      {!unlocked && criteria && (
        <div className="mt-4 inline-block rounded-lg border border-white/5 bg-black/40 px-3 py-1">
          <p className="text-[10px] font-black uppercase italic tracking-widest text-gray-700">
            🔒 {criteria}
          </p>
        </div>
      )}
    </div>

    {/* Progress Line (Decorative) */}
    {unlocked && (
      <div
        className="absolute bottom-0 left-0 h-[2px] w-0 transition-colors duration-700 ease-out group-hover:w-full"
        style={{ backgroundColor: color }}
      />
    )}
  </div>
);

export default AchievementCard;

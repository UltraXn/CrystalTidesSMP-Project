import { m as motion } from 'framer-motion';
import type React from 'react';
import MinecraftAvatar from '../../UI/MinecraftAvatar';
import type { Stage, MemberCard } from './types';

interface Stage2StaffGridProps {
  stage: Stage;
  hoveredMember: string | null;
  setHoveredMember: (name: string | null) => void;
  dragActiveMember: string | null;
  linkedMembers: Set<string>;
  handleNodePointerDown: (name: string, e: React.PointerEvent) => void;
  toggleMemberLink: (name: string) => void;
}

export function Stage2StaffGrid({
  stage,
  hoveredMember,
  setHoveredMember,
  dragActiveMember,
  linkedMembers,
  handleNodePointerDown,
  toggleMemberLink,
}: Readonly<Stage2StaffGridProps>) {
  if (!stage.members) return null;

  return (
    <div className="relative z-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stage.members.map((m: MemberCard) => {
          const isHovered = hoveredMember === m.name || dragActiveMember === m.name;
          const isLinked = linkedMembers.has(m.name);
          const accentColor = m.color || stage.accentColor || '#89d9d1';

          let cardStateClass = 'opacity-45 grayscale contrast-75 bg-zinc-950/60';
          let cardBorderColor = 'rgba(255, 255, 255, 0.08)';
          if (isLinked) {
            cardStateClass = 'opacity-100 grayscale-0 bg-black/90';
            cardBorderColor = accentColor;
          } else if (isHovered) {
            cardStateClass = 'opacity-85 grayscale-40 bg-zinc-950/85';
            cardBorderColor = 'rgba(255, 255, 255, 0.3)';
          }

          return (
            <motion.div
              key={`staff-${m.name}`}
              onHoverStart={() => setHoveredMember(m.name)}
              onHoverEnd={() => setHoveredMember(null)}
              className={`group relative flex flex-col justify-between gap-3 rounded-2xl border p-4 pt-6 shadow-2xl backdrop-blur-md transition-colors duration-300 ${cardStateClass}`}
              style={{
                borderColor: cardBorderColor,
                boxShadow: isLinked ? `0 0 30px ${accentColor}40` : '0 10px 30px rgba(0,0,0,0.8)',
              }}
            >
              {/* CIRCULAR RPG/SCI-FI GAME ASSET GEM SOCKET */}
              <div className="pointer-events-auto absolute -top-5 left-1/2 z-30 -translate-x-1/2">
                <button
                  type="button"
                  onPointerDown={(e) => handleNodePointerDown(m.name, e)}
                  onClick={() => toggleMemberLink(m.name)}
                  className={`bg-linear-to-b group/gem relative flex size-11 touch-none items-center justify-center overflow-hidden rounded-full border-2 from-[#1e293b] via-[#0f172a] to-[#020617] shadow-[0_6px_20px_rgba(0,0,0,0.9)] transition-colors ${
                    isLinked
                      ? 'pointer-events-none cursor-default select-none'
                      : 'cursor-grab active:cursor-grabbing'
                  }`}
                  style={{
                    borderColor: isLinked ? accentColor : 'rgba(255, 255, 255, 0.3)',
                    boxShadow: isLinked
                      ? `0 0 20px ${accentColor}80, inset 0 0 10px ${accentColor}50`
                      : '0 6px 15px rgba(0,0,0,0.8)',
                  }}
                  title={`Gema de Energía de ${m.name} (Arrastrar hacia el Faro)`}
                  aria-label={`Gema de Energía de ${m.name} (Arrastrar hacia el Faro)`}
                >
                  <span className="absolute left-1/2 top-0.5 size-1 -translate-x-1/2 rounded-full bg-white/60" />
                  <span className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-white/60" />
                  <span className="absolute left-0.5 top-1/2 size-1 -translate-y-1/2 rounded-full bg-white/60" />
                  <span className="absolute right-0.5 top-1/2 size-1 -translate-y-1/2 rounded-full bg-white/60" />

                  <div
                    className="rounded-xs relative flex size-5 rotate-45 items-center justify-center overflow-hidden border transition-colors duration-300"
                    style={{
                      backgroundColor: isLinked ? accentColor : 'rgba(30, 41, 59, 0.8)',
                      borderColor: isLinked ? '#ffffff' : 'rgba(148, 163, 184, 0.4)',
                      boxShadow: isLinked ? `0 0 12px ${accentColor}` : 'none',
                    }}
                  >
                    <span
                      className={`size-2.5 -rotate-45 rounded-full ${isLinked ? 'animate-ping bg-white' : 'bg-slate-500/50'}`}
                      style={{
                        backgroundColor: isLinked ? '#ffffff' : 'rgba(148, 163, 184, 0.5)',
                      }}
                    />
                  </div>
                </button>
              </div>

              {/* MEMBER AVATAR & DETAILS */}
              <div className="flex items-center gap-3">
                <div
                  className="relative size-12 shrink-0 overflow-hidden rounded-full border-2 bg-slate-900 shadow-lg transition-colors duration-300 group-hover:scale-105"
                  style={{ borderColor: accentColor }}
                >
                  <MinecraftAvatar
                    src={m.image ?? m.mc_nickname ?? m.avatar ?? m.name}
                    alt={m.name}
                    size={48}
                    className="size-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden text-left">
                  <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
                    <span
                      className="truncate text-sm/tight font-black transition-colors"
                      style={{ color: isHovered ? accentColor : '#ffffff' }}
                    >
                      {m.name}
                    </span>
                    {m.rankBadge && (
                      <img
                        src={m.rankBadge}
                        alt={m.role}
                        className="h-3.5 shrink-0 object-contain"
                      />
                    )}
                  </div>
                  <span className="block truncate text-[10.5px] font-bold text-gray-300">
                    {m.role}
                  </span>
                  <span className="mt-0.5 block text-[9.5px] italic leading-tight text-gray-400">
                    {m.desc}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

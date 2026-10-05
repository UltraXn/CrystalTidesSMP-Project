import type { MemberConfigItem } from './types';

interface Stage2HolographicBeamsProps {
  memberConfig: MemberConfigItem[];
  linkedMembers: Set<string>;
  hoveredMember: string | null;
  dragActiveMember: string | null;
}

export function Stage2HolographicBeams({
  memberConfig,
  linkedMembers,
  hoveredMember,
  dragActiveMember,
}: Readonly<Stage2HolographicBeamsProps>) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 block">
      <svg className="size-full" overflow="visible">
        <defs>
          {/* Glow Filter */}
          <filter id="beamGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Animated Gradient Streams */}
          {memberConfig.map((m) => (
            <linearGradient
              key={m.name}
              id={`plasma_grad_${m.name}`}
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor={m.color} stopOpacity="0.9" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="100%" stopColor={m.color} stopOpacity="0.9" />
            </linearGradient>
          ))}

          {/* 2-Color Drag Gradients */}
          <linearGradient id="drag_grad_Neroferno ultranix" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0b0b14" stopOpacity="1" />
            <stop offset="100%" stopColor="#ff00b7" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="drag_grad_KillubysmaliVT" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#00637c" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="drag_grad_Xurlito" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#00aeef" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="drag_grad_JAPA325" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Static Locked Energy Beams (3-Layer Plasma Streams + Traveling Particles) */}
        {memberConfig.map((m) => {
          const isLinked = linkedMembers.has(m.name);
          const isHovered = hoveredMember === m.name || dragActiveMember === m.name;

          if (!isLinked || linkedMembers.size === 4) return null;

          const pathD = `M 50% 28% C 50% 45%, ${m.xEnd} 55%, ${m.xEnd} 71.5%`;

          return (
            <g key={m.name} className="transition-colors duration-300">
              {/* 1. Outer Diffused Plasma Glow Aura */}
              <path
                d={pathD}
                fill="none"
                stroke={m.color}
                strokeWidth={isHovered ? 16 : 10}
                strokeOpacity={0.4}
                style={{ filter: 'url(#beamGlow)' }}
              />

              {/* 2. Middle Animated Energy Wave Flow */}
              <path
                d={pathD}
                fill="none"
                stroke={`url(#plasma_grad_${m.name})`}
                strokeWidth={isHovered ? 6 : 4}
                strokeDasharray="16 10"
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 12px ${m.color})`,
                }}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="52"
                  to="0"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>

              {/* 3. Inner White-Hot Core Laser Stream */}
              <path
                d={pathD}
                fill="none"
                stroke="#ffffff"
                strokeWidth={isHovered ? 2.5 : 1.5}
                strokeOpacity={0.95}
              />

              {/* 4. Traveling Plasma Energy Sparks Along Beam Path (AAA Game Particle Effect) */}
              <circle r="4.5" fill="#ffffff" style={{ filter: `drop-shadow(0 0 12px ${m.color})` }}>
                <animateMotion path={pathD} dur="1.8s" repeatCount="indefinite" />
              </circle>
              <circle r="6.5" fill={m.color} opacity="0.75">
                <animateMotion path={pathD} dur="1.8s" begin="-0.6s" repeatCount="indefinite" />
              </circle>
              <circle r="3.5" fill="#ffffff">
                <animateMotion path={pathD} dur="1.8s" begin="-1.2s" repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

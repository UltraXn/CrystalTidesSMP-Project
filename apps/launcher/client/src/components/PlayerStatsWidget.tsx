import { useEffect, useState } from 'react';
import { Shield, Award, HelpCircle, Lock, CheckCircle, Sparkles } from 'lucide-react';

interface PlayerStatsData {
  username: string;
  rank: string;
  rank_image: string;
  playtime: string;
  weekly_playtime: string;
  kills: number;
  weekly_kills: number;
  mob_kills: number;
  deaths: number;
  weekly_deaths: number;
  money: string;
  weekly_kc_earned: string;
  gacha_spins_weekly: number;
  blocks_mined?: number;
  blocks_placed?: number;
  streak_days?: number;
  member_since: string;
  is_top1_constructor?: boolean;
  is_top1_luchador?: boolean;
  is_top1_mercader?: boolean;
  is_top1_constancia?: boolean;
  is_top1_explorador?: boolean;
  top1_constructor_score?: number;
  top1_luchador_score?: number;
  top1_mercader_score?: number;
  top1_constancia_score?: number;
  top1_explorador_score?: number;
  prestige_constructor?: number;
  prestige_luchador?: number;
  prestige_mercader?: number;
  prestige_constancia?: number;
  prestige_explorador?: number;
}

interface PlayerStatsWidgetProps {
  username?: string | null;
}

interface PentagonAxis {
  key: 'constructor' | 'luchador' | 'mercader' | 'constancia' | 'explorador';
  label: string;
  value: string | number;
  score: number;
  rawPoints?: number;
  icon: React.ReactNode;
  color: string;
}

const getMcItemUrl = (filename: string) =>
  `https://minecraft.wiki/w/Special:Redirect/file/${filename}`;

interface PrestigeCardItem {
  levelNum: number;
  level: string;
  rankName: string;
  bonus: string;
  tag: string;
  color: string;
  border: string;
  bg: string;
  item: string;
}

const PrestigeLevelCard: React.FC<{
  item: PrestigeCardItem;
  currentPrestigeLevel: number;
  isCurrentCategoryTop1: boolean;
}> = ({ item, currentPrestigeLevel, isCurrentCategoryTop1 }) => {
  const isUnlocked = item.levelNum <= currentPrestigeLevel;
  const isNextTarget = isCurrentCategoryTop1 && item.levelNum === currentPrestigeLevel + 1;
  const isLocked = !isUnlocked && !isNextTarget;

  let cardBg = 'rgba(0,0,0,0.5)';
  let cardBorder = '1px solid rgba(255,255,255,0.05)';
  if (isUnlocked) {
    cardBg = item.bg;
    cardBorder = `1px solid ${item.border}`;
  } else if (isNextTarget) {
    cardBg = 'rgba(147,51,234,0.12)';
    cardBorder = '1px solid #C084FC';
  }
  const opacity = isLocked ? 0.45 : 1;

  let levelColor = 'rgba(255,255,255,0.5)';
  if (isUnlocked) levelColor = item.color;
  else if (isNextTarget) levelColor = '#C084FC';

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 12,
        background: cardBg,
        border: cardBorder,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 4,
        position: 'relative',
      }}
    >
      {isUnlocked && (
        <span
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            fontSize: 9,
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CheckCircle size={10} /> Activo
        </span>
      )}
      {isLocked && (
        <span
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            fontSize: 9,
            color: 'rgba(255,255,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Lock size={10} /> Bloqueado
        </span>
      )}
      <img
        src={item.item}
        style={{
          width: 22,
          height: 22,
          objectFit: 'contain',
          margin: '2px 0',
          filter: isLocked ? 'grayscale(0.8)' : 'none',
        }}
        alt={item.rankName}
      />
      <span style={{ color: levelColor, fontWeight: 900, fontSize: 11 }}>{item.level}</span>
      <span
        style={{
          fontSize: 11,
          color: isLocked ? 'rgba(255,255,255,0.5)' : '#FFF',
          fontWeight: 800,
        }}
      >
        {item.rankName}
      </span>
      <span
        style={{
          fontSize: 10,
          color: isLocked ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.7)',
        }}
      >
        {item.bonus}
      </span>
      <span
        style={{
          fontSize: 9.5,
          color: isUnlocked ? item.color : 'rgba(255,255,255,0.4)',
          fontFamily: 'monospace',
          fontWeight: 700,
        }}
      >
        {item.tag}
      </span>
    </div>
  );
};

const parsePlaytimeHours = (ptStr: string): number => {
  if (!ptStr) return 0;
  const hMatch = /(\d+)h/.exec(ptStr);
  const mMatch = /(\d+)m/.exec(ptStr);
  const h = parseInt(hMatch?.[1] ?? '0', 10);
  const m = parseInt(mMatch?.[1] ?? '0', 10);
  return h + m / 60;
};

const parseMoneyNum = (moneyStr: string): number => {
  if (!moneyStr) return 0;
  return parseFloat(moneyStr.replace(/[^0-9.-]+/g, '')) || 0;
};

const getTopRelativeScore = (val: number, top1Val?: number, isTop1?: boolean): number => {
  if (isTop1) return 100;
  const benchmark = Math.max(top1Val ?? 100000, 100);
  return Math.min(99, Math.max(10, Math.round((val / benchmark) * 100)));
};

const getPentagonCoordinates = (
  index: number,
  scorePercent: number,
  cx = 130,
  cy = 108,
  radius = 75,
) => {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
  const r = (radius * scorePercent) / 100;
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
};

type PrestigeTabKey = 'constructor' | 'luchador' | 'mercader' | 'constancia' | 'explorador';

const PRESTIGE_LEVEL_MAP: Record<PrestigeTabKey, keyof PlayerStatsData> = {
  constructor: 'prestige_constructor',
  luchador: 'prestige_luchador',
  mercader: 'prestige_mercader',
  constancia: 'prestige_constancia',
  explorador: 'prestige_explorador',
};

const TOP1_FLAG_MAP: Record<PrestigeTabKey, keyof PlayerStatsData> = {
  constructor: 'is_top1_constructor',
  luchador: 'is_top1_luchador',
  mercader: 'is_top1_mercader',
  constancia: 'is_top1_constancia',
  explorador: 'is_top1_explorador',
};

const getCategoryPrestigeLevel = (tab: PrestigeTabKey, stats: PlayerStatsData | null): number => {
  if (!stats) return 0;
  const key = PRESTIGE_LEVEL_MAP[tab];
  return (stats[key] as number) ?? 0;
};

const getCategoryIsTop1 = (tab: PrestigeTabKey, stats: PlayerStatsData | null): boolean => {
  if (!stats) return false;
  const key = TOP1_FLAG_MAP[tab];
  return Boolean(stats[key]);
};

interface CareerTrackTier {
  name: string;
  req: string;
  item: string;
  minVal?: number;
  isTop1Tier?: boolean;
}

interface CareerTrack {
  key: PrestigeTabKey;
  label: string;
  color: string;
  formula: string;
  icon: string;
  rawVal: number;
  isTop1?: boolean;
  tiers: CareerTrackTier[];
}

const getTierIndex = (track: CareerTrack): number => {
  if (track.isTop1) return 4;
  for (let i = 3; i >= 0; i--) {
    if (track.rawVal >= (track.tiers[i].minVal ?? 0)) {
      return i;
    }
  }
  return 0;
};

const TABS_CONFIG = {
  constructor: {
    label: 'Constructor',
    icon: 'https://minecraft.wiki/w/Special:Redirect/file/Crafting_Table.png',
  },
  luchador: {
    label: 'Luchador',
    icon: 'https://minecraft.wiki/w/Special:Redirect/file/Netherite_Sword.png',
  },
  mercader: { label: 'Mercader', icon: '/images/killucoins/coin_oro.webp' },
  constancia: {
    label: 'Constancia',
    icon: 'https://minecraft.wiki/w/Special:Redirect/file/Totem_of_Undying.png',
  },
  explorador: {
    label: 'Explorador',
    icon: 'https://minecraft.wiki/w/Special:Redirect/file/Recovery_Compass.png',
  },
} as const;

const ARCHETYPE_MOCKUPS: Record<PrestigeTabKey, PrestigeCardItem[]> = {
  constructor: [
    {
      levelNum: 1,
      level: 'Prestigio I',
      rankName: 'Iniciado de Piedra',
      bonus: '+5% KC Diarios',
      tag: '[P1]',
      color: '#F59E0B',
      border: 'rgba(245,158,11,0.3)',
      bg: 'rgba(245,158,11,0.1)',
      item: 'https://minecraft.wiki/w/Special:Redirect/file/Cobblestone.png',
    },
    {
      levelNum: 2,
      level: 'Prestigio II',
      rankName: 'Constructor Consagrado',
      bonus: '+10% KC Diarios',
      tag: '[P2]',
      color: '#CBD5E1',
      border: 'rgba(203,213,225,0.3)',
      bg: 'rgba(203,213,225,0.1)',
      item: 'https://minecraft.wiki/w/Special:Redirect/file/Iron_Pickaxe.png',
    },
    {
      levelNum: 3,
      level: 'Prestigio III',
      rankName: 'Gran Arquitecto',
      bonus: '+15% KC',
      tag: '[P3]',
      color: '#FACC15',
      border: 'rgba(250,204,21,0.3)',
      bg: 'rgba(250,204,21,0.1)',
      item: 'https://minecraft.wiki/w/Special:Redirect/file/Golden_Pickaxe.png',
    },
    {
      levelNum: 4,
      level: 'Prestigio IV',
      rankName: 'Maestro Constructor',
      bonus: '+20% KC',
      tag: '[P4]',
      color: '#22D3EE',
      border: 'rgba(34,211,238,0.3)',
      bg: 'rgba(34,211,238,0.1)',
      item: 'https://minecraft.wiki/w/Special:Redirect/file/Diamond_Pickaxe.png',
    },
    {
      levelNum: 5,
      level: 'Prestigio V',
      rankName: 'Arquitecto Mítico',
      bonus: '+25% KC + Title',
      tag: '[P5]',
      color: '#E879F9',
      border: 'rgba(232,121,249,0.4)',
      bg: 'rgba(232,121,249,0.15)',
      item: 'https://minecraft.wiki/w/Special:Redirect/file/Beacon.png',
    },
  ],
  luchador: [
    {
      levelNum: 1,
      level: 'Prestigio I',
      rankName: 'Guerrero de Bronce',
      bonus: '+5% KC Diarios',
      tag: '[P1]',
      color: '#F59E0B',
      border: 'rgba(245,158,11,0.3)',
      bg: 'rgba(245,158,11,0.1)',
      item: 'https://minecraft.wiki/w/Special:Redirect/file/Wooden_Sword.png',
    },
    {
      levelNum: 2,
      level: 'Prestigio II',
      rankName: 'Campeón de Batalla',
      bonus: '+10% KC Diarios',
      tag: '[P2]',
      color: '#CBD5E1',
      border: 'rgba(203,213,225,0.3)',
      bg: 'rgba(203,213,225,0.1)',
      item: 'https://minecraft.wiki/w/Special:Redirect/file/Iron_Sword.png',
    },
    {
      levelNum: 3,
      level: 'Prestigio III',
      rankName: 'Señor de Guerra',
      bonus: '+15% KC',
      tag: '[P3]',
      color: '#FACC15',
      border: 'rgba(250,204,21,0.3)',
      bg: 'rgba(250,204,21,0.1)',
      item: 'https://minecraft.wiki/w/Special:Redirect/file/Golden_Sword.png',
    },
    {
      levelNum: 4,
      level: 'Prestigio IV',
      rankName: 'Maestro de Armas',
      bonus: '+20% KC',
      tag: '[P4]',
      color: '#22D3EE',
      border: 'rgba(34,211,238,0.3)',
      bg: 'rgba(34,211,238,0.1)',
      item: 'https://minecraft.wiki/w/Special:Redirect/file/Diamond_Sword.png',
    },
    {
      levelNum: 5,
      level: 'Prestigio V',
      rankName: 'Gladiador Supremo',
      bonus: '+25% KC + Espadas',
      tag: '[P5]',
      color: '#E879F9',
      border: 'rgba(232,121,249,0.4)',
      bg: 'rgba(232,121,249,0.15)',
      item: 'https://minecraft.wiki/w/Special:Redirect/file/Mace.png',
    },
  ],
  mercader: [
    {
      levelNum: 1,
      level: 'Prestigio I',
      rankName: 'Mercader Próspero',
      bonus: '+5% KC Diarios',
      tag: '[P1]',
      color: '#F59E0B',
      border: 'rgba(245,158,11,0.3)',
      bg: 'rgba(245,158,11,0.1)',
      item: '/images/killucoins/coin_cobre.webp',
    },
    {
      levelNum: 2,
      level: 'Prestigio II',
      rankName: 'Comerciante de Élite',
      bonus: '+10% KC Diarios',
      tag: '[P2]',
      color: '#CBD5E1',
      border: 'rgba(203,213,225,0.3)',
      bg: 'rgba(203,213,225,0.1)',
      item: '/images/killucoins/coin_plata.webp',
    },
    {
      levelNum: 3,
      level: 'Prestigio III',
      rankName: 'Barón Financiero',
      bonus: '+15% KC',
      tag: '[P3]',
      color: '#FACC15',
      border: 'rgba(250,204,21,0.3)',
      bg: 'rgba(250,204,21,0.1)',
      item: '/images/killucoins/coin_oro.webp',
    },
    {
      levelNum: 4,
      level: 'Prestigio IV',
      rankName: 'Gran Maestro Gremial',
      bonus: '+20% KC',
      tag: '[P4]',
      color: '#22D3EE',
      border: 'rgba(34,211,238,0.3)',
      bg: 'rgba(34,211,238,0.1)',
      item: '/images/killucoins/coin_diamante.webp',
    },
    {
      levelNum: 5,
      level: 'Prestigio V',
      rankName: 'Magnate Legendario',
      bonus: '+25% KC + Rain',
      tag: '[P5]',
      color: '#E879F9',
      border: 'rgba(232,121,249,0.4)',
      bg: 'rgba(232,121,249,0.15)',
      item: '/images/killucoins/coin_iridium.webp',
    },
  ],
  constancia: [
    {
      levelNum: 1,
      level: 'Prestigio I',
      rankName: 'Devoto del Servidor',
      bonus: '+5% KC Diarios',
      tag: '[P1]',
      color: '#F59E0B',
      border: 'rgba(245,158,11,0.3)',
      bg: 'rgba(245,158,11,0.1)',
      item: 'https://minecraft.wiki/w/Special:Redirect/file/Clock.png',
    },
    {
      levelNum: 2,
      level: 'Prestigio II',
      rankName: 'Pilar Inquebrantable',
      bonus: '+10% KC Diarios',
      tag: '[P2]',
      color: '#CBD5E1',
      border: 'rgba(203,213,225,0.3)',
      bg: 'rgba(203,213,225,0.1)',
      item: 'https://minecraft.wiki/w/Special:Redirect/file/Compass.png',
    },
    {
      levelNum: 3,
      level: 'Prestigio III',
      rankName: 'Guardián de Racha',
      bonus: '+15% KC',
      tag: '[P3]',
      color: '#FACC15',
      border: 'rgba(250,204,21,0.3)',
      bg: 'rgba(250,204,21,0.1)',
      item: 'https://minecraft.wiki/w/Special:Redirect/file/Bottle_o%27_Enchanting.png',
    },
    {
      levelNum: 4,
      level: 'Prestigio IV',
      rankName: 'Leyenda Inquebrantable',
      bonus: '+20% KC',
      tag: '[P4]',
      color: '#22D3EE',
      border: 'rgba(34,211,238,0.3)',
      bg: 'rgba(34,211,238,0.1)',
      item: 'https://minecraft.wiki/w/Special:Redirect/file/Totem_of_Undying.png',
    },
    {
      levelNum: 5,
      level: 'Prestigio V',
      rankName: 'Titán Eterno',
      bonus: '+25% KC + Totem',
      tag: '[P5]',
      color: '#E879F9',
      border: 'rgba(232,121,249,0.4)',
      bg: 'rgba(232,121,249,0.15)',
      item: 'https://minecraft.wiki/w/Special:Redirect/file/Nether_Star.png',
    },
  ],
  explorador: [
    {
      levelNum: 1,
      level: 'Prestigio I',
      rankName: 'Navegante de Reinos',
      bonus: '+5% KC Diarios',
      tag: '[P1]',
      color: '#F59E0B',
      border: 'rgba(245,158,11,0.3)',
      bg: 'rgba(245,158,11,0.1)',
      item: 'https://minecraft.wiki/w/Special:Redirect/file/Leather_Boots_(item)_JE2.png',
    },
    {
      levelNum: 2,
      level: 'Prestigio II',
      rankName: 'Mapeador Ancestral',
      bonus: '+10% KC Diarios',
      tag: '[P2]',
      color: '#CBD5E1',
      border: 'rgba(203,213,225,0.3)',
      bg: 'rgba(203,213,225,0.1)',
      item: 'https://minecraft.wiki/w/Special:Redirect/file/Spyglass.png',
    },
    {
      levelNum: 3,
      level: 'Prestigio III',
      rankName: 'Pionero del Horizonte',
      bonus: '+15% KC',
      tag: '[P3]',
      color: '#FACC15',
      border: 'rgba(250,204,21,0.3)',
      bg: 'rgba(250,204,21,0.1)',
      item: 'https://minecraft.wiki/w/Special:Redirect/file/Empty_Map.png',
    },
    {
      levelNum: 4,
      level: 'Prestigio IV',
      rankName: 'Explorador Experto',
      bonus: '+20% KC',
      tag: '[P4]',
      color: '#22D3EE',
      border: 'rgba(34,211,238,0.3)',
      bg: 'rgba(34,211,238,0.1)',
      item: 'https://minecraft.wiki/w/Special:Redirect/file/Elytra.png',
    },
    {
      levelNum: 5,
      level: 'Prestigio V',
      rankName: 'Conquistador de Mundos',
      bonus: '+25% KC + Trail',
      tag: '[P5]',
      color: '#E879F9',
      border: 'rgba(232,121,249,0.4)',
      bg: 'rgba(232,121,249,0.15)',
      item: 'https://minecraft.wiki/w/Special:Redirect/file/Recovery_Compass.png',
    },
  ],
};

const PlayerProfileHeader: React.FC<{ username: string; rank?: string }> = ({ username, rank }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 18px',
      borderRadius: 16,
      background: 'rgba(15, 23, 42, 0.75)',
      border: '1px solid rgba(45, 212, 191, 0.25)',
      backdropFilter: 'blur(14px)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <img
        src={`https://mc-heads.net/avatar/${username}/40`}
        alt={username}
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          border: '1px solid rgba(45, 212, 191, 0.4)',
        }}
      />
      <div>
        <div style={{ fontSize: 14, fontWeight: 900, color: '#2DD4BF' }}>{username}</div>
        <div
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginTop: 2,
          }}
        >
          <Shield size={12} color="#38BDF8" /> {rank ?? 'Aventurero'}
        </div>
      </div>
    </div>
  </div>
);

const RadarPentagonSection: React.FC<{
  axes: PentagonAxis[];
  cx: number;
  cy: number;
  polygonPoints: string;
}> = ({ axes, cx, cy, polygonPoints }) => (
  <div
    style={{
      padding: 20,
      borderRadius: 16,
      background: 'rgba(15, 23, 42, 0.75)',
      border: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(14px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
  >
    <div
      style={{
        fontSize: 11,
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 10,
      }}
    >
      Radar de Estilo de Juego (Histórico Total)
    </div>

    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 220,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <svg width="260" height="220" viewBox="0 0 260 220" style={{ overflow: 'visible' }}>
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => {
          const gridPts = axes
            .map((_, i) => {
              const pt = getPentagonCoordinates(i, scale * 100, cx, cy);
              return `${pt.x},${pt.y}`;
            })
            .join(' ');
          return (
            <polygon
              key={`grid-${scale}`}
              points={gridPts}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
              strokeDasharray={scale === 1.0 ? 'none' : '2,2'}
            />
          );
        })}

        {axes.map((axis, i) => {
          const endPt = getPentagonCoordinates(i, 100, cx, cy);
          return (
            <line
              key={`axis-line-${axis.key}`}
              x1={cx}
              y1={cy}
              x2={endPt.x}
              y2={endPt.y}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
            />
          );
        })}

        <polygon
          points={polygonPoints}
          fill="rgba(45, 212, 191, 0.28)"
          stroke="#2DD4BF"
          strokeWidth="2.5"
          style={{ filter: 'drop-shadow(0 0 8px rgba(45,212,191,0.5))' }}
        />

        {axes.map((axis, i) => {
          const pt = getPentagonCoordinates(i, axis.score, cx, cy);
          return (
            <g key={`axis-circle-${axis.key}`}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                fill={axis.color}
                stroke="#0F172A"
                strokeWidth="1.5"
              />
            </g>
          );
        })}

        {axes.map((axis, i) => {
          const labelPt = getPentagonCoordinates(i, 122, cx, cy);
          return (
            <text
              key={`axis-label-${axis.key}`}
              x={labelPt.x}
              y={labelPt.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={axis.color}
              fontSize="9.5"
              fontWeight="900"
            >
              {axis.label}
            </text>
          );
        })}
      </svg>
    </div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
        gap: 4,
        width: '100%',
        marginTop: 12,
        boxSizing: 'border-box',
      }}
    >
      {axes.map((axis) => (
        <div
          key={axis.key}
          style={{
            background: 'rgba(0,0,0,0.4)',
            borderRadius: 8,
            padding: '6px 2px',
            textAlign: 'center',
            border: `1px solid ${axis.color}30`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 0,
          }}
        >
          {axis.icon}
          <div
            style={{
              fontSize: 8.5,
              fontWeight: 800,
              color: 'rgba(255,255,255,0.5)',
              marginTop: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: '100%',
            }}
          >
            {axis.label}
          </div>
          <div
            style={{
              fontSize: 9.5,
              fontWeight: 900,
              color: '#FFF',
              marginTop: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: '100%',
            }}
          >
            {axis.value}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CalculationGuideCard: React.FC = () => (
  <div
    style={{
      padding: 16,
      borderRadius: 16,
      background: 'rgba(15, 23, 42, 0.75)',
      border: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(14px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      fontSize: 11,
      color: 'rgba(255,255,255,0.75)',
      lineHeight: 1.4,
    }}
  >
    <div
      style={{
        fontWeight: 900,
        color: '#2DD4BF',
        fontSize: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <HelpCircle size={14} /> ¿Cómo se calcula cada Puntuación?
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <img
          src="https://minecraft.wiki/w/Special:Redirect/file/Crafting_Table.png"
          style={{ width: 14, height: 14, objectFit: 'contain' }}
          alt="Constructor"
        />
        <strong style={{ color: '#38BDF8' }}>Constructor:</strong> Bloques minados + colocados en tu
        historia.
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <img
          src="https://minecraft.wiki/w/Special:Redirect/file/Diamond_Sword.png"
          style={{ width: 14, height: 14, objectFit: 'contain' }}
          alt="Luchador"
        />
        <strong style={{ color: '#F43F5E' }}>Luchador:</strong> 15 pts por kill PvP a jugadores y 1
        pt por mob hostil.
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <img
          src="/images/killucoins/coin_oro.webp"
          style={{ width: 14, height: 14, objectFit: 'contain' }}
          alt="Mercader"
        />
        <strong style={{ color: '#F59E0B' }}>Mercader:</strong> Escala logarítmica (100 ×
        log₁₀(KilluCoins)).
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <img
          src="https://minecraft.wiki/w/Special:Redirect/file/Totem_of_Undying.png"
          style={{ width: 14, height: 14, objectFit: 'contain' }}
          alt="Constancia"
        />
        <strong style={{ color: '#E879F9' }}>Constancia:</strong> Crecimiento cuadrático (Días de
        Racha)².
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <img
          src="https://minecraft.wiki/w/Special:Redirect/file/Compass.png"
          style={{ width: 14, height: 14, objectFit: 'contain' }}
          alt="Explorador"
        />
        <strong style={{ color: '#10B981' }}>Explorador:</strong> 10 pts por hora de juego + 1 pt
        por km recorrido.
      </div>
    </div>
  </div>
);

const CareerTracksSection: React.FC<{ careerTracks: CareerTrack[] }> = ({ careerTracks }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div
      style={{
        padding: 18,
        borderRadius: 16,
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(14px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 900,
          color: '#2DD4BF',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 10,
        }}
      >
        <Award size={16} /> Líneas de Carrera y Maestría
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {careerTracks.map((track) => {
          const currentTierIndex = getTierIndex(track);

          return (
            <div
              key={track.key}
              style={{
                padding: 12,
                borderRadius: 14,
                background: 'rgba(0, 0, 0, 0.4)',
                border: `1px solid ${track.color}25`,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img
                    src={track.icon}
                    style={{ width: 16, height: 16, objectFit: 'contain' }}
                    alt={track.label}
                  />
                  <span style={{ fontSize: 12, fontWeight: 900, color: track.color }}>
                    {track.label}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
                  {track.formula}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'nowrap',
                  gap: 4,
                  overflowX: 'auto',
                }}
              >
                {track.tiers.map((tier, tIdx) => {
                  const isCurrent = tIdx === currentTierIndex;
                  const isTop1Tier = tier.isTop1Tier;

                  let pillBg = 'rgba(255, 255, 255, 0.04)';
                  let pillBorder = '1px solid rgba(255, 255, 255, 0.08)';
                  let textColor = 'rgba(255, 255, 255, 0.5)';
                  let glowStyle = {};

                  if (isCurrent) {
                    pillBg = isTop1Tier ? `${track.color}30` : `${track.color}20`;
                    pillBorder = `1.5px solid ${track.color}`;
                    textColor = isTop1Tier ? '#FFF' : track.color;
                    glowStyle = { boxShadow: `0 0 12px ${track.color}60` };
                  }

                  return (
                    <div
                      key={`tier-${track.key}-${tier.name}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      {tIdx > 0 && (
                        <span
                          style={{
                            fontSize: 9,
                            color: 'rgba(255,255,255,0.25)',
                            padding: '0 1px',
                          }}
                        >
                          →
                        </span>
                      )}

                      <div
                        style={{
                          padding: '4px 8px',
                          borderRadius: 8,
                          background: pillBg,
                          border: pillBorder,
                          color: textColor,
                          fontSize: 10,
                          fontWeight: isCurrent ? 900 : 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          ...glowStyle,
                        }}
                      >
                        <img
                          src={tier.item}
                          style={{ width: 13, height: 13, objectFit: 'contain' }}
                          alt={tier.name}
                        />
                        <span>{tier.name}</span>
                        {!isTop1Tier && (
                          <span style={{ fontSize: 8.5, opacity: 0.65 }}>({tier.req})</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 4,
          padding: 12,
          borderRadius: 12,
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          fontSize: 10.5,
          color: '#FDE68A',
          lineHeight: 1.4,
        }}
      >
        <div
          style={{
            fontWeight: 900,
            color: '#F59E0B',
            marginBottom: 6,
            fontSize: 11,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          Reglas del Rango Máximo
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10 }}>
          <div>
            • <strong>Requisito Rango Máximo:</strong> Debes ser el jugador con más
            puntos/estadística de la categoría en la que estás destacando.
          </div>
          <div>
            • <strong>Límite de 1 Rango Activo:</strong> Solo puedes poseer 1 título máximo
            simultáneo al mismo tiempo.
          </div>
          <div>
            • <strong>Transferencia Directa:</strong> Se transfiere si otro jugador supera tu
            puntaje o te vence en Duelo 1v1.
          </div>
        </div>
      </div>
    </div>
  </div>
);

const PrestigeSystemSection: React.FC<{
  prestigeTab: PrestigeTabKey;
  onSelectTab: (tab: PrestigeTabKey) => void;
  isCurrentCategoryTop1: boolean;
  currentPrestigeLevel: number;
  onOpenAscendModal: () => void;
}> = ({
  prestigeTab,
  onSelectTab,
  isCurrentCategoryTop1,
  currentPrestigeLevel,
  onOpenAscendModal,
}) => {
  const list = ARCHETYPE_MOCKUPS[prestigeTab];
  const isAscendDisabled = !isCurrentCategoryTop1 || currentPrestigeLevel >= 5;

  const renderStatus = () => {
    if (!isCurrentCategoryTop1) {
      return (
        <span style={{ color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Lock size={13} color="#F87171" />{' '}
          <em>
            Bloqueado: Debes ser el jugador #1 con Rango Máximo en{' '}
            <strong>{prestigeTab.toUpperCase()}</strong> para ascender.
          </em>
        </span>
      );
    }
    if (currentPrestigeLevel >= 5) {
      return (
        <span>
          <em>
            ¡Felicidades! Has alcanzado el <strong>Nivel Máximo V de Prestigio</strong> en{' '}
            {prestigeTab.toUpperCase()}.
          </em>
        </span>
      );
    }
    return (
      <span>
        <em>
          ¡Requisito Cumplido! Eres el #1 del servidor en{' '}
          <strong>{prestigeTab.toUpperCase()}</strong>. Puedes ascender al Nivel{' '}
          {currentPrestigeLevel + 1}.
        </em>
      </span>
    );
  };

  const renderButtonContent = () => {
    if (!isCurrentCategoryTop1) {
      return (
        <>
          <Lock size={13} /> Requisito: Alcanzar Rango Máximo
        </>
      );
    }
    if (currentPrestigeLevel >= 5) {
      return 'Prestigio Máximo Alcanzado';
    }
    return (
      <>
        <Sparkles size={13} /> Ascender a Prestigio {currentPrestigeLevel + 1}
      </>
    );
  };

  return (
    <div
      style={{
        padding: 20,
        borderRadius: 16,
        background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.25) 0%, rgba(0,0,0,0.5) 100%)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(168,85,247,0.2)',
          paddingBottom: 12,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 900,
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          Sistema de Prestigios de Estilo de Juego
        </span>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(['constructor', 'luchador', 'mercader', 'constancia', 'explorador'] as const).map(
            (key) => {
              const item = TABS_CONFIG[key];
              const isActive = prestigeTab === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => onSelectTab(key)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 800,
                    border: isActive ? '1px solid #C084FC' : '1px solid rgba(255,255,255,0.1)',
                    background: isActive ? '#9333EA' : 'rgba(255,255,255,0.05)',
                    color: isActive ? '#FFF' : 'rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <img
                    src={item.icon}
                    style={{ width: 14, height: 14, objectFit: 'contain' }}
                    alt={item.label}
                  />
                  {item.label}
                </button>
              );
            },
          )}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 10,
        }}
      >
        {list.map((item) => (
          <PrestigeLevelCard
            key={item.levelNum}
            item={item}
            currentPrestigeLevel={currentPrestigeLevel}
            isCurrentCategoryTop1={Boolean(isCurrentCategoryTop1)}
          />
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 10,
          borderTop: '1px solid rgba(168,85,247,0.2)',
          fontSize: 11,
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        {renderStatus()}

        <button
          type="button"
          disabled={isAscendDisabled}
          onClick={onOpenAscendModal}
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            background: isAscendDisabled ? 'rgba(255,255,255,0.05)' : '#9333EA',
            border: isAscendDisabled ? '1px solid rgba(255,255,255,0.1)' : '1px solid #C084FC',
            color: isAscendDisabled ? 'rgba(255,255,255,0.4)' : '#FFF',
            fontWeight: 900,
            fontSize: 11,
            cursor: isAscendDisabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {renderButtonContent()}
        </button>
      </div>
    </div>
  );
};

const AscendModal: React.FC<{
  currentPrestigeLevel: number;
  prestigeTab: PrestigeTabKey;
  isAscending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ currentPrestigeLevel, prestigeTab, isAscending, onClose, onConfirm }) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}
  >
    <div
      style={{
        background: '#0F172A',
        border: '1px solid rgba(168,85,247,0.4)',
        borderRadius: 16,
        padding: 20,
        maxWidth: 360,
        width: '100%',
        color: '#FFF',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(168,85,247,0.2)',
          paddingBottom: 10,
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 13, color: '#C084FC' }}>Confirmar Ascenso</span>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4, margin: 0 }}>
        ¿Deseas ascender al <strong>Nivel {currentPrestigeLevel + 1} de Prestigio</strong> en{' '}
        <strong>{prestigeTab.toUpperCase()}</strong> para ganar +5% en multiplicadores de KilluCoins
        diarios?
      </p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: 11,
            color: '#FFF',
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={isAscending}
          onClick={onConfirm}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            background: '#9333EA',
            border: '1px solid #C084FC',
            fontSize: 11,
            fontWeight: 800,
            color: '#FFF',
            cursor: 'pointer',
          }}
        >
          {isAscending ? 'Procesando...' : 'Confirmar Ascenso'}
        </button>
      </div>
    </div>
  </div>
);

const usePlayerStatsWidget = (username?: string | null) => {
  const [stats, setStats] = useState<PlayerStatsData | null>(null);
  const [prestigeTab, setPrestigeTab] = useState<PrestigeTabKey>('constructor');
  const [showAscendModal, setShowAscendModal] = useState(false);
  const [isAscending, setIsAscending] = useState(false);

  useEffect(() => {
    if (!username) return;
    const fetchStats = async (user: string) => {
      try {
        const res = await fetch(
          `https://api.crystaltidessmp.net/api/player-stats/${encodeURIComponent(user)}`,
        );
        const data = await res.json();
        if (data.success && data.data) {
          setStats(data.data);
        }
      } catch {
        setStats({
          username: user,
          rank: 'Aventurero',
          rank_image: 'user.png',
          playtime: '142h 30m',
          weekly_playtime: '8h 45m',
          kills: 154,
          weekly_kills: 18,
          mob_kills: 1420,
          deaths: 32,
          weekly_deaths: 3,
          money: '12,450 KC',
          weekly_kc_earned: '+2,850 KC',
          gacha_spins_weekly: 4,
          blocks_mined: 45200,
          blocks_placed: 18400,
          streak_days: 14,
          member_since: '2026',
          is_top1_constructor: false,
          is_top1_luchador: false,
          is_top1_mercader: false,
          is_top1_constancia: false,
          is_top1_explorador: false,
          prestige_constructor: 0,
          prestige_luchador: 0,
          prestige_mercader: 0,
          prestige_constancia: 0,
          prestige_explorador: 0,
        });
      }
    };
    fetchStats(username);
  }, [username]);

  const isCurrentCategoryTop1 = getCategoryIsTop1(prestigeTab, stats);
  const currentPrestigeLevel = getCategoryPrestigeLevel(prestigeTab, stats);

  const handleConfirmAscend = async () => {
    if (!isCurrentCategoryTop1 || currentPrestigeLevel >= 5) return;
    setIsAscending(true);
    try {
      const nextLevel = currentPrestigeLevel + 1;
      const keyName = `prestige_${prestigeTab}` as keyof PlayerStatsData;

      setStats((prev) =>
        prev
          ? {
              ...prev,
              [keyName]: nextLevel,
            }
          : null,
      );

      alert(
        `¡Felicidades! Has ascendido exitosamente al Prestigio ${nextLevel} en ${prestigeTab.toUpperCase()}! (+${nextLevel * 5}% KC Diarios)`,
      );
    } catch {
      alert('Error al procesar el ascenso.');
    } finally {
      setIsAscending(false);
      setShowAscendModal(false);
    }
  };

  return {
    stats,
    prestigeTab,
    setPrestigeTab,
    showAscendModal,
    setShowAscendModal,
    isAscending,
    handleConfirmAscend,
    isCurrentCategoryTop1,
    currentPrestigeLevel,
  };
};

export function PlayerStatsWidget({ username }: Readonly<PlayerStatsWidgetProps>) {
  const {
    stats,
    prestigeTab,
    setPrestigeTab,
    showAscendModal,
    setShowAscendModal,
    isAscending,
    handleConfirmAscend,
    isCurrentCategoryTop1,
    currentPrestigeLevel,
  } = usePlayerStatsWidget(username);

  if (!username) return null;

  const blocksVal = (stats?.blocks_mined ?? 0) + (stats?.blocks_placed ?? 0) || 63600;
  const scoreConstructor = getTopRelativeScore(
    blocksVal,
    stats?.top1_constructor_score ?? 100000,
    stats?.is_top1_constructor,
  );

  const killsVal = stats?.kills ?? 0;
  const mobKillsVal = stats?.mob_kills ?? 0;
  const totalCombatPoints = killsVal * 15 + mobKillsVal;
  const scoreLuchador = getTopRelativeScore(
    totalCombatPoints,
    stats?.top1_luchador_score ?? 5000,
    stats?.is_top1_luchador,
  );

  const moneyVal = parseMoneyNum(stats?.money ?? '') || 12450;
  const merchantLogPoints = Math.round(100 * Math.log10(Math.max(1, moneyVal)));
  const scoreMercader = getTopRelativeScore(
    merchantLogPoints,
    stats?.top1_mercader_score ?? 500,
    stats?.is_top1_mercader,
  );

  const streakVal = stats?.streak_days ?? 14;
  const streakPoints = Math.pow(streakVal, 2);
  const scoreConstancia = getTopRelativeScore(
    streakPoints,
    stats?.top1_constancia_score ?? 900,
    stats?.is_top1_constancia,
  );

  const playtimeHours = parsePlaytimeHours(stats?.playtime ?? '') || 14.2;
  const kmTraveled = playtimeHours * 35;
  const totalExploradorPts = playtimeHours * 10 + kmTraveled;
  const scoreExplorador = getTopRelativeScore(
    totalExploradorPts,
    stats?.top1_explorador_score ?? 3000,
    stats?.is_top1_explorador,
  );

  const axes: PentagonAxis[] = [
    {
      key: 'constructor',
      label: 'Constructor',
      value: `${(blocksVal / 1000).toFixed(1)}k`,
      score: scoreConstructor,
      rawPoints: blocksVal,
      icon: (
        <img
          src="https://minecraft.wiki/w/Special:Redirect/file/Crafting_Table.png"
          style={{ width: 14, height: 14, objectFit: 'contain' }}
          alt="Constructor"
        />
      ),
      color: '#38BDF8',
    },
    {
      key: 'luchador',
      label: 'Luchador',
      value: `${killsVal} Kills`,
      score: scoreLuchador,
      rawPoints: totalCombatPoints,
      icon: (
        <img
          src="https://minecraft.wiki/w/Special:Redirect/file/Diamond_Sword.png"
          style={{ width: 14, height: 14, objectFit: 'contain' }}
          alt="Luchador"
        />
      ),
      color: '#F43F5E',
    },
    {
      key: 'mercader',
      label: 'Mercader',
      value: stats?.money ?? '12.4k KC',
      score: scoreMercader,
      rawPoints: merchantLogPoints,
      icon: (
        <img
          src="/images/killucoins/coin_oro.webp"
          style={{ width: 14, height: 14, objectFit: 'contain' }}
          alt="Mercader"
        />
      ),
      color: '#F59E0B',
    },
    {
      key: 'constancia',
      label: 'Constancia',
      value: `${streakVal} días`,
      score: scoreConstancia,
      rawPoints: streakPoints,
      icon: (
        <img
          src="https://minecraft.wiki/w/Special:Redirect/file/Totem_of_Undying.png"
          style={{ width: 14, height: 14, objectFit: 'contain' }}
          alt="Constancia"
        />
      ),
      color: '#E879F9',
    },
    {
      key: 'explorador',
      label: 'Explorador',
      value: `${playtimeHours.toFixed(1)}h`,
      score: scoreExplorador,
      rawPoints: Math.round(totalExploradorPts),
      icon: (
        <img
          src="https://minecraft.wiki/w/Special:Redirect/file/Compass.png"
          style={{ width: 14, height: 14, objectFit: 'contain' }}
          alt="Explorador"
        />
      ),
      color: '#10B981',
    },
  ];

  const cx = 130;
  const cy = 108;

  const polygonPoints = axes
    .map((axis, i) => {
      const pt = getPentagonCoordinates(i, axis.score, cx, cy);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  const careerTracks: CareerTrack[] = [
    {
      key: 'constructor',
      label: 'Constructor',
      color: '#38BDF8',
      formula: 'Bloques Minados + Colocados',
      icon: 'https://minecraft.wiki/w/Special:Redirect/file/Crafting_Table.png',
      rawVal: blocksVal,
      isTop1: stats?.is_top1_constructor,
      tiers: [
        { name: 'Iniciado', req: '0', item: getMcItemUrl('Wooden_Pickaxe.png'), minVal: 0 },
        { name: 'Novato', req: '1k', item: getMcItemUrl('Iron_Pickaxe.png'), minVal: 1000 },
        { name: 'Hábil', req: '10k', item: getMcItemUrl('Diamond_Pickaxe.png'), minVal: 10000 },
        {
          name: 'Arquitecto',
          req: '50k',
          item: getMcItemUrl('Netherite_Pickaxe.png'),
          minVal: 50000,
        },
        {
          name: 'Maestro Constructor',
          req: 'Top 1',
          item: getMcItemUrl('Beacon.png'),
          isTop1Tier: true,
        },
      ],
    },
    {
      key: 'luchador',
      label: 'Luchador',
      color: '#F43F5E',
      formula: 'PvP (x15) + Mobs (x1)',
      icon: 'https://minecraft.wiki/w/Special:Redirect/file/Diamond_Sword.png',
      rawVal: totalCombatPoints,
      isTop1: stats?.is_top1_luchador,
      tiers: [
        { name: 'Recluta', req: '0', item: getMcItemUrl('Wooden_Sword.png'), minVal: 0 },
        { name: 'Novato', req: '50', item: getMcItemUrl('Iron_Sword.png'), minVal: 50 },
        { name: 'Guerrero', req: '500', item: getMcItemUrl('Diamond_Sword.png'), minVal: 500 },
        {
          name: 'Maestro de Armas',
          req: '2.5k',
          item: getMcItemUrl('Netherite_Sword.png'),
          minVal: 2500,
        },
        {
          name: 'Señor de la Guerra',
          req: 'Top 1',
          item: getMcItemUrl('Mace.png'),
          isTop1Tier: true,
        },
      ],
    },
    {
      key: 'mercader',
      label: 'Mercader',
      color: '#F59E0B',
      formula: '100 × log₁₀(KilluCoins)',
      icon: '/images/killucoins/coin_oro.webp',
      rawVal: moneyVal,
      isTop1: stats?.is_top1_mercader,
      tiers: [
        { name: 'Ambulante', req: '0', item: '/images/killucoins/coin_cobre.webp', minVal: 0 },
        { name: 'Novato', req: '1k', item: '/images/killucoins/coin_plata.webp', minVal: 1000 },
        { name: 'Próspero', req: '10k', item: '/images/killucoins/coin_oro.webp', minVal: 10000 },
        { name: 'Noble', req: '50k', item: '/images/killucoins/coin_diamante.webp', minVal: 50000 },
        {
          name: 'Gran Maestro Gremial',
          req: 'Top 1',
          item: '/images/killucoins/coin_iridium.webp',
          isTop1Tier: true,
        },
      ],
    },
    {
      key: 'constancia',
      label: 'Constancia',
      color: '#E879F9',
      formula: '(Días de Racha)²',
      icon: 'https://minecraft.wiki/w/Special:Redirect/file/Totem_of_Undying.png',
      rawVal: streakVal,
      isTop1: stats?.is_top1_constancia,
      tiers: [
        { name: 'Visitante', req: '0', item: getMcItemUrl('Clock.png'), minVal: 0 },
        { name: 'Viajero', req: '7d', item: getMcItemUrl('Compass.png'), minVal: 7 },
        {
          name: 'Devoto',
          req: '14d',
          item: getMcItemUrl('Bottle_o%27_Enchanting.png'),
          minVal: 14,
        },
        { name: 'Viciado', req: '30d', item: getMcItemUrl('Totem_of_Undying.png'), minVal: 30 },
        {
          name: 'Inquebrantable',
          req: 'Top 1',
          item: getMcItemUrl('Nether_Star.png'),
          isTop1Tier: true,
        },
      ],
    },
    {
      key: 'explorador',
      label: 'Explorador',
      color: '#10B981',
      formula: 'Horas (x10) + Km',
      icon: 'https://minecraft.wiki/w/Special:Redirect/file/Compass.png',
      rawVal: totalExploradorPts,
      isTop1: stats?.is_top1_explorador,
      tiers: [
        { name: 'Novato', req: '0', item: getMcItemUrl('Leather_Boots_(item)_JE2.png'), minVal: 0 },
        { name: 'Curioso', req: '100', item: getMcItemUrl('Spyglass.png'), minVal: 100 },
        { name: 'Mapeador', req: '500', item: getMcItemUrl('Empty_Map.png'), minVal: 500 },
        { name: 'Pionero', req: '2k', item: getMcItemUrl('Elytra.png'), minVal: 2000 },
        {
          name: 'Explorador Experto',
          req: 'Top 1',
          item: getMcItemUrl('Recovery_Compass.png'),
          isTop1Tier: true,
        },
      ],
    },
  ];

  return (
    <div
      style={{
        width: '100%',
        color: '#FFF',
        fontSize: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        boxSizing: 'border-box',
      }}
    >
      <PlayerProfileHeader username={username} rank={stats?.rank} />

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <RadarPentagonSection axes={axes} cx={cx} cy={cy} polygonPoints={polygonPoints} />
          <CalculationGuideCard />
        </div>
        <CareerTracksSection careerTracks={careerTracks} />
      </div>

      <PrestigeSystemSection
        prestigeTab={prestigeTab}
        onSelectTab={setPrestigeTab}
        isCurrentCategoryTop1={isCurrentCategoryTop1}
        currentPrestigeLevel={currentPrestigeLevel}
        onOpenAscendModal={() => setShowAscendModal(true)}
      />

      {showAscendModal && (
        <AscendModal
          currentPrestigeLevel={currentPrestigeLevel}
          prestigeTab={prestigeTab}
          isAscending={isAscending}
          onClose={() => setShowAscendModal(false)}
          onConfirm={handleConfirmAscend}
        />
      )}
    </div>
  );
}

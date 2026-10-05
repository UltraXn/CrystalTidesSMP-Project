import { useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

export interface PlayerStatsWidgetProps {
  username?: string | null;
}

type ArchetypeKey = 'constructor' | 'luchador' | 'mercader' | 'constancia' | 'explorador';

interface PentagonAxis {
  key: ArchetypeKey;
  label: string;
  value: string | number;
  score: number;
  rawPoints?: number;
  icon: ReactNode;
  color: string;
}

interface CareerTier {
  name: string;
  req: string;
  item: string;
  minVal?: number;
  isTop1Tier?: boolean;
}

interface CareerTrack {
  key: ArchetypeKey;
  label: string;
  color: string;
  formula: string;
  icon: string;
  rawVal: number;
  isTop1?: boolean;
  tiers: CareerTier[];
}

interface PrestigeMockup {
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

const UI_COLORS = {
  CARD_BG: 'rgba(15, 23, 42, 0.75)',
  CARD_BORDER: '1px solid rgba(255,255,255,0.08)',
  TEAL_ACCENT: '#2DD4BF',
  PURPLE_PRIMARY: '#9333EA',
  PURPLE_LIGHT: '#C084FC',
  PURPLE_BORDER_FADED: '1px solid rgba(168,85,247,0.2)',
  BORDER_SUBTLE: '1px solid rgba(255,255,255,0.1)',
  TEXT_MUTED: 'rgba(255,255,255,0.5)',
  TEXT_FAINT: 'rgba(255,255,255,0.4)',
} as const;

const ARCHETYPE_ICONS = {
  CONSTRUCTOR: 'https://minecraft.wiki/w/Special:Redirect/file/Crafting_Table.png',
  LUCHADOR: 'https://minecraft.wiki/w/Special:Redirect/file/Diamond_Sword.png',
  MERCADER: '/images/killucoins/coin_oro.webp',
  CONSTANCIA: 'https://minecraft.wiki/w/Special:Redirect/file/Totem_of_Undying.png',
  EXPLORADOR: 'https://minecraft.wiki/w/Special:Redirect/file/Compass.png',
} as const;

const getMcItemUrl = (filename: string): string =>
  `https://minecraft.wiki/w/Special:Redirect/file/${filename}`;

const parsePlaytimeHours = (ptStr: string): number => {
  if (!ptStr) return 0;
  let hours = 0;
  for (const part of ptStr.trim().split(/\s+/)) {
    if (part.endsWith('h')) {
      hours += Number.parseFloat(part.slice(0, -1)) || 0;
    } else if (part.endsWith('m')) {
      hours += (Number.parseFloat(part.slice(0, -1)) || 0) / 60;
    }
  }
  return hours;
};

const parseMoneyNum = (moneyStr: string): number => {
  if (!moneyStr) return 0;
  return Number.parseFloat(moneyStr.replace(/[^0-9.-]+/g, '')) || 0;
};

const getTopRelativeScore = (val: number, top1Val?: number, isTop1?: boolean): number => {
  if (isTop1) return 100;
  const benchmark = Math.max(top1Val || 100000, 100);
  return Math.min(99, Math.max(10, Math.round((val / benchmark) * 100)));
};

const RADAR_CENTER_X = 130;
const RADAR_CENTER_Y = 108;
const RADAR_RADIUS = 75;

const getRadarCoordinates = (index: number, scorePercent: number) => {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
  const r = (RADAR_RADIUS * scorePercent) / 100;
  return {
    x: RADAR_CENTER_X + r * Math.cos(angle),
    y: RADAR_CENTER_Y + r * Math.sin(angle),
  };
};

const DEFAULT_FALLBACK_STATS: Omit<PlayerStatsData, 'username'> = {
  rank: 'Aventurero',
  rank_image: 'user.png',
  playtime: '142h 30m',
  weekly_playtime: '8h 45m',
  kills: 154,
  weekly_kills: 18,
  mob_kills: 1420,
  deaths: 23,
  weekly_deaths: 3,
  money: '1,250 KC',
  weekly_kc_earned: '+350 KC',
  gacha_spins_weekly: 4,
  blocks_mined: 38900,
  blocks_placed: 45210,
  member_since: '14 de Febrero, 2026',
};

const SPACE_BETWEEN = 'space-between';

const PRESTIGE_TIER_BASE: Record<
  number,
  {
    level: string;
    tag: string;
    bonus: string;
    color: string;
    border: string;
    bg: string;
  }
> = {
  1: {
    level: '⭐ Prestigio I',
    tag: '[P1]',
    bonus: '+5% KC Diarios',
    color: '#F59E0B',
    border: 'rgba(245,158,11,0.3)',
    bg: 'rgba(245,158,11,0.1)',
  },
  2: {
    level: '⭐⭐ Prestigio II',
    tag: '[P2]',
    bonus: '+10% KC Diarios',
    color: '#CBD5E1',
    border: 'rgba(203,213,225,0.3)',
    bg: 'rgba(203,213,225,0.1)',
  },
  3: {
    level: '⭐⭐⭐ Prestigio III',
    tag: '[P3]',
    bonus: '+15% KC',
    color: '#FACC15',
    border: 'rgba(250,204,21,0.3)',
    bg: 'rgba(250,204,21,0.1)',
  },
  4: {
    level: '⭐⭐⭐⭐ Prestigio IV',
    tag: '[P4]',
    bonus: '+20% KC',
    color: '#22D3EE',
    border: 'rgba(34,211,238,0.3)',
    bg: 'rgba(34,211,238,0.1)',
  },
  5: {
    level: '💎 Prestigio V',
    tag: '[P5]',
    bonus: '+25% KC',
    color: '#E879F9',
    border: 'rgba(232,121,249,0.4)',
    bg: 'rgba(232,121,249,0.15)',
  },
};

function createPrestigeMockup(
  levelNum: 1 | 2 | 3 | 4 | 5,
  rankName: string,
  item: string,
  customBonus?: string,
): PrestigeMockup {
  const base = PRESTIGE_TIER_BASE[levelNum];
  return {
    levelNum,
    level: base.level,
    rankName,
    bonus: customBonus ?? base.bonus,
    tag: base.tag,
    color: base.color,
    border: base.border,
    bg: base.bg,
    item,
  };
}

const ARCHETYPE_MOCKUPS: Record<ArchetypeKey, PrestigeMockup[]> = {
  constructor: [
    createPrestigeMockup(1, 'Iniciado de Piedra', getMcItemUrl('Cobblestone.png')),
    createPrestigeMockup(2, 'Constructor Consagrado', getMcItemUrl('Iron_Pickaxe.png')),
    createPrestigeMockup(3, 'Gran Arquitecto', getMcItemUrl('Golden_Pickaxe.png')),
    createPrestigeMockup(4, 'Maestro Constructor', getMcItemUrl('Diamond_Pickaxe.png')),
    createPrestigeMockup(5, 'Arquitecto Mítico', getMcItemUrl('Beacon.png'), '+25% KC + Title'),
  ],
  luchador: [
    createPrestigeMockup(1, 'Guerrero de Bronce', getMcItemUrl('Wooden_Sword.png')),
    createPrestigeMockup(2, 'Campeón de Batalla', getMcItemUrl('Iron_Sword.png')),
    createPrestigeMockup(3, 'Señor de Guerra', getMcItemUrl('Golden_Sword.png')),
    createPrestigeMockup(4, 'Maestro de Armas', getMcItemUrl('Diamond_Sword.png')),
    createPrestigeMockup(5, 'Gladiador Supremo', getMcItemUrl('Mace.png'), '+25% KC + Espadas'),
  ],
  mercader: [
    createPrestigeMockup(1, 'Mercader Próspero', '/images/killucoins/coin_cobre.webp'),
    createPrestigeMockup(2, 'Comerciante de Élite', '/images/killucoins/coin_plata.webp'),
    createPrestigeMockup(3, 'Barón Financiero', '/images/killucoins/coin_oro.webp'),
    createPrestigeMockup(4, 'Gran Maestro Gremial', '/images/killucoins/coin_diamante.webp'),
    createPrestigeMockup(5, 'Magnate Legendario', '/images/killucoins/coin_iridium.webp'),
  ],
  constancia: [
    createPrestigeMockup(1, 'Devoto del Servidor', getMcItemUrl('Clock.png')),
    createPrestigeMockup(2, 'Pilar Inquebrantable', getMcItemUrl('Compass.png')),
    createPrestigeMockup(3, 'Guardián de Racha', getMcItemUrl('Bottle_o%27_Enchanting.png')),
    createPrestigeMockup(4, 'Leyenda Inquebrantable', getMcItemUrl('Totem_of_Undying.png')),
    createPrestigeMockup(5, 'Titán Eterno', getMcItemUrl('Nether_Star.png'), '+25% KC + Totem'),
  ],
  explorador: [
    createPrestigeMockup(1, 'Navegante de Reinos', getMcItemUrl('Leather_Boots_(item)_JE2.png')),
    createPrestigeMockup(2, 'Mapeador Ancestral', getMcItemUrl('Spyglass.png')),
    createPrestigeMockup(3, 'Pionero del Horizonte', getMcItemUrl('Empty_Map.png')),
    createPrestigeMockup(4, 'Explorador Experto', getMcItemUrl('Elytra.png')),
    createPrestigeMockup(
      5,
      'Conquistador de Mundos',
      getMcItemUrl('Recovery_Compass.png'),
      '+25% KC + Trail',
    ),
  ],
};

const PRESTIGE_TABS_CONFIG: Record<ArchetypeKey, { label: string; icon: string }> = {
  constructor: { label: 'Constructor', icon: ARCHETYPE_ICONS.CONSTRUCTOR },
  luchador: { label: 'Luchador', icon: getMcItemUrl('Netherite_Sword.png') },
  mercader: { label: 'Mercader', icon: ARCHETYPE_ICONS.MERCADER },
  constancia: { label: 'Constancia', icon: ARCHETYPE_ICONS.CONSTANCIA },
  explorador: { label: 'Explorador', icon: getMcItemUrl('Recovery_Compass.png') },
};

function buildAxes(stats?: PlayerStatsData): PentagonAxis[] {
  const blocksVal = (stats?.blocks_mined ?? 0) + (stats?.blocks_placed ?? 0) || 63600;
  const scoreConstructor = getTopRelativeScore(
    blocksVal,
    stats?.top1_constructor_score || 100000,
    stats?.is_top1_constructor,
  );

  const killsVal = stats?.kills ?? 0;
  const mobKillsVal = stats?.mob_kills ?? 0;
  const totalCombatPoints = killsVal * 15 + mobKillsVal;
  const scoreLuchador = getTopRelativeScore(
    totalCombatPoints,
    stats?.top1_luchador_score || 5000,
    stats?.is_top1_luchador,
  );

  const moneyVal = parseMoneyNum(stats?.money || '') || 12450;
  const merchantLogPoints = Math.round(100 * Math.log10(Math.max(1, moneyVal)));
  const scoreMercader = getTopRelativeScore(
    merchantLogPoints,
    stats?.top1_mercader_score || 500,
    stats?.is_top1_mercader,
  );

  const streakVal = stats?.streak_days ?? 14;
  const streakPoints = Math.pow(streakVal, 2);
  const scoreConstancia = getTopRelativeScore(
    streakPoints,
    stats?.top1_constancia_score || 900,
    stats?.is_top1_constancia,
  );

  const playtimeHours = parsePlaytimeHours(stats?.playtime || '') || 14.2;
  const kmTraveled = playtimeHours * 35;
  const totalExploradorPts = playtimeHours * 10 + kmTraveled;
  const scoreExplorador = getTopRelativeScore(
    totalExploradorPts,
    stats?.top1_explorador_score || 3000,
    stats?.is_top1_explorador,
  );

  return [
    {
      key: 'constructor',
      label: 'Constructor',
      value: `${(blocksVal / 1000).toFixed(1)}k`,
      score: scoreConstructor,
      rawPoints: blocksVal,
      icon: (
        <img
          src={ARCHETYPE_ICONS.CONSTRUCTOR}
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
          src={ARCHETYPE_ICONS.LUCHADOR}
          style={{ width: 14, height: 14, objectFit: 'contain' }}
          alt="Luchador"
        />
      ),
      color: '#F43F5E',
    },
    {
      key: 'mercader',
      label: 'Mercader',
      value: stats?.money || '12.4k KC',
      score: scoreMercader,
      rawPoints: merchantLogPoints,
      icon: (
        <img
          src={ARCHETYPE_ICONS.MERCADER}
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
          src={ARCHETYPE_ICONS.CONSTANCIA}
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
          src={ARCHETYPE_ICONS.EXPLORADOR}
          style={{ width: 14, height: 14, objectFit: 'contain' }}
          alt="Explorador"
        />
      ),
      color: '#10B981',
    },
  ];
}

function buildCareerTracks(stats?: PlayerStatsData): CareerTrack[] {
  const blocksVal = (stats?.blocks_mined ?? 0) + (stats?.blocks_placed ?? 0) || 63600;
  const killsVal = stats?.kills ?? 0;
  const mobKillsVal = stats?.mob_kills ?? 0;
  const combatPoints = killsVal * 15 + mobKillsVal;
  const moneyVal = parseMoneyNum(stats?.money || '') || 12450;
  const streakVal = stats?.streak_days ?? 14;
  const playtimeHours = parsePlaytimeHours(stats?.playtime || '') || 14.2;
  const totalExploradorPts = playtimeHours * 10 + playtimeHours * 35;

  return [
    {
      key: 'constructor',
      label: 'Constructor',
      color: '#38BDF8',
      formula: 'Bloques Minados + Colocados',
      icon: ARCHETYPE_ICONS.CONSTRUCTOR,
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
      icon: ARCHETYPE_ICONS.LUCHADOR,
      rawVal: combatPoints,
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
      icon: ARCHETYPE_ICONS.MERCADER,
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
      icon: ARCHETYPE_ICONS.CONSTANCIA,
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
      icon: ARCHETYPE_ICONS.EXPLORADOR,
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
}

function getArchetypeTop1Status(stats: PlayerStatsData | undefined, tab: ArchetypeKey): boolean {
  const top1Map: Record<ArchetypeKey, boolean | undefined> = {
    constructor: stats?.is_top1_constructor,
    luchador: stats?.is_top1_luchador,
    mercader: stats?.is_top1_mercader,
    constancia: stats?.is_top1_constancia,
    explorador: stats?.is_top1_explorador,
  };
  return Boolean(top1Map[tab]);
}

function getArchetypePrestigeLevel(stats: PlayerStatsData | undefined, tab: ArchetypeKey): number {
  const prestigeMap: Record<ArchetypeKey, number | undefined> = {
    constructor: stats?.prestige_constructor,
    luchador: stats?.prestige_luchador,
    mercader: stats?.prestige_mercader,
    constancia: stats?.prestige_constancia,
    explorador: stats?.prestige_explorador,
  };
  return prestigeMap[tab] ?? 0;
}

function getActiveTierIndex(track: CareerTrack): number {
  if (track.isTop1) return 4;
  for (let i = 3; i >= 0; i--) {
    if (track.rawVal >= (track.tiers[i].minVal ?? 0)) {
      return i;
    }
  }
  return 0;
}

function ProfileHeader({ username, rank }: Readonly<{ username: string; rank?: string }>) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: SPACE_BETWEEN,
        padding: '14px 18px',
        borderRadius: 16,
        background: UI_COLORS.CARD_BG,
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
          <div style={{ fontSize: 14, fontWeight: 900, color: UI_COLORS.TEAL_ACCENT }}>
            {username}
          </div>
          <div
            style={{
              fontSize: 11,
              color: UI_COLORS.TEXT_MUTED,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 2,
            }}
          >
            <Shield size={12} color="#38BDF8" /> {rank || 'Aventurero'}
          </div>
        </div>
      </div>
    </div>
  );
}

function RadarGridLevels({ axes }: Readonly<{ axes: PentagonAxis[] }>) {
  return (
    <>
      {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => {
        const gridPts = axes
          .map((_, i) => {
            const pt = getRadarCoordinates(i, scale * 100);
            return `${pt.x},${pt.y}`;
          })
          .join(' ');
        return (
          <polygon
            key={`scale-${scale}`}
            points={gridPts}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
            strokeDasharray={scale === 1.0 ? 'none' : '2,2'}
          />
        );
      })}
      {axes.map((axis, i) => {
        const endPt = getRadarCoordinates(i, 100);
        return (
          <line
            key={`axis-line-${axis.key}`}
            x1={RADAR_CENTER_X}
            y1={RADAR_CENTER_Y}
            x2={endPt.x}
            y2={endPt.y}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
        );
      })}
    </>
  );
}

function RadarChartSvg({ axes }: Readonly<{ axes: PentagonAxis[] }>) {
  const polygonPoints = axes
    .map((axis, i) => {
      const pt = getRadarCoordinates(i, axis.score);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  return (
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
        <RadarGridLevels axes={axes} />
        <polygon
          points={polygonPoints}
          fill="rgba(45, 212, 191, 0.28)"
          stroke={UI_COLORS.TEAL_ACCENT}
          strokeWidth="2.5"
          style={{ filter: 'drop-shadow(0 0 8px rgba(45,212,191,0.5))' }}
        />
        {axes.map((axis, i) => {
          const pt = getRadarCoordinates(i, axis.score);
          return (
            <circle
              key={`point-${axis.key}`}
              cx={pt.x}
              cy={pt.y}
              r="4.5"
              fill={axis.color}
              stroke="#0F172A"
              strokeWidth="1.5"
            />
          );
        })}
        {axes.map((axis, i) => {
          const labelPt = getRadarCoordinates(i, 122);
          return (
            <text
              key={`label-${axis.key}`}
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
  );
}

function RadarValuesGrid({ axes }: Readonly<{ axes: PentagonAxis[] }>) {
  return (
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
          key={`val-${axis.key}`}
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
              color: UI_COLORS.TEXT_MUTED,
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
  );
}

function RadarStatsCard({ axes }: Readonly<{ axes: PentagonAxis[] }>) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 16,
        background: UI_COLORS.CARD_BG,
        border: UI_COLORS.CARD_BORDER,
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
          color: UI_COLORS.TEXT_MUTED,
          marginBottom: 10,
        }}
      >
        📊 Radar de Estilo de Juego (Histórico Total)
      </div>
      <RadarChartSvg axes={axes} />
      <RadarValuesGrid axes={axes} />
    </div>
  );
}

function ScoringGuideCard() {
  const guideItems = [
    {
      label: 'Constructor',
      color: '#38BDF8',
      icon: ARCHETYPE_ICONS.CONSTRUCTOR,
      desc: 'Bloques minados + colocados en tu historia.',
    },
    {
      label: 'Luchador',
      color: '#F43F5E',
      icon: ARCHETYPE_ICONS.LUCHADOR,
      desc: '15 pts por kill PvP a jugadores y 1 pt por mob hostil.',
    },
    {
      label: 'Mercader',
      color: '#F59E0B',
      icon: ARCHETYPE_ICONS.MERCADER,
      desc: 'Escala logarítmica (100 × log₁₀(KilluCoins)).',
    },
    {
      label: 'Constancia',
      color: '#E879F9',
      icon: ARCHETYPE_ICONS.CONSTANCIA,
      desc: 'Crecimiento cuadrático (Días de Racha)².',
    },
    {
      label: 'Explorador',
      color: '#10B981',
      icon: ARCHETYPE_ICONS.EXPLORADOR,
      desc: '10 pts por hora de juego + 1 pt por km recorrido.',
    },
  ];

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 16,
        background: UI_COLORS.CARD_BG,
        border: UI_COLORS.CARD_BORDER,
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
          color: UI_COLORS.TEAL_ACCENT,
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <HelpCircle size={14} /> ¿Cómo se calcula cada Puntuación?
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {guideItems.map((item) => (
          <div
            key={`guide-${item.label}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <img
              src={item.icon}
              style={{ width: 14, height: 14, objectFit: 'contain' }}
              alt={item.label}
            />
            <strong style={{ color: item.color }}>{item.label}:</strong> {item.desc}
          </div>
        ))}
      </div>
    </div>
  );
}

function getPillVisuals(isCurrent: boolean, isTop1Tier: boolean | undefined, color: string) {
  if (!isCurrent) {
    return {
      bg: 'rgba(255, 255, 255, 0.04)',
      border: UI_COLORS.CARD_BORDER,
      color: UI_COLORS.TEXT_MUTED,
      glow: {},
    };
  }

  const bg = isTop1Tier ? `${color}30` : `${color}20`;
  const textColor = isTop1Tier ? '#FFF' : color;
  return {
    bg,
    border: `1.5px solid ${color}`,
    color: textColor,
    glow: { boxShadow: `0 0 12px ${color}60` },
  };
}

function CareerTrackRow({ track }: Readonly<{ track: CareerTrack }>) {
  const currentTierIndex = getActiveTierIndex(track);

  return (
    <div
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: SPACE_BETWEEN }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src={track.icon}
            style={{ width: 16, height: 16, objectFit: 'contain' }}
            alt={track.label}
          />
          <span style={{ fontSize: 12, fontWeight: 900, color: track.color }}>{track.label}</span>
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
          const visuals = getPillVisuals(isCurrent, tier.isTop1Tier, track.color);

          return (
            <div
              key={`tier-${tier.name}`}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {tIdx > 0 && (
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', padding: '0 1px' }}>
                  →
                </span>
              )}
              <div
                style={{
                  padding: '4px 8px',
                  borderRadius: 8,
                  background: visuals.bg,
                  border: visuals.border,
                  color: visuals.color,
                  fontSize: 10,
                  fontWeight: isCurrent ? 900 : 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  ...visuals.glow,
                }}
              >
                <img
                  src={tier.item}
                  style={{ width: 13, height: 13, objectFit: 'contain' }}
                  alt={tier.name}
                />
                <span>{tier.name}</span>
                {!tier.isTop1Tier && (
                  <span style={{ fontSize: 8.5, opacity: 0.65 }}>({tier.req})</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CareerTracksCard({ tracks }: Readonly<{ tracks: CareerTrack[] }>) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 16,
        background: UI_COLORS.CARD_BG,
        border: UI_COLORS.CARD_BORDER,
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
          color: UI_COLORS.TEAL_ACCENT,
          borderBottom: UI_COLORS.CARD_BORDER,
          paddingBottom: 10,
        }}
      >
        <Award size={16} /> Líneas de Carrera y Maestría
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {tracks.map((track) => (
          <CareerTrackRow key={`track-${track.key}`} track={track} />
        ))}
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
          🏆 Reglas del Rango Máximo
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
            puntaje. El Duelo 1v1 es exclusivo del Señor de la Guerra.
          </div>
        </div>
      </div>
    </div>
  );
}

function getPrestigeCardStyles(isUnlocked: boolean, isNextTarget: boolean, item: PrestigeMockup) {
  if (isUnlocked) {
    return {
      bg: item.bg,
      border: `1px solid ${item.border}`,
      color: item.color,
      nameColor: '#FFF',
      bonusColor: 'rgba(255,255,255,0.7)',
      tagColor: item.color,
      opacity: 1,
    };
  }

  if (isNextTarget) {
    return {
      bg: 'rgba(147,51,234,0.12)',
      border: `1px solid ${UI_COLORS.PURPLE_LIGHT}`,
      color: UI_COLORS.PURPLE_LIGHT,
      nameColor: '#FFF',
      bonusColor: 'rgba(255,255,255,0.7)',
      tagColor: UI_COLORS.TEXT_FAINT,
      opacity: 1,
    };
  }

  return {
    bg: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.05)',
    color: UI_COLORS.TEXT_MUTED,
    nameColor: UI_COLORS.TEXT_MUTED,
    bonusColor: UI_COLORS.TEXT_FAINT,
    tagColor: UI_COLORS.TEXT_FAINT,
    opacity: 0.45,
  };
}

function PrestigeTierCard({
  item,
  currentPrestigeLevel,
  isTop1,
}: Readonly<{
  item: PrestigeMockup;
  currentPrestigeLevel: number;
  isTop1: boolean;
}>) {
  const isUnlocked = item.levelNum <= currentPrestigeLevel;
  const isNextTarget = isTop1 && item.levelNum === currentPrestigeLevel + 1;
  const isLocked = !isUnlocked && !isNextTarget;
  const styles = getPrestigeCardStyles(isUnlocked, isNextTarget, item);

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 12,
        background: styles.bg,
        border: styles.border,
        opacity: styles.opacity,
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
            color: UI_COLORS.TEXT_FAINT,
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
      <span style={{ color: styles.color, fontWeight: 900, fontSize: 11 }}>{item.level}</span>
      <span style={{ fontSize: 11, color: styles.nameColor, fontWeight: 800 }}>
        {item.rankName}
      </span>
      <span style={{ fontSize: 10, color: styles.bonusColor }}>{item.bonus}</span>
      <span
        style={{ fontSize: 9.5, color: styles.tagColor, fontFamily: 'monospace', fontWeight: 700 }}
      >
        {item.tag}
      </span>
    </div>
  );
}

function PrestigeStatusBanner({
  isTop1,
  currentLevel,
  tabName,
}: Readonly<{
  isTop1: boolean;
  currentLevel: number;
  tabName: string;
}>) {
  const upperTab = tabName.toUpperCase();
  if (!isTop1) {
    return (
      <span style={{ color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Lock size={13} color="#F87171" />{' '}
        <em>
          Bloqueado: Debes ser el jugador #1 con Rango Máximo en <strong>{upperTab}</strong> para
          ascender.
        </em>
      </span>
    );
  }

  if (currentLevel >= 5) {
    return (
      <span>
        👑{' '}
        <em>
          ¡Felicidades! Has alcanzado el <strong>Nivel Máximo V de Prestigio</strong> en {upperTab}.
        </em>
      </span>
    );
  }

  return (
    <span>
      ✨{' '}
      <em>
        ¡Requisito Cumplido! Eres el #1 del servidor en <strong>{upperTab}</strong>. Puedes ascender
        al Nivel {currentLevel + 1}.
      </em>
    </span>
  );
}

function AscendTriggerButton({
  isTop1,
  currentLevel,
  onOpenModal,
}: Readonly<{
  isTop1: boolean;
  currentLevel: number;
  onOpenModal: () => void;
}>) {
  const isDisabled = !isTop1 || currentLevel >= 5;

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: 10,
    background: isDisabled ? 'rgba(255,255,255,0.05)' : UI_COLORS.PURPLE_PRIMARY,
    border: isDisabled ? UI_COLORS.BORDER_SUBTLE : `1px solid ${UI_COLORS.PURPLE_LIGHT}`,
    color: isDisabled ? UI_COLORS.TEXT_FAINT : '#FFF',
    fontWeight: 900,
    fontSize: 11,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  const getAriaLabel = () => {
    if (!isTop1) return 'Ascenso bloqueado: debes alcanzar el rango máximo';
    if (currentLevel >= 5) return 'Prestigio máximo alcanzado';
    return `Ascender a prestigio nivel ${currentLevel + 1}`;
  };

  const renderContent = () => {
    if (!isTop1) {
      return (
        <>
          <Lock size={13} /> 🔒 Requisito: Alcanzar Rango Máximo
        </>
      );
    }
    if (currentLevel >= 5) {
      return '👑 Prestigio Máximo Alcanzado';
    }
    return (
      <>
        <Sparkles size={13} /> ⭐ Ascender a Prestigio {currentLevel + 1}
      </>
    );
  };

  return (
    <button
      aria-label={getAriaLabel()}
      type="button"
      disabled={isDisabled}
      onClick={onOpenModal}
      style={buttonStyle}
    >
      {renderContent()}
    </button>
  );
}

function AscendConfirmModal({
  prestigeTab,
  currentLevel,
  isAscending,
  onClose,
  onConfirm,
}: Readonly<{
  prestigeTab: ArchetypeKey;
  currentLevel: number;
  isAscending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}>) {
  return (
    <dialog
      open
      aria-labelledby="ascend-modal-title"
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
        border: 'none',
        margin: 0,
        width: '100vw',
        height: '100vh',
        maxWidth: 'none',
        maxHeight: 'none',
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
            justifyContent: SPACE_BETWEEN,
            borderBottom: UI_COLORS.PURPLE_BORDER_FADED,
            paddingBottom: 10,
          }}
        >
          <span
            id="ascend-modal-title"
            style={{ fontWeight: 800, fontSize: 13, color: UI_COLORS.PURPLE_LIGHT }}
          >
            Confirmar Ascenso ⭐
          </span>
          <button
            aria-label="Cerrar ventana de ascenso"
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
          ¿Deseas ascender al <strong>Nivel {currentLevel + 1} de Prestigio</strong> en{' '}
          <strong>{prestigeTab.toUpperCase()}</strong> para ganar +5% en multiplicadores de
          KilluCoins diarios?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.05)',
              border: UI_COLORS.BORDER_SUBTLE,
              fontSize: 11,
              color: '#FFF',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            aria-label="Confirmar ascenso"
            aria-busy={isAscending}
            type="button"
            disabled={isAscending}
            onClick={onConfirm}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              background: UI_COLORS.PURPLE_PRIMARY,
              border: `1px solid ${UI_COLORS.PURPLE_LIGHT}`,
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
    </dialog>
  );
}

const TAB_KEYS: ArchetypeKey[] = [
  'constructor',
  'luchador',
  'mercader',
  'constancia',
  'explorador',
];

export function PlayerStatsWidget({ username }: Readonly<PlayerStatsWidgetProps>) {
  const [prestigeTab, setPrestigeTab] = useState<ArchetypeKey>('constructor');
  const [showAscendModal, setShowAscendModal] = useState(false);
  const [isAscending, setIsAscending] = useState(false);

  const queryClient = useQueryClient();
  const { data: stats } = useQuery<PlayerStatsData>({
    queryKey: ['playerStats', username],
    queryFn: async () => {
      try {
        const res = await fetch(
          `https://api.crystaltidessmp.net/api/player-stats/${encodeURIComponent(username || '')}`,
        );
        if (!res.ok) throw new Error('Failed to fetch player stats');
        const data = await res.json();
        if (data.success && data.data) return data.data;
        throw new Error('Invalid response format');
      } catch {
        return {
          username: username || '',
          ...DEFAULT_FALLBACK_STATS,
        };
      }
    },
    enabled: Boolean(username),
  });

  if (!username) return null;

  const axes = buildAxes(stats);
  const careerTracks = buildCareerTracks(stats);
  const isCurrentCategoryTop1 = getArchetypeTop1Status(stats, prestigeTab);
  const currentPrestigeLevel = getArchetypePrestigeLevel(stats, prestigeTab);
  const prestigeCards = ARCHETYPE_MOCKUPS[prestigeTab];

  const handleConfirmAscend = async () => {
    if (!isCurrentCategoryTop1 || currentPrestigeLevel >= 5) return;
    setIsAscending(true);
    try {
      const nextLevel = currentPrestigeLevel + 1;
      const keyName = `prestige_${prestigeTab}` as keyof PlayerStatsData;

      queryClient.setQueryData<PlayerStatsData | undefined>(['playerStats', username], (prev) =>
        prev ? { ...prev, [keyName]: nextLevel } : undefined,
      );

      alert(
        `🎉 ¡Felicidades! Has ascendido exitosamente al Prestigio ${nextLevel} en ${prestigeTab.toUpperCase()}! (+${nextLevel * 5}% KC Diarios)`,
      );
    } catch {
      alert('Error al procesar el ascenso.');
    } finally {
      setIsAscending(false);
      setShowAscendModal(false);
    }
  };

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
      <ProfileHeader username={username} rank={stats?.rank} />

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <RadarStatsCard axes={axes} />
          <ScoringGuideCard />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CareerTracksCard tracks={careerTracks} />
        </div>
      </div>

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
            justifyContent: SPACE_BETWEEN,
            borderBottom: UI_COLORS.PURPLE_BORDER_FADED,
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
            ⭐ Sistema de Prestigios de Estilo de Juego
          </span>
          <div
            role="tablist"
            aria-label="Pestañas de arquetipos de prestigio"
            style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}
          >
            {TAB_KEYS.map((key) => {
              const item = PRESTIGE_TABS_CONFIG[key];
              const isActive = prestigeTab === key;
              return (
                <button
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Ver prestigio de arquetipo ${item.label}`}
                  type="button"
                  key={`tab-${key}`}
                  onClick={() => setPrestigeTab(key)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 800,
                    border: isActive
                      ? `1px solid ${UI_COLORS.PURPLE_LIGHT}`
                      : UI_COLORS.BORDER_SUBTLE,
                    background: isActive ? UI_COLORS.PURPLE_PRIMARY : 'rgba(255,255,255,0.05)',
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
            })}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 10,
          }}
        >
          {prestigeCards.map((item) => (
            <PrestigeTierCard
              key={`prestige-card-${item.levelNum}`}
              item={item}
              currentPrestigeLevel={currentPrestigeLevel}
              isTop1={isCurrentCategoryTop1}
            />
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: SPACE_BETWEEN,
            paddingTop: 10,
            borderTop: UI_COLORS.PURPLE_BORDER_FADED,
            fontSize: 11,
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          <PrestigeStatusBanner
            isTop1={isCurrentCategoryTop1}
            currentLevel={currentPrestigeLevel}
            tabName={prestigeTab}
          />

          <AscendTriggerButton
            isTop1={isCurrentCategoryTop1}
            currentLevel={currentPrestigeLevel}
            onOpenModal={() => setShowAscendModal(true)}
          />
        </div>
      </div>

      {showAscendModal && (
        <AscendConfirmModal
          prestigeTab={prestigeTab}
          currentLevel={currentPrestigeLevel}
          isAscending={isAscending}
          onClose={() => setShowAscendModal(false)}
          onConfirm={handleConfirmAscend}
        />
      )}
    </div>
  );
}

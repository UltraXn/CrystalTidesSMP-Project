import { useNavigate, Link, useSearchParams } from 'react-router';
import { Medal, Info, CheckCircle, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState, useMemo, lazy, Suspense, type ComponentProps } from 'react';
import { supabase } from '../services/supabaseClient';
import { UserIdentity, Provider, User } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import '../styles/pages/dashboard.css';
import '../styles/pages/account.css';
import Loader from '../components/UI/Loader';
import ConfirmationModal from '../components/UI/ConfirmationModal';
import PlayerStats from '../components/Widgets/PlayerStats';
import { MEDAL_ICONS } from '../utils/MedalIcons';
import { formatDate } from '../utils/date';
import Toast, { ToastType } from '../components/UI/Toast';
import { useSidebar } from '../hooks/useSidebar';
import { useAccountSettings, useUserThreads, usePlayerStats } from '../hooks/useAccountData';
import { useAccountConnections } from '../hooks/useAccountConnections';

// Extracted Components
import AccountSidebar from '../components/Account/AccountSidebar';
import AchievementCard from '../components/Account/AchievementCard';
import ConnectionCards from '../components/Account/ConnectionCards';
import ProfileSettings from '../components/Account/ProfileSettings';
import SuccessModal from '../components/UI/SuccessModal';
import ShareableCard from '../components/Account/ShareableCard';

const PlaystyleRadar = lazy(() => import('../components/Account/PlaystyleRadarFinal'));

// --- CONSTANTS & CONFIGURATION ---

const ASSETS = {
  CRAFTING_TABLE: 'https://minecraft.wiki/w/Special:Redirect/file/Crafting_Table.png',
  DIAMOND_SWORD: 'https://minecraft.wiki/w/Special:Redirect/file/Diamond_Sword.png',
  WOODEN_SWORD: 'https://minecraft.wiki/w/Special:Redirect/file/Wooden_Sword.png',
  IRON_SWORD: 'https://minecraft.wiki/w/Special:Redirect/file/Iron_Sword.png',
  GOLDEN_SWORD: 'https://minecraft.wiki/w/Special:Redirect/file/Golden_Sword.png',
  NETHERITE_SWORD: 'https://minecraft.wiki/w/Special:Redirect/file/Netherite_Sword.png',
  MACE: 'https://minecraft.wiki/w/Special:Redirect/file/Mace.png',
  WOODEN_PICKAXE: 'https://minecraft.wiki/w/Special:Redirect/file/Wooden_Pickaxe.png',
  IRON_PICKAXE: 'https://minecraft.wiki/w/Special:Redirect/file/Iron_Pickaxe.png',
  GOLDEN_PICKAXE: 'https://minecraft.wiki/w/Special:Redirect/file/Golden_Pickaxe.png',
  DIAMOND_PICKAXE: 'https://minecraft.wiki/w/Special:Redirect/file/Diamond_Pickaxe.png',
  NETHERITE_PICKAXE: 'https://minecraft.wiki/w/Special:Redirect/file/Netherite_Pickaxe.png',
  COBBLESTONE: 'https://minecraft.wiki/w/Special:Redirect/file/Cobblestone.png',
  BEACON: 'https://minecraft.wiki/w/Special:Redirect/file/Beacon.png',
  TOTEM: 'https://minecraft.wiki/w/Special:Redirect/file/Totem_of_Undying.png',
  CLOCK: 'https://minecraft.wiki/w/Special:Redirect/file/Clock.png',
  COMPASS: 'https://minecraft.wiki/w/Special:Redirect/file/Compass.png',
  RECOVERY_COMPASS: 'https://minecraft.wiki/w/Special:Redirect/file/Recovery_Compass.png',
  BOTTLE_ENCHANTING: 'https://minecraft.wiki/w/Special:Redirect/file/Bottle_o%27_Enchanting.png',
  NETHER_STAR: 'https://minecraft.wiki/w/Special:Redirect/file/Nether_Star.png',
  LEATHER_BOOTS: 'https://minecraft.wiki/w/Special:Redirect/file/Leather_Boots_(item)_JE2.png',
  SPYGLASS: 'https://minecraft.wiki/w/Special:Redirect/file/Spyglass.png',
  EMPTY_MAP: 'https://minecraft.wiki/w/Special:Redirect/file/Empty_Map.png',
  ELYTRA: 'https://minecraft.wiki/w/Special:Redirect/file/Elytra.png',
  COIN_ORO: '/images/killucoins/coin_oro.webp',
  COIN_COBRE: '/images/killucoins/coin_cobre.webp',
  COIN_PLATA: '/images/killucoins/coin_plata.webp',
  COIN_DIAMANTE: '/images/killucoins/coin_diamante.webp',
  COIN_IRIDIUM: '/images/killucoins/coin_iridium.webp',
} as const;

const COLORS = {
  WHITE_02: 'rgba(255,255,255,0.02)',
  WHITE_03: 'rgba(255,255,255,0.03)',
  WHITE_05: 'rgba(255,255,255,0.05)',
} as const;

const PRESTIGE_BRANCHES = [
  'constructor',
  'luchador',
  'mercader',
  'constancia',
  'explorador',
] as const;

type PrestigeBranch = (typeof PRESTIGE_BRANCHES)[number];

interface TranslatableItem {
  id?: string | number;
  name: string;
  description: string;
  criteria?: string;
  name_en?: string;
  description_en?: string;
  criteria_en?: string;
  image_url?: string;
  icon?: string;
  color?: string;
  [key: string]: unknown;
}

interface ArchetypeItem {
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

interface UserThread {
  id: string | number;
  title: string;
  created_at: string;
  views: number;
  reply_count: number;
}

interface PlayerStatsData {
  raw_playtime?: number | string;
  playtime?: string;
  money?: number | string;
  raw_blocks_placed?: number | string;
  raw_blocks_mined?: number | string;
  raw_kills?: number | string;
  mob_kills?: number | string;
  raw_rank?: string;
  username?: string;
  member_since?: string;
  is_top1_constructor?: boolean;
  is_top1_luchador?: boolean;
  is_top1_mercader?: boolean;
  is_top1_constancia?: boolean;
  is_top1_explorador?: boolean;
  prestige_constructor?: number;
  prestige_luchador?: number;
  prestige_mercader?: number;
  prestige_constancia?: number;
  prestige_explorador?: number;
}

type TranslationFunction = (key: string, options?: Record<string, unknown>) => string;

// --- PURE UTILITY FUNCTIONS ---

const parsePlaytimeHours = (playtime: unknown): number => {
  if (typeof playtime !== 'string') return 0;
  const hoursMatch = /\b(\d+)h/.exec(playtime);
  const minsMatch = /\b(\d+)m/.exec(playtime);
  const h = hoursMatch ? Number.parseInt(hoursMatch[1], 10) : 0;
  const m = minsMatch ? Number.parseInt(minsMatch[1], 10) : 0;
  return h + m / 60;
};

const parseMoneyNumber = (money: unknown): number => {
  if (typeof money === 'string') {
    return Number.parseFloat(money.replace(/[^0-9.-]+/g, '')) || 0;
  }
  return Number(money || 0);
};

const getLocalizedText = (
  item: TranslatableItem,
  field: 'name' | 'description' | 'criteria',
  t: TranslationFunction,
  lang: string,
  fallbackTranslationKey?: string,
): string => {
  const isEnglish = lang.startsWith('en');

  if (isEnglish) {
    if (field === 'name' && item.name_en) return item.name_en;
    if (field === 'description' && item.description_en) return item.description_en;
    if (field === 'criteria' && item.criteria_en) return item.criteria_en;
  }

  if (fallbackTranslationKey) {
    const defaultValue = (item[field] as string) || '';
    return t(fallbackTranslationKey, { defaultValue });
  }

  return (item[field] as string) || '';
};

const getPrestigeCategoryStatus = (
  branch: PrestigeBranch,
  statsData?: PlayerStatsData,
): { isTop1: boolean; currentLevel: number } => {
  const top1Map: Record<PrestigeBranch, boolean> = {
    constructor: !!statsData?.is_top1_constructor,
    luchador: !!statsData?.is_top1_luchador,
    mercader: !!statsData?.is_top1_mercader,
    constancia: !!statsData?.is_top1_constancia,
    explorador: !!statsData?.is_top1_explorador,
  };

  const levelMap: Record<PrestigeBranch, number> = {
    constructor: statsData?.prestige_constructor || 0,
    luchador: statsData?.prestige_luchador || 0,
    mercader: statsData?.prestige_mercader || 0,
    constancia: statsData?.prestige_constancia || 0,
    explorador: statsData?.prestige_explorador || 0,
  };

  return {
    isTop1: top1Map[branch] ?? false,
    currentLevel: levelMap[branch] ?? 0,
  };
};

interface PrestigeTierStyle {
  levelNum: number;
  tag: string;
  color: string;
  border: string;
  bg: string;
}

const PRESTIGE_TIER_STYLES: readonly PrestigeTierStyle[] = [
  {
    levelNum: 1,
    tag: '[P1] Chat',
    color: 'text-amber-400',
    border: 'border-amber-600/40',
    bg: 'bg-amber-900/20',
  },
  {
    levelNum: 2,
    tag: '[P2] Chat',
    color: 'text-slate-300',
    border: 'border-slate-400/40',
    bg: 'bg-slate-700/20',
  },
  {
    levelNum: 3,
    tag: '[P3] Chat',
    color: 'text-yellow-400',
    border: 'border-yellow-400/40',
    bg: 'bg-yellow-500/10',
  },
  {
    levelNum: 4,
    tag: '[P4] Chat',
    color: 'text-cyan-400',
    border: 'border-cyan-400/40',
    bg: 'bg-cyan-500/10',
  },
  {
    levelNum: 5,
    tag: '',
    color: 'text-fuchsia-300',
    border: 'border-fuchsia-400/50',
    bg: 'bg-fuchsia-500/15',
  },
];

interface BranchTierSpec {
  rankKey: string;
  rankDefault: string;
  item: string;
  bonus?: string;
  bonusKey?: string;
  bonusDefault?: string;
}

const BRANCH_TIER_SPECS: Record<PrestigeBranch, readonly BranchTierSpec[]> = {
  constructor: [
    { rankKey: 'constructor.p1', rankDefault: 'Iniciado de Piedra', item: ASSETS.COBBLESTONE },
    { rankKey: 'constructor.p2', rankDefault: 'Constructor Consagrado', item: ASSETS.IRON_PICKAXE },
    {
      rankKey: 'constructor.p3',
      rankDefault: 'Gran Arquitecto',
      item: ASSETS.GOLDEN_PICKAXE,
      bonusKey: 'bonus3_discount',
      bonusDefault: '+15% KC + Descuento',
    },
    { rankKey: 'constructor.p4', rankDefault: 'Maestro Constructor', item: ASSETS.DIAMOND_PICKAXE },
    {
      rankKey: 'constructor.p5',
      rankDefault: 'Arquitecto Mítico',
      item: ASSETS.BEACON,
      bonus: '+25% KC + Title',
    },
  ],
  luchador: [
    { rankKey: 'luchador.p1', rankDefault: 'Guerrero de Bronce', item: ASSETS.WOODEN_SWORD },
    { rankKey: 'luchador.p2', rankDefault: 'Campeón de Batalla', item: ASSETS.IRON_SWORD },
    {
      rankKey: 'luchador.p3',
      rankDefault: 'Señor de Guerra',
      item: ASSETS.GOLDEN_SWORD,
      bonusKey: 'bonus3_aura',
      bonusDefault: '+15% KC + Aura',
    },
    { rankKey: 'luchador.p4', rankDefault: 'Maestro de Armas', item: ASSETS.DIAMOND_SWORD },
    {
      rankKey: 'luchador.p5',
      rankDefault: 'Gladiador Supremo',
      item: ASSETS.MACE,
      bonusKey: 'bonus5_swords',
      bonusDefault: '+25% KC + Espadas',
    },
  ],
  mercader: [
    { rankKey: 'mercader.p1', rankDefault: 'Mercader Próspero', item: ASSETS.COIN_COBRE },
    { rankKey: 'mercader.p2', rankDefault: 'Comerciante de Élite', item: ASSETS.COIN_PLATA },
    {
      rankKey: 'mercader.p3',
      rankDefault: 'Barón Financiero',
      item: ASSETS.COIN_ORO,
      bonus: '+15% KC + 10% Off',
    },
    { rankKey: 'mercader.p4', rankDefault: 'Gran Maestro Gremial', item: ASSETS.COIN_DIAMANTE },
    {
      rankKey: 'mercader.p5',
      rankDefault: 'Magnate Legendario',
      item: ASSETS.COIN_IRIDIUM,
      bonus: '+25% KC + Rain',
    },
  ],
  constancia: [
    { rankKey: 'constancia.p1', rankDefault: 'Devoto del Servidor', item: ASSETS.CLOCK },
    { rankKey: 'constancia.p2', rankDefault: 'Pilar Inquebrantable', item: ASSETS.COMPASS },
    {
      rankKey: 'constancia.p3',
      rankDefault: 'Guardián de Racha',
      item: ASSETS.BOTTLE_ENCHANTING,
      bonus: '+15% KC + Shield',
    },
    { rankKey: 'constancia.p4', rankDefault: 'Leyenda Inquebrantable', item: ASSETS.TOTEM },
    {
      rankKey: 'constancia.p5',
      rankDefault: 'Titán Eterno',
      item: ASSETS.NETHER_STAR,
      bonus: '+25% KC + Totem',
    },
  ],
  explorador: [
    { rankKey: 'explorador.p1', rankDefault: 'Navegante de Reinos', item: ASSETS.LEATHER_BOOTS },
    { rankKey: 'explorador.p2', rankDefault: 'Mapeador Ancestral', item: ASSETS.SPYGLASS },
    {
      rankKey: 'explorador.p3',
      rankDefault: 'Pionero del Horizonte',
      item: ASSETS.EMPTY_MAP,
      bonus: '+15% KC + Compass',
    },
    { rankKey: 'explorador.p4', rankDefault: 'Explorador Experto', item: ASSETS.ELYTRA },
    {
      rankKey: 'explorador.p5',
      rankDefault: 'Conquistador de Mundos',
      item: ASSETS.RECOVERY_COMPASS,
      bonus: '+25% KC + Trail',
    },
  ],
};

const getArchetypeMockups = (t: TranslationFunction): Record<PrestigeBranch, ArchetypeItem[]> => {
  const levelLabels = [
    t('account.overview.prestige.level1', { defaultValue: '⭐ Prestigio I' }),
    t('account.overview.prestige.level2', { defaultValue: '⭐⭐ Prestigio II' }),
    t('account.overview.prestige.level3', { defaultValue: '⭐⭐⭐ Prestigio III' }),
    t('account.overview.prestige.level4', { defaultValue: '⭐⭐⭐⭐ Prestigio IV' }),
    t('account.overview.prestige.level5', { defaultValue: '💎 Prestigio V' }),
  ];

  const defaultBonuses: Record<number, string> = {
    1: t('account.overview.prestige.bonus1', { defaultValue: '+5% KC Diarios' }),
    2: t('account.overview.prestige.bonus2', { defaultValue: '+10% KC Diarios' }),
    4: '+20% KC + 3 Spins',
  };

  const neonTag = t('account.overview.prestige.tag_neon', { defaultValue: '[P5] Neón' });

  const buildBranch = (branch: PrestigeBranch): ArchetypeItem[] =>
    BRANCH_TIER_SPECS[branch].map((spec, index) => {
      const style = PRESTIGE_TIER_STYLES[index];
      const level = levelLabels[index];
      const rankName = t(`account.overview.prestige.arch.${spec.rankKey}`, {
        defaultValue: spec.rankDefault,
      });

      let bonus = spec.bonus || defaultBonuses[style.levelNum] || '';
      if (spec.bonusKey) {
        bonus = t(`account.overview.prestige.${spec.bonusKey}`, {
          defaultValue: spec.bonusDefault,
        });
      }

      return {
        levelNum: style.levelNum,
        level,
        rankName,
        bonus,
        tag: style.levelNum === 5 ? neonTag : style.tag,
        color: style.color,
        border: style.border,
        bg: style.bg,
        item: spec.item,
      };
    });

  return {
    constructor: buildBranch('constructor'),
    luchador: buildBranch('luchador'),
    mercader: buildBranch('mercader'),
    constancia: buildBranch('constancia'),
    explorador: buildBranch('explorador'),
  };
};

const calculateUnlockStatus = (
  user: User | null,
  statsData: PlayerStatsData | undefined,
): Record<string, boolean> => {
  const hoursPlayed = statsData?.raw_playtime ? Number(statsData.raw_playtime) / 3600000 : 0;
  const money = parseMoneyNumber(statsData?.money);
  const blocksPlaced = Number(statsData?.raw_blocks_placed || 0);
  const blocksMined = Number(statsData?.raw_blocks_mined || 0);
  const kills = Number(statsData?.raw_kills || 0);

  const rankLower = (statsData?.raw_rank || '').toLowerCase();
  const patronKeywords = ['donador', 'fundador', 'donor', 'founder', 'neroferno'];
  const isPatron = patronKeywords.some((keyword) => rankLower.includes(keyword));

  return {
    dweller: !!user?.app_metadata?.discord_id || !!user?.user_metadata?.discord_id,
    magnate: money >= 5000,
    architect: blocksPlaced >= 1000,
    deep_miner: blocksMined >= 1000,
    guardian: kills >= 10,
    time_traveler: hoursPlayed >= 50,
    patron: isPatron,
  };
};

const handleLinkProvider = async (provider: string): Promise<void> => {
  try {
    const { data, error } = await supabase.auth.linkIdentity({
      provider: provider as Provider,
      options: {
        redirectTo: window.location.href,
      },
    });
    if (error) throw error;
    if (data?.url) window.location.href = data.url;
  } catch (error) {
    console.error('Error linking provider:', error);
    const message = error instanceof Error ? error.message : String(error);
    alert('Error: ' + message);
  }
};

// --- LOCAL SUBCOMPONENTS ---

interface UnlinkedCardProps {
  onVerifyClick: () => void;
  t: TranslationFunction;
}

function UnlinkedNotice({ onVerifyClick, t }: Readonly<UnlinkedCardProps>) {
  return (
    <div className="dashboard-card animate-fade-in mb-8 rounded-3xl border border-[#e74c3c]/10 bg-[#e74c3c]/5 px-8 py-12 text-center backdrop-blur-md">
      <div className="mb-6 text-6xl drop-shadow-[0_0_10px_rgba(231,76,60,0.3)]">🔗</div>
      <h3 className="mb-4 text-3xl font-extrabold text-[#ff6b6b]">
        {t('account.overview.not_linked_title', { defaultValue: '¡Vincula tu cuenta!' })}
      </h3>
      <p className="max-w-125 mx-auto mb-8 leading-[1.8] text-white/60">
        {t('account.overview.not_linked_msg', {
          defaultValue:
            'Para ver tus estadísticas en tiempo real (dinero, tiempo de juego, muertes), necesitas verificar que eres el dueño de la cuenta de Minecraft.',
        })}
      </p>
      <button
        type="button"
        onClick={onVerifyClick}
        style={{ boxShadow: '0 10px 25px rgba(231, 76, 60, 0.2)' }}
        className="cursor-pointer rounded-2xl bg-[#ff6b6b] px-10 py-4 text-base font-extrabold text-white transition-colors duration-200 hover:-translate-y-0.5 active:translate-y-0"
        onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
        onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        onFocus={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
        onBlur={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        {t('account.overview.verify_btn', { defaultValue: 'Verificar Ahora' })}
      </button>
    </div>
  );
}

interface RadarSectionProps {
  statsData?: PlayerStatsData;
  t: TranslationFunction;
}

function PlaystyleRadarSection({ statsData, t }: Readonly<RadarSectionProps>) {
  return (
    <div className="dashboard-card animate-slide-up rounded-2xl border border-white/5 bg-white/5 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
      <h3 className="mb-6 flex items-center gap-2.5 border-b border-white/5 pb-4 text-lg text-white">
        🎯 {t('account.overview.playstyle.title', { defaultValue: 'Estilo de Juego' })}
      </h3>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-10">
            <Loader />
          </div>
        }
      >
        <PlaystyleRadar
          stats={{
            blocksPlaced: Number(statsData?.raw_blocks_placed || 0),
            blocksMined: Number(statsData?.raw_blocks_mined || 0),
            kills: Number(statsData?.raw_kills || 0),
            mobKills: Number(statsData?.mob_kills || 0),
            playtimeHours: parsePlaytimeHours(statsData?.playtime),
            money: parseMoneyNumber(statsData?.money),
            rank: statsData?.raw_rank || 'default',
          }}
        />
      </Suspense>

      <div className="bg-white/2 mt-4 flex flex-col gap-3 rounded-xl border border-white/5 p-4">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#38BDF8]">
          💡{' '}
          {t('account.overview.formula_header', {
            defaultValue: '¿Cómo se calcula cada Puntuación?',
          })}
        </div>

        <div className="flex flex-col gap-2 text-[11.5px] leading-relaxed text-gray-300">
          <div className="flex items-start gap-1.5">
            <strong className="flex shrink-0 items-center gap-1 font-bold text-sky-400">
              <img
                src={ASSETS.CRAFTING_TABLE}
                className="size-4 object-contain"
                alt="Constructor"
              />
              {t('about.roles.radar.builder', { defaultValue: 'Constructor' })}:
            </strong>
            <span>
              {t('about.roles.branch.constructor.formula', {
                defaultValue:
                  'Bloques minados + colocados. Cada hito de bloques te otorga un nuevo rango de construcción.',
              })}
            </span>
          </div>
          <div className="flex items-start gap-1.5">
            <strong className="flex shrink-0 items-center gap-1 font-bold text-rose-500">
              <img src={ASSETS.DIAMOND_SWORD} className="size-4 object-contain" alt="Luchador" />
              {t('about.roles.radar.fighter', { defaultValue: 'Luchador' })}:
            </strong>
            <span>
              {t('about.roles.branch.luchador.formula', {
                defaultValue: '15 pts por kill PvP a jugadores y 1 pt por mob hostil eliminado.',
              })}
            </span>
          </div>
          <div className="flex items-start gap-1.5">
            <strong className="flex shrink-0 items-center gap-1 font-bold text-amber-400">
              <img src={ASSETS.COIN_ORO} className="size-4 object-contain" alt="Mercader" />
              {t('about.roles.radar.merchant', { defaultValue: 'Mercader' })}:
            </strong>
            <span>
              {t('about.roles.branch.mercader.formula', {
                defaultValue:
                  'Escala logarítmica (100 × log₁₀(KilluCoins)). Cuanto más capital acumules, mayor rango económico obtienes.',
              })}
            </span>
          </div>
          <div className="flex items-start gap-1.5">
            <strong className="flex shrink-0 items-center gap-1 font-bold text-fuchsia-400">
              <img src={ASSETS.TOTEM} className="size-4 object-contain" alt="Constancia" />
              {t('about.roles.radar.constancy', { defaultValue: 'Constancia' })}:
            </strong>
            <span>
              {t('about.roles.branch.constancia.formula', {
                defaultValue:
                  'Crecimiento cuadrático (Días de Racha)². Premia la fidelidad máxima sin romper logins diarios.',
              })}
            </span>
          </div>
          <div className="flex items-start gap-1.5">
            <strong className="flex shrink-0 items-center gap-1 font-bold text-emerald-400">
              <img src={ASSETS.COMPASS} className="size-4 object-contain" alt="Explorador" />
              {t('about.roles.radar.explorer', { defaultValue: 'Explorador' })}:
            </strong>
            <span>
              {t('about.roles.branch.explorador.formula', {
                defaultValue:
                  '10 pts por hora de juego activa + 1 pt por cada km (1,000 bloques) recorrido en Minecraft.',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaystyleRankRulesCard({ t }: Readonly<{ t: TranslationFunction }>) {
  return (
    <div className="mt-4 flex flex-col gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs/relaxed text-amber-200/90">
      <div className="flex items-center gap-1.5 text-sm font-bold text-amber-400">
        🏆 {t('about.roles.rules.max_rank_title', { defaultValue: 'Reglas del Rango Máximo' })}
      </div>
      <div className="flex flex-col gap-1.5 text-[11.5px]">
        <div>
          •{' '}
          <strong>
            {t('about.roles.rules.req_label', { defaultValue: 'Requisito Rango Máximo:' })}
          </strong>{' '}
          {t('about.roles.rules.max_rank_req', {
            defaultValue:
              'Debes ser el jugador con más puntos/estadística de la categoría en la que estás destacando.',
          })}
        </div>
        <div>
          •{' '}
          <strong>
            {t('about.roles.rules.limit_label', { defaultValue: 'Límite de 1 Rango Activo:' })}
          </strong>{' '}
          {t('about.roles.rules.limit_active', {
            defaultValue: 'Solo puedes poseer 1 título máximo simultáneo al mismo tiempo.',
          })}
        </div>
        <div>
          •{' '}
          <strong>
            {t('about.roles.rules.transfer_label', { defaultValue: 'Transferencia Directa:' })}
          </strong>{' '}
          {t('about.roles.rules.transfer', {
            defaultValue:
              'Se transfiere si otro jugador supera tu puntaje. El Duelo 1v1 es exclusivo del Señor de la Guerra.',
          })}
        </div>
      </div>
    </div>
  );
}

interface MetricRankConfig {
  icon: string;
  nameKey: string;
  nameDefault: string;
  reqKey?: string;
  reqDefault?: string;
  isMax?: boolean;
}

interface PlaystyleMetricConfig {
  icon: string;
  titleKey: string;
  titleDefault: string;
  formulaKey: string;
  formulaDefault: string;
  textColor: string;
  hoverBorder: string;
  maxBadgeBorder: string;
  maxBadgeBg: string;
  maxBadgeText: string;
  maxShadow: string;
  ranks: readonly MetricRankConfig[];
}

const PLAYSTYLE_METRIC_CONFIGS: readonly PlaystyleMetricConfig[] = [
  {
    icon: ASSETS.CRAFTING_TABLE,
    titleKey: 'about.roles.radar.builder',
    titleDefault: 'Constructor',
    formulaKey: 'account.overview.playstyle.blocks_formula',
    formulaDefault: 'Bloques Minados + Colocados',
    textColor: 'text-sky-400',
    hoverBorder: 'hover:border-sky-500/30',
    maxBadgeBorder: 'border-sky-500/30',
    maxBadgeBg: 'bg-sky-500/10',
    maxBadgeText: 'text-sky-400',
    maxShadow: 'drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]',
    ranks: [
      {
        icon: ASSETS.WOODEN_PICKAXE,
        nameKey: 'about.roles.branch.constructor.rank.1.name',
        nameDefault: 'Iniciado',
        reqKey: 'about.roles.branch.constructor.rank.1.req',
        reqDefault: '0',
      },
      {
        icon: ASSETS.IRON_PICKAXE,
        nameKey: 'about.roles.branch.constructor.rank.2.name',
        nameDefault: 'Novato',
        reqKey: 'about.roles.branch.constructor.rank.2.req',
        reqDefault: '1k',
      },
      {
        icon: ASSETS.DIAMOND_PICKAXE,
        nameKey: 'about.roles.branch.constructor.rank.3.name',
        nameDefault: 'Hábil',
        reqKey: 'about.roles.branch.constructor.rank.3.req',
        reqDefault: '10k',
      },
      {
        icon: ASSETS.NETHERITE_PICKAXE,
        nameKey: 'about.roles.branch.constructor.rank.4.name',
        nameDefault: 'Arquitecto',
        reqKey: 'about.roles.branch.constructor.rank.4.req',
        reqDefault: '50k',
      },
      {
        icon: ASSETS.BEACON,
        nameKey: 'about.roles.branch.constructor.rank.5.name',
        nameDefault: 'Maestro Constructor',
        isMax: true,
      },
    ],
  },
  {
    icon: ASSETS.DIAMOND_SWORD,
    titleKey: 'about.roles.radar.fighter',
    titleDefault: 'Luchador',
    formulaKey: 'account.overview.playstyle.pvp_formula',
    formulaDefault: 'PvP (x15) + Mobs (x1)',
    textColor: 'text-rose-400',
    hoverBorder: 'hover:border-rose-500/30',
    maxBadgeBorder: 'border-rose-500/30',
    maxBadgeBg: 'bg-rose-500/10',
    maxBadgeText: 'text-rose-400',
    maxShadow: 'drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]',
    ranks: [
      {
        icon: ASSETS.WOODEN_SWORD,
        nameKey: 'about.roles.branch.luchador.rank.1.name',
        nameDefault: 'Recluta',
        reqKey: 'about.roles.branch.luchador.rank.1.req',
        reqDefault: '0',
      },
      {
        icon: ASSETS.IRON_SWORD,
        nameKey: 'about.roles.branch.luchador.rank.2.name',
        nameDefault: 'Novato',
        reqKey: 'about.roles.branch.luchador.rank.2.req',
        reqDefault: '50',
      },
      {
        icon: ASSETS.DIAMOND_SWORD,
        nameKey: 'about.roles.branch.luchador.rank.3.name',
        nameDefault: 'Guerrero',
        reqKey: 'about.roles.branch.luchador.rank.3.req',
        reqDefault: '500',
      },
      {
        icon: ASSETS.NETHERITE_SWORD,
        nameKey: 'about.roles.branch.luchador.rank.4.name',
        nameDefault: 'Maestro de Armas',
        reqKey: 'about.roles.branch.luchador.rank.4.req',
        reqDefault: '2.5k',
      },
      {
        icon: ASSETS.MACE,
        nameKey: 'about.roles.branch.luchador.rank.5.name',
        nameDefault: 'Señor de la Guerra',
        isMax: true,
      },
    ],
  },
  {
    icon: ASSETS.COIN_ORO,
    titleKey: 'about.roles.radar.merchant',
    titleDefault: 'Mercader',
    formulaKey: 'account.overview.playstyle.merchant_formula',
    formulaDefault: '100 × log₁₀(KilluCoins)',
    textColor: 'text-amber-400',
    hoverBorder: 'hover:border-amber-500/30',
    maxBadgeBorder: 'border-amber-500/30',
    maxBadgeBg: 'bg-amber-500/10',
    maxBadgeText: 'text-amber-400',
    maxShadow: 'drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]',
    ranks: [
      {
        icon: ASSETS.COIN_COBRE,
        nameKey: 'about.roles.branch.mercader.rank.1.name',
        nameDefault: 'Ambulante',
        reqKey: 'about.roles.branch.mercader.rank.1.req',
        reqDefault: '0',
      },
      {
        icon: ASSETS.COIN_PLATA,
        nameKey: 'about.roles.branch.mercader.rank.2.name',
        nameDefault: 'Novato',
        reqKey: 'about.roles.branch.mercader.rank.2.req',
        reqDefault: '1k',
      },
      {
        icon: ASSETS.COIN_ORO,
        nameKey: 'about.roles.branch.mercader.rank.3.name',
        nameDefault: 'Próspero',
        reqKey: 'about.roles.branch.mercader.rank.3.req',
        reqDefault: '10k',
      },
      {
        icon: ASSETS.COIN_DIAMANTE,
        nameKey: 'about.roles.branch.mercader.rank.4.name',
        nameDefault: 'Noble',
        reqKey: 'about.roles.branch.mercader.rank.4.req',
        reqDefault: '50k',
      },
      {
        icon: ASSETS.COIN_IRIDIUM,
        nameKey: 'about.roles.branch.mercader.rank.5.name',
        nameDefault: 'Gran Maestro Gremial',
        isMax: true,
      },
    ],
  },
  {
    icon: ASSETS.TOTEM,
    titleKey: 'about.roles.radar.constancy',
    titleDefault: 'Constancia',
    formulaKey: 'account.overview.playstyle.constancy_formula',
    formulaDefault: '(Días de Racha)²',
    textColor: 'text-fuchsia-400',
    hoverBorder: 'hover:border-fuchsia-500/30',
    maxBadgeBorder: 'border-fuchsia-500/30',
    maxBadgeBg: 'bg-fuchsia-500/10',
    maxBadgeText: 'text-fuchsia-400',
    maxShadow: 'drop-shadow-[0_0_6px_rgba(217,70,239,0.5)]',
    ranks: [
      {
        icon: ASSETS.CLOCK,
        nameKey: 'about.roles.branch.constancia.rank.1.name',
        nameDefault: 'Visitante',
        reqKey: 'about.roles.branch.constancia.rank.1.req',
        reqDefault: '0d',
      },
      {
        icon: ASSETS.COMPASS,
        nameKey: 'about.roles.branch.constancia.rank.2.name',
        nameDefault: 'Viajero',
        reqKey: 'about.roles.branch.constancia.rank.2.req',
        reqDefault: '7d',
      },
      {
        icon: ASSETS.BOTTLE_ENCHANTING,
        nameKey: 'about.roles.branch.constancia.rank.3.name',
        nameDefault: 'Devoto',
        reqKey: 'about.roles.branch.constancia.rank.3.req',
        reqDefault: '14d',
      },
      {
        icon: ASSETS.TOTEM,
        nameKey: 'about.roles.branch.constancia.rank.4.name',
        nameDefault: 'Viciado',
        reqKey: 'about.roles.branch.constancia.rank.4.req',
        reqDefault: '30d',
      },
      {
        icon: ASSETS.NETHER_STAR,
        nameKey: 'about.roles.branch.constancia.rank.5.name',
        nameDefault: 'Inquebrantable',
        isMax: true,
      },
    ],
  },
  {
    icon: ASSETS.COMPASS,
    titleKey: 'about.roles.radar.explorer',
    titleDefault: 'Explorador',
    formulaKey: 'account.overview.playstyle.explorer_formula',
    formulaDefault: 'Horas (x10) + Km',
    textColor: 'text-emerald-400',
    hoverBorder: 'hover:border-emerald-500/30',
    maxBadgeBorder: 'border-emerald-500/30',
    maxBadgeBg: 'bg-emerald-500/10',
    maxBadgeText: 'text-emerald-400',
    maxShadow: 'drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]',
    ranks: [
      {
        icon: ASSETS.LEATHER_BOOTS,
        nameKey: 'about.roles.branch.explorador.rank.1.name',
        nameDefault: 'Novato',
        reqKey: 'about.roles.branch.explorador.rank.1.req',
        reqDefault: '0 pts',
      },
      {
        icon: ASSETS.SPYGLASS,
        nameKey: 'about.roles.branch.explorador.rank.2.name',
        nameDefault: 'Curioso',
        reqKey: 'about.roles.branch.explorador.rank.2.req',
        reqDefault: '100 pts',
      },
      {
        icon: ASSETS.EMPTY_MAP,
        nameKey: 'about.roles.branch.explorador.rank.3.name',
        nameDefault: 'Mapeador',
        reqKey: 'about.roles.branch.explorador.rank.3.req',
        reqDefault: '500 pts',
      },
      {
        icon: ASSETS.ELYTRA,
        nameKey: 'about.roles.branch.explorador.rank.4.name',
        nameDefault: 'Pionero',
        reqKey: 'about.roles.branch.explorador.rank.4.req',
        reqDefault: '2k pts',
      },
      {
        icon: ASSETS.RECOVERY_COMPASS,
        nameKey: 'about.roles.branch.explorador.rank.5.name',
        nameDefault: 'Explorador Experto',
        isMax: true,
      },
    ],
  },
];

function PlaystyleMetricCard({
  config,
  t,
}: Readonly<{
  config: PlaystyleMetricConfig;
  t: TranslationFunction;
}>) {
  return (
    <div
      className={`bg-white/3 rounded-xl border border-white/5 p-3.5 transition-colors ${config.hoverBorder}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className={`flex items-center gap-2 text-sm font-bold ${config.textColor}`}>
          <img src={config.icon} className="size-4 object-contain" alt={config.titleDefault} />
          {t(config.titleKey, { defaultValue: config.titleDefault })}
        </div>
        <span className="text-[11px] font-medium text-gray-400">
          {t(config.formulaKey, { defaultValue: config.formulaDefault })}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        {config.ranks.map((rank, idx) => {
          const rankName = t(rank.nameKey, { defaultValue: rank.nameDefault });
          const reqText = rank.reqKey ? t(rank.reqKey, { defaultValue: rank.reqDefault }) : '';

          return (
            <span key={rank.nameDefault} className="inline-flex items-center gap-1.5">
              {idx > 0 && <span className="text-gray-600">→</span>}
              {rank.isMax ? (
                <span
                  className={`flex items-center gap-1 rounded-lg border ${config.maxBadgeBorder} ${config.maxBadgeBg} px-2.5 py-1 font-extrabold ${config.maxBadgeText}`}
                >
                  <img
                    alt=""
                    src={rank.icon}
                    className={`size-3.5 object-contain ${config.maxShadow}`}
                  />{' '}
                  {rankName}
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-gray-300">
                  <img alt="" src={rank.icon} className="size-3.5 object-contain" /> {rankName} (
                  {reqText})
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function PlaystyleMetricsSection({ t }: Readonly<{ t: TranslationFunction }>) {
  return (
    <div className="dashboard-card animate-slide-up flex flex-col justify-center rounded-2xl border border-white/5 bg-white/5 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
      <h3 className="mb-4 flex items-center gap-2 border-b border-white/5 pb-3 text-lg font-black uppercase tracking-tight text-white">
        <Info color="var(--accent)" size={20} />
        {t('account.overview.playstyle.metrics_title', {
          defaultValue: 'Métricas de Estilo de Juego',
        })}
      </h3>

      <div className="flex flex-col gap-3.5">
        {PLAYSTYLE_METRIC_CONFIGS.map((config) => (
          <PlaystyleMetricCard key={config.titleDefault} config={config} t={t} />
        ))}
      </div>

      <PlaystyleRankRulesCard t={t} />
    </div>
  );
}

interface PrestigeBannerProps {
  isTop1: boolean;
  currentLevel: number;
  translatedBranch: string;
  onAscendClick: () => void;
  t: TranslationFunction;
}

function PrestigeStatusBanner({
  isTop1,
  currentLevel,
  translatedBranch,
  onAscendClick,
  t,
}: Readonly<PrestigeBannerProps>) {
  const isMaxLevel = currentLevel >= 5;
  const isButtonDisabled = !isTop1 || isMaxLevel;

  const renderStatusMessage = () => {
    if (!isTop1) {
      return (
        <span className="flex items-center gap-1.5 text-red-400">
          <Lock className="size-4 text-red-400" />{' '}
          <em>
            {t('account.overview.prestige.locked_msg', {
              defaultValue:
                'Bloqueado: Debes ser el jugador #1 con Rango Máximo en {{branch}} para ascender.',
              branch: translatedBranch,
            })}
          </em>
        </span>
      );
    }
    if (isMaxLevel) {
      return (
        <span>
          👑{' '}
          <em>
            {t('account.overview.prestige.max_reached', {
              defaultValue:
                '¡Felicidades! Has alcanzado el Nivel Máximo V de Prestigio en {{branch}}.',
              branch: translatedBranch,
            })}
          </em>
        </span>
      );
    }
    return (
      <span>
        ✨{' '}
        <em>
          {t('account.overview.prestige.req_met', {
            defaultValue:
              '¡Requisito Cumplido! Eres el #1 del servidor en {{branch}}. Puedes ascender al Nivel {{level}}.',
            branch: translatedBranch,
            level: currentLevel + 1,
          })}
        </em>
      </span>
    );
  };

  const renderButtonContent = () => {
    if (!isTop1) {
      return (
        <>
          <Lock className="size-4" />{' '}
          {t('account.overview.prestige.btn_req', {
            defaultValue: '🔒 Requisito: Alcanzar Rango Máximo',
          })}
        </>
      );
    }
    if (isMaxLevel) {
      return (
        <>
          {t('account.overview.prestige.btn_max', {
            defaultValue: '👑 Prestigio Máximo Alcanzado',
          })}
        </>
      );
    }
    return (
      <>
        <Sparkles className="size-4" />{' '}
        {t('account.overview.prestige.btn_ascend', {
          defaultValue: '⭐ Ascender a Prestigio {{level}}',
          level: currentLevel + 1,
        })}
      </>
    );
  };

  const buttonStyle = isButtonDisabled
    ? 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed opacity-60'
    : 'bg-purple-600 hover:bg-purple-500 border border-purple-300 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] hover:scale-[1.02]';

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-purple-500/20 pt-4 text-xs text-purple-200/90 sm:flex-row">
      {renderStatusMessage()}

      <button
        type="button"
        disabled={isButtonDisabled}
        onClick={onAscendClick}
        className={`flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl px-5 py-2.5 font-extrabold outline-none transition-colors focus:outline-none ${buttonStyle}`}
      >
        {renderButtonContent()}
      </button>
    </div>
  );
}

interface PrestigeSystemProps {
  prestigeTab: PrestigeBranch;
  setPrestigeTab: (tab: PrestigeBranch) => void;
  statsData?: PlayerStatsData;
  onOpenModal: () => void;
  t: TranslationFunction;
}

function PrestigeSystemSection({
  prestigeTab,
  setPrestigeTab,
  statsData,
  onOpenModal,
  t,
}: Readonly<PrestigeSystemProps>) {
  const tabsConfig = {
    constructor: {
      label: t('about.roles.radar.builder', { defaultValue: 'Constructor' }),
      icon: ASSETS.CRAFTING_TABLE,
    },
    luchador: {
      label: t('about.roles.radar.fighter', { defaultValue: 'Luchador' }),
      icon: ASSETS.NETHERITE_SWORD,
    },
    mercader: {
      label: t('about.roles.radar.merchant', { defaultValue: 'Mercader' }),
      icon: ASSETS.COIN_ORO,
    },
    constancia: {
      label: t('about.roles.radar.constancy', { defaultValue: 'Constancia' }),
      icon: ASSETS.TOTEM,
    },
    explorador: {
      label: t('about.roles.radar.explorer', { defaultValue: 'Explorador' }),
      icon: ASSETS.RECOVERY_COMPASS,
    },
  };

  const { isTop1, currentLevel } = getPrestigeCategoryStatus(prestigeTab, statsData);
  const radarKeyMap: Record<PrestigeBranch, string> = {
    constructor: 'builder',
    luchador: 'fighter',
    mercader: 'merchant',
    constancia: 'constancy',
    explorador: 'explorer',
  };
  const translatedBranch = t(`about.roles.radar.${radarKeyMap[prestigeTab]}`, {
    defaultValue: prestigeTab,
  }).toUpperCase();

  const mockups = getArchetypeMockups(t);
  const archetypeList = mockups[prestigeTab];

  return (
    <div className="dashboard-card animate-slide-up bg-linear-to-br mt-8 flex flex-col gap-5 rounded-2xl border border-purple-500/30 from-purple-900/20 via-black/40 to-indigo-900/30 p-6 text-xs/relaxed text-purple-100 shadow-lg shadow-purple-950/40">
      <div className="flex flex-col justify-between gap-3 border-b border-purple-500/20 pb-5 text-base font-extrabold text-purple-300 sm:flex-row sm:items-center">
        <span className="flex items-center gap-2 text-white">
          ⭐{' '}
          {t('account.overview.prestige.title', {
            defaultValue: 'Sistema de Prestigios de Estilo de Juego',
          })}
        </span>

        <div className="flex flex-wrap items-center gap-2 p-1">
          {PRESTIGE_BRANCHES.map((key) => {
            const item = tabsConfig[key];
            const isSelected = prestigeTab === key;
            const tabClasses = isSelected
              ? 'bg-purple-600 border border-purple-300 text-white shadow-[0_0_12px_rgba(147,51,234,0.5)]'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10';

            return (
              <button
                aria-label="Action"
                type="button"
                key={key}
                onClick={() => setPrestigeTab(key)}
                className={`flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold outline-none transition-colors focus:outline-none focus:ring-0 focus-visible:outline-none ${tabClasses}`}
              >
                <img src={item.icon} className="size-4 object-contain" alt={item.label} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="my-2 grid grid-cols-1 gap-3.5 sm:grid-cols-5">
        {archetypeList.map((item) => {
          const isUnlocked = item.levelNum <= currentLevel;
          const isNextTarget = isTop1 && item.levelNum === currentLevel + 1;
          const isLocked = !isUnlocked && !isNextTarget;

          let cardBg = 'bg-black/60';
          let cardBorder = 'border-white/5';
          let itemColor = 'text-gray-400';

          if (isUnlocked) {
            cardBg = item.bg;
            cardBorder = item.border;
            itemColor = item.color;
          } else if (isNextTarget) {
            cardBg = 'bg-purple-900/30';
            cardBorder = 'border-purple-400';
            itemColor = 'text-purple-300';
          }

          const opacityClass = isLocked ? 'opacity-40' : 'opacity-100';
          const tagTextColor = isUnlocked ? item.color : 'text-gray-500';
          const titleTextColor = isLocked ? 'text-gray-400' : 'text-white';

          return (
            <div
              key={item.levelNum}
              className={`rounded-xl p-4 ${cardBg} border ${cardBorder} ${opacityClass} group relative flex flex-col items-center gap-1.5 overflow-hidden text-center shadow-md transition-colors hover:scale-[1.02]`}
            >
              {isUnlocked && (
                <span className="absolute right-2 top-2 flex items-center gap-1 text-[9.5px] font-bold text-emerald-400">
                  <CheckCircle className="size-3" />{' '}
                  {t('account.overview.prestige.active', { defaultValue: 'Activo' })}
                </span>
              )}
              {isLocked && (
                <span className="absolute right-2 top-2 flex items-center gap-1 text-[9.5px] font-bold text-gray-500">
                  <Lock className="size-3" />{' '}
                  {t('account.overview.prestige.locked', { defaultValue: 'Bloqueado' })}
                </span>
              )}
              <img
                src={item.item}
                className={`my-1 size-6 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-110 ${isLocked ? 'grayscale' : ''}`}
                alt={item.rankName}
              />
              <span className={`${itemColor} text-xs font-extrabold tracking-wide`}>
                {item.level}
              </span>
              <span
                className={`text-xs ${titleTextColor} w-full truncate font-bold`}
                title={item.rankName}
              >
                {item.rankName}
              </span>
              <span className="mt-0.5 text-[11px] font-medium text-gray-300">{item.bonus}</span>
              <span className={`text-[10.5px] ${tagTextColor} mt-0.5 font-mono font-semibold`}>
                {item.tag}
              </span>
            </div>
          );
        })}
      </div>

      <PrestigeStatusBanner
        isTop1={isTop1}
        currentLevel={currentLevel}
        translatedBranch={translatedBranch}
        onAscendClick={onOpenModal}
        t={t}
      />
    </div>
  );
}

interface PrestigeModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: PrestigeBranch;
  onSimulateSuccess: () => void;
}

function PrestigeAscendModal({
  isOpen,
  onClose,
  branch,
  onSimulateSuccess,
}: Readonly<PrestigeModalProps>) {
  if (!isOpen) return null;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="bg-linear-to-b relative flex w-full max-w-lg flex-col gap-6 rounded-3xl border border-purple-500/40 from-purple-950/90 via-slate-950 to-black p-6 text-white shadow-[0_0_50px_rgba(147,51,234,0.3)] sm:p-8">
        <button
          aria-label="Action"
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/5 text-lg font-bold text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="mb-1 flex size-16 items-center justify-center rounded-2xl border border-purple-400/40 bg-purple-600/20 text-3xl shadow-[0_0_20px_rgba(147,51,234,0.4)]">
            ⭐
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-white">
            Maqueta de Ascenso — Prestigio I
          </h3>
          <p className="text-xs text-purple-200/70">
            Simulación interactiva del proceso de reinicio y reclamo de bonificaciones permanentes
            para la rama <strong className="text-purple-300">{branch.toUpperCase()}</strong>.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/50 p-4 text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-gray-400">Estado Actual:</span>
            <span className="font-bold text-amber-400">Top 1 / Rango Máximo (100%)</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-gray-400">Nuevo Estado:</span>
            <span className="flex items-center gap-1 font-extrabold text-purple-400">
              ⭐ Prestigio I
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-gray-400">Bonificación Permanente:</span>
            <span className="font-bold text-emerald-400">+5% KC Diarios</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-gray-400">Recompensa Inmediata:</span>
            <span className="font-bold text-sky-400">1 Spin Gratis en Gacha 🎰</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Badge de Chat:</span>
            <span className="rounded-sm border border-purple-500/40 bg-purple-900/40 px-2 py-0.5 font-mono text-[11px] text-purple-300">
              [P1] Chat
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-center text-[11px] leading-relaxed text-amber-300/80">
          ⚠️{' '}
          <em>
            Al ascender, tus puntos de esta rama se reiniciarán a 0 para comenzar el progreso hacia
            Prestigio II. Tus multiplicadores e insignias pasadas se mantendrán para siempre.
          </em>
        </div>

        <div className="flex gap-3">
          <button
            aria-label="Action"
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-gray-300 transition-colors hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            aria-label="Action"
            type="button"
            onClick={() => {
              onClose();
              onSimulateSuccess();
            }}
            className="flex-1 cursor-pointer rounded-xl border border-purple-300 bg-purple-600 py-3 text-xs font-black text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-colors hover:scale-[1.02] hover:bg-purple-500"
          >
            ⭐ Confirmar Ascenso
          </button>
        </div>
      </div>
    </div>
  );
}

interface AchievementsTimelineProps {
  statsData?: PlayerStatsData;
  t: TranslationFunction;
}

function AchievementsTimeline({ statsData, t }: Readonly<AchievementsTimelineProps>) {
  const showPromotion =
    statsData?.raw_rank && !['default'].includes(statsData.raw_rank.toLowerCase());
  const playtimeHours = parsePlaytimeHours(statsData?.playtime).toFixed(1);

  return (
    <div className="bg-white/2 rounded-4xl mb-10 overflow-hidden border border-white/5 p-8">
      <h3 className="text-(--accent) mb-8 text-xs font-black uppercase tracking-[0.2em]">
        {t('account.journey_title', { defaultValue: '📅 Tu Travesía en CrystalTides' })}
      </h3>
      <div className="scrollbar-none relative flex items-center gap-0 overflow-x-auto py-4">
        <div className="inset-x-17.5 absolute top-8 z-0 h-px bg-white/10" />

        <div className="min-w-35 relative z-10 flex flex-col items-center">
          <div className="bg-(--accent) mb-4 size-4 rounded-full shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]" />
          <span className="text-xs/loose font-black uppercase tracking-widest text-white">
            {t('account.journey_arrival', { defaultValue: 'Llegada' })}
          </span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            {statsData?.member_since || '???'}
          </span>
        </div>

        {showPromotion && (
          <div className="min-w-35 relative z-10 mx-auto flex flex-col items-center">
            <div className="mb-4 size-3 rounded-full bg-white" />
            <span className="text-xs/loose font-black uppercase tracking-widest text-white">
              {t('account.journey_promotion', { defaultValue: 'Ascenso' })}
            </span>
            <span className="text-(--accent) mt-1 text-[10px] font-black uppercase tracking-widest">
              {statsData.raw_rank}
            </span>
          </div>
        )}

        <div className="min-w-35 relative z-10 ml-auto flex flex-col items-center text-right">
          <div className="mb-4 size-4 rotate-45 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          <span className="text-xs/loose font-black uppercase tracking-widest text-white">
            {t('account.journey_today', { defaultValue: 'Hoy' })}
          </span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            {playtimeHours}h {t('account.journey_played', { defaultValue: 'jugadas' })}
          </span>
        </div>
      </div>
    </div>
  );
}

interface PostsTabProps {
  threads: UserThread[];
  isLoading: boolean;
  t: TranslationFunction;
}

function PostsTabContent({ threads, isLoading, t }: Readonly<PostsTabProps>) {
  if (isLoading) {
    return <Loader text={t('account.posts.loading')} />;
  }

  if (threads.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '2rem',
          background: COLORS.WHITE_02,
          borderRadius: '8px',
        }}
      >
        <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>{t('account.posts.empty')}</p>
        <Link to="/forum" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
          {t('account.posts.go_to_forum', { defaultValue: 'Ir al Foro' })}
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {threads.map((thread) => (
        <Link
          to={`/forum/thread/topic/${thread.id}`}
          key={thread.id}
          style={{ textDecoration: 'none' }}
        >
          <div
            className="thread-card-mini"
            style={{
              background: COLORS.WHITE_03,
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${COLORS.WHITE_05}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = COLORS.WHITE_05)}
            onMouseOut={(e) => (e.currentTarget.style.background = COLORS.WHITE_03)}
            onFocus={(e) => (e.currentTarget.style.background = COLORS.WHITE_05)}
            onBlur={(e) => (e.currentTarget.style.background = COLORS.WHITE_03)}
          >
            <div>
              <h4 style={{ color: '#fff', margin: '0 0 0.3rem 0' }}>{thread.title}</h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                {formatDate(thread.created_at)}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                color: 'var(--muted)',
                fontSize: '0.9rem',
              }}
            >
              <span>
                {thread.views} {t('account.posts.views')}
              </span>
              <span>
                {thread.reply_count} {t('account.posts.replies')}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

interface MedalsTabProps {
  userMedals?: string[];
  medalDefinitions: TranslatableItem[];
  t: TranslationFunction;
  lang: string;
}

function MedalsTabContent({ userMedals, medalDefinitions, t, lang }: Readonly<MedalsTabProps>) {
  if (!userMedals || userMedals.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem',
          background: COLORS.WHITE_02,
          borderRadius: '12px',
        }}
      >
        <Medal size={48} style={{ color: '#333', marginBottom: '1rem' }} />
        <p style={{ color: '#888' }}>
          {t('account.no_medals', { defaultValue: 'Aún no tienes medallas especiales.' })}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1.5rem',
      }}
    >
      {userMedals.map((medalId) => {
        const def = medalDefinitions.find((m) => m.id === medalId);
        if (!def) return null;
        const Icon = MEDAL_ICONS[def.icon as keyof typeof MEDAL_ICONS] || Medal;

        return (
          <div
            key={medalId}
            className="medal-card animate-pop"
            style={{
              background: `linear-gradient(145deg, ${def.color}10, rgba(0,0,0,0.4))`,
              border: `1px solid ${def.color}40`,
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '60px',
                width: '60px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {def.image_url ? (
                <img
                  src={def.image_url}
                  alt={def.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: `drop-shadow(0 0 10px ${def.color}60)`,
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: '2.5rem',
                    color: def.color,
                    filter: `drop-shadow(0 0 10px ${def.color}60)`,
                  }}
                >
                  <Icon />
                </div>
              )}
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              {getLocalizedText(def, 'name', t, lang, `account.medals.items.${medalId}.title`)}
            </h3>
            <p style={{ color: '#ccc', fontSize: '0.85rem' }}>
              {getLocalizedText(
                def,
                'description',
                t,
                lang,
                `account.medals.items.${medalId}.desc`,
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}

interface OverviewTabProps {
  isLinked: boolean;
  statsData?: ComponentProps<typeof PlayerStats>['statsData'];
  loadingStats: boolean;
  statsError: boolean;
  prestigeTab: PrestigeBranch;
  setPrestigeTab: (tab: PrestigeBranch) => void;
  showAscendModal: boolean;
  setShowAscendModal: (show: boolean) => void;
  onVerifyClick: () => void;
  showToast: (message: string, type?: ToastType) => void;
  t: TranslationFunction;
}

function OverviewTabContent({
  isLinked,
  statsData,
  loadingStats,
  statsError,
  prestigeTab,
  setPrestigeTab,
  showAscendModal,
  setShowAscendModal,
  onVerifyClick,
  showToast,
  t,
}: Readonly<OverviewTabProps>) {
  return (
    <div className="fade-in">
      <h2 className="mb-8 border-b border-white/5 pb-4 text-2xl font-black uppercase tracking-tighter text-white">
        {t('account.overview.stats_title')}
      </h2>

      {isLinked ? (
        <PlayerStats statsData={statsData || null} loading={loadingStats} error={statsError} />
      ) : (
        <UnlinkedNotice onVerifyClick={onVerifyClick} t={t} />
      )}

      {isLinked && (
        <>
          <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
            <PlaystyleRadarSection statsData={statsData ?? undefined} t={t} />
            <PlaystyleMetricsSection t={t} />
          </div>

          <PrestigeSystemSection
            prestigeTab={prestigeTab}
            setPrestigeTab={setPrestigeTab}
            statsData={statsData ?? undefined}
            onOpenModal={() => setShowAscendModal(true)}
            t={t}
          />

          <PrestigeAscendModal
            isOpen={showAscendModal}
            onClose={() => setShowAscendModal(false)}
            branch={prestigeTab}
            onSimulateSuccess={() =>
              showToast(
                `✨ ¡Ascenso a Prestigio I (${prestigeTab.toUpperCase()}) simulado con éxito!`,
                'success',
              )
            }
          />
        </>
      )}
    </div>
  );
}

interface AchievementsTabProps {
  statsData?: PlayerStatsData;
  achievementDefinitions: TranslatableItem[];
  unlockStatus: Record<string, boolean>;
  userAchievementsSet: Set<string>;
  username: string;
  t: TranslationFunction;
  lang: string;
}

function AchievementsTabContent({
  statsData,
  achievementDefinitions,
  unlockStatus,
  userAchievementsSet,
  username,
  t,
  lang,
}: Readonly<AchievementsTabProps>) {
  const [sharingAchievement, setSharingAchievement] = useState<{
    title: string;
    description: string;
    icon: React.ReactNode;
    unlocked: boolean;
  } | null>(null);

  const handleShare = (achievement: TranslatableItem, iconElement: React.ReactNode) => {
    setSharingAchievement({
      ...achievement,
      title: achievement.name,
      description: achievement.description,
      icon: iconElement,
      unlocked: true,
    });
  };

  return (
    <div key="achievements" className="fade-in">
      <h2 className="mb-8 border-b border-white/5 pb-4 text-2xl font-black uppercase tracking-tighter text-white">
        {t('account.achievements.title')}
      </h2>

      {sharingAchievement && (
        <ShareableCard
          achievement={sharingAchievement}
          username={username}
          onClose={() => setSharingAchievement(null)}
        />
      )}

      <AchievementsTimeline statsData={statsData} t={t} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {achievementDefinitions.length > 0 ? (
          achievementDefinitions.map((achievement) => {
            const achievementId = String(achievement.id ?? '');
            const isUnlocked =
              unlockStatus[achievementId] || userAchievementsSet.has(achievementId) || false;

            const renderedIcon = achievement.image_url ? (
              <img
                src={achievement.image_url}
                alt={achievement.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
              />
            ) : (
              (achievement.icon as React.ReactNode)
            );

            return (
              <AchievementCard
                key={achievementId}
                title={getLocalizedText(
                  achievement,
                  'name',
                  t,
                  lang,
                  `account.achievements.items.${achievementId}`,
                )}
                description={getLocalizedText(
                  achievement,
                  'description',
                  t,
                  lang,
                  `account.achievements.items.${achievementId}_desc`,
                )}
                criteria={getLocalizedText(
                  achievement,
                  'criteria',
                  t,
                  lang,
                  `account.achievements.items.${achievementId}_criteria`,
                )}
                icon={renderedIcon}
                unlocked={isUnlocked}
                onShare={isUnlocked ? () => handleShare(achievement, renderedIcon) : undefined}
                color={achievement.color}
              />
            );
          })
        ) : (
          <p
            style={{
              color: '#666',
              gridColumn: '1/-1',
              textAlign: 'center',
            }}
          >
            No hay logros.
          </p>
        )}
      </div>
    </div>
  );
}

// --- MAIN ACCOUNT COMPONENT ---

function useMobileSidebar() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { sidebarOpen, setSidebarOpen } = useSidebar();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  useEffect(() => {
    document.body.style.overflow = isMobile && sidebarOpen ? 'hidden' : 'unset';
  }, [isMobile, sidebarOpen]);

  return { isMobile, sidebarOpen, setSidebarOpen };
}

function useAccountDerivedUser(user: User | null, defaultNotLinkedText: string) {
  const mcUUID = user?.user_metadata?.minecraft_uuid;
  const isLinked = Boolean(mcUUID);
  const mcUsername = isLinked
    ? (user?.user_metadata?.minecraft_nick as string) || (user?.user_metadata?.username as string)
    : defaultNotLinkedText;

  const identities = user?.identities || [];
  const discordIdentity = identities.find((id: UserIdentity) => id.provider === 'discord');
  const twitchIdentity = identities.find((id: UserIdentity) => id.provider === 'twitch');
  const discordMetadata =
    user?.user_metadata?.discord_id ||
    user?.user_metadata?.discord_name ||
    user?.user_metadata?.discord_tag;
  const isDiscordLinked = Boolean(discordIdentity || discordMetadata);

  const userAchievementsSet = useMemo(
    () => new Set<string>((user?.user_metadata?.achievements as string[]) || []),
    [user?.user_metadata?.achievements],
  );

  return {
    mcUUID,
    isLinked,
    mcUsername,
    discordIdentity,
    twitchIdentity,
    isDiscordLinked,
    userAchievementsSet,
  };
}

interface AccountContentAreaProps {
  activeTab: string;
  isLinked: boolean;
  mcUsername: string;
  statsData?: PlayerStatsData | null;
  loadingStats: boolean;
  statsError: boolean;
  prestigeTab: PrestigeBranch;
  setPrestigeTab: React.Dispatch<React.SetStateAction<PrestigeBranch>>;
  showAscendModal: boolean;
  setShowAscendModal: React.Dispatch<React.SetStateAction<boolean>>;
  onTabChange: (tab: string) => void;
  connections: ReturnType<typeof useAccountConnections>;
  t: ReturnType<typeof useTranslation>['t'];
  lang: string;
  achievementDefinitions: TranslatableItem[];
  unlockStatus: Record<string, boolean>;
  userAchievementsSet: Set<string>;
  user: User;
  userThreads: UserThread[];
  loadingThreads: boolean;
  medalDefinitions: TranslatableItem[];
  discordIdentity?: UserIdentity;
  twitchIdentity?: UserIdentity;
  isDiscordLinked: boolean;
}

const AccountContentArea: React.FC<Readonly<AccountContentAreaProps>> = (props) => {
  switch (props.activeTab) {
    case 'overview':
      return (
        <OverviewTabContent
          isLinked={props.isLinked}
          statsData={
            props.statsData as unknown as ComponentProps<typeof OverviewTabContent>['statsData']
          }
          loadingStats={props.loadingStats}
          statsError={props.statsError}
          prestigeTab={props.prestigeTab}
          setPrestigeTab={props.setPrestigeTab}
          showAscendModal={props.showAscendModal}
          setShowAscendModal={props.setShowAscendModal}
          onVerifyClick={() => props.onTabChange('connections')}
          showToast={props.connections.showToast}
          t={props.t}
        />
      );
    case 'achievements':
      return (
        <AchievementsTabContent
          statsData={props.statsData || undefined}
          achievementDefinitions={props.achievementDefinitions}
          unlockStatus={props.unlockStatus}
          userAchievementsSet={props.userAchievementsSet}
          username={
            props.statsData?.username ||
            (props.user?.user_metadata?.full_name as string) ||
            'Jugador'
          }
          t={props.t}
          lang={props.lang}
        />
      );
    case 'posts':
      return (
        <div key="posts" className="fade-in">
          <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="m-0 text-2xl font-black uppercase tracking-tighter text-white">
              {props.t('account.posts.title')}
            </h2>
            <Link
              to="/forum"
              className="hover:bg-(--accent) rounded-xl bg-white px-6 py-2 text-xs font-black uppercase tracking-widest text-black shadow-xl shadow-white/5 transition-colors"
            >
              + {props.t('account.posts.create_topic', { defaultValue: 'Crear Tema' })}
            </Link>
          </div>
          <PostsTabContent
            threads={props.userThreads}
            isLoading={props.loadingThreads}
            t={props.t}
          />
        </div>
      );
    case 'medals':
      return (
        <div key="medals" className="fade-in">
          <h2 className="mb-8 border-b border-white/5 pb-4 text-2xl font-black uppercase tracking-tighter text-white">
            {props.t('account.medals_title', { defaultValue: 'Mis Medallas' })}
          </h2>
          <MedalsTabContent
            userMedals={props.user?.user_metadata?.medals}
            medalDefinitions={props.medalDefinitions}
            t={props.t}
            lang={props.lang}
          />
        </div>
      );
    case 'connections':
      return (
        <div key="connections" className="fade-in">
          <h2 className="mb-8 border-b border-white/5 pb-4 text-2xl font-black uppercase tracking-tighter text-white">
            {props.t('account.connections.title')}
          </h2>
          <ConnectionCards
            isLinked={props.isLinked}
            mcUsername={props.mcUsername}
            statsDataUsername={props.statsData?.username}
            linkCode={props.connections.linkCode}
            linkLoading={props.connections.linkLoading}
            onGenerateCode={props.connections.handleGenerateCode}
            discordIdentity={props.discordIdentity}
            isDiscordLinked={props.isDiscordLinked}
            discordMetadataName={
              (props.user?.user_metadata?.discord_tag as string) ||
              (props.user?.user_metadata?.discord_name as string) ||
              (props.user?.user_metadata?.social_discord as string)
            }
            discordMetadataAvatar={props.user?.user_metadata?.discord_avatar as string}
            twitchIdentity={props.twitchIdentity}
            onLinkProvider={handleLinkProvider}
            onUnlinkProvider={props.connections.handleUnlinkProvider}
            onUnlinkMinecraft={props.connections.handleUnlinkMinecraft}
            onUnlinkDiscord={props.connections.handleUnlinkDiscord}
            manualCode={props.connections.manualCode}
            onManualCodeChange={props.connections.setManualCode}
            onVerifyCode={props.connections.handleVerifyManualCode}
            isVerifying={props.connections.isVerifyingMutation}
            discordManualCode={props.connections.discordManualCode}
            onDiscordManualCodeChange={props.connections.setDiscordManualCode}
            onVerifyDiscordCode={props.connections.handleVerifyDiscordCode}
            isVerifyingDiscord={props.connections.isVerifyingMutation}
            onLinkMicrosoft={props.connections.handleLinkMicrosoft}
          />
        </div>
      );
    case 'settings':
      return (
        <ProfileSettings
          user={props.user}
          mcUsername={props.mcUsername}
          discordIdentity={props.discordIdentity}
          twitchIdentity={props.twitchIdentity}
          showToast={props.connections.showToast}
        />
      );
    default:
      return null;
  }
};

// --- MAIN ACCOUNT COMPONENT ---

export default function Account() {
  const { t, i18n } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Navigation State
  const activeTab = searchParams.get('tab') || 'overview';
  const [prestigeTab, setPrestigeTab] = useState<PrestigeBranch>('constructor');
  const [showAscendModal, setShowAscendModal] = useState(false);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  // Queries
  const { data: settingsData } = useAccountSettings();
  const medalDefinitions = settingsData?.medal_definitions || [];
  const achievementDefinitions = settingsData?.achievement_definitions || [];

  const { data: userThreads = [], isLoading: loadingThreads } = useUserThreads(
    user?.id,
    activeTab === 'posts',
  );

  const {
    mcUUID,
    isLinked,
    mcUsername,
    discordIdentity,
    twitchIdentity,
    isDiscordLinked,
    userAchievementsSet,
  } = useAccountDerivedUser(user, t('account.minecraft.not_linked'));

  const {
    data: statsData,
    isLoading: loadingStats,
    isError: statsError,
  } = usePlayerStats(mcUUID, activeTab === 'overview' || activeTab === 'connections');

  const { isMobile, sidebarOpen, setSidebarOpen } = useMobileSidebar();
  const connections = useAccountConnections(user);
  const unlockStatus = calculateUnlockStatus(user, statsData);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#080808',
        }}
      >
        <Loader style={{ height: 'auto', minHeight: 'auto' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] pb-16 pt-28">
      <div className="max-w-350 mx-auto px-6 lg:flex lg:gap-10">
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <button
            type="button"
            aria-label="Cerrar menú lateral"
            className="z-150 fixed inset-0 w-full cursor-pointer border-none bg-black/80 text-left backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <AccountSidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          user={user}
          statsData={statsData || undefined}
          mcUsername={mcUsername}
          isLinked={isLinked}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="animate-fade-in relative mt-8 flex-1 lg:mt-0">
          <AccountContentArea
            activeTab={activeTab}
            isLinked={isLinked}
            mcUsername={mcUsername}
            statsData={statsData}
            loadingStats={loadingStats}
            statsError={statsError}
            prestigeTab={prestigeTab}
            setPrestigeTab={setPrestigeTab}
            showAscendModal={showAscendModal}
            setShowAscendModal={setShowAscendModal}
            onTabChange={handleTabChange}
            connections={connections}
            t={t}
            lang={i18n.language}
            achievementDefinitions={achievementDefinitions as unknown as TranslatableItem[]}
            unlockStatus={unlockStatus}
            userAchievementsSet={userAchievementsSet}
            user={user}
            userThreads={userThreads as unknown as UserThread[]}
            loadingThreads={loadingThreads}
            medalDefinitions={medalDefinitions as unknown as TranslatableItem[]}
            discordIdentity={discordIdentity}
            twitchIdentity={twitchIdentity}
            isDiscordLinked={isDiscordLinked}
          />
        </main>
      </div>

      <ConfirmationModal
        isOpen={connections.isUnlinkModalOpen}
        onClose={() => !connections.isUnlinking && connections.setIsUnlinkModalOpen(false)}
        onConfirm={connections.confirmUnlink}
        isLoading={connections.isUnlinking}
        title={t('account.unlink_confirm_title', { defaultValue: 'Desvincular cuenta' })}
        message={t('account.unlink_confirm_msg', {
          defaultValue: '¿Estás seguro? Podrías perder acceso a ciertas características.',
        })}
      />

      <Toast
        isVisible={connections.toast.visible}
        message={connections.toast.message}
        type={connections.toast.type}
        onClose={() => connections.setToast((prev) => ({ ...prev, visible: false }))}
      />

      <SuccessModal
        isOpen={connections.showSuccessModal}
        onClose={() => connections.setShowSuccessModal(false)}
        onAction={() => window.location.reload()}
        title={t('account.connections.verify_success', { defaultValue: '¡VINCULACIÓN EXITOSA!' })}
        message={t('account.connections.success_link_desc', {
          defaultValue:
            'Tu cuenta de Minecraft ha sido conectada correctamente. Ahora tus estadísticas y rangos están sincronizados.',
        })}
        buttonText={t('common.accept', { defaultValue: 'GENIAL' })}
      />
    </div>
  );
}

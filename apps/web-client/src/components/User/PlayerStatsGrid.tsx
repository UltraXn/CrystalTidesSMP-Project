import { Suspense, lazy } from 'react';
import { Trophy } from 'lucide-react';
import Loader from '../UI/Loader';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

const PlaystyleRadar = lazy(() => import('../Account/PlaystyleRadarFinal'));

interface PlayerStats {
  playtime: string;
  kills: number;
  mob_kills: number;
  deaths: number;
  money: string;
  blocks_mined: string;
  blocks_placed: string;
  rank?: string;
  is_top1_constructor?: boolean;
  is_top1_luchador?: boolean;
  is_top1_mercader?: boolean;
  is_top1_constancia?: boolean;
  is_top1_explorador?: boolean;
  top1ConstructorScore?: number;
  top1LuchadorScore?: number;
  top1MercaderScore?: number;
  top1ConstanciaScore?: number;
  top1ExploradorScore?: number;
}

interface PlayerStatsGridProps {
  stats: PlayerStats | null;
  loading: boolean;
  isPublic: boolean;
  isAdmin: boolean;
}

// Helper to parse playtime "12h 30m"
const parsePlaytime = (ptStr: string): number => {
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

const parseMoney = (moneyStr: string): number => {
  if (!moneyStr) return 0;
  return Number.parseFloat(moneyStr.replace(/[^0-9.-]+/g, '')) || 0;
};

function renderRadarContent(loading: boolean, stats: PlayerStats | null, t: TFunction) {
  if (loading) {
    return (
      <div className="py-12">
        <Loader text={t('profile.loading_stats')} />
      </div>
    );
  }

  if (stats) {
    return (
      <div className="h-[220px] w-full">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center">
              <Loader />
            </div>
          }
        >
          <PlaystyleRadar
            stats={{
              blocksPlaced: Number(stats.blocks_placed || 0),
              blocksMined: Number(stats.blocks_mined || 0),
              kills: Number(stats.kills || 0),
              mobKills: Number(stats.mob_kills || 0),
              playtimeHours: parsePlaytime(stats.playtime),
              money: parseMoney(stats.money),
              rank: stats.rank ?? 'default',
              isTop1Constructor: stats.is_top1_constructor,
              isTop1Luchador: stats.is_top1_luchador,
              isTop1Mercader: stats.is_top1_mercader,
              isTop1Constancia: stats.is_top1_constancia,
              isTop1Explorador: stats.is_top1_explorador,
              top1ConstructorScore: stats.top1ConstructorScore,
              top1LuchadorScore: stats.top1LuchadorScore,
              top1MercaderScore: stats.top1MercaderScore,
              top1ConstanciaScore: stats.top1ConstanciaScore,
              top1ExploradorScore: stats.top1ExploradorScore,
            }}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="py-8 text-center text-xs font-bold italic text-gray-500">
      {t('profile.error_stats', 'No se pudieron cargar los datos de estilo.')}
    </div>
  );
}

export default function PlayerStatsGrid({
  stats,
  loading,
  isPublic,
  isAdmin,
}: Readonly<PlayerStatsGridProps>) {
  const { t } = useTranslation();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-md transition-colors hover:border-white/20 hover:shadow-2xl">
      <h3 className="mb-6 flex items-center gap-3 text-sm font-black uppercase tracking-widest text-white/40">
        <Trophy size={16} /> {t('profile.playstyle_title', 'Gráfico de Estilo')}
      </h3>

      {isPublic || isAdmin ? (
        <div className="flex flex-col items-center">{renderRadarContent(loading, stats, t)}</div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/5 bg-black/20 px-6 py-12 text-center">
          <div className="mb-2 text-2xl opacity-30">🔒</div>
          <p className="text-xs font-bold text-gray-500">
            {t('profile.private_stats', 'Este usuario mantiene su estilo de juego en privado.')}
          </p>
        </div>
      )}
    </div>
  );
}

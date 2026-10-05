export interface BossCardTheme {
  cardBg: string;
  viewportBg: string;
  badgeBg: string;
  activeBtn: string;
  activePhaseBtn: string;
  accentText: string;
  grid1: number;
  grid2: number;
}

export function getBossCardTheme(category = '', bossName = ''): BossCardTheme {
  const isBoss =
    category === 'bosses' ||
    category.includes('boss') ||
    bossName.toLowerCase().includes('terror') ||
    bossName.toLowerCase().includes('chesed') ||
    bossName.toLowerCase().includes('geburah') ||
    bossName.toLowerCase().includes('malkuth');
  const isHostile =
    !isBoss &&
    (category === 'mobs_hostiles' || category.includes('hostil') || category.includes('mythology'));
  const isCompanion =
    !isBoss &&
    !isHostile &&
    (category === 'mobs_pacificos' ||
      category.includes('pacifico') ||
      category.includes('critters'));

  if (isBoss) {
    return {
      cardBg:
        'border-rose-900/40 bg-gradient-to-br from-rose-950/20 via-neutral-900/95 to-neutral-950',
      viewportBg: 'bg-gradient-to-b from-rose-950/25 via-neutral-950 to-neutral-950',
      badgeBg: 'bg-rose-950/60 border-rose-800/60 text-rose-300',
      activeBtn: 'bg-rose-950/80 text-rose-100 border-rose-700/70',
      activePhaseBtn: 'bg-rose-900/40 border-rose-600/70 text-rose-200',
      accentText: 'text-rose-400',
      grid1: 0x881337,
      grid2: 0x4c0519,
    };
  }
  if (isHostile) {
    return {
      cardBg:
        'border-purple-900/30 bg-gradient-to-br from-purple-950/15 via-neutral-900/95 to-neutral-950',
      viewportBg: 'bg-gradient-to-b from-purple-950/20 via-neutral-950 to-neutral-950',
      badgeBg: 'bg-purple-950/50 border-purple-800/50 text-purple-300',
      activeBtn: 'bg-purple-950/80 text-purple-100 border-purple-700/70',
      activePhaseBtn: 'bg-purple-900/40 border-purple-600/70 text-purple-200',
      accentText: 'text-purple-400',
      grid1: 0x581c87,
      grid2: 0x2e1065,
    };
  }
  if (isCompanion) {
    return {
      cardBg:
        'border-emerald-900/30 bg-gradient-to-br from-emerald-950/15 via-neutral-900/95 to-neutral-950',
      viewportBg: 'bg-gradient-to-b from-emerald-950/20 via-neutral-950 to-neutral-950',
      badgeBg: 'bg-emerald-950/50 border-emerald-800/50 text-emerald-300',
      activeBtn: 'bg-emerald-950/80 text-emerald-100 border-emerald-700/70',
      activePhaseBtn: 'bg-emerald-900/40 border-emerald-600/70 text-emerald-200',
      accentText: 'text-emerald-400',
      grid1: 0x064e3b,
      grid2: 0x022c22,
    };
  }
  return {
    cardBg:
      'border-blue-900/30 bg-gradient-to-br from-blue-950/15 via-neutral-900/95 to-neutral-950',
    viewportBg: 'bg-gradient-to-b from-blue-950/20 via-neutral-950 to-neutral-950',
    badgeBg: 'bg-blue-950/50 border-blue-800/50 text-blue-300',
    activeBtn: 'bg-blue-950/80 text-blue-100 border-blue-700/70',
    activePhaseBtn: 'bg-blue-900/40 border-blue-600/70 text-blue-200',
    accentText: 'text-blue-400',
    grid1: 0x1e3a8a,
    grid2: 0x0f172a,
  };
}

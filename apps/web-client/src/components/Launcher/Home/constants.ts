export const LAUNCHER_HOME_CONSTANTS = {
  SERVER_IP: 'mc.crystaltidesSMP.net',
  ACCENT_COLOR: 'var(--accent)',
  BORDER_LOW: 'var(--border-low)',
  ACTIVE_STATE: 'ACTIVE',
  INACTIVE_STATE: 'INACTIVE',
  SESSION_MICROSOFT: 'microsoft',
  SESSION_GUEST: 'guest',
  BG_WHITE_05: 'rgba(255, 255, 255, 0.05)',
  TEXT_MUTED_55: 'rgba(255, 255, 255, 0.55)',
  ACCENT_TINT_12: 'rgba(45, 212, 191, 0.12)',
  ACCENT_BORDER_30: 'rgba(45, 212, 191, 0.3)',
  TEXT_MUTED_60: 'rgba(255, 255, 255, 0.6)',
} as const;

export interface ChipStyle {
  color: string;
  background: string;
  border: string;
  thumb: string;
}

export const categoryStyle = (category: string): ChipStyle => {
  const c = category.toLowerCase();
  if (c.includes('evento')) {
    return {
      color: '#C4B5FD',
      background: 'rgba(139, 92, 246, 0.12)',
      border: 'rgba(139, 92, 246, 0.35)',
      thumb: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 55%, #1E1038 100%)',
    };
  }
  if (c.includes('mantenimiento')) {
    return {
      color: '#FCD34D',
      background: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.35)',
      thumb: 'linear-gradient(135deg, #D97706 0%, #92400E 55%, #2A1503 100%)',
    };
  }
  if (c.includes('anuncio') || c.includes('comunidad')) {
    return {
      color: '#7DD3FC',
      background: 'rgba(14, 165, 233, 0.12)',
      border: 'rgba(14, 165, 233, 0.35)',
      thumb: 'linear-gradient(135deg, #0EA5E9 0%, #155E75 55%, #062530 100%)',
    };
  }
  return {
    color: LAUNCHER_HOME_CONSTANTS.ACCENT_COLOR,
    background: LAUNCHER_HOME_CONSTANTS.ACCENT_TINT_12,
    border: LAUNCHER_HOME_CONSTANTS.ACCENT_BORDER_30,
    thumb: 'linear-gradient(135deg, #0F766E 0%, #134E4A 55%, #04211E 100%)',
  };
};

export const getDayPart = (): string => {
  const h = new Date().getHours();
  if (h < 7) return 'Buenas noches';
  if (h < 13) return 'Buenos días';
  if (h < 21) return 'Buenas tardes';
  return 'Buenas noches';
};

export const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? 'Hace 1 semana' : `Hace ${weeks} semanas`;
};

export const getAccountBadgeLabel = (sessionType?: string): string => {
  if (sessionType === LAUNCHER_HOME_CONSTANTS.SESSION_GUEST) return 'Invitado';
  if (sessionType === LAUNCHER_HOME_CONSTANTS.SESSION_MICROSOFT) return 'Premium';
  return 'Sin sesión';
};

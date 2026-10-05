export interface StaffMember {
  id: string | number;
  name: string;
  mc_nickname?: string;
  role: string;
  role_en?: string;
  image: string;
  color: string;
  description: string;
  description_en?: string;
  socials?: {
    twitter?: string;
    discord?: string;
    youtube?: string;
    twitch?: string;
  };
}

export const RANK_BADGES: Record<string, string> = {
  Neroferno: '/ranks/rank-neroferno.png',
  Killuwu: '/ranks/rank-killu.png',
  Developer: '/ranks/developer.png',
  Admin: '/ranks/admin.png',
  Moderator: '/ranks/moderator.png',
  Helper: '/ranks/helper.png',
  Usuario: '/ranks/user.png',
  Staff: '/ranks/staff.png',
};

export const FALLBACK_STAFF: StaffMember[] = [
  {
    id: 'killu',
    name: 'KillubysmaliVT',
    role: 'Killuwu',
    color: '#00637c',
    image: '/skins/killu.png',
    mc_nickname: 'KillubysmaliVT',
    description:
      'Creadora, streamer y líder comunitaria. Mantiene la armonía del servidor, organiza eventos y es el corazón de la Pecerita.',
    socials: { twitter: 'KilluBysmali', discord: 'killubysmalivt', twitch: 'killubysmalivt' },
  },
  {
    id: 'nero',
    name: 'Neroferno ultranix',
    role: 'Neroferno',
    color: '#ff00b7',
    image: 'https://minotar.net/skin/344af588-8a7e-4053-9f03-92d68d96b86c',
    mc_nickname: 'Neroferno',
    description:
      'Co-fundador y desarrollador Lead. Inyectado de café y euforia, programa plugins custom, máquinas dedicadas, MySQL/Redis y mata los bugs en producción.',
    socials: { twitter: 'Neroferno', discord: 'neroferno' },
  },
  {
    id: 'xurlito',
    name: 'Xurlito',
    role: 'Developer',
    color: '#00aeef',
    image: '/skins/churly.png',
    mc_nickname: 'Xurlito',
    description:
      'Artista principal y consultor de diseño visual. Mantiene la estética pulida, las interfaces y la experiencia visual limpia de CrystalTides.',
    socials: { discord: 'churlito' },
  },
  {
    id: 'japa',
    name: 'JAPA325',
    role: 'Developer',
    color: '#1d4ed8',
    image: 'JAPA325',
    mc_nickname: 'JAPA325',
    description:
      'Consultor de niveles, experiencia de juego y BetaTester oficial. El agente del caos constructivo que busca romper las mecánicas para dejarlas a prueba de fallos.',
    socials: { discord: 'mocaccino25' },
  },
];

export const DISCORD_CHANNELS = [
  {
    name: '𝖢𝗁𝖺𝗋𝗅𝖺-𝗀𝖾𝗇𝖾𝗋𝖺𝗅🦑',
    desc: 'El centro de conversación y bienvenida diaria de la comunidad.',
  },
  {
    name: '𝖢𝗈𝗆𝗉-𝖺𝗋𝗍𝖾✨',
    desc: 'Espacio para compartir ilustraciones, diseños y creaciones del staff y miembros.',
  },
  {
    name: 'minecraft-and-chill',
    desc: 'Charlas sobre el survival, capturas del juego y proyectos en el servidor.',
  },
  {
    name: 'actualizacion-del-server',
    desc: 'Registro oficial de parches, parches del launcher e infraestructura técnica.',
  },
  {
    name: 'anuncios-minecraft',
    desc: 'Anuncios importantes, apertura de puertas, mantenimiento y notas de la versión.',
  },
  { name: 'sos🙀ඞ', desc: 'Canal rápido para alertas, asistencia y tickets de soporte directo.' },
];

export const getBadge = (role: string): string | null => {
  if (!role) return null;
  const key = Object.keys(RANK_BADGES).find((k) => k.toLowerCase() === role.toLowerCase());
  return key ? RANK_BADGES[key] : null;
};

export const resolveUrl = (url: string, platform: 'twitter' | 'youtube' | 'twitch'): string => {
  if (!url) return '#';
  if (url.startsWith('http')) return url;
  if (platform === 'twitter') return `https://x.com/${url.replace('@', '')}`;
  if (platform === 'youtube') return `https://youtube.com/@${url}`;
  if (platform === 'twitch') return `https://twitch.tv/${url}`;
  return url;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'online':
      return '#22c55e';
    case 'dnd':
      return '#ef4444';
    case 'idle':
      return '#eab308';
    default:
      return '#52525b';
  }
};

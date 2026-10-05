export interface RoleRank {
  levelNum: number;
  rankName: string;
  reqText: string;
  item: string;
}

export interface RoleRules {
  topTitle: string;
  topRequirement: string;
  rulesList: string[];
}

export interface Role {
  id: string;
  title: string;
  iconUrl: string;
  colorHex: string;
  subtitle: string;
  description: string;
  formulaDesc: string;
  benchmarkMetric: string;
  ranks: RoleRank[];
  rules: RoleRules;
  radarScore: number;
}

export interface PrestigeTier {
  level: number;
  name: string;
  badge: string;
  color: string;
  req: string;
}

// 5 Niveles de Prestigio Oficiales del Servidor
const REQ_TOP_SERVER = 'Top del Servidor';

export const PRESTIGE_TIERS: PrestigeTier[] = [
  {
    level: 1,
    name: 'Prestigio I (Cobre)',
    badge: '⭐ PRESTIGIO I',
    color: '#CD7F32',
    req: 'Racha inicial o hito de nivel 2',
  },
  {
    level: 2,
    name: 'Prestigio II (Hierro)',
    badge: '⭐⭐ PRESTIGIO II',
    color: '#94A3B8',
    req: 'Racha intermedia o hito de nivel 3',
  },
  {
    level: 3,
    name: 'Prestigio III (Oro)',
    badge: '⭐⭐⭐ PRESTIGIO III',
    color: '#F59E0B',
    req: 'Racha de 14 días o hito de nivel 4',
  },
  {
    level: 4,
    name: 'Prestigio IV (Diamante)',
    badge: '⭐⭐⭐⭐ PRESTIGIO IV',
    color: '#38BDF8',
    req: 'Racha de 30 días o Top 5 del Servidor',
  },
  {
    level: 5,
    name: 'Prestigio V (Iridium)',
    badge: '💎 PRESTIGIO V',
    color: '#E879F9',
    req: 'Top #1 indiscutido de la Maestría',
  },
];

export const roles: Role[] = [
  {
    id: 'constructor',
    title: 'Constructor & Colonizador',
    subtitle: 'Arte Arquitectónico y Reinos',
    iconUrl: 'https://minecraft.wiki/w/Special:Redirect/file/Crafting_Table.png',
    colorHex: '#38BDF8',
    description:
      'Domina el arte de la arquitectura y funda reinos. Diseña megaconstrucciones protegidas y conecta el mundo a través de rutas comerciales, puertos y ciudades.',
    formulaDesc:
      'Bloques minados + colocados. Cada hito de bloques te otorga un nuevo rango de construcción.',
    benchmarkMetric: 'Bloques Minados + Colocados',
    ranks: [
      {
        levelNum: 1,
        rankName: 'Iniciado',
        reqText: '0 bloques',
        item: 'https://minecraft.wiki/w/Special:Redirect/file/Wooden_Pickaxe.png',
      },
      {
        levelNum: 2,
        rankName: 'Novato',
        reqText: '1,000 bloques',
        item: 'https://minecraft.wiki/w/Special:Redirect/file/Iron_Pickaxe.png',
      },
      {
        levelNum: 3,
        rankName: 'Hábil',
        reqText: '10,000 bloques',
        item: 'https://minecraft.wiki/w/Special:Redirect/file/Diamond_Pickaxe.png',
      },
      {
        levelNum: 4,
        rankName: 'Arquitecto',
        reqText: '50,000 bloques',
        item: 'https://minecraft.wiki/w/Special:Redirect/file/Netherite_Pickaxe.png',
      },
      {
        levelNum: 5,
        rankName: 'Maestro Constructor',
        reqText: REQ_TOP_SERVER,
        item: 'https://minecraft.wiki/w/Special:Redirect/file/Beacon.png',
      },
    ],
    rules: {
      topTitle: 'Maestro Constructor Supremo',
      topRequirement: 'Suma total de bloques minados y colocados más alta del servidor',
      rulesList: [
        'Los bloques deben ser colocados y minados de forma orgánica jugando en el mundo survival.',
        'Queda estrictamente prohibido el bucleo artificial de bloques (romper y colocar el mismo bloque consecutivamente con scripts o macros).',
        'Las megaconstrucciones en zonas protegidas otorgan validación oficial en el mapa interactivo del servidor.',
      ],
    },
    radarScore: 95,
  },
  {
    id: 'luchador',
    title: 'Luchador & Gladiador',
    subtitle: 'PvP, Mobs y Mazmorras',
    iconUrl: 'https://minecraft.wiki/w/Special:Redirect/file/Diamond_Sword.png',
    colorHex: '#F43F5E',
    description:
      'Conquista las profundidades y domina la arena. Derrota jefes en mazmorras semanales, asegura cofres de eventos de control y lidera a tu clan a la gloria.',
    formulaDesc: '15 pts por kill PvP a jugadores y 1 pt por mob hostil eliminado.',
    benchmarkMetric: 'PvP (x15 pts) + Mobs (x1 pt)',
    ranks: [
      {
        levelNum: 1,
        rankName: 'Recluta',
        reqText: '0 pts',
        item: 'https://minecraft.wiki/w/Special:Redirect/file/Wooden_Sword.png',
      },
      {
        levelNum: 2,
        rankName: 'Novato',
        reqText: '50 pts',
        item: 'https://minecraft.wiki/w/Special:Redirect/file/Iron_Sword.png',
      },
      {
        levelNum: 3,
        rankName: 'Guerrero',
        reqText: '500 pts',
        item: 'https://minecraft.wiki/w/Special:Redirect/file/Diamond_Sword.png',
      },
      {
        levelNum: 4,
        rankName: 'Maestro de Armas',
        reqText: '2,500 pts',
        item: 'https://minecraft.wiki/w/Special:Redirect/file/Netherite_Sword.png',
      },
      {
        levelNum: 5,
        rankName: 'Señor de la Guerra',
        reqText: REQ_TOP_SERVER,
        item: 'https://minecraft.wiki/w/Special:Redirect/file/Mace.png',
      },
    ],
    rules: {
      topTitle: 'Señor de la Guerra',
      topRequirement:
        'Puntuación combinada de Kills PvP y bajas en Mazmorras más alta del servidor',
      rulesList: [
        'Las Kills PvP solo contabilizan entre jugadores distintos sin alianza de clan.',
        "El 'Kill Farming' (matar repetidamente a la misma cuenta o multicuentas) resultará en el reseteo completo de las estadísticas de combate.",
        'Las botes y mazmorras otorgan multiplicadores temporales durante eventos semanales.',
      ],
    },
    radarScore: 90,
  },
  {
    id: 'mercader',
    title: 'Mercader & Magnate',
    subtitle: 'Economía y KilluCoins',
    iconUrl: '/images/killucoins/coin_oro.webp',
    colorHex: '#F59E0B',
    description:
      'Controla los mercados del servidor. Comercia con otros jugadores, subasta ítems raros y acumula KilluCoins para dominar el ranking económico.',
    formulaDesc:
      'Escala logarítmica (100 × log₁₀(KilluCoins)). Cuanto más capital acumules, mayor rango económico obtienes.',
    benchmarkMetric: '100 × log₁₀(KilluCoins)',
    ranks: [
      {
        levelNum: 1,
        rankName: 'Ambulante',
        reqText: '0 KC',
        item: '/images/killucoins/coin_cobre.webp',
      },
      {
        levelNum: 2,
        rankName: 'Novato',
        reqText: '1,000 KC',
        item: '/images/killucoins/coin_plata.webp',
      },
      {
        levelNum: 3,
        rankName: 'Próspero',
        reqText: '10,000 KC',
        item: '/images/killucoins/coin_oro.webp',
      },
      {
        levelNum: 4,
        rankName: 'Noble',
        reqText: '50,000 KC',
        item: '/images/killucoins/coin_diamante.webp',
      },
      {
        levelNum: 5,
        rankName: 'Gran Maestro Gremial',
        reqText: REQ_TOP_SERVER,
        item: '/images/killucoins/coin_iridium.webp',
      },
    ],
    rules: {
      topTitle: 'Gran Maestro Gremial Supremo',
      topRequirement: 'Mayor fortuna acumulada en KilluCoins (escala logarítmica)',
      rulesList: [
        'El balance financiero se audita en tiempo real a través del plugin económico del servidor.',
        'Quedan prohibidos los traspasos ficticios o préstamos temporales de KilluCoins entre cuentas secundarias antes del corte de ranking.',
        'Las tiendas de jugadores y subastas otorgan bonificaciones de prestigio comercial.',
      ],
    },
    radarScore: 85,
  },
  {
    id: 'constancia',
    title: 'Constancia & Lealtad',
    subtitle: 'Rachas Diarias y Fidelidad',
    iconUrl: 'https://minecraft.wiki/w/Special:Redirect/file/Totem_of_Undying.png',
    colorHex: '#D946EF',
    description:
      'La lealtad tiene recompensa. Mantén rachas de conexión diaria, participa activamente en eventos y fortalece la presencia del servidor.',
    formulaDesc:
      'Crecimiento cuadrático (Días de Racha)². Premia la fidelidad máxima sin romper logins diarios.',
    benchmarkMetric: '(Días de Racha)²',
    ranks: [
      {
        levelNum: 1,
        rankName: 'Visitante',
        reqText: '0 días',
        item: 'https://minecraft.wiki/w/Special:Redirect/file/Clock.png',
      },
      {
        levelNum: 2,
        rankName: 'Viajero',
        reqText: '7 días',
        item: 'https://minecraft.wiki/w/Special:Redirect/file/Compass.png',
      },
      {
        levelNum: 3,
        rankName: 'Devoto',
        reqText: '14 días',
        item: 'https://minecraft.wiki/w/Special:Redirect/file/Bottle_o%27_Enchanting.png',
      },
      {
        levelNum: 4,
        rankName: 'Viciado',
        reqText: '30 días',
        item: 'https://minecraft.wiki/w/Special:Redirect/file/Totem_of_Undying.png',
      },
      {
        levelNum: 5,
        rankName: 'Inquebrantable',
        reqText: REQ_TOP_SERVER,
        item: 'https://minecraft.wiki/w/Special:Redirect/file/Nether_Star.png',
      },
    ],
    rules: {
      topTitle: 'Inquebrantable Supremo',
      topRequirement:
        'Racha ininterrumpida de días con crecimiento cuadrático más alta del servidor',
      rulesList: [
        'Las rachas diarias se resetean si no te conectas al menos 15 minutos en un lapso de 24 horas.',
        'Queda prohibido el AFK desmedido con máquinas automatizadas para engordar las horas jugadas sin actividad activa.',
        'Los miembros activos obtienen multiplicadores de recompensas diarias y cofres de lealtad.',
      ],
    },
    radarScore: 92,
  },
  {
    id: 'explorador',
    title: 'Explorador & Cartógrafo',
    subtitle: 'Travesías y Biomas Raros',
    iconUrl: 'https://minecraft.wiki/w/Special:Redirect/file/Compass.png',
    colorHex: '#10B981',
    description:
      'Recorre los confines del mundo survival, descubre estructuras legendarias, reclama mapas del tesoro y cartografía las tierras ignotas.',
    formulaDesc:
      '10 pts por hora de juego activa + 1 pt por cada km (1,000 bloques) recorrido en Minecraft.',
    benchmarkMetric: 'Horas (x10) + Km',
    ranks: [
      {
        levelNum: 1,
        rankName: 'Novato',
        reqText: '0 pts',
        item: 'https://minecraft.wiki/w/Special:Redirect/file/Leather_Boots_(item)_JE2.png',
      },
      {
        levelNum: 2,
        rankName: 'Curioso',
        reqText: '100 pts',
        item: 'https://minecraft.wiki/w/Special:Redirect/file/Spyglass.png',
      },
      {
        levelNum: 3,
        rankName: 'Mapeador',
        reqText: '500 pts',
        item: 'https://minecraft.wiki/w/Special:Redirect/file/Empty_Map.png',
      },
      {
        levelNum: 4,
        rankName: 'Pionero',
        reqText: '2,000 pts',
        item: 'https://minecraft.wiki/w/Special:Redirect/file/Elytra.png',
      },
      {
        levelNum: 5,
        rankName: 'Explorador Experto',
        reqText: REQ_TOP_SERVER,
        item: 'https://minecraft.wiki/w/Special:Redirect/file/Recovery_Compass.png',
      },
    ],
    rules: {
      topTitle: 'Explorador Experto Supremo',
      topRequirement: 'Mayor puntuación combinada de horas activas y distancia recorrida',
      rulesList: [
        'Se contabilizan trayectos a pie, a caballo, en barco y con Elytras.',
        'El teletransporte por comandos o waystones no suma distancia a la estadística de exploración.',
        'Descubrir estructuras raras del Nether y End otorga bonos de prestigio de explorador.',
      ],
    },
    radarScore: 88,
  },
];

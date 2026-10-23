import type { TFunction } from 'i18next';
import type { Stage, StageFloatingItem } from './types';

export * from './types';

import { DiscordIcon, TwitchIcon } from './StageSharedComponents';

export { DiscordIcon, TwitchIcon };

const SIZE_14_18 = 'w-14 h-14 sm:w-18 sm:h-18';
const SIZE_16_20 = 'w-16 h-16 sm:w-20 sm:h-20';

export const STAGE_FLOATING_ITEMS: Record<number, StageFloatingItem[]> = {
  1: [
    {
      icon: TwitchIcon,
      color: '#a855f7',
      pos: 'top-8 left-6 sm:left-10',
      size: 'w-12 h-12 sm:w-16 sm:h-16',
      duration: 14,
      rotateX: [10, -10, 10],
      rotateZ: [-8, 8, -8],
      y: [-6, 6, -6],
    },
    {
      icon: DiscordIcon,
      color: '#5865f2',
      pos: 'bottom-20 left-10 sm:left-16',
      size: 'w-12 h-12 sm:w-16 sm:h-16',
      duration: 18,
      rotateX: [-12, 12, -12],
      rotateZ: [6, -6, 6],
      y: [6, -6, 6],
    },
    {
      src: '/images/items/Diamond_JE3_BE3.png',
      pos: 'top-1/3 right-10 sm:right-16',
      size: SIZE_14_18,
      duration: 15,
      rotateX: [8, -8, 8],
      rotateZ: [-6, 6, -6],
      y: [-8, 8, -8],
    },
    {
      src: '/images/items/Emerald_JE3_BE3.png',
      pos: 'bottom-12 right-12 sm:right-24',
      size: SIZE_14_18,
      duration: 20,
      rotateX: [-10, 10, -10],
      rotateZ: [8, -8, 8],
      y: [8, -8, 8],
    },
  ],
  2: [
    {
      src: '/images/items/Totem_of_Undying_JE2_BE2.png',
      pos: 'top-10 left-8 sm:left-12',
      size: SIZE_16_20,
      duration: 16,
      rotateX: [12, -8, 12],
      rotateZ: [-6, 6, -6],
      y: [-8, 8, -8],
    },
    {
      src: '/images/items/Netherite_Chestplate_JE2_BE1.png',
      pos: 'bottom-16 left-12 sm:left-20',
      size: SIZE_16_20,
      duration: 15,
      rotateX: [-8, 12, -8],
      rotateZ: [8, -8, 8],
      y: [6, -6, 6],
    },
    {
      src: '/images/items/enchanted_book.webp',
      pos: 'top-1/4 right-8 sm:right-16',
      size: SIZE_16_20,
      duration: 17,
      rotateX: [10, -10, 10],
      rotateZ: [-6, 8, -6],
      y: [-6, 6, -6],
    },
    {
      src: '/images/items/Heavy_Core_JE1_BE1.png',
      pos: 'bottom-10 right-10 sm:right-24',
      size: SIZE_14_18,
      duration: 19,
      rotateX: [-12, 8, -12],
      rotateZ: [6, -6, 6],
      y: [8, -8, 8],
    },
  ],
  3: [
    {
      src: '/images/items/Dragon_Head_(S)_JE1.png',
      pos: 'top-10 left-6 sm:left-12',
      size: SIZE_16_20,
      duration: 15,
      rotateX: [14, -10, 14],
      rotateZ: [-8, 8, -8],
      y: [-8, 8, -8],
    },
    {
      src: '/images/items/Trident_(item).png',
      pos: 'bottom-14 left-10 sm:left-20',
      size: SIZE_14_18,
      duration: 14,
      rotateX: [-10, 12, -10],
      rotateZ: [6, -6, 6],
      y: [6, -6, 6],
    },
    {
      src: '/images/items/Beacon_JE6_BE2.webp',
      pos: 'top-1/3 right-10 sm:right-20',
      size: SIZE_14_18,
      duration: 18,
      rotateX: [10, -12, 10],
      rotateZ: [-6, 6, -6],
      y: [-6, 6, -6],
    },
    {
      src: '/images/items/xp_bottle.webp',
      pos: 'bottom-12 right-12 sm:right-24',
      size: SIZE_14_18,
      duration: 16,
      rotateX: [-8, 10, -8],
      rotateZ: [8, -8, 8],
      y: [8, -8, 8],
    },
  ],
  4: [
    {
      src: '/images/items/Elytra_JE2_BE2.png',
      pos: 'top-8 left-8 sm:left-14',
      size: SIZE_16_20,
      duration: 16,
      rotateX: [12, -12, 12],
      rotateZ: [-8, 8, -8],
      y: [-8, 8, -8],
    },
    {
      src: '/images/items/Saddle_JE2_BE2.png',
      pos: 'bottom-16 left-12 sm:left-24',
      size: SIZE_14_18,
      duration: 19,
      rotateX: [-10, 10, -10],
      rotateZ: [6, -6, 6],
      y: [6, -6, 6],
    },
    {
      src: '/images/items/Sniffer_Egg_(item)_JE1_BE1.png',
      pos: 'top-1/4 right-10 sm:right-16',
      size: SIZE_14_18,
      duration: 15,
      rotateX: [10, -10, 10],
      rotateZ: [-6, 8, -6],
      y: [-6, 6, -6],
    },
    {
      src: '/images/items/Silence_Armor_Trim_Smithing_Template_JE1_BE1.png',
      pos: 'bottom-10 right-14 sm:right-24',
      size: SIZE_14_18,
      duration: 17,
      rotateX: [-14, 10, -14],
      rotateZ: [8, -8, 8],
      y: [8, -8, 8],
    },
  ],
};

export function getServerHistoryStages(t: TFunction): Stage[] {
  return [
    {
      id: 1,
      year: '2022',
      stageName: t('history_section.stage1.stageName', 'ESTACIÓN 01'),
      title: t('history_section.stage1.title', 'La Pecerita de los Killufishies'),
      subtitle: t('history_section.stage1.subtitle', 'El Origen de la Comunidad en Twitch'),
      badge: t('history_section.stage1.badge', '✦ EL ORIGEN'),
      accentColor: '#89d9d1',
      icon: TwitchIcon,
      narrativeSummary: t(
        'history_section.stage1.summary',
        'El nacimiento de nuestra historia en los streams de Twitch de Killu: un espacio dedicado al arte, la ilustración y las primeras noches de juego casual.',
      ),
      features: [
        {
          icon: TwitchIcon,
          title: t('history_section.stage1.f1_title', 'Streams de Ilustración'),
          desc: t('history_section.stage1.f1_desc', 'Comunidad activa de dibujo & fanart'),
          badgeText: 'TWITCH',
          brandColor: '#9146ff',
        },
        {
          icon: DiscordIcon,
          title: t('history_section.stage1.f2_title', 'Noches de Minijuegos'),
          desc: t('history_section.stage1.f2_desc', 'Primeros momentos de chill & gaming'),
          badgeText: 'COMMUNITY',
          brandColor: '#5865f2',
        },
      ],
    },
    {
      id: 2,
      year: '2023',
      stageName: t('history_section.stage2.stageName', 'ESTACIÓN 02'),
      title: t('history_section.stage2.title', 'Creación del staff'),
      subtitle: t(
        'history_section.stage2.subtitle',
        'Formación del Núcleo de Desarrollo, Arte y QA',
      ),
      badge: t('history_section.stage2.badge', '✦ NÚCLEO STAFF'),
      accentColor: '#89d9d1',
      imageSrc: '/images/items/Beacon_JE6_BE2.webp',
      narrativeSummary: t(
        'history_section.stage2.summary',
        'Se forma el equipo oficial: Killu en la voz y comunidad, Nero en la arquitectura técnica e infraestructura, Churly en el diseño de interfaz y Japa en el testing de juego.',
      ),
      members: [
        {
          name: 'KillubysmaliVT',
          role: t('history_section.members.killu.role', 'Directora & Comunidad'),
          image: '/skins/killu.png',
          mc_nickname: 'KillubysmaliVT',
          rankBadge: '/ranks/rank-killu.png',
          color: '#00637c',
          desc: t(
            'history_section.members.killu.desc',
            'Líder comunitaria y streamer. El corazón de la Pecerita.',
          ),
        },
        {
          name: 'Neroferno ultranix',
          role: t('history_section.members.nero.role', 'Dev Lead & Infra'),
          image: 'https://minotar.net/skin/344af588-8a7e-4053-9f03-92d68d96b86c',
          mc_nickname: 'Neroferno',
          rankBadge: '/ranks/rank-neroferno.png',
          color: '#ff00b7',
          desc: t(
            'history_section.members.nero.desc',
            'Co-fundador. Arquitectura de código, MySQL/Redis y parches.',
          ),
        },
        {
          name: 'Xurlito',
          role: t('history_section.members.churly.role', 'Diseño & Arte Lead'),
          image: '/skins/churly.png',
          mc_nickname: 'Xurlito',
          rankBadge: '/ranks/developer.png',
          color: '#00aeef',
          desc: t(
            'history_section.members.churly.desc',
            'Artista principal. Dirección gráfica y estética pulida.',
          ),
        },
        {
          name: 'JAPA325',
          role: t('history_section.members.japa.role', 'QA & BetaTester'),
          image: 'JAPA325',
          mc_nickname: 'JAPA325',
          rankBadge: '/ranks/staff.png',
          color: '#000080',
          desc: t(
            'history_section.members.japa.desc',
            'Consultor de juego. El agente del caos a prueba de fallos.',
          ),
        },
      ],
    },
    {
      id: 3,
      year: 'Nov 2024',
      stageName: t('history_section.stage3.stageName', 'ESTACIÓN 03'),
      title: t('history_section.stage3.title', 'Evolución a CrystalTides SMP'),
      subtitle: t(
        'history_section.stage3.subtitle',
        'Sistema RPG, Economía VIVA & Bosses del Nether',
      ),
      badge: t('history_section.stage3.badge', '✦ EVOLUCIÓN'),
      accentColor: '#89d9d1',
      imageSrc: '/logo.png',
      narrativeSummary: t(
        'history_section.stage3.summary',
        'La pecerita fue renombrada como CrystalTidesSMP, un servidor nuevo con mecánicas nuevas y bosses increíbles.',
      ),
      features: [
        {
          imageSrc: '/images/items/Iron_Sword_JE2_BE2.png',
          title: t('history_section.stage3.f1_title', 'Habilidades mcMMO'),
          desc: t('history_section.stage3.f1_desc', 'Sistema RPG completo de maestrías & combate'),
          badgeText: 'MCMMO CORE',
          brandColor: '#f59e0b',
        },
        {
          imageSrc: '/images/killucoin.png',
          title: t('history_section.stage3.f2_title', 'Economía Killupesos'),
          desc: t(
            'history_section.stage3.f2_desc',
            'Se originó el futuro sistema de economía con 7 monedas de cambio',
          ),
          badgeText: 'ECONOMY',
          brandColor: '#10b981',
        },
        {
          imageSrc: '/images/items/Wither_Skeleton_Skull_(S)_JE2.png',
          title: t('history_section.stage3.f3_title', 'Forgotten Terror Boss'),
          desc: t('history_section.stage3.f3_desc', 'Mazmorra semanal y combates en el Nether'),
          badgeText: 'DUNGEON',
          brandColor: '#ef4444',
          videoUrl: 'https://x.com/NeroSecretsAlt/status/1859128432702918841?s=20',
        },
        {
          imageSrc: '/images/items/Waystone_Structure.png',
          title: t('history_section.stage3.f4_title', 'Red de Waystones'),
          desc: t('history_section.stage3.f4_desc', 'Teletransporte e hitos del mapa survival'),
          badgeText: 'MAP',
          brandColor: '#06b6d4',
        },
      ],
    },
    {
      id: 4,
      year: '2025 - 2026',
      stageName: t('history_section.stage4.stageName', 'ESTACIÓN 04'),
      title: t('history_section.stage4.title', 'Era Dedicada & Launcher'),
      subtitle: t(
        'history_section.stage4.subtitle',
        'Servidores Dedicados, Dominio Oficial y Futuro',
      ),
      badge: t('history_section.stage4.badge', '✦ ERA DEDICADA'),
      accentColor: '#89d9d1',
      imageSrc: '/images/items/Impulse_Command_Block_JE1.png',
      narrativeSummary: t(
        'history_section.stage4.summary',
        'Migración a infraestructura profesional en servidores dedicados Ubuntu Server (MySQL, Redis, nodos distribuidos), dominio oficial y Launcher Beta.',
      ),
      features: [
        {
          imageSrc: '/images/items/server_rack_icon.png',
          title: t('history_section.stage4.f1_title', 'Dedicated Ubuntu Node'),
          desc: t('history_section.stage4.f1_desc', '20 TPS constantes y nodos distribuidos'),
          badgeText: 'INFRA',
          brandColor: '#e95420',
        },
        {
          imageSrc: '/images/server_icon.png',
          title: t('history_section.stage4.f2_title', 'Mc.CrystalTidesSMP.net'),
          desc: t('history_section.stage4.f2_desc', 'Dominio oficial de conexión directa'),
          badgeText: 'DOMINIO',
          brandColor: '#00e5ff',
        },
        {
          imageSrc: '/images/items/Shield_JE2_BE1.webp',
          title: t('history_section.stage4.f3_title', 'Launcher Oficial Beta'),
          desc: t('history_section.stage4.f3_desc', 'Entrada optimizada al juego en 1-Click'),
          badgeText: 'CLIENT',
          brandColor: '#a855f7',
        },
      ],
    },
  ];
}

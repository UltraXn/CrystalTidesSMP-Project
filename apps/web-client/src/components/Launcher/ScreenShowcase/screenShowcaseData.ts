export interface ScreenItem {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  iconName: 'play' | 'layers' | 'folder' | 'shirt' | 'users' | 'alert';
  desc: string;
  features: string[];
  previewColor: string;
  badge: string;
}

export const SCREEN_SHOWCASE_ITEMS: ScreenItem[] = [
  {
    id: 'hub',
    num: '01',
    title: 'Launch Hub & Play Deck',
    subtitle: 'Centro de Mando Principal',
    iconName: 'play',
    desc: 'La pantalla principal integra el saludo personalizado del jugador, estado en vivo del servidor CrystalTides con ping en tiempo real, contador de horas de juego y el botón de lanzamiento con barra de progreso de descarga delta animada.',
    features: [
      'Barra de descarga integrada con indicador de velocidad (MB/s) y ETA',
      'Detección instantánea del estado del servidor (Ping & Jugadores en línea)',
      'Contador de horas históricas y selector rápido de perfil',
      'Banner de noticias y changelogs de la comunidad',
    ],
    previewColor: 'from-teal-500/20 via-purple-500/10 to-transparent',
    badge: 'CORE ENGINE',
  },
  {
    id: 'versions',
    num: '02',
    title: 'Version Matrix Switcher',
    subtitle: 'Selector Visual de Versiones',
    iconName: 'layers',
    desc: 'Revolucionaria cuadrícula de versiones que permite saltar entre snapshots futuros (26.1), la versión recomendada de CrystalTides (1.21.3 Fabric), versiones históricas (1.20, 1.16) y perfiles legacy (1.8.9 PvP) con un solo clic.',
    features: [
      'Filtros instantáneos por Fabric, Forge, NeoForge y Vanilla',
      'Selector de subversiones (ej. 1.21.1, 1.21.3, 1.21.4)',
      "Badges de estado: 'RECOMENDADO', 'NUEVO', 'SNAPSHOT'",
      'Lanzamiento directo o configuración avanzada por versión',
    ],
    previewColor: 'from-purple-500/20 via-teal-500/10 to-transparent',
    badge: 'VERSION HUB',
  },
  {
    id: 'mods',
    num: '03',
    title: 'Mod & Shader Center',
    subtitle: 'Gestión y Detección de Conflictos',
    iconName: 'folder',
    desc: 'Administra decenas de mods en milisegundos con interruptores de activación individual, categorización inteligente (Optimización, Shaders, Sonido, QoL) y soporte para arrastrar y soltar archivos .jar directamente a la ventana.',
    features: [
      'Interruptores iluminados de activación/desactivación en tiempo real',
      'Buscador instantáneo por nombre o creador',
      'Detección de dependencias y advertencia de versiones incompatibles',
      'Sincronización SHA-256 con el modpack oficial del servidor',
    ],
    previewColor: 'from-teal-500/20 via-sky-500/10 to-transparent',
    badge: 'MOD ENGINE',
  },
  {
    id: 'locker',
    num: '04',
    title: '3D Cosmetics & Cape Wardrobe',
    subtitle: 'Armario y Capas en la Nube',
    iconName: 'shirt',
    desc: 'Previsualiza tu skin en tres dimensiones con rotación completa de 360°, selector de capas oficiales de CrystalTides y soporte para guardar presets estéticos que se sincronizan con tu cuenta web.',
    features: [
      'Visor 3D interactivo con rotación libre y animación de postura',
      'Carrusel de capas exclusivas con equipamiento en 1 clic',
      'Sincronización con la nube de CrystalTides SMP',
      'Presets visuales listos para PvP y Cinema Shaders',
    ],
    previewColor: 'from-amber-500/20 via-purple-500/10 to-transparent',
    badge: '3D LOCKER',
  },
  {
    id: 'social',
    num: '05',
    title: 'Social Presence & Live Chat',
    subtitle: 'Amigos y Mensajería Instantánea',
    iconName: 'users',
    desc: 'Mantente conectado con tus compañeros de clan sin salir del launcher gracias a la presencia enriquecida (Rich Presence) que muestra si tus amigos están jugando en el SMP, explorando dungeons o en los menús.',
    features: [
      "Estados en vivo: 'En CrystalTides SMP 👑', 'En Dungeons', 'En Menús'",
      'Ventana emergente de chat directo con confirmación de lectura',
      'Pestañas de lista de amigos y solicitudes entrantes',
      'Unión rápida al servidor haciendo clic sobre un amigo en línea',
    ],
    previewColor: 'from-sky-500/20 via-teal-500/10 to-transparent',
    badge: 'SOCIAL NETWORK',
  },
  {
    id: 'diagnostics',
    num: '06',
    title: 'Crash Reporter & Diagnostics',
    subtitle: 'Diagnóstico Inteligente de Errores',
    iconName: 'alert',
    desc: 'Cuando un mod o entidad provoca el cierre de Minecraft, el modal de diagnóstico detecta el código de salida, identifica el mod sospechoso culpable (ej. Lithium/Mixin) y ofrece un botón de re-arranque con copiado del log de error.',
    features: [
      'Análisis de Mixin y StackTrace para señalar el mod responsable',
      'Botón de re-lanzamiento en 1 solo clic',
      'Copiado instantáneo del reporte para soporte en Discord',
      'Acceso directo a la carpeta de crash-reports y logs',
    ],
    previewColor: 'from-red-500/20 via-purple-500/10 to-transparent',
    badge: 'DIAGNOSTICS',
  },
];

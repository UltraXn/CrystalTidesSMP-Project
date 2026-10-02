import React, { useState } from "react";
import {
  Play,
  Layers,
  FolderTree,
  Shirt,
  Users,
  AlertTriangle,
  ChevronRight,
  Check,
  Download,
  Sparkles,
} from "lucide-react";

export const ScreenShowcaseSection: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<number>(0);

  const screens = [
    {
      id: "hub",
      num: "01",
      title: "Launch Hub & Play Deck",
      subtitle: "Centro de Mando Principal",
      icon: <Play className="h-4 w-4 text-teal-400" />,
      desc: "La pantalla principal integra el saludo personalizado del jugador, estado en vivo del servidor CrystalTides con ping en tiempo real, contador de horas de juego y el botón de lanzamiento con barra de progreso de descarga delta animada.",
      features: [
        "Barra de descarga integrada con indicador de velocidad (MB/s) y ETA",
        "Detección instantánea del estado del servidor (Ping & Jugadores en línea)",
        "Contador de horas históricas y selector rápido de perfil",
        "Banner de noticias y changelogs de la comunidad",
      ],
      previewColor: "from-teal-500/20 via-purple-500/10 to-transparent",
      badge: "CORE ENGINE",
    },
    {
      id: "versions",
      num: "02",
      title: "Version Matrix Switcher",
      subtitle: "Selector Visual de Versiones",
      icon: <Layers className="h-4 w-4 text-purple-400" />,
      desc: "Revolucionaria cuadrícula de versiones que permite saltar entre snapshots futuros (26.1), la versión recomendada de CrystalTides (1.21.3 Fabric), versiones históricas (1.20, 1.16) y perfiles legacy (1.8.9 PvP) con un solo clic.",
      features: [
        "Filtros instantáneos por Fabric, Forge, NeoForge y Vanilla",
        "Selector de subversiones (ej. 1.21.1, 1.21.3, 1.21.4)",
        "Badges de estado: 'RECOMENDADO', 'NUEVO', 'SNAPSHOT'",
        "Lanzamiento directo o configuración avanzada por versión",
      ],
      previewColor: "from-purple-500/20 via-teal-500/10 to-transparent",
      badge: "VERSION HUB",
    },
    {
      id: "mods",
      num: "03",
      title: "Mod & Shader Center",
      subtitle: "Gestión y Detección de Conflictos",
      icon: <FolderTree className="h-4 w-4 text-teal-400" />,
      desc: "Administra decenas de mods en milisegundos con interruptores de activación individual, categorización inteligente (Optimización, Shaders, Sonido, QoL) y soporte para arrastrar y soltar archivos .jar directamente a la ventana.",
      features: [
        "Interruptores iluminados de activación/desactivación en tiempo real",
        "Buscador instantáneo por nombre o creador",
        "Detección de dependencias y advertencia de versiones incompatibles",
        "Sincronización SHA-256 con el modpack oficial del servidor",
      ],
      previewColor: "from-teal-500/20 via-sky-500/10 to-transparent",
      badge: "MOD ENGINE",
    },
    {
      id: "locker",
      num: "04",
      title: "3D Cosmetics & Cape Wardrobe",
      subtitle: "Armario y Capas en la Nube",
      icon: <Shirt className="h-4 w-4 text-amber-400" />,
      desc: "Previsualiza tu skin en tres dimensiones con rotación completa de 360°, selector de capas oficiales de CrystalTides y soporte para guardar presets estéticos que se sincronizan con tu cuenta web.",
      features: [
        "Visor 3D interactivo con rotación libre y animación de postura",
        "Carrusel de capas exclusivas con equipamiento en 1 clic",
        "Sincronización con la nube de CrystalTides SMP",
        "Presets visuales listos para PvP y Cinema Shaders",
      ],
      previewColor: "from-amber-500/20 via-purple-500/10 to-transparent",
      badge: "3D LOCKER",
    },
    {
      id: "social",
      num: "05",
      title: "Social Presence & Live Chat",
      subtitle: "Amigos y Mensajería Instantánea",
      icon: <Users className="h-4 w-4 text-sky-400" />,
      desc: "Mantente conectado con tus compañeros de clan sin salir del launcher gracias a la presencia enriquecida (Rich Presence) que muestra si tus amigos están jugando en el SMP, explorando dungeons o en los menús.",
      features: [
        "Estados en vivo: 'En CrystalTides SMP 👑', 'En Dungeons', 'En Menús'",
        "Ventana emergente de chat directo con confirmación de lectura",
        "Pestañas de lista de amigos y solicitudes entrantes",
        "Unión rápida al servidor haciendo clic sobre un amigo en línea",
      ],
      previewColor: "from-sky-500/20 via-teal-500/10 to-transparent",
      badge: "SOCIAL NETWORK",
    },
    {
      id: "diagnostics",
      num: "06",
      title: "Crash Reporter & Diagnostics",
      subtitle: "Diagnóstico Inteligente de Errores",
      icon: <AlertTriangle className="h-4 w-4 text-red-400" />,
      desc: "Cuando un mod o entidad provoca el cierre de Minecraft, el modal de diagnóstico detecta el código de salida, identifica el mod sospechoso culpable (ej. Lithium/Mixin) y ofrece un botón de re-arranque con copiado del log de error.",
      features: [
        "Análisis de Mixin y StackTrace para señalar el mod responsable",
        "Botón de re-lanzamiento en 1 solo clic",
        "Copiado instantáneo del reporte para soporte en Discord",
        "Acceso directo a la carpeta de crash-reports y logs",
      ],
      previewColor: "from-red-500/20 via-purple-500/10 to-transparent",
      badge: "DIAGNOSTICS",
    },
  ];

  const current = screens[activeScreen];

  return (
    <section className="relative z-10 mx-auto max-w-6xl space-y-12 px-4 py-16 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-purple-300">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span>EXPERIENCIA DE PANTALLAS UI/UX</span>
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
          Diseñado Pantalla a Pantalla para la{" "}
          <span className="text-teal-400">Élite</span>
        </h2>
        <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
          Explora la arquitectura de cada módulo del cliente: interfaces
          limpias, ausencia de ruido visual y accesibilidad inmediata para tus
          partidas.
        </p>
      </div>

      {/* Screen Selector Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {screens.map((s, idx) => {
          const isActive = activeScreen === idx;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveScreen(idx)}
              aria-label={s.title}
              className={`flex cursor-pointer flex-col justify-between gap-3 rounded-xl border p-3.5 text-left transition-all ${
                isActive
                  ? "border-teal-500/50 bg-[#130b1e] shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/30"
                  : "hover:bg-white/3 border-white/10 bg-[#09050e]/90 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-[11px] font-bold ${isActive ? "text-teal-400" : "text-slate-500"}`}
                >
                  {s.num}
                </span>
                <span
                  className={`rounded-lg p-1.5 ${isActive ? "bg-teal-500/20 text-teal-300" : "bg-white/5 text-slate-400"}`}
                >
                  {s.icon}
                </span>
              </div>
              <div>
                <div
                  className={`text-xs font-bold ${isActive ? "text-white" : "text-slate-300"}`}
                >
                  {s.title.split("&")[0]}
                </div>
                <div className="truncate text-[10px] text-slate-500">
                  {s.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Screen Detail Stage & Mockup Visualizer */}
      <div className="relative grid grid-cols-1 items-center gap-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0a0512] p-6 shadow-2xl sm:p-10 lg:grid-cols-12">
        {/* Glow Background */}
        <div
          className={`bg-linear-to-br absolute inset-0 ${current.previewColor} pointer-events-none opacity-60`}
        />

        {/* Left Column: Descriptive Breakdown */}
        <div className="relative z-10 space-y-6 lg:col-span-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-teal-500/20 bg-teal-500/10 px-2.5 py-1 font-mono text-xs font-black text-teal-400">
                PANTALLA {current.num}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                {current.badge}
              </span>
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              {current.title}
            </h3>
            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              {current.desc}
            </p>
          </div>

          {/* Features Checkpoints */}
          <div className="space-y-2.5 border-t border-white/5 pt-2">
            {current.features.map((feat, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 text-xs text-slate-200"
              >
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-400">
                  <Check className="stroke-3 h-2.5 w-2.5" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <a
              href="#launcher"
              className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 transition-colors hover:text-teal-300"
            >
              <span>Probar en el simulador interactivo arriba</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Right Column: High-Fidelity UI Wireframe Mockup */}
        <div className="relative z-10 lg:col-span-7">
          <div className="space-y-4 rounded-2xl border border-white/15 bg-[#07030a]/90 p-4 shadow-2xl sm:p-6">
            {/* Mockup Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="ml-2 font-mono text-[11px] text-slate-400">
                  CrystalTides Client • {current.title}
                </span>
              </div>
              <span className="rounded border border-teal-500/20 bg-teal-950/60 px-2 py-0.5 font-mono text-[10px] text-teal-400">
                60 FPS
              </span>
            </div>

            {/* Mockup Specific Renderers depending on active screen */}
            {activeScreen === 0 && (
              /* SCREEN 01: Launch Hub */
              <div className="space-y-4 pt-1">
                <div className="bg-linear-to-r flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-500/20 from-teal-950/40 via-purple-950/30 to-black p-4">
                  <div>
                    <div className="text-xs text-slate-400">Buenos días,</div>
                    <div className="text-base font-black text-white">
                      AlexGamer99 👑
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[10px] uppercase text-teal-400">
                      mc.crystaltidesSMP.net
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                      142 Jugadores en línea
                    </div>
                  </div>
                </div>

                {/* Big Launch Button with Simulated Download Bar */}
                <div className="space-y-3 rounded-xl border border-white/10 bg-[#0f081b] p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold text-white">
                      <Download className="h-3.5 w-3.5 text-teal-400" />
                      DESCARGANDO ACTUALIZACIÓN (Fabric 1.21.3)
                    </span>
                    <span className="font-mono font-bold text-teal-300">
                      84.2 MB / 112.5 MB (75%)
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full border border-slate-700 bg-slate-900 p-0.5">
                    <div className="bg-linear-to-r h-full w-3/4 animate-pulse rounded-full from-teal-400 to-purple-500" />
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-slate-400">
                    <span>Velocidad: 18.4 MB/s</span>
                    <span>Delta Sync SHA-256 Verificado</span>
                  </div>
                </div>
              </div>
            )}

            {activeScreen === 1 && (
              /* SCREEN 02: Version Switcher */
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-linear-to-br space-y-2 rounded-xl border border-purple-500/30 from-purple-900/30 to-black p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-purple-300">
                      Snapshot
                    </span>
                    <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[9px] font-bold text-purple-300">
                      26.1
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white">26.1.1</div>
                  <div className="text-[11px] text-slate-400">
                    Future Snapshot • Fabric
                  </div>
                </div>

                <div className="bg-linear-to-br space-y-2 rounded-xl border border-teal-500/40 from-teal-900/30 to-black p-3.5 ring-1 ring-teal-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-teal-300">
                      Recomendado
                    </span>
                    <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[9px] font-bold text-teal-300">
                      1.21
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white">1.21.3</div>
                  <div className="text-[11px] font-semibold text-teal-300">
                    CrystalTides SMP • Fabric
                  </div>
                </div>
              </div>
            )}

            {activeScreen === 2 && (
              /* SCREEN 03: Mod Manager */
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs">
                  <span className="font-bold text-white">
                    Sodium 0.6.2 (Optimization)
                  </span>
                  <span className="rounded bg-teal-500/10 px-2 py-0.5 font-mono text-[10px] text-teal-400">
                    ACTIVO
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs">
                  <span className="font-bold text-white">
                    Iris Shaders 1.8.0
                  </span>
                  <span className="rounded bg-teal-500/10 px-2 py-0.5 font-mono text-[10px] text-teal-400">
                    ACTIVO
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs">
                  <span className="font-bold text-white">Cloth Config v15</span>
                  <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-400">
                    INACTIVO
                  </span>
                </div>
              </div>
            )}

            {activeScreen === 3 && (
              /* SCREEN 04: 3D Locker */
              <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-black/40 p-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-teal-500/30 bg-teal-950/30 text-3xl shadow-inner">
                  🧙‍♂️
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="text-xs font-bold text-white">
                    Capa Oficial CrystalTides 2026
                  </div>
                  <div className="text-[11px] text-teal-400">
                    Estado: Equipada en Servidor
                  </div>
                  <div className="font-mono text-[10px] text-slate-400">
                    Shader Preset: High Ultra (PBR)
                  </div>
                </div>
              </div>
            )}

            {activeScreen === 4 && (
              /* SCREEN 05: Social Overlay */
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between rounded-lg border border-teal-500/20 bg-teal-500/10 p-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-400" />
                    <span className="font-bold text-white">172px</span>
                  </div>
                  <span className="font-mono text-[10px] text-teal-300">
                    En CrystalTides SMP 💎
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-400" />
                    <span className="font-bold text-white">daaaavidds</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    En el Launcher
                  </span>
                </div>
              </div>
            )}

            {activeScreen === 5 && (
              /* SCREEN 06: Crash Reporter */
              <div className="space-y-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Cierre Inesperado Detectado (Exit Code: 255)</span>
                </div>
                <div className="rounded border border-red-500/20 bg-black/50 p-2 font-mono text-[11px] text-slate-300">
                  Causa sospechosa: Lithium (lithium-fabric-mc1.21.3.jar)
                </div>
                <div className="flex justify-end gap-2 text-[10px]">
                  <span className="rounded bg-teal-500 px-2.5 py-1 font-bold text-slate-950">
                    Reiniciar Juego
                  </span>
                  <span className="rounded bg-white/10 px-2.5 py-1 font-bold text-white">
                    Copiar Log
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

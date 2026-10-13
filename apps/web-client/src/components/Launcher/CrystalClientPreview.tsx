import React, { useState, useRef, useEffect } from 'react'; // React: hooks esenciales para ciclo de vida y referencias de timers
import {
  Bell,
  MessageSquare,
  Layers,
  Compass,
  Sliders,
  ShoppingCart,
  Settings,
  Search,
  UserPlus,
  ExternalLink,
  Swords,
  Box,
  X,
  Minimize2,
  Square,
  Check,
  Send,
  CheckCheck,
} from 'lucide-react';

export interface FriendEntry {
  name: string;
  avatar: string;
  status: string;
  statusType: 'online' | 'launcher' | 'menu' | 'idle' | 'offline';
  activity: string;
}

const SAMPLE_FRIENDS_ONLINE: FriendEntry[] = [
  {
    name: '172px',
    avatar: 'https://mc-heads.net/avatar/172px/64',
    status: 'In-game: CrystalTides 👑',
    statusType: 'online',
    activity: 'CrystalTides SMP',
  },
  {
    name: 'daaaavidds',
    avatar: 'https://mc-heads.net/avatar/daaaavidds/64',
    status: 'In-game: Singleplayer',
    statusType: 'online',
    activity: 'Mundo Local',
  },
  {
    name: 'masaya46',
    avatar: 'https://mc-heads.net/avatar/masaya46/64',
    status: 'In-game: Private Server',
    statusType: 'online',
    activity: 'Servidor Privado',
  },
  {
    name: '3wafyy',
    avatar: 'https://mc-heads.net/avatar/3wafyy/64',
    status: 'In Launcher',
    statusType: 'launcher',
    activity: 'Launcher',
  },
  {
    name: 'cuvsa',
    avatar: 'https://mc-heads.net/avatar/cuvsa/64',
    status: 'In-game: CrystalTides SMP 💎',
    statusType: 'online',
    activity: 'CrystalTides SMP',
  },
  {
    name: 'zakhbear',
    avatar: 'https://mc-heads.net/avatar/zakhbear/64',
    status: 'In Menus',
    statusType: 'menu',
    activity: 'Menús',
  },
  {
    name: 'KingofHalo04',
    avatar: 'https://mc-heads.net/avatar/KingofHalo04/64',
    status: 'Idle',
    statusType: 'idle',
    activity: 'Ausente',
  },
  {
    name: 'meegreyone',
    avatar: 'https://mc-heads.net/avatar/meegreyone/64',
    status: 'Idle',
    statusType: 'idle',
    activity: 'Ausente',
  },
];

const SAMPLE_FRIENDS_OFFLINE: FriendEntry[] = [
  {
    name: 'XerxerBro',
    avatar: 'https://mc-heads.net/avatar/XerxerBro/64',
    status: 'Offline for 3 days',
    statusType: 'offline',
    activity: '',
  },
  {
    name: '2fishbowl',
    avatar: 'https://mc-heads.net/avatar/2fishbowl/64',
    status: 'Offline for 21 hours',
    statusType: 'offline',
    activity: '',
  },
  {
    name: 'wtfbroimlagging',
    avatar: 'https://mc-heads.net/avatar/Steve/64',
    status: 'Offline for 36 days',
    statusType: 'offline',
    activity: '',
  },
  {
    name: 'Director32',
    avatar: 'https://mc-heads.net/avatar/Alex/64',
    status: 'Offline for 121 days',
    statusType: 'offline',
    activity: '',
  },
];

const getLaunchButtonLabel = (downloading: boolean, progress: number): string => {
  if (!downloading) return 'LAUNCH';
  return progress >= 100 ? 'READY' : 'SYNCING';
};

const getStatusBadgeColor = (statusType: string): string => {
  if (statusType === 'online') return 'bg-emerald-400';
  if (statusType === 'launcher') return 'bg-purple-400';
  return 'bg-amber-400';
};

// eslint-disable-next-line react-doctor/no-giant-component
export const CrystalClientPreview: React.FC = () => {
  const [activeNav, setActiveNav] = useState<string>('home');
  const [selectedProfile, setSelectedProfile] = useState<string>('crystaltides');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [searchFriend, setSearchFriend] = useState('');
  const [activeChatFriend, setActiveChatFriend] = useState<FriendEntry | null>(null);
  const [chatMessages, setChatMessages] = useState<
    { sender: 'me' | 'them'; text: string; time: string }[]
  >([
    {
      sender: 'them',
      text: '¿Entras al server a farmear shards?',
      time: '19:02',
    },
    {
      sender: 'me',
      text: 'Sí, ya estoy abriendo el cliente con los nuevos shaders!',
      time: '19:04',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const downloadTimerRef = useRef<ReturnType<typeof setInterval> | null>(null); // React Doctor: referencia para cancelar intervalo al desmontar
  const chatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // React Doctor: referencia para cancelar timeout al desmontar

  useEffect(() => {
    // React Doctor: limpiar cualquier timer activo al desmontar el componente para evitar memory leaks
    return () => {
      if (downloadTimerRef.current) clearInterval(downloadTimerRef.current); // React Doctor: liberar timer de descarga
      if (chatTimerRef.current) clearTimeout(chatTimerRef.current); // React Doctor: liberar timer de respuesta chat
    };
  }, []);

  useEffect(() => {
    if (isDownloading && downloadProgress >= 100) {
      if (downloadTimerRef.current) {
        clearInterval(downloadTimerRef.current);
        downloadTimerRef.current = null;
      }
      const finishTimer = setTimeout(() => {
        setIsDownloading(false);
      }, 2000);
      return () => clearTimeout(finishTimer);
    }
  }, [isDownloading, downloadProgress]);

  const handleLaunch = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(0);

    if (downloadTimerRef.current) clearInterval(downloadTimerRef.current);
    downloadTimerRef.current = setInterval(() => {
      setDownloadProgress((prev) => (prev >= 100 ? 100 : prev + 10));
    }, 250);
  };

  const handleSendChatMessage = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setChatMessages((prev) => [...prev, { sender: 'me', text: chatInput, time: timeStr }]);
    setChatInput('');

    if (chatTimerRef.current) clearTimeout(chatTimerRef.current); // React Doctor: cancelar timeout previo si el usuario envía mensajes seguidos
    chatTimerRef.current = setTimeout(() => {
      // React Doctor: timeout asignado a ref para posibilitar limpieza en unmount
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'them',
          text: '¡De una! Te veo en las coordenadas del spawn 🚀',
          time: timeStr,
        },
      ]);
    }, 1000);
  };

  const filteredOnline = SAMPLE_FRIENDS_ONLINE.filter((f) =>
    f.name.toLowerCase().includes(searchFriend.toLowerCase()),
  );

  return (
    <div className="max-w-310 mx-auto flex w-full select-none flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#07090e] font-sans text-slate-100 shadow-2xl">
      {/* ── TOP TITLE BAR ── */}
      <div className="flex h-10 items-center justify-between border-b border-white/5 bg-[#05060a] px-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold tracking-wide text-white">
            <span className="text-sm text-teal-400">💎</span>
            <span>CrystalTides Client</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-[11px] text-slate-400">Build 2.4.0</span>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span>9,101 Online</span>
          </div>
        </div>

        {/* Window Action Buttons */}
        <div className="flex items-center gap-3 text-slate-400">
          <button
            type="button"
            aria-label="Minimize"
            className="cursor-pointer p-1 transition-colors hover:text-white"
          >
            <Minimize2 className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Maximize"
            className="cursor-pointer p-1 transition-colors hover:text-white"
          >
            <Square className="size-3" />
          </button>
          <button
            type="button"
            aria-label="Close"
            className="cursor-pointer p-1 transition-colors hover:text-red-400"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ── MAIN BODY (3-COLUMN LAYOUT) ── */}
      <div className="min-h-160 relative flex flex-1 overflow-hidden bg-[#07090f]">
        {/* 1. LEFT SIDEBAR */}
        <nav className="z-20 flex w-16 shrink-0 flex-col items-center justify-between border-r border-white/5 bg-[#040609] py-4">
          {/* Top Logo */}
          <div className="flex w-full flex-col items-center gap-5">
            <div className="bg-linear-to-br flex size-10 cursor-pointer items-center justify-center rounded-xl border border-teal-500/30 from-teal-500/20 via-purple-500/20 to-black shadow-lg shadow-teal-500/10">
              <span className="text-lg font-black text-white">💎</span>
            </div>

            {/* Nav Icons */}
            <div className="flex w-full flex-col items-center gap-3 px-2">
              {/* Home */}
              <button
                type="button"
                onClick={() => setActiveNav('home')}
                title="Home / Inicio"
                aria-label="Home / Inicio"
                className={`flex size-10 cursor-pointer items-center justify-center rounded-xl transition-colors ${
                  activeNav === 'home'
                    ? 'border border-teal-500/40 bg-teal-500/15 text-teal-300 shadow-md shadow-teal-500/10'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="size-4 rounded-sm border-2 border-current" />
              </button>

              {/* Profiles & Skins */}
              <button
                type="button"
                onClick={() => setActiveNav('profiles')}
                title="Profiles / Perfiles"
                aria-label="Profiles / Perfiles"
                className={`flex size-10 cursor-pointer items-center justify-center rounded-xl transition-colors ${
                  activeNav === 'profiles'
                    ? 'border border-teal-500/40 bg-teal-500/15 text-teal-300 shadow-md shadow-teal-500/10'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="size-3.5 rounded-full border-2 border-current" />
              </button>

              {/* Notifications */}
              <button
                type="button"
                onClick={() => setActiveNav('notifications')}
                title="Notificaciones"
                className="relative flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Bell className="size-4" />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-teal-400" />
              </button>

              {/* Chat */}
              <button
                type="button"
                onClick={() => setActiveNav('chat')}
                title="Mensajes"
                className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <MessageSquare className="size-4" />
              </button>

              {/* Versions */}
              <button
                type="button"
                onClick={() => setActiveNav('versions')}
                title="Versiones"
                className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Layers className="size-4" />
              </button>

              {/* Radar / Server Status */}
              <button
                type="button"
                onClick={() => setActiveNav('radar')}
                title="Estado del Servidor"
                className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Compass className="size-4" />
              </button>

              {/* Mods */}
              <button
                type="button"
                onClick={() => setActiveNav('mods')}
                title="Gestor de Mods"
                className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Sliders className="size-4" />
              </button>
            </div>
          </div>

          {/* Bottom Icons (Store, Settings) */}
          <div className="flex w-full flex-col items-center gap-3 px-2">
            <button
              type="button"
              title="Tienda Oficial"
              className="relative flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <ShoppingCart className="size-4" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500" />
            </button>

            <button
              type="button"
              title="Ajustes"
              className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Settings className="size-4" />
            </button>
          </div>
        </nav>

        {/* 2. CENTER CONTENT AREA */}
        <main className="bg-linear-to-b relative flex-1 space-y-6 overflow-y-auto from-[#090e17]/80 via-[#07090f] to-[#040508] p-6">
          {/* Greeting Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-100">Good to see you,</span>
                <div className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-0.5 transition-colors hover:border-teal-500/40">
                  <img
                    src="https://mc-heads.net/avatar/172px/24"
                    alt="User"
                    className="size-4 rounded-sm"
                  />
                  <span className="text-sm font-bold text-white">AlexGamer99</span>
                  <span className="text-xs text-slate-400">⌵</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>
                  Last played: <strong className="text-slate-200">CrystalTides SMP</strong> • 16
                  hours ago
                </span>
                <span>•</span>
                <span>
                  Total playtime: <strong className="text-slate-200">1,364h</strong>
                </span>
              </div>
            </div>
          </div>

          {/* 3-Widget Primary Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {/* Widget 1: Big Launch Card (Col 5) */}
            <div className="border-white/8 group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-[#07050a] p-1 shadow-2xl md:col-span-5">
              <button
                type="button"
                onClick={handleLaunch}
                className={`relative flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl px-5 py-4 transition-colors ${
                  isDownloading
                    ? 'bg-linear-to-b from-teal-900 to-slate-950 text-teal-300'
                    : 'bg-linear-to-b inset-shadow-sm from-[#3ec7b5] via-[#20a394] to-[#158b7e] text-white shadow-md shadow-teal-500/25 hover:brightness-105'
                }`}
                style={{
                  boxShadow:
                    'inset 0 1px 1px rgba(255, 255, 255, 0.45), 0 4px 16px rgba(20, 184, 166, 0.35)',
                }}
              >
                {isDownloading && (
                  <div
                    className="pointer-events-none absolute inset-0 bg-white/20 transition-colors duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center">
                  <span className="font-sans text-[26px] font-black uppercase leading-tight tracking-[0.22em] text-white drop-shadow-sm">
                    {getLaunchButtonLabel(isDownloading, downloadProgress)}
                  </span>
                  <span className="drop-shadow-xs mt-0.5 flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-white/95">
                    {isDownloading
                      ? `${downloadProgress}% • 84.2 MB / 112.5 MB`
                      : 'Fabric 🔖 1.21.3'}
                  </span>
                </div>
              </button>

              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-center gap-1 py-1.5 text-center text-[9.5px] font-extrabold uppercase tracking-widest text-white/75 transition-colors hover:text-white"
              >
                <span>CHANGE VERSION</span>
                <span className="text-[10px]">⌵</span>
              </button>
            </div>

            {/* Widget 2: Latest Profiles (Col 4) */}
            <div className="flex flex-col justify-between space-y-2.5 rounded-2xl border border-white/10 bg-[#090d16] p-4 md:col-span-4">
              <div className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                LATEST PROFILES
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedProfile('crystaltides')}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl border p-2.5 text-left transition-colors ${
                    selectedProfile === 'crystaltides'
                      ? 'border-teal-500/40 bg-teal-500/10 text-white'
                      : 'bg-white/2 border-white/5 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-6 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
                      <Swords className="size-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">CrystalTides SMP</div>
                      <div className="text-[10px] text-slate-400">Fabric 1.21.3</div>
                    </div>
                  </div>
                  {selectedProfile === 'crystaltides' && (
                    <Check className="size-3.5 text-teal-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProfile('worldedit')}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl border p-2.5 text-left transition-colors ${
                    selectedProfile === 'worldedit'
                      ? 'border-teal-500/40 bg-teal-500/10 text-white'
                      : 'bg-white/2 border-white/5 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                      <Box className="size-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Hypixel Bedwars</div>
                      <div className="text-[10px] text-slate-400">Forge 1.8.9</div>
                    </div>
                  </div>
                  {selectedProfile === 'worldedit' && <Check className="size-3.5 text-teal-400" />}
                </button>
              </div>
            </div>

            {/* Widget 3: Partners / Servers Grid (Col 3) */}
            <div className="flex flex-col justify-between space-y-3 rounded-2xl border border-white/10 bg-[#090d16] p-4 md:col-span-3">
              <div className="flex items-center justify-between font-mono text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <span>SERVERS & PARTNERS</span>
                <span className="text-[9px] text-slate-500">1/3</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {['💎', '🛡️', '⚔️', '🌀', '👑', '🔮', '🌋', '🎯'].map((emoji) => (
                  <div
                    key={`server-partner-${emoji}`}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-white/5 bg-white/5 text-sm transition-colors hover:scale-105 hover:border-teal-500/40"
                  >
                    {emoji}
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-1">
                <span className="size-1.5 rounded-full bg-teal-400" />
                <span className="size-1.5 rounded-full bg-slate-700" />
                <span className="size-1.5 rounded-full bg-slate-700" />
              </div>
            </div>
          </div>

          {/* News Feed Grid (2x2) */}
          <div className="space-y-3">
            <div className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              NEWS FEED
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Card 1: Changelog */}
              <div className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[#090e18] p-4 transition-colors hover:border-white/20">
                <div className="bg-linear-to-br flex size-24 shrink-0 items-center justify-center rounded-xl border border-white/10 from-teal-900/40 to-slate-900 text-3xl">
                  💎
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-black text-white">
                      CHANGELOG
                    </span>
                    <ExternalLink className="size-3 text-slate-500 transition-colors group-hover:text-teal-400" />
                  </div>
                  <div className="space-y-0.5 text-[11px] text-slate-400">
                    <div>• Performance optimizations (+140% FPS)</div>
                    <div>• General bug fixes & stability</div>
                  </div>
                  <button
                    type="button"
                    className="pt-1 text-[10px] font-bold uppercase tracking-wider text-teal-400 hover:underline"
                  >
                    READ MORE &rarr;
                  </button>
                </div>
              </div>

              {/* Card 2: New Minecraft Version */}
              <div className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[#090e18] p-4 transition-colors hover:border-white/20">
                <div className="bg-linear-to-br flex size-24 shrink-0 flex-col items-center justify-center rounded-xl border border-emerald-500/30 from-emerald-900/40 via-teal-900/30 to-black">
                  <span className="font-mono text-xs font-bold text-emerald-400">MC UPDATE</span>
                  <span className="text-xl font-black text-white">1.21.3</span>
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="inline-block rounded-sm bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-300">
                    NUEVA VERSIÓN
                  </div>
                  <div className="text-xs font-bold text-white">
                    Minecraft 1.21.3 & Snapshots Disponibles
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Soporte instantáneo para mods de Fabric y shaders PBR.
                  </div>
                </div>
              </div>

              {/* Card 3: Partner Program */}
              <div className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[#090e18] p-4 transition-colors hover:border-white/20">
                <div className="bg-linear-to-br flex size-24 shrink-0 items-center justify-center rounded-xl border border-purple-500/30 from-purple-900/40 to-slate-900 text-3xl">
                  👑
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-[9px] font-bold uppercase text-purple-400">
                    PARTNER PROGRAM
                  </div>
                  <div className="text-xs font-bold text-white">BECOME A CREATOR</div>
                  <div className="text-[11px] text-slate-400">
                    Únete al programa de creadores y desbloquea capas exclusivas.
                  </div>
                </div>
              </div>

              {/* Card 4: New Modules */}
              <div className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[#090e18] p-4 transition-colors hover:border-white/20">
                <div className="bg-linear-to-br flex size-24 shrink-0 items-center justify-center rounded-xl border border-sky-500/30 from-sky-900/40 to-slate-900 text-3xl">
                  ⚡
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-[9px] font-bold uppercase text-sky-400">NEW MODS</div>
                  <div className="text-xs font-bold text-white">COMBAT HUD & KEYSTROKES</div>
                  <div className="text-[11px] text-slate-400">
                    Nuevos módulos visuales de PvP activables en 1 clic.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* 3. RIGHT SIDEBAR (FRIENDS & SOCIAL PANEL) */}
        <aside className="z-20 flex w-64 shrink-0 flex-col space-y-4 border-l border-white/5 bg-[#05070c] p-4">
          {/* Header Tabs */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="cursor-pointer border-b-2 border-teal-400 pb-1 text-xs font-bold text-white"
              >
                Friends
              </button>
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1 pb-1 text-xs font-bold text-slate-400 hover:text-white"
              >
                <span>Requests</span>
                <span className="size-1.5 rounded-full bg-amber-400" />
              </button>
            </div>
            <button
              type="button"
              aria-label="Add friend"
              className="cursor-pointer p-1 text-slate-400 hover:text-white"
            >
              <UserPlus className="size-3.5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              aria-label="Buscar jugador" // React Doctor / a11y: campo con etiqueta accesible para lectores de pantalla
              placeholder="Find a player..."
              value={searchFriend}
              onChange={(e) => setSearchFriend(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-1.5 pl-7 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500/40"
            />
          </div>

          {/* Friends Lists */}
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {/* Online List */}
            <div className="space-y-1.5">
              <div className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {filteredOnline.length} Online
              </div>

              {filteredOnline.map((friend) => (
                <div
                  key={friend.name}
                  className="group flex cursor-pointer items-center justify-between rounded-lg p-1.5 transition-colors hover:bg-white/5"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="relative shrink-0">
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="size-6 rounded-md bg-slate-800"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-black ${getStatusBadgeColor(
                          friend.statusType,
                        )}`}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-white">{friend.name}</div>
                      <div className="truncate text-[10px] text-slate-400">{friend.status}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`Enviar mensaje a ${friend.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveChatFriend(friend);
                    }}
                    className="cursor-pointer p-1 text-slate-500 transition-colors hover:text-teal-400"
                  >
                    <MessageSquare className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Offline List */}
            <div className="space-y-1.5 border-t border-white/5 pt-2">
              <div className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                {SAMPLE_FRIENDS_OFFLINE.length} Offline
              </div>

              {SAMPLE_FRIENDS_OFFLINE.map((friend) => (
                <div
                  key={friend.name}
                  className="group flex cursor-pointer items-center justify-between rounded-lg p-1.5 opacity-50 transition-colors hover:bg-white/5 hover:opacity-100"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="size-6 rounded-md bg-slate-800 grayscale"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-white">{friend.name}</div>
                      <div className="truncate text-[10px] text-slate-400">{friend.status}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`Enviar mensaje a ${friend.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveChatFriend(friend);
                    }}
                    className="cursor-pointer p-1 text-slate-500 transition-colors hover:text-teal-400"
                  >
                    <MessageSquare className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* 4. ACTIVE CHAT OVERLAY MODAL */}
        {activeChatFriend && (
          <div className="right-68 absolute bottom-4 z-30 flex h-80 w-72 flex-col overflow-hidden rounded-2xl border border-teal-500/40 bg-[#0b0e17] shadow-2xl duration-200 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-teal-950/40 p-3">
              <div className="flex items-center gap-2">
                <img src={activeChatFriend.avatar} alt="" className="size-5 rounded-sm" />
                <div>
                  <div className="text-xs font-bold text-white">{activeChatFriend.name}</div>
                  <div className="text-[9px] text-teal-300">{activeChatFriend.status}</div>
                </div>
              </div>
              <button
                type="button"
                aria-label="Cerrar chat"
                onClick={() => setActiveChatFriend(null)}
                className="cursor-pointer text-slate-400 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-2 overflow-y-auto p-3 text-xs">
              {chatMessages.map((m) => (
                <div
                  key={`chat-msg-${m.time}-${m.text}`}
                  className={`max-w-[85%] rounded-xl p-2 text-[11px] leading-relaxed ${
                    m.sender === 'me'
                      ? 'ml-auto border border-teal-500/40 bg-teal-500/20 text-teal-100'
                      : 'mr-auto border border-white/10 bg-white/5 text-slate-200'
                  }`}
                >
                  <div>{m.text}</div>
                  <div className="mt-1 flex items-center justify-end gap-1 text-right text-[8px] text-slate-400">
                    <span>{m.time}</span>
                    {m.sender === 'me' && <CheckCheck className="size-2.5 text-teal-400" />}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendChatMessage}
              className="flex items-center gap-1.5 border-t border-white/10 bg-black/40 p-2"
            >
              <input
                type="text"
                aria-label="Escribir mensaje de chat" // React Doctor / a11y: etiqueta descriptiva para campo de entrada en formulario
                placeholder="Enviar mensaje..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white outline-none focus:border-teal-500/40"
              />
              <button
                type="submit"
                aria-label="Enviar mensaje"
                className="cursor-pointer rounded-lg bg-teal-500 p-1.5 font-bold text-slate-950 hover:bg-teal-400"
              >
                <Send className="size-3" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

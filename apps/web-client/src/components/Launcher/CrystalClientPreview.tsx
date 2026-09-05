import React, { useState } from "react";
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
  CheckCheck
} from "lucide-react";

export interface FriendEntry {
  name: string;
  avatar: string;
  status: string;
  statusType: "online" | "launcher" | "menu" | "idle" | "offline";
  activity: string;
}

const SAMPLE_FRIENDS_ONLINE: FriendEntry[] = [
  { name: "172px", avatar: "https://mc-heads.net/avatar/172px/64", status: "In-game: CrystalTides 👑", statusType: "online", activity: "CrystalTides SMP" },
  { name: "daaaavidds", avatar: "https://mc-heads.net/avatar/daaaavidds/64", status: "In-game: Singleplayer", statusType: "online", activity: "Mundo Local" },
  { name: "masaya46", avatar: "https://mc-heads.net/avatar/masaya46/64", status: "In-game: Private Server", statusType: "online", activity: "Servidor Privado" },
  { name: "3wafyy", avatar: "https://mc-heads.net/avatar/3wafyy/64", status: "In Launcher", statusType: "launcher", activity: "Launcher" },
  { name: "cuvsa", avatar: "https://mc-heads.net/avatar/cuvsa/64", status: "In-game: CrystalTides SMP 💎", statusType: "online", activity: "CrystalTides SMP" },
  { name: "zakhbear", avatar: "https://mc-heads.net/avatar/zakhbear/64", status: "In Menus", statusType: "menu", activity: "Menús" },
  { name: "KingofHalo04", avatar: "https://mc-heads.net/avatar/KingofHalo04/64", status: "Idle", statusType: "idle", activity: "Ausente" },
  { name: "meegreyone", avatar: "https://mc-heads.net/avatar/meegreyone/64", status: "Idle", statusType: "idle", activity: "Ausente" },
];

const SAMPLE_FRIENDS_OFFLINE: FriendEntry[] = [
  { name: "XerxerBro", avatar: "https://mc-heads.net/avatar/XerxerBro/64", status: "Offline for 3 days", statusType: "offline", activity: "" },
  { name: "2fishbowl", avatar: "https://mc-heads.net/avatar/2fishbowl/64", status: "Offline for 21 hours", statusType: "offline", activity: "" },
  { name: "wtfbroimlagging", avatar: "https://mc-heads.net/avatar/Steve/64", status: "Offline for 36 days", statusType: "offline", activity: "" },
  { name: "Director32", avatar: "https://mc-heads.net/avatar/Alex/64", status: "Offline for 121 days", statusType: "offline", activity: "" },
];

export const CrystalClientPreview: React.FC = () => {
  const [activeNav, setActiveNav] = useState<string>("home");
  const [selectedProfile, setSelectedProfile] = useState<string>("crystaltides");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [searchFriend, setSearchFriend] = useState("");
  const [activeChatFriend, setActiveChatFriend] = useState<FriendEntry | null>(null);
  const [chatMessages, setChatMessages] = useState<{ sender: "me" | "them"; text: string; time: string }[]>([
    { sender: "them", text: "¿Entras al server a farmear shards?", time: "19:02" },
    { sender: "me", text: "Sí, ya estoy abriendo el cliente con los nuevos shaders!", time: "19:04" }
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleLaunch = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsDownloading(false), 2000);
          return 100;
        }
        return prev + 10;
      });
    }, 250);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setChatMessages((prev) => [...prev, { sender: "me", text: chatInput, time: timeStr }]);
    setChatInput("");

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: "them", text: "¡De una! Te veo en las coordenadas del spawn 🚀", time: timeStr }
      ]);
    }, 1000);
  };

  const filteredOnline = SAMPLE_FRIENDS_ONLINE.filter((f) =>
    f.name.toLowerCase().includes(searchFriend.toLowerCase())
  );

  return (
    <div className="w-full max-w-310 mx-auto rounded-2xl bg-[#07090e] border border-white/10 shadow-2xl overflow-hidden font-sans text-slate-100 flex flex-col select-none">
      {/* ── TOP TITLE BAR ── */}
      <div className="h-10 px-4 bg-[#05060a] border-b border-white/5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-white tracking-wide">
            <span className="text-teal-400 text-sm">💎</span>
            <span>CrystalTides Client</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] font-mono text-slate-400">Build 2.4.0</span>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>9,101 Online</span>
          </div>
        </div>

        {/* Window Action Buttons */}
        <div className="flex items-center gap-3 text-slate-400">
          <button type="button" aria-label="Minimize" className="hover:text-white transition-colors cursor-pointer p-1">
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button type="button" aria-label="Maximize" className="hover:text-white transition-colors cursor-pointer p-1">
            <Square className="w-3 h-3" />
          </button>
          <button type="button" aria-label="Close" className="hover:text-red-400 transition-colors cursor-pointer p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── MAIN BODY (3-COLUMN LAYOUT) ── */}
      <div className="flex flex-1 min-h-160 bg-[#07090f] relative overflow-hidden">
        {/* 1. LEFT SIDEBAR */}
        <nav className="w-16 bg-[#040609] border-r border-white/5 flex flex-col items-center py-4 justify-between shrink-0 z-20">
          {/* Top Logo */}
          <div className="flex flex-col items-center gap-5 w-full">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-teal-500/20 via-purple-500/20 to-black border border-teal-500/30 flex items-center justify-center shadow-lg shadow-teal-500/10 cursor-pointer">
              <span className="text-lg font-black text-white">💎</span>
            </div>

            {/* Nav Icons */}
            <div className="flex flex-col items-center gap-3 w-full px-2">
              {/* Home */}
              <button
                type="button"
                onClick={() => setActiveNav("home")}
                title="Home / Inicio"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  activeNav === "home"
                    ? "bg-teal-500/15 border border-teal-500/40 text-teal-300 shadow-md shadow-teal-500/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="w-4 h-4 rounded-sm border-2 border-current" />
              </button>

              {/* Profiles & Skins */}
              <button
                type="button"
                onClick={() => setActiveNav("profiles")}
                title="Profiles / Perfiles"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  activeNav === "profiles"
                    ? "bg-teal-500/15 border border-teal-500/40 text-teal-300 shadow-md shadow-teal-500/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />
              </button>

              {/* Notifications */}
              <button
                type="button"
                onClick={() => setActiveNav("notifications")}
                title="Notificaciones"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-400" />
              </button>

              {/* Chat */}
              <button
                type="button"
                onClick={() => setActiveNav("chat")}
                title="Mensajes"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              {/* Versions */}
              <button
                type="button"
                onClick={() => setActiveNav("versions")}
                title="Versiones"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4" />
              </button>

              {/* Radar / Server Status */}
              <button
                type="button"
                onClick={() => setActiveNav("radar")}
                title="Estado del Servidor"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4" />
              </button>

              {/* Mods */}
              <button
                type="button"
                onClick={() => setActiveNav("mods")}
                title="Gestor de Mods"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Icons (Store, Settings) */}
          <div className="flex flex-col items-center gap-3 w-full px-2">
            <button
              type="button"
              title="Tienda Oficial"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer relative"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
            </button>

            <button
              type="button"
              title="Ajustes"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </nav>

        {/* 2. CENTER CONTENT AREA */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6 bg-linear-to-b from-[#090e17]/80 via-[#07090f] to-[#040508] relative">
          {/* Greeting Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-100">Good to see you,</span>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 hover:border-teal-500/40 cursor-pointer transition-colors">
                  <img
                    src="https://mc-heads.net/avatar/172px/24"
                    alt="User"
                    className="w-4 h-4 rounded-sm"
                  />
                  <span className="font-bold text-sm text-white">AlexGamer99</span>
                  <span className="text-xs text-slate-400">⌵</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Last played: <strong className="text-slate-200">CrystalTides SMP</strong> • 16 hours ago</span>
                <span>•</span>
                <span>Total playtime: <strong className="text-slate-200">1,364h</strong></span>
              </div>
            </div>
          </div>

          {/* 3-Widget Primary Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Widget 1: Big Launch Card (Col 5) */}
            <div className="md:col-span-5 rounded-2xl bg-[#07050a] border border-white/8 shadow-2xl overflow-hidden flex flex-col justify-between p-1 relative group">
              <button
                type="button"
                onClick={handleLaunch}
                className={`w-full py-4 px-5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden ${
                  isDownloading
                    ? "bg-linear-to-b from-teal-900 to-slate-950 text-teal-300"
                    : "bg-linear-to-b from-[#3ec7b5] via-[#20a394] to-[#158b7e] text-white hover:brightness-105 shadow-md shadow-teal-500/25 inset-shadow-sm"
                }`}
                style={{
                  boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.45), 0 4px 16px rgba(20, 184, 166, 0.35)",
                }}
              >
                {isDownloading && (
                  <div
                    className="absolute inset-0 bg-white/20 transition-all duration-300 pointer-events-none"
                    style={{ width: `${downloadProgress}%` }}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-[26px] font-black tracking-[0.22em] uppercase leading-tight font-sans text-white drop-shadow-sm">
                    {isDownloading ? (downloadProgress >= 100 ? "READY" : "SYNCING") : "LAUNCH"}
                  </span>
                  <span className="text-[11px] font-bold tracking-wider mt-0.5 text-white/95 flex items-center gap-1.5 drop-shadow-xs">
                    {isDownloading ? `${downloadProgress}% • 84.2 MB / 112.5 MB` : "Fabric 🔖 1.21.3"}
                  </span>
                </div>
              </button>

              <button
                type="button"
                className="w-full py-1.5 text-center text-[9.5px] font-extrabold text-white/75 hover:text-white uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <span>CHANGE VERSION</span>
                <span className="text-[10px]">⌵</span>
              </button>
            </div>

            {/* Widget 2: Latest Profiles (Col 4) */}
            <div className="md:col-span-4 rounded-2xl bg-[#090d16] border border-white/10 p-4 space-y-2.5 flex flex-col justify-between">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">
                LATEST PROFILES
              </div>

              <div className="space-y-2">
                <div
                  onClick={() => setSelectedProfile("crystaltides")}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedProfile === "crystaltides"
                      ? "bg-teal-500/10 border-teal-500/40 text-white"
                      : "bg-white/2 border-white/5 text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                      <Swords className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">CrystalTides SMP</div>
                      <div className="text-[10px] text-slate-400">Fabric 1.21.3</div>
                    </div>
                  </div>
                  {selectedProfile === "crystaltides" && <Check className="w-3.5 h-3.5 text-teal-400" />}
                </div>

                <div
                  onClick={() => setSelectedProfile("worldedit")}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedProfile === "worldedit"
                      ? "bg-teal-500/10 border-teal-500/40 text-white"
                      : "bg-white/2 border-white/5 text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Box className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Hypixel Bedwars</div>
                      <div className="text-[10px] text-slate-400">Forge 1.8.9</div>
                    </div>
                  </div>
                  {selectedProfile === "worldedit" && <Check className="w-3.5 h-3.5 text-teal-400" />}
                </div>
              </div>
            </div>

            {/* Widget 3: Partners / Servers Grid (Col 3) */}
            <div className="md:col-span-3 rounded-2xl bg-[#090d16] border border-white/10 p-4 space-y-3 flex flex-col justify-between">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
                <span>SERVERS & PARTNERS</span>
                <span className="text-slate-500 text-[9px]">1/3</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {["💎", "🛡️", "⚔️", "🌀", "👑", "🔮", "🌋", "🎯"].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 hover:border-teal-500/40 flex items-center justify-center text-sm cursor-pointer transition-all hover:scale-105"
                  >
                    {emoji}
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              </div>
            </div>
          </div>

          {/* News Feed Grid (2x2) */}
          <div className="space-y-3">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">
              NEWS FEED
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Changelog */}
              <div className="p-4 rounded-2xl bg-[#090e18] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-4 group relative overflow-hidden">
                <div className="w-24 h-24 rounded-xl bg-linear-to-br from-teal-900/40 to-slate-900 border border-white/10 flex items-center justify-center text-3xl shrink-0">
                  💎
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      CHANGELOG
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-teal-400 transition-colors" />
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <div>• Performance optimizations (+140% FPS)</div>
                    <div>• General bug fixes & stability</div>
                  </div>
                  <button type="button" className="text-[10px] font-bold text-teal-400 hover:underline uppercase tracking-wider pt-1">
                    READ MORE &rarr;
                  </button>
                </div>
              </div>

              {/* Card 2: New Minecraft Version */}
              <div className="p-4 rounded-2xl bg-[#090e18] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-4 group relative overflow-hidden">
                <div className="w-24 h-24 rounded-xl bg-linear-to-br from-emerald-900/40 via-teal-900/30 to-black border border-emerald-500/30 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-mono text-emerald-400 font-bold">MC UPDATE</span>
                  <span className="text-xl font-black text-white">1.21.3</span>
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="inline-block text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase">
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
              <div className="p-4 rounded-2xl bg-[#090e18] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-4 group relative overflow-hidden">
                <div className="w-24 h-24 rounded-xl bg-linear-to-br from-purple-900/40 to-slate-900 border border-purple-500/30 flex items-center justify-center text-3xl shrink-0">
                  👑
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-[9px] font-bold text-purple-400 uppercase">PARTNER PROGRAM</div>
                  <div className="text-xs font-bold text-white">BECOME A CREATOR</div>
                  <div className="text-[11px] text-slate-400">
                    Únete al programa de creadores y desbloquea capas exclusivas.
                  </div>
                </div>
              </div>

              {/* Card 4: New Modules */}
              <div className="p-4 rounded-2xl bg-[#090e18] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-4 group relative overflow-hidden">
                <div className="w-24 h-24 rounded-xl bg-linear-to-br from-sky-900/40 to-slate-900 border border-sky-500/30 flex items-center justify-center text-3xl shrink-0">
                  ⚡
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-[9px] font-bold text-sky-400 uppercase">NEW MODS</div>
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
        <aside className="w-64 bg-[#05070c] border-l border-white/5 flex flex-col p-4 space-y-4 shrink-0 z-20">
          {/* Header Tabs */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-3">
              <button type="button" className="text-xs font-bold text-white border-b-2 border-teal-400 pb-1 cursor-pointer">
                Friends
              </button>
              <button type="button" className="text-xs font-bold text-slate-400 hover:text-white pb-1 cursor-pointer flex items-center gap-1">
                <span>Requests</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </button>
            </div>
            <button type="button" aria-label="Add friend" className="text-slate-400 hover:text-white cursor-pointer p-1">
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Find a player..."
              value={searchFriend}
              onChange={(e) => setSearchFriend(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500/40"
            />
          </div>

          {/* Friends Lists */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Online List */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">
                {filteredOnline.length} Online
              </div>

              {filteredOnline.map((friend) => (
                <div
                  key={friend.name}
                  className="p-1.5 rounded-lg hover:bg-white/5 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-6 h-6 rounded-md bg-slate-800"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black ${
                          friend.statusType === "online"
                            ? "bg-emerald-400"
                            : friend.statusType === "launcher"
                            ? "bg-purple-400"
                            : "bg-amber-400"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{friend.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{friend.status}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveChatFriend(friend);
                    }}
                    className="p-1 text-slate-500 hover:text-teal-400 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Offline List */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono">
                {SAMPLE_FRIENDS_OFFLINE.length} Offline
              </div>

              {SAMPLE_FRIENDS_OFFLINE.map((friend) => (
                <div
                  key={friend.name}
                  className="p-1.5 rounded-lg hover:bg-white/5 flex items-center justify-between group transition-colors opacity-50 hover:opacity-100 cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-6 h-6 rounded-md bg-slate-800 grayscale"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{friend.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{friend.status}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveChatFriend(friend);
                    }}
                    className="p-1 text-slate-500 hover:text-teal-400 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* 4. ACTIVE CHAT OVERLAY MODAL */}
        {activeChatFriend && (
          <div className="absolute bottom-4 right-68 w-72 h-80 rounded-2xl bg-[#0b0e17] border border-teal-500/40 shadow-2xl flex flex-col overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-3 bg-teal-950/40 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={activeChatFriend.avatar} alt="" className="w-5 h-5 rounded" />
                <div>
                  <div className="text-xs font-bold text-white">{activeChatFriend.name}</div>
                  <div className="text-[9px] text-teal-300">{activeChatFriend.status}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveChatFriend(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl max-w-[85%] text-[11px] leading-relaxed ${
                    m.sender === "me"
                      ? "ml-auto bg-teal-500/20 border border-teal-500/40 text-teal-100"
                      : "mr-auto bg-white/5 border border-white/10 text-slate-200"
                  }`}
                >
                  <div>{m.text}</div>
                  <div className="text-[8px] text-slate-400 text-right mt-1 flex items-center justify-end gap-1">
                    <span>{m.time}</span>
                    {m.sender === "me" && <CheckCheck className="w-2.5 h-2.5 text-teal-400" />}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendChatMessage} className="p-2 border-t border-white/10 flex items-center gap-1.5 bg-black/40">
              <input
                type="text"
                placeholder="Enviar mensaje..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-teal-500/40"
              />
              <button
                type="submit"
                className="p-1.5 rounded-lg bg-teal-500 text-slate-950 hover:bg-teal-400 font-bold cursor-pointer"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

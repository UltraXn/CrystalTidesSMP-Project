import React from "react";
import { 
  Cpu, 
  Zap, 
  ShieldCheck, 
  RefreshCw, 
  Terminal
} from "lucide-react";

export const ArchitectureInfographic: React.FC = () => {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-bold uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5 text-teal-400" />
          <span>ARQUITECTURA DE ALTO RENDIMIENTO</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Ingeniería de <span className="text-teal-400">Cero Bloat</span> en Rust
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Diseñado para erradicar el consumo excesivo de memoria de los launchers convencionales basados en Java o Electron.
        </p>
      </div>

      {/* 3 Core Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Native Rust Core */}
        <div className="p-7 rounded-3xl bg-[#0b0612] border border-white/10 hover:border-teal-500/40 transition-all duration-300 shadow-2xl space-y-5 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-white group-hover:text-teal-300 transition-colors">
              Motor Nativo Tauri 2.0
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              En lugar de empaquetar un navegador Chromium completo de 500MB, el cliente se compila en binario nativo de Rust y aprovecha la aceleración por GPU del sistema operativo.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/2 border border-white/5 space-y-2 font-mono text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>RAM en reposo:</span>
              <span className="text-teal-300 font-bold">&lt; 38.4 MB</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tiempo de arranque:</span>
              <span className="text-teal-300 font-bold">~ 0.6 Seg</span>
            </div>
          </div>
        </div>

        {/* Card 2: SHA-256 Delta Sync */}
        <div className="p-7 rounded-3xl bg-[#0b0612] border border-white/10 hover:border-purple-500/40 transition-all duration-300 shadow-2xl space-y-5 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            <RefreshCw className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-white group-hover:text-purple-300 transition-colors">
              Sincronización Delta SHA-256
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Algoritmo de cálculo de hash en paralelo que verifica carpetas de juego contra el servidor y descarga únicamente los mods modificados en milisegundos.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/2 border border-white/5 space-y-2 font-mono text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>Ahorro de ancho de banda:</span>
              <span className="text-purple-300 font-bold">95.4%</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Verificación de integridad:</span>
              <span className="text-purple-300 font-bold">Criptográfica</span>
            </div>
          </div>
        </div>

        {/* Card 3: Microsoft OAuth 2.0 PKCE */}
        <div className="p-7 rounded-3xl bg-[#0b0612] border border-white/10 hover:border-teal-500/40 transition-all duration-300 shadow-2xl space-y-5 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-white group-hover:text-teal-300 transition-colors">
              Bóveda PKCE & Cero Passwords
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autenticación oficial directa con Xbox Live y Microsoft mediante tokens efímeros cifrados con AES-256-GCM. Tu contraseña nunca se almacena ni se transmite a terceros.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/2 border border-white/5 space-y-2 font-mono text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>Almacenamiento:</span>
              <span className="text-teal-300 font-bold">OS Credential Vault</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Cumplimiento:</span>
              <span className="text-teal-300 font-bold">OAuth 2.0 RFC 7636</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Workflow: Delta Sync Process */}
      <div className="p-8 rounded-3xl bg-[#07030a] border border-white/10 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Flujo de Sincronización Delta</h3>
          </div>
          <span className="text-[11px] font-mono text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded border border-teal-500/20">
            SHA-256 Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-2 relative">
            <div className="text-teal-400 font-mono font-bold text-[11px]">PASO 01</div>
            <div className="font-bold text-white">Escaneo Hash Local</div>
            <div className="text-slate-400 text-[11px]">El motor calcula en paralelo el SHA-256 de tu carpeta .minecraft/mods.</div>
          </div>

          <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-2 relative">
            <div className="text-purple-400 font-mono font-bold text-[11px]">PASO 02</div>
            <div className="font-bold text-white">Cotejo de Manifiesto</div>
            <div className="text-slate-400 text-[11px]">Compara contra el manifiesto JSON oficial firmado del servidor.</div>
          </div>

          <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-2 relative">
            <div className="text-teal-400 font-mono font-bold text-[11px]">PASO 03</div>
            <div className="font-bold text-white">Descarga Selectiva</div>
            <div className="text-slate-400 text-[11px]">Solo descarga los archivos faltantes o con hash diferente.</div>
          </div>

          <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 space-y-2 relative">
            <div className="text-teal-300 font-mono font-bold text-[11px]">PASO 04</div>
            <div className="font-bold text-white">Lanzamiento Inmediato</div>
            <div className="text-slate-300 text-[11px]">El juego inicia en 0.6s con todos los mods validados.</div>
          </div>
        </div>
      </div>
    </section>
  );
};

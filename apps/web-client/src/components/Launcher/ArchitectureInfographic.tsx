import React from 'react';
import { Cpu, Zap, ShieldCheck, RefreshCw, Terminal } from 'lucide-react';

export const ArchitectureInfographic: React.FC = () => {
  return (
    <section className="relative z-10 mx-auto max-w-6xl space-y-12 px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-300">
          <Cpu className="size-3.5 text-teal-400" />
          <span>ARQUITECTURA DE ALTO RENDIMIENTO</span>
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
          Ingeniería de <span className="text-teal-400">Cero Bloat</span> en Rust
        </h2>
        <p className="text-sm/relaxed text-slate-400 sm:text-base">
          Diseñado para erradicar el consumo excesivo de memoria de los launchers convencionales
          basados en Java o Electron.
        </p>
      </div>

      {/* 3 Core Architecture Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1: Native Rust Core */}
        <div className="group relative space-y-5 overflow-hidden rounded-3xl border border-white/10 bg-[#0b0612] p-7 shadow-2xl transition-colors duration-300 hover:border-teal-500/40">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/10 text-teal-400 transition-transform group-hover:scale-110">
            <Zap className="size-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-white transition-colors group-hover:text-teal-300">
              Motor Nativo Tauri 2.0
            </h3>
            <p className="text-xs/relaxed text-slate-400">
              En lugar de empaquetar un navegador Chromium completo de 500MB, el cliente se compila
              en binario nativo de Rust y aprovecha la aceleración por GPU del sistema operativo.
            </p>
          </div>

          <div className="bg-white/2 space-y-2 rounded-xl border border-white/5 p-3.5 font-mono text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>RAM en reposo:</span>
              <span className="font-bold text-teal-300">&lt; 38.4 MB</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tiempo de arranque:</span>
              <span className="font-bold text-teal-300">~ 0.6 Seg</span>
            </div>
          </div>
        </div>

        {/* Card 2: SHA-256 Delta Sync */}
        <div className="group relative space-y-5 overflow-hidden rounded-3xl border border-white/10 bg-[#0b0612] p-7 shadow-2xl transition-colors duration-300 hover:border-purple-500/40">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-400 transition-transform group-hover:scale-110">
            <RefreshCw className="size-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-white transition-colors group-hover:text-purple-300">
              Sincronización Delta SHA-256
            </h3>
            <p className="text-xs/relaxed text-slate-400">
              Algoritmo de cálculo de hash en paralelo que verifica carpetas de juego contra el
              servidor y descarga únicamente los mods modificados en milisegundos.
            </p>
          </div>

          <div className="bg-white/2 space-y-2 rounded-xl border border-white/5 p-3.5 font-mono text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>Ahorro de ancho de banda:</span>
              <span className="font-bold text-purple-300">95.4%</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Verificación de integridad:</span>
              <span className="font-bold text-purple-300">Criptográfica</span>
            </div>
          </div>
        </div>

        {/* Card 3: Microsoft OAuth 2.0 PKCE */}
        <div className="group relative space-y-5 overflow-hidden rounded-3xl border border-white/10 bg-[#0b0612] p-7 shadow-2xl transition-colors duration-300 hover:border-teal-500/40">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/10 text-teal-400 transition-transform group-hover:scale-110">
            <ShieldCheck className="size-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-white transition-colors group-hover:text-teal-300">
              Bóveda PKCE & Cero Passwords
            </h3>
            <p className="text-xs/relaxed text-slate-400">
              Autenticación oficial directa con Xbox Live y Microsoft mediante tokens efímeros
              cifrados con AES-256-GCM. Tu contraseña nunca se almacena ni se transmite a terceros.
            </p>
          </div>

          <div className="bg-white/2 space-y-2 rounded-xl border border-white/5 p-3.5 font-mono text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>Almacenamiento:</span>
              <span className="font-bold text-teal-300">OS Credential Vault</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Cumplimiento:</span>
              <span className="font-bold text-teal-300">OAuth 2.0 RFC 7636</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Workflow: Delta Sync Process */}
      <div className="space-y-6 rounded-3xl border border-white/10 bg-[#07030a] p-8 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-teal-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Flujo de Sincronización Delta
            </h3>
          </div>
          <span className="rounded-sm border border-teal-500/20 bg-teal-500/10 px-2.5 py-1 font-mono text-[11px] text-teal-400">
            SHA-256 Verified
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-4">
          <div className="bg-white/2 relative space-y-2 rounded-xl border border-white/5 p-4">
            <div className="font-mono text-[11px] font-bold text-teal-400">PASO 01</div>
            <div className="font-bold text-white">Escaneo Hash Local</div>
            <div className="text-[11px] text-slate-400">
              El motor calcula en paralelo el SHA-256 de tu carpeta .minecraft/mods.
            </div>
          </div>

          <div className="bg-white/2 relative space-y-2 rounded-xl border border-white/5 p-4">
            <div className="font-mono text-[11px] font-bold text-purple-400">PASO 02</div>
            <div className="font-bold text-white">Cotejo de Manifiesto</div>
            <div className="text-[11px] text-slate-400">
              Compara contra el manifiesto JSON oficial firmado del servidor.
            </div>
          </div>

          <div className="bg-white/2 relative space-y-2 rounded-xl border border-white/5 p-4">
            <div className="font-mono text-[11px] font-bold text-teal-400">PASO 03</div>
            <div className="font-bold text-white">Descarga Selectiva</div>
            <div className="text-[11px] text-slate-400">
              Solo descarga los archivos faltantes o con hash diferente.
            </div>
          </div>

          <div className="relative space-y-2 rounded-xl border border-teal-500/30 bg-teal-500/10 p-4">
            <div className="font-mono text-[11px] font-bold text-teal-300">PASO 04</div>
            <div className="font-bold text-white">Lanzamiento Inmediato</div>
            <div className="text-[11px] text-slate-300">
              El juego inicia en 0.6s con todos los mods validados.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

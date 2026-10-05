import React, { useState } from 'react';
import { Cpu } from 'lucide-react';

export const RamAllocationSection: React.FC = () => {
  const [ramValue, setRamValue] = useState(6);

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0c0714] p-6 shadow-2xl md:col-span-2">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-teal-400" />
          <h3 className="text-sm font-bold text-white">
            Control de Asignación de Memoria RAM (JVM)
          </h3>
        </div>
        <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 font-mono text-xs font-bold text-teal-300">
          {ramValue} GB Asignados (Recomendado: 4-8 GB)
        </span>
      </div>

      <div className="space-y-4 pt-2">
        <input
          type="range"
          aria-label="Asignación de memoria RAM en gigabytes"
          min={2}
          max={32}
          step={1}
          value={ramValue}
          onChange={(e) => setRamValue(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-teal-400"
        />

        <div className="flex justify-between font-mono text-[11px] text-slate-400">
          <span>2 GB (Mínimo)</span>
          <span>4 GB</span>
          <span className="font-bold text-teal-400">8 GB (Ideal)</span>
          <span>16 GB</span>
          <span>32 GB (Extremo)</span>
        </div>

        {/* Real-time feedback badge */}
        <div className="bg-white/2 flex items-center justify-between rounded-xl border border-white/5 p-3 text-xs">
          <span className="text-slate-300">Argumentos JVM generados automáticamente:</span>
          <code className="rounded-sm border border-teal-500/20 bg-black/40 px-2 py-1 font-mono text-teal-300">
            -Xms2G -Xmx{ramValue}G -XX:+UseG1GC -XX:G1ReservePercent=15
          </code>
        </div>
      </div>
    </div>
  );
};

interface WikiInfoboxDropsTableProps {
  drops?: string[];
}

export function WikiInfoboxDropsTable({ drops }: Readonly<WikiInfoboxDropsTableProps>) {
  if (!drops || drops.length === 0) return null;

  return (
    <div className="space-y-2 border-t border-white/10 pt-2">
      <div className="text-(--accent) text-[11px] font-black uppercase tracking-wider">
        Tabla de Botín / Drops
      </div>
      <div className="space-y-1">
        {drops.map((drop) => (
          <div
            key={`drop-${drop}`}
            className="flex items-center justify-between rounded-lg border border-white/5 bg-black/40 p-2 text-xs"
          >
            <span className="font-medium text-white/80">{drop.split('(')[0].trim()}</span>
            <span className="text-(--accent) rounded-md border border-[#89d9d1]/20 bg-[#168c80]/20 px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums">
              {drop.includes('(') ? `(${drop.split('(')[1]}` : '100%'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

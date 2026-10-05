import type { Stage } from './types';

interface StageSelectionTabsProps {
  stages: Stage[];
  activeStageId: number;
  onSelectStage?: (id: number) => void;
  onSelect?: (id: number) => void;
}

export function StageSelectionTabs({
  stages,
  activeStageId,
  onSelectStage,
  onSelect,
}: Readonly<StageSelectionTabsProps>) {
  const handleSelect = onSelectStage ?? onSelect;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0c10]/90 px-4 py-6 shadow-2xl backdrop-blur-2xl">
      <div className="bg-linear-to-r pointer-events-none absolute inset-x-10 top-1/2 h-0.5 -translate-y-1/2 rounded-full from-[#168c80]/40 via-[#89d9d1]/60 to-[#168c80]/40 opacity-40" />

      <div className="relative z-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stages.map((stg) => {
          const isSelected = activeStageId === stg.id;
          const IconComponent = stg.icon;

          let iconStyleClass = 'bg-white/5 border-white/10 text-gray-400';
          if (isSelected) {
            if (stg.id === 1) {
              iconStyleClass =
                'bg-[#9146ff]/20 border-[#9146ff]/50 text-[#9146ff] shadow-[0_0_12px_rgba(145,70,255,0.4)]';
            } else {
              iconStyleClass = 'bg-[#89d9d1]/20 border-[#89d9d1]/40 text-[#89d9d1]';
            }
          }

          let iconContent = null;
          if (stg.imageSrc) {
            iconContent = (
              <img src={stg.imageSrc} alt={stg.title} className="size-5 object-contain" />
            );
          } else if (IconComponent) {
            const extraStyle =
              isSelected && stg.id === 1
                ? 'text-[#9146ff] drop-shadow-[0_0_8px_rgba(145,70,255,0.8)]'
                : '';
            iconContent = <IconComponent className={`size-5 ${extraStyle}`} />;
          }

          const dotClass = isSelected
            ? 'bg-[#89d9d1] animate-pulse shadow-[0_0_8px_#89d9d1]'
            : 'bg-gray-600 opacity-30';

          return (
            <button
              key={stg.id}
              type="button"
              aria-label={`${stg.stageName}: ${stg.title}`}
              onClick={() => handleSelect?.(stg.id)}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 text-left transition-colors duration-300 ${
                isSelected
                  ? 'scale-[1.02] border-[#89d9d1] bg-black/90 shadow-[0_0_25px_rgba(137,217,209,0.25)]'
                  : 'border-white/10 bg-[#0a0d14]/70 hover:border-white/20 hover:bg-black/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className="rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest"
                  style={{
                    color: stg.accentColor,
                    backgroundColor: `${stg.accentColor}15`,
                    borderColor: `${stg.accentColor}40`,
                  }}
                >
                  {stg.stageName}
                </span>
                <span className="font-mono text-xs font-black text-gray-400">{stg.year}</span>
              </div>

              <div className="my-1 flex items-start gap-3">
                <div
                  className={`mt-0.5 flex shrink-0 items-center justify-center rounded-xl border p-2 transition-transform group-hover:scale-110 ${iconStyleClass}`}
                >
                  {iconContent}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="wrap-break-word text-xs/snug font-black uppercase tracking-tight text-white transition-colors group-hover:text-[#89d9d1]">
                    {stg.title}
                  </h4>
                  <p className="wrap-break-word mt-0.5 text-[10px] font-medium leading-tight text-gray-400">
                    {stg.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end border-t border-white/5 pt-1">
                <div className={`size-2.5 rounded-full transition-colors ${dotClass}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

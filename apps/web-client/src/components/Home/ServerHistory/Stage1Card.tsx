import type React from 'react';
import { Server, Sparkles } from 'lucide-react';
import { Minecraft3DSkullCanvas } from '../Minecraft3DSkullCanvas';
import { Minecraft3DServerRackMiniCanvas } from '../Minecraft3DServerRackMiniCanvas';
import { FloatingItem, StageHeader, TwitchIcon } from './StageSharedComponents';
import type { Stage, StageFloatingItem, FeatureItem } from './types';

function getFeatureBgIcon(f: FeatureItem) {
  const titleLower = f.title.toLowerCase();
  if (titleLower.includes('forgotten')) {
    return (
      <div className="size-20">
        <Minecraft3DSkullCanvas size={80} />
      </div>
    );
  }
  if (titleLower.includes('ubuntu') || titleLower.includes('dedicated')) {
    return <Server className="size-16 text-white" />;
  }
  if (f.imageSrc) {
    return <img src={f.imageSrc} alt={f.title} className="size-16 object-contain" />;
  }
  if (f.icon) {
    return <f.icon className="size-16 text-white" />;
  }
  return <Sparkles className="size-16 text-white" />;
}

function getFeatureBadgeIcon(f: FeatureItem, brandColor: string) {
  const titleLower = f.title.toLowerCase();
  if (titleLower.includes('forgotten')) {
    return <Minecraft3DSkullCanvas size={44} className="size-full" />;
  }
  if (titleLower.includes('ubuntu') || titleLower.includes('dedicated')) {
    return <Minecraft3DServerRackMiniCanvas />;
  }
  if (f.imageSrc) {
    return (
      <img
        src={f.imageSrc}
        alt={f.title}
        className="size-full object-contain drop-shadow-[0_0_8px_rgba(0,229,255,0.4)] filter"
      />
    );
  }
  if (f.icon) {
    return <f.icon className="size-5" style={{ color: brandColor }} />;
  }
  return <Sparkles className="size-5" style={{ color: brandColor }} />;
}

export function StageFeatures({ features }: Readonly<{ features: FeatureItem[] }>) {
  return (
    <div className="relative z-10 flex flex-wrap justify-center gap-5 border-t border-white/10 pt-4">
      {features.map((f) => {
        const brandColor = f.brandColor ?? '#00e5ff';

        return (
          <div
            key={`feature-${f.title}`}
            className="max-w-85 group relative flex min-w-60 flex-1 flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0f14] p-5 shadow-xl transition-colors duration-300 hover:scale-[1.02]"
            style={
              {
                '--brand-color': brandColor,
              } as React.CSSProperties
            }
          >
            <div className="pointer-events-none absolute -bottom-3 -right-3 scale-110 transform opacity-15 transition-opacity group-hover:opacity-35">
              {getFeatureBgIcon(f)}
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-black/60 p-1.5 shadow-md">
                {getFeatureBadgeIcon(f, brandColor)}
              </div>
              <span
                className="rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest"
                style={{
                  color: brandColor,
                  backgroundColor: `${brandColor}20`,
                  borderColor: `${brandColor}50`,
                }}
              >
                {f.badgeText}
              </span>
            </div>
            <div className="relative z-10 space-y-1.5 text-left">
              <h5 className="text-sm font-black uppercase tracking-wide text-white transition-colors group-hover:opacity-90">
                {f.title}
              </h5>
              <p className="text-xs/snug text-gray-400">{f.desc}</p>
            </div>
            <div
              className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-[0.001] transition-transform duration-300 group-hover:scale-x-100"
              style={{
                backgroundColor: brandColor,
                boxShadow: `0 0 10px ${brandColor}`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function Stage1Card({
  stage,
  floatingItems,
}: Readonly<{ stage: Stage; floatingItems: StageFloatingItem[] }>) {
  return (
    <div className="bg-linear-to-b relative space-y-8 overflow-hidden rounded-3xl border border-white/10 from-[#101726]/90 via-[#090d16]/95 to-[#0b1320]/95 p-8 shadow-[0_0_50px_rgba(137,217,209,0.15)] md:p-10">
      <div className="pointer-events-none relative z-10 flex items-center justify-center pb-4 pt-2">
        <div className="group relative flex size-24 items-center justify-center overflow-hidden rounded-3xl border border-[#9146ff]/40 bg-black/60 p-5 shadow-[0_0_40px_rgba(145,70,255,0.3)] backdrop-blur-xl sm:size-32">
          <div
            className="absolute inset-0 opacity-25 transition-opacity"
            style={{
              background: `radial-gradient(circle, #9146ff 0%, transparent 70%)`,
            }}
          />
          <TwitchIcon className="relative z-10 size-14 animate-pulse text-[#9146ff] drop-shadow-[0_0_15px_rgba(145,70,255,0.8)]" />
        </div>
      </div>
      {floatingItems.map((item, idx) => (
        <FloatingItem key={item.pos} item={item} idx={idx} />
      ))}
      <StageHeader stage={stage} />
      <p className="relative z-10 mx-auto max-w-4xl rounded-2xl border border-white/10 bg-black/60 p-5 text-sm/relaxed font-medium text-gray-200 shadow-2xl backdrop-blur-md sm:p-6 md:text-base">
        {stage.narrativeSummary}
      </p>
      {stage.features && <StageFeatures features={stage.features} />}
    </div>
  );
}

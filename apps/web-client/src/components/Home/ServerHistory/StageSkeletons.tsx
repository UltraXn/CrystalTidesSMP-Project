import type React from 'react';

/* Shared skeleton building blocks */
const SkeletonBone = ({ className }: { className: string }) => (
  <div className={`bg-white/8 ${className}`} />
);

const SkeletonHeaderBlock = () => (
  <div className="relative z-10 space-y-3 text-center">
    <div className="flex justify-center">
      <SkeletonBone className="h-6 w-36 rounded-full border border-white/5" />
    </div>
    <div className="flex justify-center">
      <SkeletonBone className="h-9 w-72 rounded-xl" />
    </div>
    <div className="flex justify-center">
      <SkeletonBone className="h-5 w-56 rounded-lg" />
    </div>
  </div>
);

const SkeletonNarrativeBlock = () => (
  <div className="border-white/8 relative z-10 mx-auto max-w-4xl space-y-2.5 rounded-2xl border bg-black/40 p-5 shadow-2xl backdrop-blur-md sm:p-6">
    <SkeletonBone className="h-3.5 w-full rounded-sm" />
    <SkeletonBone className="h-3.5 w-11/12 rounded-sm" />
    <SkeletonBone className="h-3.5 w-4/5 rounded-sm" />
  </div>
);

const SkeletonFeaturesBlock = ({ count = 2 }: { count?: number }) => (
  <div className="relative z-10 mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className="border-white/8 flex items-start gap-4 rounded-2xl border bg-black/50 p-5 backdrop-blur-xl"
      >
        <SkeletonBone className="size-12 shrink-0 rounded-xl border border-white/5" />
        <div className="flex-1 space-y-2">
          <SkeletonBone className="h-2 w-16 rounded-sm" />
          <SkeletonBone className="h-4 w-32 rounded-sm" />
          <SkeletonBone className="h-3 w-full rounded-sm" />
        </div>
      </div>
    ))}
  </div>
);

const SkeletonFloatingCard = ({
  thumbW = 'w-14',
  thumbH = 'h-11',
}: {
  thumbW?: string;
  thumbH?: string;
}) => (
  <div className="border-white/8 flex items-center gap-3 rounded-2xl border bg-black/60 p-2.5 backdrop-blur-xl">
    <SkeletonBone className={`${thumbW} ${thumbH} shrink-0 rounded-xl border border-white/5`} />
    <div className="flex-1 space-y-1.5">
      <SkeletonBone className="h-2.5 w-20 rounded-sm" />
      <SkeletonBone className="h-3.5 w-28 rounded-sm" />
    </div>
  </div>
);

/* ── Stage 1 Skeleton: Centered Twitch icon → Header → Narrative → 2 Features ── */
export const Stage1Skeleton = () => (
  <div className="bg-linear-to-b relative animate-pulse space-y-8 overflow-hidden rounded-3xl border border-white/10 from-[#101726]/90 via-[#090d16]/95 to-[#05070c] p-8 shadow-[0_0_50px_rgba(137,217,209,0.1)] md:p-10">
    {/* Centered icon box (Twitch) */}
    <div className="relative z-10 flex items-center justify-center pb-4 pt-2">
      <div className="flex size-24 items-center justify-center rounded-3xl border border-[#9146ff]/20 bg-black/60 backdrop-blur-xl sm:size-32">
        <SkeletonBone className="size-14 rounded-xl" />
      </div>
    </div>
    <SkeletonHeaderBlock />
    <SkeletonNarrativeBlock />
    <SkeletonFeaturesBlock count={2} />
  </div>
);

/* ── Stage 2 Skeleton: Header → Bio cards left | Beacon center | Bio cards right → 4-member grid ── */
export const Stage2Skeleton = () => (
  <div className="bg-linear-to-b relative animate-pulse space-y-8 overflow-hidden rounded-3xl border border-white/10 from-[#101726]/90 via-[#090d16]/95 to-[#05070c] p-8 shadow-[0_0_50px_rgba(137,217,209,0.1)] md:p-10">
    <SkeletonHeaderBlock />
    {/* 3-column: bio cards | beacon | bio cards */}
    <div className="sm:min-h-70 relative z-10 my-2 flex min-h-60 items-center justify-between px-2 sm:px-4">
      {/* Left bio cards */}
      <div className="sm:w-68 z-10 hidden w-60 flex-col gap-4 md:flex">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="border-white/8 space-y-2 rounded-2xl border bg-black/60 p-3.5 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2.5 border-b border-white/5 pb-2">
              <SkeletonBone className="size-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1">
                <SkeletonBone className="h-2 w-24 rounded-sm" />
                <SkeletonBone className="h-3 w-20 rounded-sm" />
              </div>
            </div>
            <SkeletonBone className="h-3 w-full rounded-sm" />
            <SkeletonBone className="h-3 w-4/5 rounded-sm" />
            <div className="flex gap-1 pt-0.5">
              <SkeletonBone className="h-4 w-14 rounded-md" />
              <SkeletonBone className="h-4 w-12 rounded-md" />
              <SkeletonBone className="h-4 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>
      {/* Center beacon drop zone */}
      <div className="pointer-events-none flex flex-1 items-center justify-center">
        <SkeletonBone className="size-48 rounded-full border border-white/5" />
      </div>
      {/* Right bio cards */}
      <div className="sm:w-68 z-10 hidden w-60 flex-col gap-4 md:flex">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="border-white/8 space-y-2 rounded-2xl border bg-black/60 p-3.5 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2.5 border-b border-white/5 pb-2">
              <SkeletonBone className="size-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1">
                <SkeletonBone className="h-2 w-20 rounded-sm" />
                <SkeletonBone className="h-3 w-16 rounded-sm" />
              </div>
            </div>
            <SkeletonBone className="h-3 w-full rounded-sm" />
            <SkeletonBone className="h-3 w-3/4 rounded-sm" />
            <div className="flex gap-1 pt-0.5">
              <SkeletonBone className="h-4 w-16 rounded-md" />
              <SkeletonBone className="h-4 w-14 rounded-md" />
              <SkeletonBone className="w-18 h-4 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* 4 member cards grid */}
    <div className="relative z-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border-white/8 relative flex flex-col gap-3 rounded-2xl border bg-zinc-950/60 p-4 pt-6 backdrop-blur-md"
          >
            {/* Gem socket */}
            <div className="absolute -top-5 left-1/2 z-30 -translate-x-1/2">
              <SkeletonBone className="size-11 rounded-full border-2 border-white/10" />
            </div>
            {/* Avatar + details */}
            <div className="flex items-center gap-3">
              <SkeletonBone className="size-12 shrink-0 rounded-full border-2 border-white/10" />
              <div className="flex-1 space-y-1.5">
                <SkeletonBone className="h-3.5 w-24 rounded-sm" />
                <SkeletonBone className="h-2.5 w-20 rounded-sm" />
                <SkeletonBone className="h-2 w-full rounded-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ── Stage 3 Skeleton: Header → Video button → Photo cards left | 3D center | Photo cards right → Narrative → Features ── */
export const Stage3Skeleton = () => (
  <div className="bg-linear-to-b relative animate-pulse space-y-8 overflow-hidden rounded-3xl border border-white/10 from-[#101726]/90 via-[#090d16]/95 to-[#05070c] p-8 shadow-[0_0_50px_rgba(137,217,209,0.1)] md:p-10">
    {/* 3D bg glow */}
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="size-48 rounded-full bg-[#89d9d1]/5 blur-3xl" />
    </div>
    <SkeletonHeaderBlock />
    {/* Video button placeholder */}
    <div className="relative z-20 my-2.5 flex justify-center">
      <div className="border-white/8 flex items-center gap-3 rounded-2xl border bg-black/60 px-5 py-2.5 backdrop-blur-xl">
        <SkeletonBone className="size-8 shrink-0 rounded-xl" />
        <div className="space-y-1">
          <SkeletonBone className="h-2.5 w-36 rounded-sm" />
          <SkeletonBone className="h-3.5 w-28 rounded-sm" />
        </div>
      </div>
    </div>
    {/* 3-column: photo cards | 3D | photo cards */}
    <div className="sm:min-h-70 relative z-10 my-2 flex min-h-60 items-center justify-between px-2 sm:px-4">
      <div className="z-10 hidden w-52 flex-col gap-3.5 sm:w-60 md:flex">
        <SkeletonFloatingCard />
        <SkeletonFloatingCard />
      </div>
      <div className="pointer-events-none flex-1" />
      <div className="z-10 hidden w-52 flex-col gap-3.5 sm:w-60 md:flex">
        <SkeletonFloatingCard />
        <SkeletonFloatingCard />
      </div>
    </div>
    <SkeletonNarrativeBlock />
    <SkeletonFeaturesBlock count={2} />
  </div>
);

/* ── Stage 4 Skeleton: Header → Feature pills left | 3D center | Feature pills right → Narrative → Features ── */
export const Stage4Skeleton = () => (
  <div className="bg-linear-to-b relative animate-pulse space-y-8 overflow-hidden rounded-3xl border border-white/10 from-[#101726]/90 via-[#090d16]/95 to-[#05070c] p-8 shadow-[0_0_50px_rgba(233,84,32,0.1)] md:p-10">
    {/* 3D bg glow */}
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="size-48 rounded-full bg-[#e95420]/5 blur-3xl" />
    </div>
    <SkeletonHeaderBlock />
    {/* 3-column: feature pills | 3D | feature pills */}
    <div className="sm:min-h-70 relative z-10 my-2 flex min-h-60 items-center justify-between px-2 sm:px-4">
      <div className="max-w-85 z-10 hidden w-fit shrink-0 flex-col gap-3.5 md:flex">
        <SkeletonFloatingCard thumbW="w-11" thumbH="h-11" />
        <SkeletonFloatingCard thumbW="w-11" thumbH="h-11" />
      </div>
      <div className="pointer-events-none flex-1" />
      <div className="max-w-85 z-10 hidden w-fit shrink-0 flex-col gap-3.5 md:flex">
        <SkeletonFloatingCard thumbW="w-11" thumbH="h-11" />
        <SkeletonFloatingCard thumbW="w-11" thumbH="h-11" />
      </div>
    </div>
    <SkeletonNarrativeBlock />
    <SkeletonFeaturesBlock count={2} />
  </div>
);

const STAGE_SKELETONS: Record<number, React.FC> = {
  1: Stage1Skeleton,
  2: Stage2Skeleton,
  3: Stage3Skeleton,
  4: Stage4Skeleton,
};

export const StageSkeletonFallback = ({ stageId }: { stageId: number }) => {
  const SkelComponent = STAGE_SKELETONS[stageId] || Stage1Skeleton;
  return <SkelComponent />;
};

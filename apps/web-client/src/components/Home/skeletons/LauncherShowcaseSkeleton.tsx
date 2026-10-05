const SkeletonBone = ({ className }: { className: string }) => (
  <div className={`bg-white/8 ${className}`} />
);

export default function LauncherShowcaseSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <div className="flex justify-center">
          <SkeletonBone className="h-5 w-64 border border-white/5" />
        </div>
        <div className="flex justify-center">
          <SkeletonBone className="h-10 w-full max-w-lg" />
        </div>
        <div className="flex justify-center">
          <SkeletonBone className="h-4 w-2/3" />
        </div>
        <div className="flex justify-center gap-2 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonBone key={i} className="h-7 w-28" />
          ))}
        </div>
      </div>

      {/* Desktop Window Frame (Sharp Edges) */}
      <div className="mx-auto max-w-6xl overflow-hidden border border-slate-800 bg-[#0B0F17] shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#0F141F] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <SkeletonBone className="size-2.5 rounded-full" />
            <SkeletonBone className="size-2.5 rounded-full" />
            <SkeletonBone className="size-2.5 rounded-full" />
            <SkeletonBone className="ml-2 h-3.5 w-48" />
          </div>
          <div className="flex gap-2">
            <SkeletonBone className="h-5 w-24" />
            <SkeletonBone className="size-5" />
          </div>
        </div>
        <div className="flex h-[640px] gap-4 bg-[#070A0F] p-4">
          <SkeletonBone className="h-full w-20" />
          <div className="flex-1 space-y-4">
            <SkeletonBone className="h-48 w-full" />
            <div className="grid grid-cols-3 gap-4">
              <SkeletonBone className="h-28" />
              <SkeletonBone className="h-28" />
              <SkeletonBone className="h-28" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

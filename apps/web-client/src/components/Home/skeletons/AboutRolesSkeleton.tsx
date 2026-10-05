const SkeletonBone = ({ className }: { className: string }) => (
  <div className={`bg-white/8 ${className}`} />
);

export default function AboutRolesSkeleton() {
  return (
    <div className="bg-linear-to-b animate-pulse space-y-8 rounded-3xl border border-white/10 from-[#101726]/90 via-[#090d16]/95 to-[#05070c] p-6 sm:p-8">
      {/* Header */}
      <div className="space-y-3 text-center">
        <div className="flex justify-center">
          <SkeletonBone className="h-8 w-72 rounded-full border border-white/5" />
        </div>
        <div className="flex justify-center">
          <SkeletonBone className="h-4 w-96 rounded-lg" />
        </div>
      </div>

      {/* Role Tabs */}
      <div className="flex flex-wrap justify-center gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonBone key={i} className="h-10 w-36 rounded-xl border border-white/5 sm:w-44" />
        ))}
      </div>

      {/* Content Section: Info Card + Radar Chart */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        {/* Info Card */}
        <div className="border-white/8 space-y-4 rounded-2xl border bg-black/50 p-6 lg:col-span-7">
          <div className="flex items-center gap-3">
            <SkeletonBone className="size-12 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <SkeletonBone className="h-5 w-48 rounded-sm" />
              <SkeletonBone className="h-3 w-32 rounded-sm" />
            </div>
          </div>
          <SkeletonBone className="h-3.5 w-full rounded-sm" />
          <SkeletonBone className="h-3.5 w-11/12 rounded-sm" />
          <div className="space-y-2 rounded-xl border border-white/5 bg-white/5 p-4">
            <SkeletonBone className="h-3 w-28 rounded-sm" />
            <SkeletonBone className="h-4 w-3/4 rounded-sm" />
          </div>
        </div>

        {/* Radar Chart Placeholder */}
        <div className="border-white/8 flex flex-col items-center justify-center space-y-4 rounded-2xl border bg-black/50 p-6 lg:col-span-5">
          <SkeletonBone className="size-48 rounded-full border border-white/5" />
          <SkeletonBone className="h-3 w-36 rounded-sm" />
        </div>
      </div>

      {/* Ranks Table */}
      <div className="border-white/8 space-y-3 rounded-2xl border bg-black/50 p-6">
        <SkeletonBone className="h-5 w-40 rounded-sm" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 rounded-xl bg-white/5 p-3"
            >
              <div className="flex items-center gap-3">
                <SkeletonBone className="size-8 shrink-0 rounded-lg" />
                <SkeletonBone className="h-4 w-28 rounded-sm" />
              </div>
              <SkeletonBone className="h-3 w-24 rounded-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Prestige Tiers */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center space-y-2 rounded-xl border border-white/5 bg-black/40 p-3 text-center"
          >
            <SkeletonBone className="h-3 w-20 rounded-sm" />
            <SkeletonBone className="h-4 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

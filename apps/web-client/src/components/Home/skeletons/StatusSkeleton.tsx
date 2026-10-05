const SkeletonBone = ({ className }: { className: string }) => (
  <div className={`bg-white/8 ${className}`} />
);

export default function StatusSkeleton() {
  return (
    <div
      className="page-container animate-pulse space-y-10"
      style={{ maxWidth: '1000px', margin: '0 auto', padding: '8rem 1rem 2rem' }}
    >
      {/* Header Skeleton */}
      <div className="space-y-3 text-center">
        <div className="flex justify-center">
          <SkeletonBone className="h-10 w-64 rounded-xl border border-white/5" />
        </div>
        <div className="flex justify-center">
          <SkeletonBone className="h-4 w-80 rounded-lg" />
        </div>
      </div>

      {/* ServerStatusCard Skeleton */}
      <div className="border-white/8 space-y-6 rounded-3xl border bg-[#090d16]/95 p-8">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <SkeletonBone className="h-4 w-32 rounded-full" />
            <SkeletonBone className="h-8 w-56 rounded-xl" />
          </div>
          <SkeletonBone className="h-10 w-36 rounded-2xl border border-white/10" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 rounded-2xl border border-white/5 bg-black/40 p-4">
              <SkeletonBone className="h-3 w-20 rounded-sm" />
              <SkeletonBone className="h-6 w-28 rounded-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Players & Performance Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Players Panel */}
        <div className="space-y-4 rounded-2xl border border-white/5 bg-[#090d16]/90 p-6">
          <SkeletonBone className="h-6 w-44 rounded-sm" />
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex w-32 items-center gap-2 rounded-lg border border-white/5 bg-black/30 px-3 py-2"
              >
                <SkeletonBone className="size-6 shrink-0 rounded-sm" />
                <SkeletonBone className="h-3.5 w-16 rounded-sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Performance Panel */}
        <div className="space-y-4 rounded-2xl border border-white/5 bg-[#090d16]/90 p-6">
          <SkeletonBone className="h-6 w-48 rounded-sm" />
          <div className="space-y-3">
            <SkeletonBone className="h-4 w-full rounded-sm" />
            <SkeletonBone className="h-4 w-4/5 rounded-sm" />
            <SkeletonBone className="h-4 w-3/4 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

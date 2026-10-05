const SkeletonBone = ({ className }: { className: string }) => (
  <div className={`bg-white/8 ${className}`} />
);

export default function RulesSkeleton() {
  return (
    <div className="animate-pulse space-y-8 px-4">
      {/* Header */}
      <div className="space-y-3 text-center">
        <div className="flex justify-center">
          <SkeletonBone className="h-8 w-60 rounded-full border border-white/5" />
        </div>
        <div className="flex justify-center">
          <SkeletonBone className="h-4 w-80 rounded-lg" />
        </div>
      </div>

      {/* Filter Pills & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonBone key={i} className="h-9 w-28 rounded-full border border-white/5" />
          ))}
        </div>
        <SkeletonBone className="h-10 w-full rounded-xl border border-white/5 sm:w-64" />
      </div>

      {/* Accordions List */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border-white/8 space-y-3 rounded-2xl border bg-[#090d16]/95 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SkeletonBone className="size-9 shrink-0 rounded-xl" />
                <div className="space-y-1.5">
                  <SkeletonBone className="h-4 w-48 rounded-sm" />
                  <SkeletonBone className="h-3 w-32 rounded-sm" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SkeletonBone className="h-6 w-16 rounded-full" />
                <SkeletonBone className="size-5 rounded-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

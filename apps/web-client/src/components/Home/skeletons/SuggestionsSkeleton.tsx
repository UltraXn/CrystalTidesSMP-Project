const SkeletonBone = ({ className }: { className: string }) => (
  <div className={`bg-white/8 ${className}`} />
);

export default function SuggestionsSkeleton() {
  return (
    <div className="animate-pulse space-y-8 px-4">
      {/* Header */}
      <div className="space-y-3 text-center">
        <div className="flex justify-center">
          <SkeletonBone className="h-8 w-64 rounded-full border border-white/5" />
        </div>
        <div className="flex justify-center">
          <SkeletonBone className="h-4 w-96 rounded-lg" />
        </div>
      </div>

      {/* Poll Card */}
      <div className="border-white/8 space-y-4 rounded-2xl border bg-[#090d16]/95 p-6">
        <div className="flex items-center gap-3">
          <SkeletonBone className="size-8 shrink-0 rounded-lg" />
          <SkeletonBone className="h-5 w-48 rounded-sm" />
        </div>
        <SkeletonBone className="h-4 w-3/4 rounded-sm" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 rounded-xl border border-white/5 bg-black/40 p-3">
              <div className="flex justify-between">
                <SkeletonBone className="h-3.5 w-32 rounded-sm" />
                <SkeletonBone className="h-3.5 w-12 rounded-sm" />
              </div>
              <SkeletonBone className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Submit Suggestion Form Box */}
      <div className="border-white/8 space-y-4 rounded-2xl border bg-[#090d16]/95 p-6">
        <SkeletonBone className="h-5 w-44 rounded-sm" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SkeletonBone className="h-10 w-full rounded-xl border border-white/5" />
          <SkeletonBone className="h-10 w-full rounded-xl border border-white/5" />
        </div>
        <SkeletonBone className="h-24 w-full rounded-xl border border-white/5" />
        <div className="flex justify-end">
          <SkeletonBone className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* Suggestions Feed Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border-white/8 flex flex-col justify-between space-y-3 rounded-2xl border bg-black/40 p-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SkeletonBone className="size-7 rounded-full" />
                  <SkeletonBone className="h-3.5 w-24 rounded-sm" />
                </div>
                <SkeletonBone className="h-5 w-20 rounded-full" />
              </div>
              <SkeletonBone className="h-3.5 w-full rounded-sm" />
              <SkeletonBone className="h-3.5 w-4/5 rounded-sm" />
            </div>
            <div className="flex items-center gap-4 border-t border-white/5 pt-2">
              <SkeletonBone className="h-7 w-16 rounded-lg" />
              <SkeletonBone className="h-7 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

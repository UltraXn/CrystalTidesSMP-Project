const SkeletonBone = ({ className }: { className: string }) => (
  <div className={`bg-white/8 ${className}`} />
);

export default function StaffShowcaseSkeleton() {
  return (
    <div className="animate-pulse space-y-12 px-4">
      {/* Header */}
      <div className="space-y-3 text-center">
        <div className="flex justify-center">
          <SkeletonBone className="h-8 w-64 rounded-full border border-white/5" />
        </div>
        <div className="flex justify-center">
          <SkeletonBone className="h-4 w-96 rounded-lg" />
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border-white/8 relative space-y-4 overflow-hidden rounded-2xl border bg-[#090d16]/95 p-6"
          >
            {/* Rank Badge Header */}
            <div className="flex items-center justify-between">
              <SkeletonBone className="h-6 w-24 rounded-full" />
              <SkeletonBone className="h-4 w-16 rounded-sm" />
            </div>
            {/* Avatar */}
            <div className="my-2 flex justify-center">
              <SkeletonBone className="size-24 rounded-2xl border border-white/10" />
            </div>
            {/* Member Details */}
            <div className="space-y-2 text-center">
              <SkeletonBone className="mx-auto h-5 w-32 rounded-sm" />
              <SkeletonBone className="mx-auto h-3 w-4/5 rounded-sm" />
              <SkeletonBone className="mx-auto h-3 w-3/4 rounded-sm" />
            </div>
            {/* Social Links */}
            <div className="flex justify-center gap-2 border-t border-white/5 pt-2">
              <SkeletonBone className="size-8 rounded-lg" />
              <SkeletonBone className="size-8 rounded-lg" />
              <SkeletonBone className="size-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Discord Widget Section */}
      <div className="bg-linear-to-b space-y-6 rounded-3xl border border-white/10 from-[#101726]/90 via-[#090d16]/95 to-[#05070c] p-6">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-white/5 pb-4 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <SkeletonBone className="h-6 w-48 rounded-sm" />
            <SkeletonBone className="h-3.5 w-64 rounded-sm" />
          </div>
          <SkeletonBone className="h-10 w-36 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-white/5 bg-black/40 p-4"
            >
              <SkeletonBone className="mt-0.5 size-5 shrink-0 rounded-sm" />
              <div className="flex-1 space-y-1.5">
                <SkeletonBone className="h-3.5 w-28 rounded-sm" />
                <SkeletonBone className="h-3 w-full rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

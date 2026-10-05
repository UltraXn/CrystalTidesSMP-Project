const SkeletonBone = ({ className }: { className: string }) => (
  <div className={`bg-white/8 ${className}`} />
);

export default function ContestsSkeleton() {
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

      {/* Contests Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-white/8 flex flex-col justify-between space-y-5 rounded-2xl border bg-[#090d16]/95 p-6"
          >
            <div className="space-y-4">
              {/* Card Top Pill & Icon */}
              <div className="flex items-center justify-between">
                <SkeletonBone className="size-10 rounded-xl" />
                <SkeletonBone className="h-6 w-20 rounded-full" />
              </div>
              {/* Title & Desc */}
              <div className="space-y-2">
                <SkeletonBone className="h-5 w-48 rounded-sm" />
                <SkeletonBone className="h-3.5 w-full rounded-sm" />
                <SkeletonBone className="h-3.5 w-5/6 rounded-sm" />
              </div>
              {/* Timer Block */}
              <div className="flex justify-around rounded-xl border border-white/5 bg-black/40 p-3">
                {[1, 2, 3, 4].map((t) => (
                  <div key={t} className="space-y-1 text-center">
                    <SkeletonBone className="mx-auto h-5 w-8 rounded-sm" />
                    <SkeletonBone className="mx-auto h-2 w-6 rounded-sm" />
                  </div>
                ))}
              </div>
            </div>
            {/* Register Button */}
            <SkeletonBone className="mt-4 h-11 w-full rounded-xl border border-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

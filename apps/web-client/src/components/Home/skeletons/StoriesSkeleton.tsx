const SkeletonBone = ({ className }: { className: string }) => (
  <div className={`bg-white/8 ${className}`} />
);

export default function StoriesSkeleton() {
  return (
    <div className="animate-pulse space-y-8 px-4">
      {/* Header */}
      <div className="space-y-3 text-center">
        <div className="flex justify-center">
          <SkeletonBone className="h-8 w-60 rounded-full border border-white/5" />
        </div>
        <div className="flex justify-center">
          <SkeletonBone className="h-4 w-96 rounded-lg" />
        </div>
      </div>

      {/* Intro Banner */}
      <div className="mx-auto max-w-3xl space-y-3 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <SkeletonBone className="mx-auto h-4 w-full rounded-sm" />
        <SkeletonBone className="mx-auto h-4 w-5/6 rounded-sm" />
      </div>

      {/* Stories/Locations Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-white/8 flex flex-col justify-between space-y-4 overflow-hidden rounded-2xl border bg-[#090d16]/95"
          >
            <SkeletonBone className="h-44 w-full" />
            <div className="flex-1 space-y-3 p-5">
              <div className="flex items-center justify-between">
                <SkeletonBone className="h-5 w-32 rounded-sm" />
                <SkeletonBone className="h-5 w-24 rounded-md" />
              </div>
              <SkeletonBone className="h-3.5 w-full rounded-sm" />
              <SkeletonBone className="h-3.5 w-11/12 rounded-sm" />
            </div>
            <div className="flex items-center justify-between border-t border-white/5 px-5 pb-5 pt-2">
              <SkeletonBone className="h-9 w-28 rounded-xl" />
              <SkeletonBone className="h-9 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SkeletonBone = ({ className }: { className: string }) => (
  <div className={`bg-white/8 ${className}`} />
);

export default function BlogSkeleton() {
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

      {/* Articles Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-white/8 flex flex-col justify-between space-y-4 overflow-hidden rounded-2xl border bg-[#090d16]/95"
          >
            {/* Image Placeholder */}
            <SkeletonBone className="h-48 w-full" />
            {/* Body */}
            <div className="flex-1 space-y-3 p-5">
              <div className="flex items-center justify-between">
                <SkeletonBone className="h-5 w-24 rounded-full" />
                <SkeletonBone className="h-3 w-20 rounded-sm" />
              </div>
              <SkeletonBone className="h-5 w-full rounded-sm" />
              <SkeletonBone className="h-3.5 w-full rounded-sm" />
              <SkeletonBone className="h-3.5 w-4/5 rounded-sm" />
            </div>
            {/* Footer / Likes */}
            <div className="flex items-center justify-between border-t border-white/5 px-5 pb-5 pt-3">
              <SkeletonBone className="h-8 w-20 rounded-lg" />
              <SkeletonBone className="h-4 w-24 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

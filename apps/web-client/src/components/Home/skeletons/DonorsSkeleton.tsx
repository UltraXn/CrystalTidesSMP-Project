const SkeletonBone = ({ className }: { className: string }) => (
  <div className={`bg-white/8 ${className}`} />
);

export default function DonorsSkeleton() {
  return (
    <div className="max-w-360 mx-auto w-full animate-pulse space-y-16 px-4">
      {/* 1. Header Section */}
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <div className="flex items-center justify-center gap-3">
          <SkeletonBone className="size-8 shrink-0 rounded-full" />
          <SkeletonBone className="h-8 w-72 rounded-xl" />
        </div>
        <SkeletonBone className="mx-auto h-4 w-11/12 rounded-sm" />
        <SkeletonBone className="mx-auto h-4 w-4/5 rounded-sm" />
      </div>

      {/* 2. Últimas Donaciones Title & Vertical Stream Feed */}
      <div className="space-y-8">
        <div className="flex items-center justify-center gap-4">
          <SkeletonBone className="h-0.5 w-16 rounded-sm" />
          <SkeletonBone className="h-6 w-48 rounded-lg" />
          <SkeletonBone className="h-0.5 w-16 rounded-sm" />
        </div>

        {/* Vertical Stream Container (Matches max-w-676px height 430px) */}
        <div className="max-w-169 border-white/8 mx-auto space-y-4 rounded-3xl border bg-[#090d16]/90 p-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/60 p-4"
            >
              <div className="flex flex-1 items-center gap-3">
                <SkeletonBone className="size-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <SkeletonBone className="h-3.5 w-28 rounded-sm" />
                  <SkeletonBone className="h-2.5 w-20 rounded-sm" />
                </div>
              </div>
              <SkeletonBone className="h-7 w-20 rounded-full border border-white/10" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. KoFi Button & Carousel Section */}
      <div className="space-y-12">
        {/* Ko-fi button centered */}
        <div className="flex justify-center">
          <SkeletonBone className="h-14 w-64 rounded-2xl border border-white/10" />
        </div>

        {/* 5-Column Donors Carousel Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="border-white/8 flex h-96 flex-col justify-between space-y-4 rounded-3xl border bg-[#0a0a0a]/80 p-4"
            >
              {/* 3:4 Aspect Ratio Image Box */}
              <SkeletonBone className="aspect-3/4 w-full rounded-2xl border border-white/5" />
              {/* Donor Name & Rank Badge */}
              <div className="space-y-2 text-center">
                <SkeletonBone className="mx-auto h-4 w-28 rounded-sm" />
                <SkeletonBone className="mx-auto h-3 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

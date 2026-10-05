const SkeletonBone = ({ className }: { className: string }) => (
  <div className={`bg-white/8 ${className}`} />
);

export default function ServerHistorySkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-10 px-4">
      {/* Header */}
      <div className="space-y-3 text-center">
        <div className="flex justify-center">
          <SkeletonBone className="h-7 w-64 rounded-full border border-white/5" />
        </div>
        <div className="flex justify-center">
          <SkeletonBone className="h-4 w-96 rounded-lg" />
        </div>
      </div>

      {/* Stage Selector Bar */}
      <div className="rounded-3xl border border-white/10 bg-[#0b0c10]/90 p-4 backdrop-blur-2xl">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3 rounded-2xl border border-white/5 bg-black/40 p-4">
              <div className="flex items-center justify-between">
                <SkeletonBone className="h-4 w-20 rounded-md" />
                <SkeletonBone className="h-3 w-10 rounded-sm" />
              </div>
              <div className="flex items-center gap-3">
                <SkeletonBone className="size-10 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <SkeletonBone className="h-3.5 w-24 rounded-sm" />
                  <SkeletonBone className="h-2.5 w-16 rounded-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-1">
                <SkeletonBone className="h-2.5 w-16 rounded-sm" />
                <SkeletonBone className="size-2.5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Stage Content Card */}
      <div className="bg-linear-to-b space-y-8 rounded-3xl border border-white/10 from-[#101726]/90 via-[#090d16]/95 to-[#05070c] p-8 md:p-10">
        <div className="space-y-3 text-center">
          <div className="flex justify-center">
            <SkeletonBone className="h-6 w-36 rounded-full border border-white/5" />
          </div>
          <div className="flex justify-center">
            <SkeletonBone className="h-9 w-72 rounded-xl" />
          </div>
        </div>

        <div className="border-white/8 mx-auto max-w-4xl space-y-2.5 rounded-2xl border bg-black/40 p-5">
          <SkeletonBone className="h-3.5 w-full rounded-sm" />
          <SkeletonBone className="h-3.5 w-11/12 rounded-sm" />
          <SkeletonBone className="h-3.5 w-4/5 rounded-sm" />
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="border-white/8 flex items-start gap-4 rounded-2xl border bg-black/50 p-5"
            >
              <SkeletonBone className="size-12 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <SkeletonBone className="h-2.5 w-16 rounded-sm" />
                <SkeletonBone className="h-4 w-32 rounded-sm" />
                <SkeletonBone className="h-3 w-full rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const SkeletonBone = ({ className }: { className: string }) => (
  <div className={`bg-white/8 ${className}`} />
);

export default function FaqSkeleton() {
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

      {/* Accordion Items */}
      <div className="mx-auto max-w-4xl space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-5"
          >
            <SkeletonBone className="h-5 w-2/3 rounded-lg" />
            <SkeletonBone className="size-5 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

const SkeletonBone = ({ className }: { className: string }) => (
    <div className={`bg-white/8 ${className}`} />
);

export default function StatusSkeleton() {
    return (
        <div className="page-container space-y-10 animate-pulse" style={{ maxWidth: '1000px', margin: '0 auto', padding: '8rem 1rem 2rem' }}>
            {/* Header Skeleton */}
            <div className="text-center space-y-3">
                <div className="flex justify-center">
                    <SkeletonBone className="h-10 w-64 rounded-xl border border-white/5" />
                </div>
                <div className="flex justify-center">
                    <SkeletonBone className="h-4 w-80 rounded-lg" />
                </div>
            </div>

            {/* ServerStatusCard Skeleton */}
            <div className="p-8 rounded-3xl bg-[#090d16]/95 border border-white/8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
                    <div className="space-y-2">
                        <SkeletonBone className="h-4 w-32 rounded-full" />
                        <SkeletonBone className="h-8 w-56 rounded-xl" />
                    </div>
                    <SkeletonBone className="h-10 w-36 rounded-2xl border border-white/10" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                            <SkeletonBone className="h-3 w-20 rounded" />
                            <SkeletonBone className="h-6 w-28 rounded" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Players & Performance Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Players Panel */}
                <div className="p-6 rounded-2xl bg-[#090d16]/90 border border-white/5 space-y-4">
                    <SkeletonBone className="h-6 w-44 rounded" />
                    <div className="flex flex-wrap gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-lg border border-white/5 w-32">
                                <SkeletonBone className="w-6 h-6 rounded-sm shrink-0" />
                                <SkeletonBone className="h-3.5 w-16 rounded" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance Panel */}
                <div className="p-6 rounded-2xl bg-[#090d16]/90 border border-white/5 space-y-4">
                    <SkeletonBone className="h-6 w-48 rounded" />
                    <div className="space-y-3">
                        <SkeletonBone className="h-4 w-full rounded" />
                        <SkeletonBone className="h-4 w-4/5 rounded" />
                        <SkeletonBone className="h-4 w-3/4 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}

const SkeletonBone = ({ className }: { className: string }) => (
    <div className={`bg-white/8 ${className}`} />
);

export default function AboutRolesSkeleton() {
    return (
        <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-b from-[#101726]/90 via-[#090d16]/95 to-[#05070c] border border-white/10 space-y-8 animate-pulse">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="flex justify-center">
                    <SkeletonBone className="h-8 w-72 rounded-full border border-white/5" />
                </div>
                <div className="flex justify-center">
                    <SkeletonBone className="h-4 w-96 rounded-lg" />
                </div>
            </div>

            {/* Role Tabs */}
            <div className="flex flex-wrap justify-center gap-3">
                {[1, 2, 3, 4, 5].map(i => (
                    <SkeletonBone key={i} className="h-10 w-36 sm:w-44 rounded-xl border border-white/5" />
                ))}
            </div>

            {/* Content Section: Info Card + Radar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Info Card */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-black/50 border border-white/8 space-y-4">
                    <div className="flex items-center gap-3">
                        <SkeletonBone className="w-12 h-12 rounded-xl shrink-0" />
                        <div className="space-y-2 flex-1">
                            <SkeletonBone className="h-5 w-48 rounded" />
                            <SkeletonBone className="h-3 w-32 rounded" />
                        </div>
                    </div>
                    <SkeletonBone className="h-3.5 w-full rounded" />
                    <SkeletonBone className="h-3.5 w-11/12 rounded" />
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                        <SkeletonBone className="h-3 w-28 rounded" />
                        <SkeletonBone className="h-4 w-3/4 rounded" />
                    </div>
                </div>

                {/* Radar Chart Placeholder */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-black/50 border border-white/8 flex flex-col items-center justify-center space-y-4">
                    <SkeletonBone className="w-48 h-48 rounded-full border border-white/5" />
                    <SkeletonBone className="h-3 w-36 rounded" />
                </div>
            </div>

            {/* Ranks Table */}
            <div className="p-6 rounded-2xl bg-black/50 border border-white/8 space-y-3">
                <SkeletonBone className="h-5 w-40 rounded" />
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="p-3 rounded-xl bg-white/5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <SkeletonBone className="w-8 h-8 rounded-lg shrink-0" />
                                <SkeletonBone className="h-4 w-28 rounded" />
                            </div>
                            <SkeletonBone className="h-3 w-24 rounded" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Prestige Tiers */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 text-center flex flex-col items-center">
                        <SkeletonBone className="h-3 w-20 rounded" />
                        <SkeletonBone className="h-4 w-24 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

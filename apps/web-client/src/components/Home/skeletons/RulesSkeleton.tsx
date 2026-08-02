const SkeletonBone = ({ className }: { className: string }) => (
    <div className={`bg-white/8 ${className}`} />
);

export default function RulesSkeleton() {
    return (
        <div className="space-y-8 animate-pulse px-4">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="flex justify-center">
                    <SkeletonBone className="h-8 w-60 rounded-full border border-white/5" />
                </div>
                <div className="flex justify-center">
                    <SkeletonBone className="h-4 w-80 rounded-lg" />
                </div>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <SkeletonBone key={i} className="h-9 w-28 rounded-full border border-white/5" />
                    ))}
                </div>
                <SkeletonBone className="h-10 w-full sm:w-64 rounded-xl border border-white/5" />
            </div>

            {/* Accordions List */}
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="p-5 rounded-2xl bg-[#090d16]/95 border border-white/8 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <SkeletonBone className="w-9 h-9 rounded-xl shrink-0" />
                                <div className="space-y-1.5">
                                    <SkeletonBone className="h-4 w-48 rounded" />
                                    <SkeletonBone className="h-3 w-32 rounded" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <SkeletonBone className="h-6 w-16 rounded-full" />
                                <SkeletonBone className="w-5 h-5 rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

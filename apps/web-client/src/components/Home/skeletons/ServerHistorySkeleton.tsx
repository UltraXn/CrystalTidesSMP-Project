const SkeletonBone = ({ className }: { className: string }) => (
    <div className={`bg-white/8 ${className}`} />
);

export default function ServerHistorySkeleton() {
    return (
        <div className="max-w-6xl mx-auto px-4 space-y-10 animate-pulse">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="flex justify-center">
                    <SkeletonBone className="h-7 w-64 rounded-full border border-white/5" />
                </div>
                <div className="flex justify-center">
                    <SkeletonBone className="h-4 w-96 rounded-lg" />
                </div>
            </div>

            {/* Stage Selector Bar */}
            <div className="p-4 bg-[#0b0c10]/90 border border-white/10 rounded-3xl backdrop-blur-2xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="p-4 rounded-2xl border border-white/5 bg-black/40 space-y-3">
                            <div className="flex justify-between items-center">
                                <SkeletonBone className="h-4 w-20 rounded-md" />
                                <SkeletonBone className="h-3 w-10 rounded" />
                            </div>
                            <div className="flex items-center gap-3">
                                <SkeletonBone className="w-10 h-10 rounded-xl shrink-0" />
                                <div className="space-y-1.5 flex-1">
                                    <SkeletonBone className="h-3.5 w-24 rounded" />
                                    <SkeletonBone className="h-2.5 w-16 rounded" />
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-white/5">
                                <SkeletonBone className="h-2.5 w-16 rounded" />
                                <SkeletonBone className="w-2.5 h-2.5 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Stage Content Card */}
            <div className="p-8 md:p-10 rounded-3xl bg-linear-to-b from-[#101726]/90 via-[#090d16]/95 to-[#05070c] border border-white/10 space-y-8">
                <div className="text-center space-y-3">
                    <div className="flex justify-center">
                        <SkeletonBone className="h-6 w-36 rounded-full border border-white/5" />
                    </div>
                    <div className="flex justify-center">
                        <SkeletonBone className="h-9 w-72 rounded-xl" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-black/40 border border-white/8 max-w-4xl mx-auto space-y-2.5">
                    <SkeletonBone className="h-3.5 w-full rounded" />
                    <SkeletonBone className="h-3.5 w-11/12 rounded" />
                    <SkeletonBone className="h-3.5 w-4/5 rounded" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    {[1, 2].map(i => (
                        <div key={i} className="p-5 rounded-2xl bg-black/50 border border-white/8 flex items-start gap-4">
                            <SkeletonBone className="w-12 h-12 rounded-xl shrink-0" />
                            <div className="space-y-2 flex-1">
                                <SkeletonBone className="h-2.5 w-16 rounded" />
                                <SkeletonBone className="h-4 w-32 rounded" />
                                <SkeletonBone className="h-3 w-full rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

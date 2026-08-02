const SkeletonBone = ({ className }: { className: string }) => (
    <div className={`bg-white/8 ${className}`} />
);

export default function SuggestionsSkeleton() {
    return (
        <div className="space-y-8 animate-pulse px-4">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="flex justify-center">
                    <SkeletonBone className="h-8 w-64 rounded-full border border-white/5" />
                </div>
                <div className="flex justify-center">
                    <SkeletonBone className="h-4 w-96 rounded-lg" />
                </div>
            </div>

            {/* Poll Card */}
            <div className="p-6 rounded-2xl bg-[#090d16]/95 border border-white/8 space-y-4">
                <div className="flex items-center gap-3">
                    <SkeletonBone className="w-8 h-8 rounded-lg shrink-0" />
                    <SkeletonBone className="h-5 w-48 rounded" />
                </div>
                <SkeletonBone className="h-4 w-3/4 rounded" />
                <div className="space-y-3 pt-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                            <div className="flex justify-between">
                                <SkeletonBone className="h-3.5 w-32 rounded" />
                                <SkeletonBone className="h-3.5 w-12 rounded" />
                            </div>
                            <SkeletonBone className="h-2 w-full rounded-full" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit Suggestion Form Box */}
            <div className="p-6 rounded-2xl bg-[#090d16]/95 border border-white/8 space-y-4">
                <SkeletonBone className="h-5 w-44 rounded" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SkeletonBone className="h-10 w-full rounded-xl border border-white/5" />
                    <SkeletonBone className="h-10 w-full rounded-xl border border-white/5" />
                </div>
                <SkeletonBone className="h-24 w-full rounded-xl border border-white/5" />
                <div className="flex justify-end">
                    <SkeletonBone className="h-10 w-36 rounded-xl" />
                </div>
            </div>

            {/* Suggestions Feed Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-5 rounded-2xl bg-black/40 border border-white/8 space-y-3 flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <SkeletonBone className="w-7 h-7 rounded-full" />
                                    <SkeletonBone className="h-3.5 w-24 rounded" />
                                </div>
                                <SkeletonBone className="h-5 w-20 rounded-full" />
                            </div>
                            <SkeletonBone className="h-3.5 w-full rounded" />
                            <SkeletonBone className="h-3.5 w-4/5 rounded" />
                        </div>
                        <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                            <SkeletonBone className="h-7 w-16 rounded-lg" />
                            <SkeletonBone className="h-7 w-16 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

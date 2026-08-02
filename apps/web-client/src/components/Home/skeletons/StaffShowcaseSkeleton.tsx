const SkeletonBone = ({ className }: { className: string }) => (
    <div className={`bg-white/8 ${className}`} />
);

export default function StaffShowcaseSkeleton() {
    return (
        <div className="space-y-12 animate-pulse px-4">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="flex justify-center">
                    <SkeletonBone className="h-8 w-64 rounded-full border border-white/5" />
                </div>
                <div className="flex justify-center">
                    <SkeletonBone className="h-4 w-96 rounded-lg" />
                </div>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-6 rounded-2xl bg-[#090d16]/95 border border-white/8 space-y-4 relative overflow-hidden">
                        {/* Rank Badge Header */}
                        <div className="flex justify-between items-center">
                            <SkeletonBone className="h-6 w-24 rounded-full" />
                            <SkeletonBone className="h-4 w-16 rounded" />
                        </div>
                        {/* Avatar */}
                        <div className="flex justify-center my-2">
                            <SkeletonBone className="w-24 h-24 rounded-2xl border border-white/10" />
                        </div>
                        {/* Member Details */}
                        <div className="text-center space-y-2">
                            <SkeletonBone className="h-5 w-32 mx-auto rounded" />
                            <SkeletonBone className="h-3 w-4/5 mx-auto rounded" />
                            <SkeletonBone className="h-3 w-3/4 mx-auto rounded" />
                        </div>
                        {/* Social Links */}
                        <div className="flex justify-center gap-2 pt-2 border-t border-white/5">
                            <SkeletonBone className="w-8 h-8 rounded-lg" />
                            <SkeletonBone className="w-8 h-8 rounded-lg" />
                            <SkeletonBone className="w-8 h-8 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Discord Widget Section */}
            <div className="p-6 rounded-3xl bg-linear-to-b from-[#101726]/90 via-[#090d16]/95 to-[#05070c] border border-white/10 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                    <div className="space-y-2">
                        <SkeletonBone className="h-6 w-48 rounded" />
                        <SkeletonBone className="h-3.5 w-64 rounded" />
                    </div>
                    <SkeletonBone className="h-10 w-36 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                            <SkeletonBone className="w-5 h-5 rounded shrink-0 mt-0.5" />
                            <div className="space-y-1.5 flex-1">
                                <SkeletonBone className="h-3.5 w-28 rounded" />
                                <SkeletonBone className="h-3 w-full rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

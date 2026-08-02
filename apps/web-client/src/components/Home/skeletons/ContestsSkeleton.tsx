const SkeletonBone = ({ className }: { className: string }) => (
    <div className={`bg-white/8 ${className}`} />
);

export default function ContestsSkeleton() {
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

            {/* Contests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="p-6 rounded-2xl bg-[#090d16]/95 border border-white/8 space-y-5 flex flex-col justify-between">
                        <div className="space-y-4">
                            {/* Card Top Pill & Icon */}
                            <div className="flex justify-between items-center">
                                <SkeletonBone className="w-10 h-10 rounded-xl" />
                                <SkeletonBone className="h-6 w-20 rounded-full" />
                            </div>
                            {/* Title & Desc */}
                            <div className="space-y-2">
                                <SkeletonBone className="h-5 w-48 rounded" />
                                <SkeletonBone className="h-3.5 w-full rounded" />
                                <SkeletonBone className="h-3.5 w-5/6 rounded" />
                            </div>
                            {/* Timer Block */}
                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex justify-around">
                                {[1, 2, 3, 4].map(t => (
                                    <div key={t} className="text-center space-y-1">
                                        <SkeletonBone className="h-5 w-8 mx-auto rounded" />
                                        <SkeletonBone className="h-2 w-6 mx-auto rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Register Button */}
                        <SkeletonBone className="h-11 w-full rounded-xl border border-white/5 mt-4" />
                    </div>
                ))}
            </div>
        </div>
    );
}

const SkeletonBone = ({ className }: { className: string }) => (
    <div className={`bg-white/8 ${className}`} />
);

export default function StoriesSkeleton() {
    return (
        <div className="space-y-8 animate-pulse px-4">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="flex justify-center">
                    <SkeletonBone className="h-8 w-60 rounded-full border border-white/5" />
                </div>
                <div className="flex justify-center">
                    <SkeletonBone className="h-4 w-96 rounded-lg" />
                </div>
            </div>

            {/* Intro Banner */}
            <div className="max-w-3xl mx-auto p-8 bg-white/5 border border-white/10 rounded-2xl space-y-3 text-center">
                <SkeletonBone className="h-4 w-full mx-auto rounded" />
                <SkeletonBone className="h-4 w-5/6 mx-auto rounded" />
            </div>

            {/* Stories/Locations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="rounded-2xl bg-[#090d16]/95 border border-white/8 overflow-hidden space-y-4 flex flex-col justify-between">
                        <SkeletonBone className="h-44 w-full" />
                        <div className="p-5 space-y-3 flex-1">
                            <div className="flex justify-between items-center">
                                <SkeletonBone className="h-5 w-32 rounded" />
                                <SkeletonBone className="h-5 w-24 rounded-md" />
                            </div>
                            <SkeletonBone className="h-3.5 w-full rounded" />
                            <SkeletonBone className="h-3.5 w-11/12 rounded" />
                        </div>
                        <div className="px-5 pb-5 pt-2 border-t border-white/5 flex justify-between items-center">
                            <SkeletonBone className="h-9 w-28 rounded-xl" />
                            <SkeletonBone className="h-9 w-24 rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const SkeletonBone = ({ className }: { className: string }) => (
    <div className={`bg-white/8 ${className}`} />
);

export default function BlogSkeleton() {
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

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="rounded-2xl bg-[#090d16]/95 border border-white/8 overflow-hidden space-y-4 flex flex-col justify-between">
                        {/* Image Placeholder */}
                        <SkeletonBone className="h-48 w-full" />
                        {/* Body */}
                        <div className="p-5 space-y-3 flex-1">
                            <div className="flex justify-between items-center">
                                <SkeletonBone className="h-5 w-24 rounded-full" />
                                <SkeletonBone className="h-3 w-20 rounded" />
                            </div>
                            <SkeletonBone className="h-5 w-full rounded" />
                            <SkeletonBone className="h-3.5 w-full rounded" />
                            <SkeletonBone className="h-3.5 w-4/5 rounded" />
                        </div>
                        {/* Footer / Likes */}
                        <div className="px-5 pb-5 flex justify-between items-center border-t border-white/5 pt-3">
                            <SkeletonBone className="h-8 w-20 rounded-lg" />
                            <SkeletonBone className="h-4 w-24 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

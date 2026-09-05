const SkeletonBone = ({ className }: { className: string }) => (
    <div className={`bg-white/8 ${className}`} />
);

export default function LauncherShowcaseSkeleton() {
    return (
        <div className="w-full py-12 px-4 sm:px-6 lg:px-8 space-y-12 animate-pulse">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
                <div className="flex justify-center">
                    <SkeletonBone className="h-5 w-64 border border-white/5" />
                </div>
                <div className="flex justify-center">
                    <SkeletonBone className="h-10 w-full max-w-lg" />
                </div>
                <div className="flex justify-center">
                    <SkeletonBone className="h-4 w-2/3" />
                </div>
                <div className="flex justify-center gap-2 pt-2">
                    {[1, 2, 3, 4].map(i => (
                        <SkeletonBone key={i} className="h-7 w-28" />
                    ))}
                </div>
            </div>

            {/* Desktop Window Frame (Sharp Edges) */}
            <div className="max-w-6xl mx-auto border border-slate-800 bg-[#0B0F17] shadow-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-[#0F141F] border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <SkeletonBone className="w-2.5 h-2.5 rounded-full" />
                        <SkeletonBone className="w-2.5 h-2.5 rounded-full" />
                        <SkeletonBone className="w-2.5 h-2.5 rounded-full" />
                        <SkeletonBone className="h-3.5 w-48 ml-2" />
                    </div>
                    <div className="flex gap-2">
                        <SkeletonBone className="h-5 w-24" />
                        <SkeletonBone className="h-5 w-5" />
                    </div>
                </div>
                <div className="h-[640px] bg-[#070A0F] p-4 flex gap-4">
                    <SkeletonBone className="w-20 h-full" />
                    <div className="flex-1 space-y-4">
                        <SkeletonBone className="h-48 w-full" />
                        <div className="grid grid-cols-3 gap-4">
                            <SkeletonBone className="h-28" />
                            <SkeletonBone className="h-28" />
                            <SkeletonBone className="h-28" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

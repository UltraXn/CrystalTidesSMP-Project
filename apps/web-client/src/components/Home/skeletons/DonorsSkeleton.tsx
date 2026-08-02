const SkeletonBone = ({ className }: { className: string }) => (
    <div className={`bg-white/8 ${className}`} />
);

export default function DonorsSkeleton() {
    return (
        <div className="w-full max-w-360 mx-auto px-4 space-y-16 animate-pulse">
            {/* 1. Header Section */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-3">
                    <SkeletonBone className="w-8 h-8 rounded-full shrink-0" />
                    <SkeletonBone className="h-8 w-72 rounded-xl" />
                </div>
                <SkeletonBone className="h-4 w-11/12 mx-auto rounded" />
                <SkeletonBone className="h-4 w-4/5 mx-auto rounded" />
            </div>

            {/* 2. Últimas Donaciones Title & Vertical Stream Feed */}
            <div className="space-y-8">
                <div className="flex items-center justify-center gap-4">
                    <SkeletonBone className="h-0.5 w-16 rounded" />
                    <SkeletonBone className="h-6 w-48 rounded-lg" />
                    <SkeletonBone className="h-0.5 w-16 rounded" />
                </div>

                {/* Vertical Stream Container (Matches max-w-676px height 430px) */}
                <div className="max-w-169 mx-auto p-4 rounded-3xl bg-[#090d16]/90 border border-white/8 space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-4 rounded-2xl bg-black/60 border border-white/5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1">
                                <SkeletonBone className="w-10 h-10 rounded-full shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <SkeletonBone className="h-3.5 w-28 rounded" />
                                    <SkeletonBone className="h-2.5 w-20 rounded" />
                                </div>
                            </div>
                            <SkeletonBone className="h-7 w-20 rounded-full border border-white/10" />
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. KoFi Button & Carousel Section */}
            <div className="space-y-12">
                {/* Ko-fi button centered */}
                <div className="flex justify-center">
                    <SkeletonBone className="h-14 w-64 rounded-2xl border border-white/10" />
                </div>

                {/* 5-Column Donors Carousel Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="p-4 rounded-3xl bg-[#0a0a0a]/80 border border-white/8 space-y-4 flex flex-col justify-between h-96">
                            {/* 3:4 Aspect Ratio Image Box */}
                            <SkeletonBone className="w-full aspect-3/4 rounded-2xl border border-white/5" />
                            {/* Donor Name & Rank Badge */}
                            <div className="space-y-2 text-center">
                                <SkeletonBone className="h-4 w-28 mx-auto rounded" />
                                <SkeletonBone className="h-3 w-20 mx-auto rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

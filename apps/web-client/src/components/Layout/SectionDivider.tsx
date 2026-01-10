


export default function SectionDivider() {
    return (
        <div className="w-full flex items-center justify-center gap-8 py-16 opacity-50 select-none pointer-events-none">
            <div className="h-px w-32 sm:w-64 bg-linear-to-r from-transparent to-(--accent)"></div>
            <div className="w-3 h-3 rotate-45 bg-(--accent) shadow-[0_0_15px_var(--accent)] animate-pulse"></div>
            <div className="h-px w-32 sm:w-64 bg-linear-to-l from-transparent to-(--accent)"></div>
        </div>
    );
}

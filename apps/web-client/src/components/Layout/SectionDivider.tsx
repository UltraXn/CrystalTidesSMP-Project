export default function SectionDivider() {
  return (
    <div className="pointer-events-none flex w-full select-none items-center justify-center gap-8 py-10 opacity-50">
      <div className="bg-linear-to-r to-(--accent) h-px w-32 from-transparent sm:w-64"></div>
      <div className="bg-(--accent) size-3 rotate-45 animate-pulse shadow-[0_0_15px_var(--accent)]"></div>
      <div className="bg-linear-to-l to-(--accent) h-px w-32 from-transparent sm:w-64"></div>
    </div>
  );
}

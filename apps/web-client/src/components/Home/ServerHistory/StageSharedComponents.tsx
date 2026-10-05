import { m as motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import type { Stage, StageFloatingItem } from './types';

export const DiscordIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    className={className}
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 640 512"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.8,167.234,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z" />
  </svg>
);

export const TwitchIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    className={className}
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11.571 4.714h1.715v5.143H11.571V4.714zm4.715 0H18v5.143h-1.714V4.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0H6zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714v9.429z" />
  </svg>
);

export function FloatingItem({ item, idx }: Readonly<{ item: StageFloatingItem; idx: number }>) {
  let bounceX: number[] = [0, 120, 25, 145, 0];
  let bounceY: number[] = [0, 75, 120, 20, 0];

  if (idx === 1) {
    bounceX = [0, 130, 30, 140, 0];
    bounceY = [0, -75, -125, -25, 0];
  } else if (idx === 2) {
    bounceX = [0, -120, -25, -140, 0];
    bounceY = [0, 70, 115, 20, 0];
  } else if (idx === 3) {
    bounceX = [0, -130, -30, -140, 0];
    bounceY = [0, -75, -120, -20, 0];
  }

  const bounceDuration = 32 + idx * 6;

  let iconContent = null;
  if (item.src) {
    iconContent = (
      <img
        src={item.src}
        alt="Minecraft DVD Bouncing Relic"
        className="size-full object-contain drop-shadow-[0_0_20px_rgba(0,229,255,0.4)] filter"
      />
    );
  } else if (item.icon) {
    iconContent = (
      <item.icon
        className="size-full drop-shadow-[0_0_15px_currentColor] filter"
        style={{ color: item.color || '#00e5ff' }}
      />
    );
  }

  return (
    <div className={`absolute ${item.pos} pointer-events-none opacity-30 ${item.size} z-0`}>
      <motion.div
        animate={{ x: bounceX, y: bounceY }}
        transition={{
          duration: bounceDuration,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="flex size-full items-center justify-center"
      >
        {iconContent}
      </motion.div>
    </div>
  );
}

export function StageHeader({
  stage,
  linkedCount,
  resetLinks,
}: Readonly<{
  stage: Stage;
  linkedCount?: number;
  resetLinks?: () => void;
}>) {
  let headerIcon = null;
  if (stage.imageSrc) {
    headerIcon = (
      <img
        src={stage.imageSrc}
        alt={stage.title}
        className="size-10 shrink-0 object-contain drop-shadow-[0_0_15px_rgba(0,229,255,0.85)]"
      />
    );
  } else if (stage.id === 1) {
    headerIcon = (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#9146ff]/50 bg-[#9146ff]/20 shadow-[0_0_15px_rgba(145,70,255,0.5)]">
        <TwitchIcon className="size-6 animate-pulse text-[#9146ff] drop-shadow-[0_0_10px_rgba(145,70,255,0.9)]" />
      </div>
    );
  }

  return (
    <div className="relative z-10 flex flex-col items-start justify-between gap-4 border-b border-[#00e5ff]/30 pb-5 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3.5">
        {headerIcon}
        <div>
          <h3 className="flex items-center gap-2 text-2xl font-black uppercase tracking-tight text-white md:text-3xl">
            {stage.title}
          </h3>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        {linkedCount !== undefined && linkedCount > 0 && resetLinks && (
          <button
            aria-label="Action"
            type="button"
            onClick={resetLinks}
            className="flex cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-black/70 p-2 text-gray-300 backdrop-blur-md transition-colors hover:border-white/40 hover:text-white"
            title="Reiniciar Altar"
          >
            <RefreshCw className="size-3.5" />
          </button>
        )}
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/60 p-1.5 pl-3.5 pr-2 backdrop-blur-md">
          <span className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-gray-200">
            <span className="size-1.5 shrink-0 rounded-full bg-[#00e5ff]" />
            ESTACIÓN_{stage.id.toString().padStart(2, '0')}
          </span>
          <span className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-0.5 font-mono text-[10.5px] font-medium text-gray-400">
            {stage.year}
          </span>
        </div>
      </div>
    </div>
  );
}

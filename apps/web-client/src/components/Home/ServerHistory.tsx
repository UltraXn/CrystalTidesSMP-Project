import { useState, useRef, useEffect } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import {
  History,
  Sparkles,
  Server,
  Play,
  X,
  RefreshCw,
  LucideIcon,
} from "lucide-react";
import { Skeleton } from "boneyard-js/react";
import { useTranslation } from "react-i18next";
import Section from "../Layout/Section";
import MinecraftAvatar from "../UI/MinecraftAvatar";
import { Minecraft3DAltarCanvas } from "./Minecraft3DAltarCanvas";
import { Minecraft3DSkullCanvas } from "./Minecraft3DSkullCanvas";
import { Minecraft3DServerRackCanvas } from "./Minecraft3DServerRackCanvas";
import { Minecraft3DServerRackMiniCanvas } from "./Minecraft3DServerRackMiniCanvas";

const DiscordIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
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

const TwitchIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
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

interface MemberCard {
  name: string;
  role: string;
  image?: string;
  mc_nickname?: string;
  avatar?: string;
  rankBadge?: string;
  color: string;
  desc: string;
}

interface FeatureItem {
  imageSrc?: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  badgeText: string;
  brandColor?: string;
  videoUrl?: string;
}

interface StageFloatingItem {
  src?: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  color?: string;
  pos: string;
  size: string;
  duration: number;
  rotateX: number[];
  rotateZ: number[];
  y: number[];
}

interface Stage {
  id: number;
  year: string;
  stageName: string;
  title: string;
  subtitle: string;
  badge: string;
  accentColor: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  imageSrc?: string;
  narrativeSummary: string;
  members?: MemberCard[];
  features?: FeatureItem[];
}

const STAGE_FLOATING_ITEMS: Record<number, StageFloatingItem[]> = {
  1: [
    {
      icon: TwitchIcon,
      color: "#a855f7",
      pos: "top-8 left-6 sm:left-10",
      size: "w-12 h-12 sm:w-16 sm:h-16",
      duration: 14,
      rotateX: [10, -10, 10],
      rotateZ: [-8, 8, -8],
      y: [-6, 6, -6],
    },
    {
      icon: DiscordIcon,
      color: "#5865f2",
      pos: "bottom-20 left-10 sm:left-16",
      size: "w-12 h-12 sm:w-16 sm:h-16",
      duration: 18,
      rotateX: [-12, 12, -12],
      rotateZ: [6, -6, 6],
      y: [6, -6, 6],
    },
    {
      src: "/images/items/Diamond_JE3_BE3.png",
      pos: "top-1/3 right-10 sm:right-16",
      size: "w-14 h-14 sm:w-18 sm:h-18",
      duration: 15,
      rotateX: [8, -8, 8],
      rotateZ: [-6, 6, -6],
      y: [-8, 8, -8],
    },
    {
      src: "/images/items/Emerald_JE3_BE3.png",
      pos: "bottom-12 right-12 sm:right-24",
      size: "w-14 h-14 sm:w-18 sm:h-18",
      duration: 20,
      rotateX: [-10, 10, -10],
      rotateZ: [8, -8, 8],
      y: [8, -8, 8],
    },
  ],
  2: [
    {
      src: "/images/items/Totem_of_Undying_JE2_BE2.png",
      pos: "top-10 left-8 sm:left-12",
      size: "w-16 h-16 sm:w-20 sm:h-20",
      duration: 16,
      rotateX: [12, -8, 12],
      rotateZ: [-6, 6, -6],
      y: [-8, 8, -8],
    },
    {
      src: "/images/items/Netherite_Chestplate_JE2_BE1.png",
      pos: "bottom-16 left-12 sm:left-20",
      size: "w-16 h-16 sm:w-20 sm:h-20",
      duration: 15,
      rotateX: [-8, 12, -8],
      rotateZ: [8, -8, 8],
      y: [6, -6, 6],
    },
    {
      src: "/images/items/enchanted_book.gif",
      pos: "top-1/4 right-8 sm:right-16",
      size: "w-16 h-16 sm:w-20 sm:h-20",
      duration: 17,
      rotateX: [10, -10, 10],
      rotateZ: [-6, 8, -6],
      y: [-6, 6, -6],
    },
    {
      src: "/images/items/Heavy_Core_JE1_BE1.png",
      pos: "bottom-10 right-10 sm:right-24",
      size: "w-14 h-14 sm:w-18 sm:h-18",
      duration: 19,
      rotateX: [-12, 8, -12],
      rotateZ: [6, -6, 6],
      y: [8, -8, 8],
    },
  ],
  3: [
    {
      src: "/images/items/Dragon_Head_(S)_JE1.png",
      pos: "top-10 left-6 sm:left-12",
      size: "w-16 h-16 sm:w-20 sm:h-20",
      duration: 15,
      rotateX: [14, -10, 14],
      rotateZ: [-8, 8, -8],
      y: [-8, 8, -8],
    },
    {
      src: "/images/items/Trident_(item).png",
      pos: "bottom-14 left-10 sm:left-20",
      size: "w-14 h-14 sm:w-18 sm:h-18",
      duration: 14,
      rotateX: [-10, 12, -10],
      rotateZ: [6, -6, 6],
      y: [6, -6, 6],
    },
    {
      src: "/images/items/Beacon_JE6_BE2.webp",
      pos: "top-1/3 right-10 sm:right-20",
      size: "w-14 h-14 sm:w-18 sm:h-18",
      duration: 18,
      rotateX: [10, -12, 10],
      rotateZ: [-6, 6, -6],
      y: [-6, 6, -6],
    },
    {
      src: "/images/items/xp_bottle.webp",
      pos: "bottom-12 right-12 sm:right-24",
      size: "w-14 h-14 sm:w-18 sm:h-18",
      duration: 16,
      rotateX: [-8, 10, -8],
      rotateZ: [8, -8, 8],
      y: [8, -8, 8],
    },
  ],
  4: [
    {
      src: "/images/items/Elytra_JE2_BE2.png",
      pos: "top-8 left-8 sm:left-14",
      size: "w-16 h-16 sm:w-20 sm:h-20",
      duration: 16,
      rotateX: [12, -12, 12],
      rotateZ: [-8, 8, -8],
      y: [-8, 8, -8],
    },
    {
      src: "/images/items/Saddle_JE2_BE2.png",
      pos: "bottom-16 left-12 sm:left-24",
      size: "w-14 h-14 sm:w-18 sm:h-18",
      duration: 19,
      rotateX: [-10, 10, -10],
      rotateZ: [6, -6, 6],
      y: [6, -6, 6],
    },
    {
      src: "/images/items/Sniffer_Egg_(item)_JE1_BE1.png",
      pos: "top-1/4 right-10 sm:right-16",
      size: "w-14 h-14 sm:w-18 sm:h-18",
      duration: 15,
      rotateX: [10, -10, 10],
      rotateZ: [-6, 8, -6],
      y: [-6, 6, -6],
    },
    {
      src: "/images/items/Silence_Armor_Trim_Smithing_Template_JE1_BE1.png",
      pos: "bottom-10 right-14 sm:right-24",
      size: "w-14 h-14 sm:w-18 sm:h-18",
      duration: 17,
      rotateX: [-14, 10, -14],
      rotateZ: [8, -8, 8],
      y: [8, -8, 8],
    },
  ],
};

/* ==========================================================================
   ISOLATED STAGE HELPER SUBCOMPONENTS
   ========================================================================== */
function FloatingItem({
  item,
  idx,
}: Readonly<{ item: StageFloatingItem; idx: number }>) {
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
        className="h-full w-full object-contain drop-shadow-[0_0_20px_rgba(0,229,255,0.4)] filter"
      />
    );
  } else if (item.icon) {
    iconContent = (
      <item.icon
        className="h-full w-full drop-shadow-[0_0_15px_currentColor] filter"
        style={{ color: item.color || "#00e5ff" }}
      />
    );
  }

  return (
    <div
      className={`absolute ${item.pos} pointer-events-none opacity-30 ${item.size} z-0`}
    >
      <motion.div
        animate={{ x: bounceX, y: bounceY }}
        transition={{
          duration: bounceDuration,
          repeat: Infinity,
          ease: "linear",
        }}
        className="flex h-full w-full items-center justify-center"
      >
        {iconContent}
      </motion.div>
    </div>
  );
}

function StageHeader({
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
        className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_0_15px_rgba(0,229,255,0.85)]"
      />
    );
  } else if (stage.id === 1) {
    headerIcon = (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#9146ff]/50 bg-[#9146ff]/20 shadow-[0_0_15px_rgba(145,70,255,0.5)]">
        <TwitchIcon className="h-6 w-6 animate-pulse text-[#9146ff] drop-shadow-[0_0_10px_rgba(145,70,255,0.9)]" />
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
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/60 p-1.5 pl-3.5 pr-2 backdrop-blur-md">
          <span className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-gray-200">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#00e5ff]" />
            ESTACIÓN_{stage.id.toString().padStart(2, "0")}
          </span>
          <span className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-0.5 font-mono text-[10.5px] font-medium text-gray-400">
            {stage.year}
          </span>
        </div>
      </div>
    </div>
  );
}

function getFeatureBgIcon(f: FeatureItem) {
  const titleLower = f.title.toLowerCase();
  if (titleLower.includes("forgotten")) {
    return (
      <div className="h-20 w-20">
        <Minecraft3DSkullCanvas size={80} />
      </div>
    );
  }
  if (titleLower.includes("ubuntu") || titleLower.includes("dedicated")) {
    return <Server className="h-16 w-16 text-white" />;
  }
  if (f.imageSrc) {
    return (
      <img
        src={f.imageSrc}
        alt={f.title}
        className="h-16 w-16 object-contain"
      />
    );
  }
  if (f.icon) {
    return <f.icon className="h-16 w-16 text-white" />;
  }
  return <Sparkles className="h-16 w-16 text-white" />;
}

function getFeatureBadgeIcon(f: FeatureItem, brandColor: string) {
  const titleLower = f.title.toLowerCase();
  if (titleLower.includes("forgotten")) {
    return <Minecraft3DSkullCanvas size={44} className="h-full w-full" />;
  }
  if (titleLower.includes("ubuntu") || titleLower.includes("dedicated")) {
    return <Minecraft3DServerRackMiniCanvas />;
  }
  if (f.imageSrc) {
    return (
      <img
        src={f.imageSrc}
        alt={f.title}
        className="h-full w-full object-contain drop-shadow-[0_0_8px_rgba(0,229,255,0.4)] filter"
      />
    );
  }
  if (f.icon) {
    return <f.icon className="h-5 w-5" style={{ color: brandColor }} />;
  }
  return <Sparkles className="h-5 w-5" style={{ color: brandColor }} />;
}

function StageFeatures({ features }: Readonly<{ features: FeatureItem[] }>) {
  return (
    <div className="relative z-10 flex flex-wrap justify-center gap-5 border-t border-white/10 pt-4">
      {features.map((f) => {
        const brandColor = f.brandColor || "#00e5ff";

        return (
          <div
            key={`feature-${f.title}`}
            className="max-w-85 group relative flex min-w-60 flex-1 flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0f14] p-5 shadow-xl transition-colors duration-300 hover:scale-[1.02]"
            style={
              {
                "--brand-color": brandColor,
              } as React.CSSProperties
            }
          >
            <div className="pointer-events-none absolute -bottom-3 -right-3 scale-110 transform opacity-15 transition-opacity group-hover:opacity-35">
              {getFeatureBgIcon(f)}
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/60 p-1.5 shadow-md">
                {getFeatureBadgeIcon(f, brandColor)}
              </div>
              <span
                className="rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest"
                style={{
                  color: brandColor,
                  backgroundColor: `${brandColor}20`,
                  borderColor: `${brandColor}50`,
                }}
              >
                {f.badgeText}
              </span>
            </div>
            <div className="relative z-10 space-y-1.5 text-left">
              <h5 className="text-sm font-black uppercase tracking-wide text-white transition-colors group-hover:opacity-90">
                {f.title}
              </h5>
              <p className="text-xs leading-snug text-gray-400">{f.desc}</p>
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5 origin-left scale-x-[0.001] transition-transform duration-300 group-hover:scale-x-100"
              style={{
                backgroundColor: brandColor,
                boxShadow: `0 0 10px ${brandColor}`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ==========================================================================
   ISOLATED STAGE 01 CARD (LA PECERITA DE LOS KILLUFISHIES)
   ========================================================================== */
function Stage1Card({
  stage,
  floatingItems,
}: Readonly<{ stage: Stage; floatingItems: StageFloatingItem[] }>) {
  return (
    <div className="bg-linear-to-b relative space-y-8 overflow-hidden rounded-3xl border border-white/10 from-[#101726]/90 via-[#090d16]/95 to-[#05070c] p-8 shadow-[0_0_50px_rgba(137,217,209,0.15)] md:p-10">
      <div className="pointer-events-none relative z-10 flex items-center justify-center pb-4 pt-2">
        <div className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-[#9146ff]/40 bg-black/60 p-5 shadow-[0_0_40px_rgba(145,70,255,0.3)] backdrop-blur-xl sm:h-32 sm:w-32">
          <div
            className="absolute inset-0 opacity-25 transition-opacity"
            style={{
              background: `radial-gradient(circle, #9146ff 0%, transparent 70%)`,
            }}
          />
          <TwitchIcon className="relative z-10 h-14 w-14 animate-pulse text-[#9146ff] drop-shadow-[0_0_15px_rgba(145,70,255,0.8)]" />
        </div>
      </div>
      {floatingItems.map((item, idx) => (
        <FloatingItem key={item.pos} item={item} idx={idx} />
      ))}
      <StageHeader stage={stage} />
      <p className="relative z-10 mx-auto max-w-4xl rounded-2xl border border-white/10 bg-black/60 p-5 text-sm font-medium leading-relaxed text-gray-200 shadow-2xl backdrop-blur-md sm:p-6 md:text-base">
        {stage.narrativeSummary}
      </p>
      {stage.features && <StageFeatures features={stage.features} />}
    </div>
  );
}

/* ==========================================================================
   ISOLATED STAGE 02 CARD (CREACIÓN DEL STAFF CON ENLACE INTERACTIVO)
   ========================================================================== */
const memberConfig = [
  {
    name: "KillubysmaliVT",
    xEnd: "12.5%",
    color: "#00637c",
    role: "Directora & Comunidad",
  },
  {
    name: "Neroferno ultranix",
    xEnd: "37.5%",
    color: "#ff00b7",
    role: "Dev Lead & Infra",
  },
  {
    name: "Xurlito",
    xEnd: "62.5%",
    color: "#00aeef",
    role: "Diseño & Arte Lead",
  },
  { name: "JAPA325", xEnd: "87.5%", color: "#000080", role: "QA & BetaTester" },
];

function Stage2Card({
  stage,
  floatingItems,
}: Readonly<{ stage: Stage; floatingItems: StageFloatingItem[] }>) {
  const { t } = useTranslation();
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const [linkedMembers, setLinkedMembers] = useState<Set<string>>(new Set());
  const [dragActiveMember, setDragActiveMember] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const cardRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const allLinked = linkedMembers.size === 4;

  // Global Window Pointer Move & Pointer Up Handlers for Silky Smooth Dragging
  useEffect(() => {
    if (!dragActiveMember) return;

    const handleWindowPointerMove = (e: PointerEvent) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    };

    const handleWindowPointerUp = () => {
      if (cardRef.current && dropZoneRef.current) {
        const cardRect = cardRef.current.getBoundingClientRect();
        const dropRect = dropZoneRef.current.getBoundingClientRect();

        const dropCenterX = dropRect.left + dropRect.width / 2 - cardRect.left;
        const dropCenterY = dropRect.top + dropRect.height / 2 - cardRect.top;

        if (cursorPos) {
          const dx = cursorPos.x - dropCenterX;
          const dy = cursorPos.y - dropCenterY;
          const dist = Math.hypot(dx, dy);

          if (dist < 160) {
            setLinkedMembers((prev) => {
              const next = new Set(prev);
              next.add(dragActiveMember);
              return next;
            });
          }
        }
      }

      setDragActiveMember(null);
      setCursorPos(null);
    };

    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerUp);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
    };
  }, [dragActiveMember, cursorPos]);

  const handleNodePointerDown = (memberName: string, e: React.PointerEvent) => {
    e.preventDefault();
    if (linkedMembers.has(memberName)) return;
    setDragActiveMember(memberName);
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const toggleMemberLink = (name: string) => {
    if (linkedMembers.has(name)) return;
    setLinkedMembers((prev) => {
      const next = new Set(prev);
      next.add(name);
      return next;
    });
  };

  const resetLinks = () => {
    setLinkedMembers(new Set());
  };

  let activeStaffColor: string | null = null;
  if (dragActiveMember) {
    activeStaffColor =
      memberConfig.find((m) => m.name === dragActiveMember)?.color || null;
  } else if (hoveredMember) {
    activeStaffColor =
      memberConfig.find((m) => m.name === hoveredMember)?.color || null;
  }

  return (
    <div
      ref={cardRef}
      className="bg-linear-to-b relative select-none space-y-8 overflow-hidden rounded-3xl border border-white/10 from-[#101726]/90 via-[#090d16]/95 to-[#05070c] p-8 shadow-[0_0_50px_rgba(137,217,209,0.15)] md:p-10"
    >
      {/* 3D CANVAS BACKGROUND INTEGRATION FOR STAGE 02 */}
      <div className="pointer-events-none absolute inset-0 z-0 flex h-full w-full items-center justify-center opacity-100">
        <Minecraft3DAltarCanvas
          stageId={2}
          accentColor={stage.accentColor}
          activeStaffColor={activeStaffColor}
          linkedMembersList={Array.from(linkedMembers)}
          dragActiveMember={dragActiveMember}
          cursorPos={cursorPos}
        />
      </div>

      {/* HOLOGRAPHIC ENERGY BEAMS LAYER CONNECTING BEACON TO STAFF CARDS */}
      <div className="pointer-events-none absolute inset-0 z-20 block">
        <svg className="h-full w-full" overflow="visible">
          <defs>
            {/* Glow Filter */}
            <filter id="beamGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Animated Gradient Streams */}
            {memberConfig.map((m) => (
              <linearGradient
                key={m.name}
                id={`plasma_grad_${m.name}`}
                x1="0%"
                y1="100%"
                x2="0%"
                y2="0%"
              >
                <stop offset="0%" stopColor={m.color} stopOpacity="0.9" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="100%" stopColor={m.color} stopOpacity="0.9" />
              </linearGradient>
            ))}

            {/* 2-Color Drag Gradients */}
            <linearGradient
              id="drag_grad_Neroferno ultranix"
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#0b0b14" stopOpacity="1" />
              <stop offset="100%" stopColor="#ff00b7" stopOpacity="1" />
            </linearGradient>
            <linearGradient
              id="drag_grad_KillubysmaliVT"
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#00637c" stopOpacity="1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
            <linearGradient
              id="drag_grad_Xurlito"
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#00aeef" stopOpacity="1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
            <linearGradient
              id="drag_grad_JAPA325"
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Static Locked Energy Beams (3-Layer Plasma Streams + Traveling Particles) */}
          {memberConfig.map((m) => {
            const isLinked = linkedMembers.has(m.name);
            const isHovered =
              hoveredMember === m.name || dragActiveMember === m.name;

            if (!isLinked || linkedMembers.size === 4) return null;

            const pathD = `M 50% 28% C 50% 45%, ${m.xEnd} 55%, ${m.xEnd} 71.5%`;

            return (
              <g key={m.name} className="transition-colors duration-300">
                {/* 1. Outer Diffused Plasma Glow Aura */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={m.color}
                  strokeWidth={isHovered ? 16 : 10}
                  strokeOpacity={0.4}
                  style={{ filter: "url(#beamGlow)" }}
                />

                {/* 2. Middle Animated Energy Wave Flow */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={`url(#plasma_grad_${m.name})`}
                  strokeWidth={isHovered ? 6 : 4}
                  strokeDasharray="16 10"
                  strokeLinecap="round"
                  style={{
                    filter: `drop-shadow(0 0 12px ${m.color})`,
                  }}
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="52"
                    to="0"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>

                {/* 3. Inner White-Hot Core Laser Stream */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  strokeOpacity={0.95}
                />

                {/* 4. Traveling Plasma Energy Sparks Along Beam Path (AAA Game Particle Effect) */}
                <circle
                  r="4.5"
                  fill="#ffffff"
                  style={{ filter: `drop-shadow(0 0 12px ${m.color})` }}
                >
                  <animateMotion
                    path={pathD}
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="6.5" fill={m.color} opacity="0.75">
                  <animateMotion
                    path={pathD}
                    dur="1.8s"
                    begin="-0.6s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="3.5" fill="#ffffff">
                  <animateMotion
                    path={pathD}
                    dur="1.8s"
                    begin="-1.2s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}
        </svg>
      </div>

      {floatingItems.map((item, idx) => (
        <FloatingItem key={item.pos} item={item} idx={idx} />
      ))}

      <StageHeader
        stage={stage}
        linkedCount={linkedMembers.size}
        resetLinks={resetLinks}
      />

      {/* 4/4 SYNC FRIENDSHIP & BRAND CREATION STORY BANNER (COMPACT ABSOLUTE OVERLAY) */}
      <AnimatePresence>
        {allLinked && (
          <motion.div
            initial={{ opacity: 0, y: -10, x: "-50%", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: -10, x: "-50%", scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="pointer-events-auto absolute left-1/2 top-20 z-30 w-[88%] max-w-md space-y-1.5 rounded-2xl border border-[#00e5ff]/50 bg-black/90 p-3 text-center shadow-[0_0_30px_rgba(0,229,255,0.3)] backdrop-blur-2xl sm:max-w-lg sm:p-4"
          >
            <div className="flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#00e5ff]" />
              <span className="font-mono text-[10px] font-black uppercase tracking-wider text-[#00e5ff]">
                ✦{" "}
                {t(
                  "history_section.stage2.banner_badge",
                  "EL ORIGEN DE NUESTRA MARCA & SERVIDOR",
                )}{" "}
                ✦
              </span>
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#00e5ff]" />
            </div>
            <p className="text-[11px] font-medium leading-snug text-gray-200 sm:text-xs">
              {t(
                "history_section.stage2.banner_text",
                "Lo que comenzó como una gran amistad dio origen a algo maravilloso. CrystalTidesSMP no es solo un servidor o marca; es el reflejo de nuestro compromiso por construir un hogar digital transparente, creado con empatía y escuchando a nuestra comunidad.",
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO 3D SHOWCASE SPACE, FLOATING STAFF BIO CARDS & INVISIBLE INTERACTIVE DROP ZONE */}
      <div className="min-h-95 sm:min-h-110 pointer-events-auto relative z-10 my-2 flex items-center justify-between px-2 sm:px-4">
        {/* LEFT COLUMN FLOATING BIO CARDS (Killu - Top, Nero - Bottom) */}
        <div className="sm:w-68 z-10 hidden w-60 flex-col gap-4 md:flex">
          {/* 1. KillubysmaliVT Floating Bio Card */}
          <AnimatePresence>
            {linkedMembers.has("KillubysmaliVT") && (
              <motion.div
                initial={{ opacity: 0, x: -30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-2 rounded-2xl border border-[#00637c]/60 bg-black/85 p-3.5 text-left shadow-[0_0_25px_rgba(0,99,124,0.3)] backdrop-blur-xl"
              >
                <div className="flex items-center gap-2.5 border-b border-[#00637c]/30 pb-2">
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#00637c] bg-slate-900">
                    <MinecraftAvatar
                      src="/skins/killu.png"
                      alt="KillubysmaliVT"
                      size={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <span className="block truncate font-mono text-[9px] font-black uppercase tracking-wider text-[#5eead4]">
                      ✦{" "}
                      {t(
                        "history_section.members.killu.role",
                        "Directora & Comunidad",
                      )}
                    </span>
                    <h6 className="truncate text-xs font-black text-white">
                      KillubysmaliVT
                    </h6>
                  </div>
                </div>
                <p className="text-[10.5px] font-medium leading-snug text-gray-200">
                  {t(
                    "history_section.members.killu.desc",
                    "Apasionada, alegre y el alma protectora de la Pecerita. Crea un ambiente acogedor, organiza eventos y guía con calidez humana.",
                  )}
                </p>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  <span className="rounded-md border border-[#00637c]/40 bg-[#00637c]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#5eead4]">
                    {t("history_section.members.killu.tag1", "Carismática")}
                  </span>
                  <span className="rounded-md border border-[#00637c]/40 bg-[#00637c]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#5eead4]">
                    {t("history_section.members.killu.tag2", "Eventos")}
                  </span>
                  <span className="rounded-md border border-[#00637c]/40 bg-[#00637c]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#5eead4]">
                    {t("history_section.members.killu.tag3", "Voz Principal")}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2. Neroferno ultranix Floating Bio Card */}
          <AnimatePresence>
            {linkedMembers.has("Neroferno ultranix") && (
              <motion.div
                initial={{ opacity: 0, x: -30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-2 rounded-2xl border border-[#ff00b7]/60 bg-black/85 p-3.5 text-left shadow-[0_0_25px_rgba(255,0,183,0.3)] backdrop-blur-xl"
              >
                <div className="flex items-center gap-2.5 border-b border-[#ff00b7]/30 pb-2">
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#ff00b7] bg-slate-900">
                    <MinecraftAvatar
                      src="https://minotar.net/skin/344af588-8a7e-4053-9f03-92d68d96b86c"
                      alt="Neroferno"
                      size={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <span className="block truncate font-mono text-[9px] font-black uppercase tracking-wider text-[#e879f9]">
                      ✦{" "}
                      {t(
                        "history_section.members.nero.role",
                        "Dev Lead & Infra",
                      )}
                    </span>
                    <h6 className="truncate text-xs font-black text-white">
                      Neroferno ultranix
                    </h6>
                  </div>
                </div>
                <p className="text-[10.5px] font-medium leading-snug text-gray-200">
                  {t(
                    "history_section.members.nero.desc",
                    "Mente lógica e inyectado de euforia técnica. Obsesionado con el rendimiento del servidor, parches custom y código limpio sin fallos.",
                  )}
                </p>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  <span className="rounded-md border border-[#ff00b7]/40 bg-[#ff00b7]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#e879f9]">
                    {t("history_section.members.nero.tag1", "Euforia Técnica")}
                  </span>
                  <span className="rounded-md border border-[#ff00b7]/40 bg-[#ff00b7]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#e879f9]">
                    {t("history_section.members.nero.tag2", "Infra Fullstack")}
                  </span>
                  <span className="rounded-md border border-[#ff00b7]/40 bg-[#ff00b7]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#e879f9]">
                    {t("history_section.members.nero.tag3", "Cero Bugs")}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CENTER SPACE & INVISIBLE DROP ZONE TARGET */}
        <div className="pointer-events-none flex flex-1 items-center justify-center">
          <div
            ref={dropZoneRef}
            className="pointer-events-auto flex h-48 w-48 items-center justify-center rounded-full"
          />
        </div>

        {/* RIGHT COLUMN FLOATING BIO CARDS (Churly - Top, Japa - Bottom) */}
        <div className="sm:w-68 z-10 hidden w-60 flex-col gap-4 md:flex">
          {/* 3. Xurlito Floating Bio Card */}
          <AnimatePresence>
            {linkedMembers.has("Xurlito") && (
              <motion.div
                initial={{ opacity: 0, x: 30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-2 rounded-2xl border border-[#00aeef]/60 bg-black/85 p-3.5 text-left shadow-[0_0_25px_rgba(0,174,239,0.3)] backdrop-blur-xl"
              >
                <div className="flex items-center gap-2.5 border-b border-[#00aeef]/30 pb-2">
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#00aeef] bg-slate-900">
                    <MinecraftAvatar
                      src="/skins/churly.png"
                      alt="Xurlito"
                      size={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <span className="block truncate font-mono text-[9px] font-black uppercase tracking-wider text-[#38bdf8]">
                      ✦{" "}
                      {t(
                        "history_section.members.churly.role",
                        "Diseño & Arte Lead",
                      )}
                    </span>
                    <h6 className="truncate text-xs font-black text-white">
                      Xurlito
                    </h6>
                  </div>
                </div>
                <p className="text-[10.5px] font-medium leading-snug text-gray-200">
                  {t(
                    "history_section.members.churly.desc",
                    "Perfeccionista visual, creativo y visionario de la estética. Diseña interfaces, conceptos de arte e identidades visuales únicas.",
                  )}
                </p>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  <span className="rounded-md border border-[#00aeef]/40 bg-[#00aeef]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#38bdf8]">
                    {t(
                      "history_section.members.churly.tag1",
                      "Visión Artística",
                    )}
                  </span>
                  <span className="rounded-md border border-[#00aeef]/40 bg-[#00aeef]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#38bdf8]">
                    {t("history_section.members.churly.tag2", "UI/UX Lead")}
                  </span>
                  <span className="rounded-md border border-[#00aeef]/40 bg-[#00aeef]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#38bdf8]">
                    {t(
                      "history_section.members.churly.tag3",
                      "Estética Pulida",
                    )}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4. JAPA325 Floating Bio Card */}
          <AnimatePresence>
            {linkedMembers.has("JAPA325") && (
              <motion.div
                initial={{ opacity: 0, x: 30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-2 rounded-2xl border border-[#1d4ed8]/60 bg-black/85 p-3.5 text-left shadow-[0_0_25px_rgba(29,78,216,0.3)] backdrop-blur-xl"
              >
                <div className="flex items-center gap-2.5 border-b border-[#1d4ed8]/30 pb-2">
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#1d4ed8] bg-slate-900">
                    <MinecraftAvatar
                      src="JAPA325"
                      alt="JAPA325"
                      size={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <span className="block truncate font-mono text-[9px] font-black uppercase tracking-wider text-[#60a5fa]">
                      ✦{" "}
                      {t(
                        "history_section.members.japa.role",
                        "QA & BETA TESTER",
                      )}
                    </span>
                    <h6 className="truncate text-xs font-black text-white">
                      JAPA325
                    </h6>
                  </div>
                </div>
                <p className="text-[10.5px] font-medium leading-snug text-gray-200">
                  {t(
                    "history_section.members.japa.desc",
                    "Curioso, persistente e implacable buscando romper mecánicas para mejorarlas. El agente del caos a prueba de fallos personal de killu.",
                  )}
                </p>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  <span className="rounded-md border border-[#1d4ed8]/40 bg-[#1d4ed8]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#60a5fa]">
                    {t("history_section.members.japa.tag1", "Agente Caos")}
                  </span>
                  <span className="rounded-md border border-[#1d4ed8]/40 bg-[#1d4ed8]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#60a5fa]">
                    {t("history_section.members.japa.tag2", "QA Tester")}
                  </span>
                  <span className="rounded-md border border-[#1d4ed8]/40 bg-[#1d4ed8]/30 px-2 py-0.5 text-[8.5px] font-semibold text-[#60a5fa]">
                    {t("history_section.members.japa.tag3", "Gameplay Solid")}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* STAFF MEMBERS CARDS WITH DRAGGABLE ENERGY NODES */}
      {stage.members && (
        <div className="relative z-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stage.members.map((m) => {
              const isHovered =
                hoveredMember === m.name || dragActiveMember === m.name;
              const isLinked = linkedMembers.has(m.name);
              const accentColor = m.color || stage.accentColor || "#89d9d1";

              let cardStateClass =
                "opacity-45 grayscale contrast-75 bg-zinc-950/60";
              let cardBorderColor = "rgba(255, 255, 255, 0.08)";
              if (isLinked) {
                cardStateClass = "opacity-100 grayscale-0 bg-black/90";
                cardBorderColor = accentColor;
              } else if (isHovered) {
                cardStateClass = "opacity-85 grayscale-40 bg-zinc-950/85";
                cardBorderColor = "rgba(255, 255, 255, 0.3)";
              }

              return (
                <motion.div
                  key={`staff-${m.name}`}
                  onHoverStart={() => setHoveredMember(m.name)}
                  onHoverEnd={() => setHoveredMember(null)}
                  className={`group relative flex flex-col justify-between gap-3 rounded-2xl border p-4 pt-6 shadow-2xl backdrop-blur-md transition-colors duration-300 ${cardStateClass}`}
                  style={{
                    borderColor: cardBorderColor,
                    boxShadow: isLinked
                      ? `0 0 30px ${accentColor}40`
                      : "0 10px 30px rgba(0,0,0,0.8)",
                  }}
                >
                  {/* CIRCULAR RPG/SCI-FI GAME ASSET GEM SOCKET (CIRCULO CON GEMA SALIDA DE RAYO) */}
                  <div className="pointer-events-auto absolute -top-5 left-1/2 z-30 -translate-x-1/2">
                    <button
                      type="button"
                      onPointerDown={(e) => handleNodePointerDown(m.name, e)}
                      onClick={() => toggleMemberLink(m.name)}
                      className={`bg-linear-to-b group/gem relative flex h-11 w-11 touch-none items-center justify-center overflow-hidden rounded-full border-2 from-[#1e293b] via-[#0f172a] to-[#020617] shadow-[0_6px_20px_rgba(0,0,0,0.9)] transition-colors ${
                        isLinked
                          ? "pointer-events-none cursor-default select-none"
                          : "cursor-grab active:cursor-grabbing"
                      }`}
                      style={{
                        borderColor: isLinked
                          ? accentColor
                          : "rgba(255, 255, 255, 0.3)",
                        boxShadow: isLinked
                          ? `0 0 20px ${accentColor}80, inset 0 0 10px ${accentColor}50`
                          : "0 6px 15px rgba(0,0,0,0.8)",
                      }}
                      title={`Gema de Energía de ${m.name} (Arrastrar hacia el Faro)`}
                    >
                      {/* 4 Cardinal Accent Nodes on the Metallic Ring Frame */}
                      <span className="absolute left-1/2 top-0.5 h-1 w-1 -translate-x-1/2 rounded-full bg-white/60" />
                      <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white/60" />
                      <span className="absolute left-0.5 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-white/60" />
                      <span className="absolute right-0.5 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-white/60" />

                      {/* CENTRAL FACETED ENERGY GEM CRYSTAL */}
                      <div
                        className="rounded-xs relative flex h-5 w-5 rotate-45 items-center justify-center overflow-hidden border transition-colors duration-300"
                        style={{
                          backgroundColor: isLinked
                            ? accentColor
                            : "rgba(30, 41, 59, 0.8)",
                          borderColor: isLinked
                            ? "#ffffff"
                            : "rgba(148, 163, 184, 0.4)",
                          boxShadow: isLinked
                            ? `0 0 12px ${accentColor}`
                            : "none",
                        }}
                      >
                        {/* White Hot Pulsing Inner Light Core */}
                        <span
                          className={`h-2.5 w-2.5 -rotate-45 rounded-full ${isLinked ? "animate-ping bg-white" : "bg-slate-500/50"}`}
                          style={{
                            backgroundColor: isLinked
                              ? "#ffffff"
                              : "rgba(148, 163, 184, 0.5)",
                          }}
                        />
                      </div>
                    </button>
                  </div>

                  {/* MEMBER AVATAR & DETAILS */}
                  <div className="flex items-center gap-3">
                    <div
                      className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 bg-slate-900 shadow-lg transition-colors duration-300 group-hover:scale-105"
                      style={{ borderColor: accentColor }}
                    >
                      <MinecraftAvatar
                        src={m.image || m.mc_nickname || m.avatar || m.name}
                        alt={m.name}
                        size={48}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden text-left">
                      <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
                        <span
                          className="truncate text-sm font-black leading-tight transition-colors"
                          style={{ color: isHovered ? accentColor : "#ffffff" }}
                        >
                          {m.name}
                        </span>
                        {m.rankBadge && (
                          <img
                            src={m.rankBadge}
                            alt={m.role}
                            className="h-3.5 shrink-0 object-contain"
                          />
                        )}
                      </div>
                      <span className="block truncate text-[10.5px] font-bold text-gray-300">
                        {m.role}
                      </span>
                      <span className="mt-0.5 block text-[9.5px] italic leading-tight text-gray-400">
                        {m.desc}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   ISOLATED STAGE 03 CARD (PROYECTO CRYSTALTIDES)
   ========================================================================== */
function Stage3Card({
  stage,
  floatingItems,
  setShowWitherVideo,
  setSelectedPhotoModal,
  showWitherVideo,
  selectedPhotoModal,
}: Readonly<{
  stage: Stage;
  floatingItems: StageFloatingItem[];
  setShowWitherVideo: (v: boolean) => void;
  setSelectedPhotoModal: (src: string | null) => void;
  showWitherVideo: boolean;
  selectedPhotoModal: string | null;
}>) {
  const { t } = useTranslation();
  return (
    <div className="bg-linear-to-b relative space-y-8 overflow-hidden rounded-3xl border border-white/10 from-[#101726]/90 via-[#090d16]/95 to-[#05070c] p-8 shadow-[0_0_50px_rgba(137,217,209,0.15)] md:p-10">
      <div className="pointer-events-none absolute inset-0 z-0 flex h-full w-full items-center justify-center opacity-100">
        <Minecraft3DAltarCanvas stageId={3} accentColor={stage.accentColor} />
      </div>
      {floatingItems.map((item, idx) => (
        <FloatingItem key={item.pos} item={item} idx={idx} />
      ))}
      <StageHeader stage={stage} />
      <div className="pointer-events-auto relative z-20 my-2.5 flex justify-center">
        <motion.button
          type="button"
          onClick={() => setShowWitherVideo(true)}
          animate={{ y: [-2, 3, -2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-[#ef4444]/60 bg-[#ef4444]/25 px-5 py-2.5 shadow-[0_0_25px_rgba(239,68,68,0.4)] backdrop-blur-xl transition-colors hover:scale-105 hover:bg-[#ef4444]/40"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#ef4444] bg-[#ef4444]/40 shadow-lg transition-transform group-hover:scale-110">
            <Play className="h-4 w-4 fill-white text-white" />
          </div>
          <div className="overflow-hidden text-left">
            <span className="block truncate font-mono text-[9.5px] font-black uppercase tracking-wider text-[#ef4444]">
              {t(
                "history_section.stage3.live_combat",
                "🔴 VER REGISTRO DE COMBATE EN VIVO",
              )}
            </span>
            <h6 className="truncate text-xs font-black text-white">
              {t(
                "history_section.stage3.wither_boss",
                "Wither Terror Boss Fight",
              )}
            </h6>
          </div>
        </motion.button>
      </div>
      <div className="sm:min-h-70 pointer-events-auto relative z-10 my-2 flex min-h-60 items-center justify-between px-2 sm:px-4">
        <div className="z-10 hidden w-52 flex-col gap-3.5 sm:w-60 md:flex">
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() =>
              setSelectedPhotoModal("/images/memories/memory_1.jfif")
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedPhotoModal("/images/memories/memory_1.jfif");
              }
            }}
            className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-[#00e5ff]/40 bg-black/80 p-2.5 shadow-[0_0_20px_rgba(0,229,255,0.2)] backdrop-blur-xl transition-colors hover:border-[#00e5ff]"
          >
            <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-xl border border-[#00e5ff]/50 bg-slate-900 shadow-md">
              <img
                src="/images/memories/memory_1.jfif"
                alt="Ciudadela Nether"
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
              />
            </div>
            <div className="min-w-0 overflow-hidden text-left">
              <span className="block truncate font-mono text-[9px] font-black uppercase tracking-wider text-[#00e5ff]">
                {t("history_section.stage3.nether_raid", "NETHER RAID")}
              </span>
              <h6 className="truncate text-xs font-black text-white">
                {t("history_section.stage3.nether_citadel", "Ciudadela Nether")}
              </h6>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() =>
              setSelectedPhotoModal("/images/memories/memory_4.png")
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedPhotoModal("/images/memories/memory_4.png");
              }
            }}
            className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-[#a855f7]/40 bg-black/80 p-2.5 shadow-[0_0_20px_rgba(168,85,247,0.2)] backdrop-blur-xl transition-colors hover:border-[#a855f7]"
          >
            <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-xl border border-[#a855f7]/50 bg-slate-900 shadow-md">
              <img
                src="/images/memories/memory_4.png"
                alt="Bosque Sakura"
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
              />
            </div>
            <div className="min-w-0 overflow-hidden text-left">
              <span className="block truncate font-mono text-[9px] font-black uppercase tracking-wider text-[#a855f7]">
                {t("history_section.stage3.community", "COMUNIDAD")}
              </span>
              <h6 className="truncate text-xs font-black text-white">
                {t("history_section.stage3.sakura_forest", "Bosque Sakura")}
              </h6>
            </div>
          </motion.div>
        </div>
        <div className="pointer-events-none flex-1" />
        <div className="z-10 hidden w-52 flex-col gap-3.5 sm:w-60 md:flex">
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() =>
              setSelectedPhotoModal("/images/memories/memory_2.jfif")
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedPhotoModal("/images/memories/memory_2.jfif");
              }
            }}
            className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-[#ef4444]/40 bg-black/80 p-2.5 shadow-[0_0_20px_rgba(239,68,68,0.2)] backdrop-blur-xl transition-colors hover:border-[#ef4444]"
          >
            <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-xl border border-[#ef4444]/50 bg-slate-900 shadow-md">
              <img
                src="/images/memories/memory_2.jfif"
                alt="Batalla Nether"
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
              />
            </div>
            <div className="min-w-0 overflow-hidden text-left">
              <span className="block truncate font-mono text-[9px] font-black uppercase tracking-wider text-[#ef4444]">
                {t("history_section.stage3.showdown", "ENFRENTAMIENTO")}
              </span>
              <h6 className="truncate text-xs font-black text-white">
                {t("history_section.stage3.nether_battle", "Batalla Nether")}
              </h6>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() =>
              setSelectedPhotoModal("/images/memories/memory_3.png")
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedPhotoModal("/images/memories/memory_3.png");
              }
            }}
            className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-[#10b981]/40 bg-black/80 p-2.5 shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-xl transition-colors hover:border-[#10b981]"
          >
            <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-xl border border-[#10b981]/50 bg-slate-900 shadow-md">
              <img
                src="/images/memories/memory_3.png"
                alt="Gran Bóveda"
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
              />
            </div>
            <div className="min-w-0 overflow-hidden text-left">
              <span className="block truncate font-mono text-[9px] font-black uppercase tracking-wider text-[#10b981]">
                {t("history_section.stage3.economy", "ECONOMÍA")}
              </span>
              <h6 className="truncate text-xs font-black text-white">
                {t("history_section.stage3.grand_vault", "Gran Bóveda")}
              </h6>
            </div>
          </motion.div>
        </div>
      </div>
      <p className="relative z-10 mx-auto max-w-4xl rounded-2xl border border-white/10 bg-black/60 p-5 text-sm font-medium leading-relaxed text-gray-200 shadow-2xl backdrop-blur-md sm:p-6 md:text-base">
        {stage.narrativeSummary}
      </p>
      {stage.features && <StageFeatures features={stage.features} />}

      {/* CINEMATIC LIGHTBOX VIDEO POPUP MODAL (ISOLATED TO CARD) */}
      <AnimatePresence>
        {showWitherVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center rounded-3xl bg-black/90 p-4 backdrop-blur-2xl sm:p-6"
            onClick={() => setShowWitherVideo(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-[#ef4444]/50 bg-[#090b10] shadow-[0_0_60px_rgba(239,68,68,0.35)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#ef4444]/20 bg-black/60 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 animate-ping rounded-full bg-[#ef4444]" />
                  <div className="text-left">
                    <span className="block font-mono text-[10px] font-black uppercase tracking-wider text-[#ef4444]">
                      🔴 REGISTRO DE COMBATE EN VIVO
                    </span>
                    <h4 className="text-sm font-black uppercase tracking-tight text-white sm:text-base">
                      Forgotten Terror Wither Boss Fight
                    </h4>
                  </div>
                </div>
                <button
                  aria-label="Action"
                  type="button"
                  onClick={() => setShowWitherVideo(false)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition-colors hover:bg-[#ef4444]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative aspect-video w-full bg-black">
                <video
                  src="/videos/wither_battle_clip.mp4"
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHOTO LIGHTBOX PREVIEW MODAL (ISOLATED TO CARD) */}
      <AnimatePresence>
        {selectedPhotoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center rounded-3xl bg-black/90 p-4 backdrop-blur-2xl sm:p-6"
            onClick={() => setSelectedPhotoModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                aria-label="Action"
                type="button"
                onClick={() => setSelectedPhotoModal(null)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/80 text-white transition-colors hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
              <img
                src={selectedPhotoModal}
                alt="Memoria Minecraft"
                className="mx-auto h-auto max-h-[70vh] w-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==========================================================================
   ISOLATED STAGE 04 CARD (NUEVA ERA)
   ========================================================================== */
function Stage4Card({
  stage,
  floatingItems,
}: Readonly<{ stage: Stage; floatingItems: StageFloatingItem[] }>) {
  const { t } = useTranslation();
  return (
    <div className="bg-linear-to-b relative space-y-8 overflow-hidden rounded-3xl border border-white/10 from-[#101726]/90 via-[#090d16]/95 to-[#05070c] p-8 shadow-[0_0_50px_rgba(233,84,32,0.15)] md:p-10">
      <div className="pointer-events-none absolute inset-0 z-0 flex h-full w-full items-center justify-center opacity-100">
        <Minecraft3DServerRackCanvas accentColor={stage.accentColor} />
      </div>
      {floatingItems.map((item, idx) => (
        <FloatingItem key={item.pos} item={item} idx={idx} />
      ))}
      <StageHeader stage={stage} />
      <div className="sm:min-h-70 pointer-events-auto relative z-10 my-2 flex min-h-60 items-center justify-between px-2 sm:px-4">
        <div className="max-w-85 z-10 hidden w-fit shrink-0 flex-col gap-3.5 md:flex">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="group flex cursor-default items-center gap-3 rounded-2xl border border-[#e95420]/40 bg-black/80 p-2.5 shadow-[0_0_20px_rgba(233,84,32,0.2)] backdrop-blur-xl transition-colors hover:border-[#e95420]"
          >
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e95420]/50 bg-slate-900/80 p-1 shadow-md">
              <img
                src="/images/items/Impulse_Command_Block_JE1.png"
                alt="Nuevo Hosting"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0 whitespace-nowrap pr-1 text-left">
              <span className="block font-mono text-[9px] font-black uppercase tracking-wider text-[#e95420]">
                {t("history_section.stage4.new_hosting", "NUEVO HOSTING")}
              </span>
              <h6 className="text-xs font-black text-white">
                {t(
                  "history_section.stage4.ubuntu_tps",
                  "Ubuntu 20 TPS Sostenidos",
                )}
              </h6>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="group flex cursor-default items-center gap-3 rounded-2xl border border-[#10b981]/40 bg-black/80 p-2.5 shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-xl transition-colors hover:border-[#10b981]"
          >
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#10b981]/50 bg-slate-900/80 p-1 shadow-md">
              <img
                src="/images/items/xp_bottle.webp"
                alt="Recompensas Diarias"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0 whitespace-nowrap pr-1 text-left">
              <span className="block font-mono text-[9px] font-black uppercase tracking-wider text-[#10b981]">
                {t(
                  "history_section.stage4.daily_rewards",
                  "RECOMPENSAS DIARIAS",
                )}
              </span>
              <h6 className="text-xs font-black text-white">
                {t(
                  "history_section.stage4.daily_loot",
                  "Premios & Loot por Entrar",
                )}
              </h6>
            </div>
          </motion.div>
        </div>
        <div className="pointer-events-none flex-1" />
        <div className="max-w-85 z-10 hidden w-fit shrink-0 flex-col gap-3.5 md:flex">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="group flex cursor-default items-center gap-3 rounded-2xl border border-[#00e5ff]/40 bg-black/80 p-2.5 shadow-[0_0_20px_rgba(0,229,255,0.2)] backdrop-blur-xl transition-colors hover:border-[#00e5ff]"
          >
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#00e5ff]/50 bg-slate-900/80 p-1 shadow-md">
              <img
                src="/images/items/enchanted_book.gif"
                alt="Nuevas Estadisticas"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0 whitespace-nowrap pr-1 text-left">
              <span className="block font-mono text-[9px] font-black uppercase tracking-wider text-[#00e5ff]">
                {t("history_section.stage4.new_stats", "NUEVAS ESTADÍSTICAS")}
              </span>
              <h6 className="text-xs font-black text-white">
                {t(
                  "history_section.stage4.live_metrics",
                  "Métricas & Kills en Vivo",
                )}
              </h6>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="group flex cursor-default items-center gap-3 rounded-2xl border border-[#a855f7]/40 bg-black/80 p-2.5 shadow-[0_0_20px_rgba(168,85,247,0.2)] backdrop-blur-xl transition-colors hover:border-[#a855f7]"
          >
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#a855f7]/50 bg-slate-900/80 p-1 shadow-md">
              <img
                src="/images/killucoin.png"
                alt="Economia Mejorada"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0 whitespace-nowrap pr-1 text-left">
              <span className="block font-mono text-[9px] font-black uppercase tracking-wider text-[#a855f7]">
                {t(
                  "history_section.stage4.improved_economy",
                  "ECONOMÍA MEJORADA",
                )}
              </span>
              <h6 className="text-xs font-black text-white">
                {t(
                  "history_section.stage4.economy_system",
                  "Sistema de economía mejorado",
                )}
              </h6>
            </div>
          </motion.div>
        </div>
      </div>
      <p className="relative z-10 mx-auto max-w-4xl rounded-2xl border border-white/10 bg-black/60 p-5 text-sm font-medium leading-relaxed text-gray-200 shadow-2xl backdrop-blur-md sm:p-6 md:text-base">
        {stage.narrativeSummary}
      </p>
      {stage.features && <StageFeatures features={stage.features} />}
    </div>
  );
}

/* Shared skeleton building blocks */
const SkeletonBone = ({ className }: { className: string }) => (
  <div className={`bg-white/8 ${className}`} />
);

const SkeletonHeaderBlock = () => (
  <div className="relative z-10 space-y-3 text-center">
    <div className="flex justify-center">
      <SkeletonBone className="h-6 w-36 rounded-full border border-white/5" />
    </div>
    <div className="flex justify-center">
      <SkeletonBone className="h-9 w-72 rounded-xl" />
    </div>
    <div className="flex justify-center">
      <SkeletonBone className="h-5 w-56 rounded-lg" />
    </div>
  </div>
);

const SkeletonNarrativeBlock = () => (
  <div className="border-white/8 relative z-10 mx-auto max-w-4xl space-y-2.5 rounded-2xl border bg-black/40 p-5 shadow-2xl backdrop-blur-md sm:p-6">
    <SkeletonBone className="h-3.5 w-full rounded" />
    <SkeletonBone className="h-3.5 w-11/12 rounded" />
    <SkeletonBone className="h-3.5 w-4/5 rounded" />
  </div>
);

const SkeletonFeaturesBlock = ({ count = 2 }: { count?: number }) => (
  <div className="relative z-10 mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className="border-white/8 flex items-start gap-4 rounded-2xl border bg-black/50 p-5 backdrop-blur-xl"
      >
        <SkeletonBone className="h-12 w-12 shrink-0 rounded-xl border border-white/5" />
        <div className="flex-1 space-y-2">
          <SkeletonBone className="h-2 w-16 rounded" />
          <SkeletonBone className="h-4 w-32 rounded" />
          <SkeletonBone className="h-3 w-full rounded" />
        </div>
      </div>
    ))}
  </div>
);

const SkeletonFloatingCard = ({
  thumbW = "w-14",
  thumbH = "h-11",
}: {
  thumbW?: string;
  thumbH?: string;
}) => (
  <div className="border-white/8 flex items-center gap-3 rounded-2xl border bg-black/60 p-2.5 backdrop-blur-xl">
    <SkeletonBone
      className={`${thumbW} ${thumbH} shrink-0 rounded-xl border border-white/5`}
    />
    <div className="flex-1 space-y-1.5">
      <SkeletonBone className="h-2.5 w-20 rounded" />
      <SkeletonBone className="h-3.5 w-28 rounded" />
    </div>
  </div>
);

/* ── Stage 1 Skeleton: Centered Twitch icon → Header → Narrative → 2 Features ── */
const Stage1Skeleton = () => (
  <div className="bg-linear-to-b relative animate-pulse space-y-8 overflow-hidden rounded-3xl border border-white/10 from-[#101726]/90 via-[#090d16]/95 to-[#05070c] p-8 shadow-[0_0_50px_rgba(137,217,209,0.1)] md:p-10">
    {/* Centered icon box (Twitch) */}
    <div className="relative z-10 flex items-center justify-center pb-4 pt-2">
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-[#9146ff]/20 bg-black/60 backdrop-blur-xl sm:h-32 sm:w-32">
        <SkeletonBone className="h-14 w-14 rounded-xl" />
      </div>
    </div>
    <SkeletonHeaderBlock />
    <SkeletonNarrativeBlock />
    <SkeletonFeaturesBlock count={2} />
  </div>
);

/* ── Stage 2 Skeleton: Header → Bio cards left | Beacon center | Bio cards right → 4-member grid ── */
const Stage2Skeleton = () => (
  <div className="bg-linear-to-b relative animate-pulse space-y-8 overflow-hidden rounded-3xl border border-white/10 from-[#101726]/90 via-[#090d16]/95 to-[#05070c] p-8 shadow-[0_0_50px_rgba(137,217,209,0.1)] md:p-10">
    <SkeletonHeaderBlock />
    {/* 3-column: bio cards | beacon | bio cards */}
    <div className="sm:min-h-70 relative z-10 my-2 flex min-h-60 items-center justify-between px-2 sm:px-4">
      {/* Left bio cards */}
      <div className="sm:w-68 z-10 hidden w-60 flex-col gap-4 md:flex">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="border-white/8 space-y-2 rounded-2xl border bg-black/60 p-3.5 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2.5 border-b border-white/5 pb-2">
              <SkeletonBone className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1">
                <SkeletonBone className="h-2 w-24 rounded" />
                <SkeletonBone className="h-3 w-20 rounded" />
              </div>
            </div>
            <SkeletonBone className="h-3 w-full rounded" />
            <SkeletonBone className="h-3 w-4/5 rounded" />
            <div className="flex gap-1 pt-0.5">
              <SkeletonBone className="h-4 w-14 rounded-md" />
              <SkeletonBone className="h-4 w-12 rounded-md" />
              <SkeletonBone className="h-4 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>
      {/* Center beacon drop zone */}
      <div className="pointer-events-none flex flex-1 items-center justify-center">
        <SkeletonBone className="h-48 w-48 rounded-full border border-white/5" />
      </div>
      {/* Right bio cards */}
      <div className="sm:w-68 z-10 hidden w-60 flex-col gap-4 md:flex">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="border-white/8 space-y-2 rounded-2xl border bg-black/60 p-3.5 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2.5 border-b border-white/5 pb-2">
              <SkeletonBone className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1">
                <SkeletonBone className="h-2 w-20 rounded" />
                <SkeletonBone className="h-3 w-16 rounded" />
              </div>
            </div>
            <SkeletonBone className="h-3 w-full rounded" />
            <SkeletonBone className="h-3 w-3/4 rounded" />
            <div className="flex gap-1 pt-0.5">
              <SkeletonBone className="h-4 w-16 rounded-md" />
              <SkeletonBone className="h-4 w-14 rounded-md" />
              <SkeletonBone className="w-18 h-4 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* 4 member cards grid */}
    <div className="relative z-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border-white/8 relative flex flex-col gap-3 rounded-2xl border bg-zinc-950/60 p-4 pt-6 backdrop-blur-md"
          >
            {/* Gem socket */}
            <div className="absolute -top-5 left-1/2 z-30 -translate-x-1/2">
              <SkeletonBone className="h-11 w-11 rounded-full border-2 border-white/10" />
            </div>
            {/* Avatar + details */}
            <div className="flex items-center gap-3">
              <SkeletonBone className="h-12 w-12 shrink-0 rounded-full border-2 border-white/10" />
              <div className="flex-1 space-y-1.5">
                <SkeletonBone className="h-3.5 w-24 rounded" />
                <SkeletonBone className="h-2.5 w-20 rounded" />
                <SkeletonBone className="h-2 w-full rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ── Stage 3 Skeleton: Header → Video button → Photo cards left | 3D center | Photo cards right → Narrative → Features ── */
const Stage3Skeleton = () => (
  <div className="bg-linear-to-b relative animate-pulse space-y-8 overflow-hidden rounded-3xl border border-white/10 from-[#101726]/90 via-[#090d16]/95 to-[#05070c] p-8 shadow-[0_0_50px_rgba(137,217,209,0.1)] md:p-10">
    {/* 3D bg glow */}
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="h-48 w-48 rounded-full bg-[#89d9d1]/5 blur-3xl" />
    </div>
    <SkeletonHeaderBlock />
    {/* Video button placeholder */}
    <div className="relative z-20 my-2.5 flex justify-center">
      <div className="border-white/8 flex items-center gap-3 rounded-2xl border bg-black/60 px-5 py-2.5 backdrop-blur-xl">
        <SkeletonBone className="h-8 w-8 shrink-0 rounded-xl" />
        <div className="space-y-1">
          <SkeletonBone className="h-2.5 w-36 rounded" />
          <SkeletonBone className="h-3.5 w-28 rounded" />
        </div>
      </div>
    </div>
    {/* 3-column: photo cards | 3D | photo cards */}
    <div className="sm:min-h-70 relative z-10 my-2 flex min-h-60 items-center justify-between px-2 sm:px-4">
      <div className="z-10 hidden w-52 flex-col gap-3.5 sm:w-60 md:flex">
        <SkeletonFloatingCard />
        <SkeletonFloatingCard />
      </div>
      <div className="pointer-events-none flex-1" />
      <div className="z-10 hidden w-52 flex-col gap-3.5 sm:w-60 md:flex">
        <SkeletonFloatingCard />
        <SkeletonFloatingCard />
      </div>
    </div>
    <SkeletonNarrativeBlock />
    <SkeletonFeaturesBlock count={2} />
  </div>
);

/* ── Stage 4 Skeleton: Header → Feature pills left | 3D center | Feature pills right → Narrative → Features ── */
const Stage4Skeleton = () => (
  <div className="bg-linear-to-b relative animate-pulse space-y-8 overflow-hidden rounded-3xl border border-white/10 from-[#101726]/90 via-[#090d16]/95 to-[#05070c] p-8 shadow-[0_0_50px_rgba(233,84,32,0.1)] md:p-10">
    {/* 3D bg glow */}
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="h-48 w-48 rounded-full bg-[#e95420]/5 blur-3xl" />
    </div>
    <SkeletonHeaderBlock />
    {/* 3-column: feature pills | 3D | feature pills */}
    <div className="sm:min-h-70 relative z-10 my-2 flex min-h-60 items-center justify-between px-2 sm:px-4">
      <div className="max-w-85 z-10 hidden w-fit shrink-0 flex-col gap-3.5 md:flex">
        <SkeletonFloatingCard thumbW="w-11" thumbH="h-11" />
        <SkeletonFloatingCard thumbW="w-11" thumbH="h-11" />
      </div>
      <div className="pointer-events-none flex-1" />
      <div className="max-w-85 z-10 hidden w-fit shrink-0 flex-col gap-3.5 md:flex">
        <SkeletonFloatingCard thumbW="w-11" thumbH="h-11" />
        <SkeletonFloatingCard thumbW="w-11" thumbH="h-11" />
      </div>
    </div>
    <SkeletonNarrativeBlock />
    <SkeletonFeaturesBlock count={2} />
  </div>
);

const STAGE_SKELETONS: Record<number, React.FC> = {
  1: Stage1Skeleton,
  2: Stage2Skeleton,
  3: Stage3Skeleton,
  4: Stage4Skeleton,
};

const StageSkeletonFallback = ({ stageId }: { stageId: number }) => {
  const SkelComponent = STAGE_SKELETONS[stageId] || Stage1Skeleton;
  return <SkelComponent />;
};

export default function ServerHistory() {
  const { t } = useTranslation();
  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [isTabLoading, setIsTabLoading] = useState<boolean>(false);
  const [showWitherVideo, setShowWitherVideo] = useState<boolean>(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(
    null,
  );

  const handleStageSelect = (stageId: number) => {
    if (stageId === activeStageId) return;
    setIsTabLoading(true);
    setActiveStageId(stageId);
    setTimeout(() => setIsTabLoading(false), 600);
  };

  const stages: Stage[] = [
    {
      id: 1,
      year: "2022",
      stageName: t("history_section.stage1.stageName", "ESTACIÓN 01"),
      title: t(
        "history_section.stage1.title",
        "La Pecerita de los Killufishies",
      ),
      subtitle: t(
        "history_section.stage1.subtitle",
        "El Origen de la Comunidad en Twitch",
      ),
      badge: t("history_section.stage1.badge", "✦ EL ORIGEN"),
      accentColor: "#89d9d1",
      icon: TwitchIcon,
      narrativeSummary: t(
        "history_section.stage1.summary",
        "El nacimiento de nuestra historia en los streams de Twitch de Killu: un espacio dedicado al arte, la ilustración y las primeras noches de juego casual.",
      ),
      features: [
        {
          icon: TwitchIcon,
          title: t("history_section.stage1.f1_title", "Streams de Ilustración"),
          desc: t(
            "history_section.stage1.f1_desc",
            "Comunidad activa de dibujo & fanart",
          ),
          badgeText: "TWITCH",
          brandColor: "#9146ff",
        },
        {
          icon: DiscordIcon,
          title: t("history_section.stage1.f2_title", "Noches de Minijuegos"),
          desc: t(
            "history_section.stage1.f2_desc",
            "Primeros momentos de chill & gaming",
          ),
          badgeText: "COMMUNITY",
          brandColor: "#5865f2",
        },
      ],
    },
    {
      id: 2,
      year: "2023",
      stageName: t("history_section.stage2.stageName", "ESTACIÓN 02"),
      title: t("history_section.stage2.title", "Creación del staff"),
      subtitle: t(
        "history_section.stage2.subtitle",
        "Formación del Núcleo de Desarrollo, Arte y QA",
      ),
      badge: t("history_section.stage2.badge", "✦ NÚCLEO STAFF"),
      accentColor: "#89d9d1",
      imageSrc: "/images/items/Beacon_JE6_BE2.webp",
      narrativeSummary: t(
        "history_section.stage2.summary",
        "Se forma el equipo oficial: Killu en la voz y comunidad, Nero en la arquitectura técnica e infraestructura, Churly en el diseño de interfaz y Japa en el testing de juego.",
      ),
      members: [
        {
          name: "KillubysmaliVT",
          role: t(
            "history_section.members.killu.role",
            "Directora & Comunidad",
          ),
          image: "/skins/killu.png",
          mc_nickname: "KillubysmaliVT",
          rankBadge: "/ranks/rank-killu.png",
          color: "#00637c",
          desc: t(
            "history_section.members.killu.desc",
            "Líder comunitaria y streamer. El corazón de la Pecerita.",
          ),
        },
        {
          name: "Neroferno ultranix",
          role: t("history_section.members.nero.role", "Dev Lead & Infra"),
          image:
            "https://minotar.net/skin/344af588-8a7e-4053-9f03-92d68d96b86c",
          mc_nickname: "Neroferno",
          rankBadge: "/ranks/rank-neroferno.png",
          color: "#ff00b7",
          desc: t(
            "history_section.members.nero.desc",
            "Co-fundador. Arquitectura de código, MySQL/Redis y parches.",
          ),
        },
        {
          name: "Xurlito",
          role: t("history_section.members.churly.role", "Diseño & Arte Lead"),
          image: "/skins/churly.png",
          mc_nickname: "Xurlito",
          rankBadge: "/ranks/developer.png",
          color: "#00aeef",
          desc: t(
            "history_section.members.churly.desc",
            "Artista principal. Dirección gráfica y estética pulida.",
          ),
        },
        {
          name: "JAPA325",
          role: t("history_section.members.japa.role", "QA & BetaTester"),
          image: "JAPA325",
          mc_nickname: "JAPA325",
          rankBadge: "/ranks/staff.png",
          color: "#000080",
          desc: t(
            "history_section.members.japa.desc",
            "Consultor de juego. El agente del caos a prueba de fallos.",
          ),
        },
      ],
    },
    {
      id: 3,
      year: "Nov 2024",
      stageName: t("history_section.stage3.stageName", "ESTACIÓN 03"),
      title: t("history_section.stage3.title", "Evolución a CrystalTides SMP"),
      subtitle: t(
        "history_section.stage3.subtitle",
        "Sistema RPG, Economía VIVA & Bosses del Nether",
      ),
      badge: t("history_section.stage3.badge", "✦ EVOLUCIÓN"),
      accentColor: "#89d9d1",
      imageSrc: "/logo.png",
      narrativeSummary: t(
        "history_section.stage3.summary",
        "La pecerita fue renombrada como CrystalTidesSMP, un servidor nuevo con mecánicas nuevas y bosses increíbles.",
      ),
      features: [
        {
          imageSrc: "/images/items/Iron_Sword_JE2_BE2.png",
          title: t("history_section.stage3.f1_title", "Habilidades mcMMO"),
          desc: t(
            "history_section.stage3.f1_desc",
            "Sistema RPG completo de maestrías & combate",
          ),
          badgeText: "MCMMO CORE",
          brandColor: "#f59e0b",
        },
        {
          imageSrc: "/images/killucoin.png",
          title: t("history_section.stage3.f2_title", "Economía Killupesos"),
          desc: t(
            "history_section.stage3.f2_desc",
            "Se originó el futuro sistema de economía con 7 monedas de cambio",
          ),
          badgeText: "ECONOMY",
          brandColor: "#10b981",
        },
        {
          imageSrc: "/images/items/Wither_Skeleton_Skull_(S)_JE2.png",
          title: t("history_section.stage3.f3_title", "Forgotten Terror Boss"),
          desc: t(
            "history_section.stage3.f3_desc",
            "Mazmorra semanal y combates en el Nether",
          ),
          badgeText: "DUNGEON",
          brandColor: "#ef4444",
          videoUrl:
            "https://x.com/NeroSecretsAlt/status/1859128432702918841?s=20",
        },
        {
          imageSrc: "/images/items/Waystone_Structure.png",
          title: t("history_section.stage3.f4_title", "Red de Waystones"),
          desc: t(
            "history_section.stage3.f4_desc",
            "Teletransporte e hitos del mapa survival",
          ),
          badgeText: "MAP",
          brandColor: "#06b6d4",
        },
      ],
    },
    {
      id: 4,
      year: "2025 - 2026",
      stageName: t("history_section.stage4.stageName", "ESTACIÓN 04"),
      title: t("history_section.stage4.title", "Era Dedicada & Launcher"),
      subtitle: t(
        "history_section.stage4.subtitle",
        "Servidores Dedicados, Dominio Oficial y Futuro",
      ),
      badge: t("history_section.stage4.badge", "✦ ERA DEDICADA"),
      accentColor: "#89d9d1",
      imageSrc: "/images/items/Impulse_Command_Block_JE1.png",
      narrativeSummary: t(
        "history_section.stage4.summary",
        "Migración a infraestructura profesional en servidores dedicados Ubuntu Server (MySQL, Redis, nodos distribuidos), dominio oficial y Launcher Beta.",
      ),
      features: [
        {
          imageSrc: "/images/items/server_rack_icon.png",
          title: t("history_section.stage4.f1_title", "Dedicated Ubuntu Node"),
          desc: t(
            "history_section.stage4.f1_desc",
            "20 TPS constantes y nodos distribuidos",
          ),
          badgeText: "INFRA",
          brandColor: "#e95420",
        },
        {
          imageSrc: "/images/server_icon.png",
          title: t("history_section.stage4.f2_title", "Mc.CrystalTidesSMP.net"),
          desc: t(
            "history_section.stage4.f2_desc",
            "Dominio oficial de conexión directa",
          ),
          badgeText: "DOMINIO",
          brandColor: "#00e5ff",
        },
        {
          imageSrc: "/images/items/Shield_JE2_BE1.webp",
          title: t("history_section.stage4.f3_title", "Launcher Oficial Beta"),
          desc: t(
            "history_section.stage4.f3_desc",
            "Entrada optimizada al juego en 1-Click",
          ),
          badgeText: "CLIENT",
          brandColor: "#a855f7",
        },
      ],
    },
  ];

  const activeStage = stages.find((s) => s.id === activeStageId) || stages[0];
  const currentFloatingItems =
    STAGE_FLOATING_ITEMS[activeStage.id] || STAGE_FLOATING_ITEMS[1];

  return (
    <Section
      title={
        <div className="flex items-center justify-center gap-3">
          <History className="text-(--accent) text-3xl" />
          <span className="uppercase tracking-widest text-white">
            {t("history_section.title", "Historia de CrystalTides SMP")}
          </span>
        </div>
      }
    >
      <div className="mx-auto max-w-6xl space-y-10 px-4">
        <p className="mx-auto max-w-3xl text-center text-sm font-medium leading-relaxed text-gray-300 opacity-90 sm:text-base">
          {t(
            "history_section.desc",
            "Bienvenid@ a la historia de CrystalTides SMP, aquí podrás ver las etapas del proyecto",
          )}
        </p>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0c10]/90 px-4 py-6 shadow-2xl backdrop-blur-2xl">
          <div className="bg-linear-to-r pointer-events-none absolute left-10 right-10 top-1/2 h-0.5 -translate-y-1/2 rounded-full from-[#168c80]/40 via-[#89d9d1]/60 to-[#168c80]/40 opacity-40" />

          <div className="relative z-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stages.map((stg) => {
              const isSelected = activeStageId === stg.id;
              const IconComponent = stg.icon;

              let iconStyleClass = "bg-white/5 border-white/10 text-gray-400";
              if (isSelected) {
                if (stg.id === 1) {
                  iconStyleClass =
                    "bg-[#9146ff]/20 border-[#9146ff]/50 text-[#9146ff] shadow-[0_0_12px_rgba(145,70,255,0.4)]";
                } else {
                  iconStyleClass =
                    "bg-[#89d9d1]/20 border-[#89d9d1]/40 text-[#89d9d1]";
                }
              }

              let iconContent = null;
              if (stg.imageSrc) {
                iconContent = (
                  <img
                    src={stg.imageSrc}
                    alt={stg.title}
                    className="h-5 w-5 object-contain"
                  />
                );
              } else if (IconComponent) {
                const extraStyle =
                  isSelected && stg.id === 1
                    ? "text-[#9146ff] drop-shadow-[0_0_8px_rgba(145,70,255,0.8)]"
                    : "";
                iconContent = (
                  <IconComponent className={`h-5 w-5 ${extraStyle}`} />
                );
              }

              const dotClass = isSelected
                ? "bg-[#89d9d1] animate-pulse shadow-[0_0_8px_#89d9d1]"
                : "bg-gray-600 opacity-30";

              return (
                <button
                  key={stg.id}
                  type="button"
                  aria-label={`${stg.stageName}: ${stg.title}`}
                  onClick={() => handleStageSelect(stg.id)}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                    isSelected
                      ? "scale-[1.02] border-[#89d9d1] bg-black/90 shadow-[0_0_25px_rgba(137,217,209,0.25)]"
                      : "border-white/10 bg-[#0a0d14]/70 hover:border-white/20 hover:bg-black/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest"
                      style={{
                        color: stg.accentColor,
                        backgroundColor: `${stg.accentColor}15`,
                        borderColor: `${stg.accentColor}40`,
                      }}
                    >
                      {stg.stageName}
                    </span>
                    <span className="font-mono text-xs font-black text-gray-400">
                      {stg.year}
                    </span>
                  </div>

                  <div className="my-1 flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex shrink-0 items-center justify-center rounded-xl border p-2 transition-transform group-hover:scale-110 ${iconStyleClass}`}
                    >
                      {iconContent}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="wrap-break-word text-xs font-black uppercase leading-snug tracking-tight text-white transition-colors group-hover:text-[#89d9d1]">
                        {stg.title}
                      </h4>
                      <p className="wrap-break-word mt-0.5 text-[10px] font-medium leading-tight text-gray-400">
                        {stg.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end border-t border-white/5 pt-1">
                    <div
                      className={`h-2.5 w-2.5 rounded-full transition-colors ${dotClass}`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <Skeleton
          name={`server-history-stage-${activeStageId}`}
          loading={isTabLoading}
          fallback={<StageSkeletonFallback stageId={activeStageId} />}
          animate="shimmer"
          color="#1a1a2e"
          darkColor="#0f0f1a"
          transition={300}
        >
          <AnimatePresence mode="wait">
            {activeStageId === 1 && (
              <motion.div
                key={1}
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -15 }}
                transition={{ duration: 0.3 }}
                className="relative text-left transition-colors duration-500"
              >
                <Stage1Card
                  stage={activeStage}
                  floatingItems={currentFloatingItems}
                />
              </motion.div>
            )}
            {activeStageId === 2 && (
              <motion.div
                key={2}
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -15 }}
                transition={{ duration: 0.3 }}
                className="relative text-left transition-colors duration-500"
              >
                <Stage2Card
                  stage={activeStage}
                  floatingItems={currentFloatingItems}
                />
              </motion.div>
            )}
            {activeStageId === 3 && (
              <motion.div
                key={3}
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -15 }}
                transition={{ duration: 0.3 }}
                className="relative text-left transition-colors duration-500"
              >
                <Stage3Card
                  stage={activeStage}
                  floatingItems={currentFloatingItems}
                  setShowWitherVideo={setShowWitherVideo}
                  setSelectedPhotoModal={setSelectedPhotoModal}
                  showWitherVideo={showWitherVideo}
                  selectedPhotoModal={selectedPhotoModal}
                />
              </motion.div>
            )}
            {activeStageId === 4 && (
              <motion.div
                key={4}
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -15 }}
                transition={{ duration: 0.3 }}
                className="relative text-left transition-colors duration-500"
              >
                <Stage4Card
                  stage={activeStage}
                  floatingItems={currentFloatingItems}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Skeleton>
      </div>
    </Section>
  );
}

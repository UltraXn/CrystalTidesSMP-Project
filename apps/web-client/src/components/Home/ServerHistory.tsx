import { useState, useRef, useEffect } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { History, Sparkles, Server, Play, X, RefreshCw, LucideIcon } from "lucide-react";
import { Skeleton } from 'boneyard-js/react';
import { useTranslation } from "react-i18next";
import Section from "../Layout/Section";
import MinecraftAvatar from "../UI/MinecraftAvatar";
import { Minecraft3DAltarCanvas } from "./Minecraft3DAltarCanvas";
import { Minecraft3DSkullCanvas } from "./Minecraft3DSkullCanvas";
import { Minecraft3DServerRackCanvas } from "./Minecraft3DServerRackCanvas";
import { Minecraft3DServerRackMiniCanvas } from "./Minecraft3DServerRackMiniCanvas";

const DiscordIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" xmlns="http://www.w3.org/2000/svg">
        <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.8,167.234,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z" />
    </svg>
);

const TwitchIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
        { icon: TwitchIcon, color: "#a855f7", pos: "top-8 left-6 sm:left-10", size: "w-12 h-12 sm:w-16 sm:h-16", duration: 14, rotateX: [10, -10, 10], rotateZ: [-8, 8, -8], y: [-6, 6, -6] },
        { icon: DiscordIcon, color: "#5865f2", pos: "bottom-20 left-10 sm:left-16", size: "w-12 h-12 sm:w-16 sm:h-16", duration: 18, rotateX: [-12, 12, -12], rotateZ: [6, -6, 6], y: [6, -6, 6] },
        { src: "/images/items/Diamond_JE3_BE3.png", pos: "top-1/3 right-10 sm:right-16", size: "w-14 h-14 sm:w-18 sm:h-18", duration: 15, rotateX: [8, -8, 8], rotateZ: [-6, 6, -6], y: [-8, 8, -8] },
        { src: "/images/items/Emerald_JE3_BE3.png", pos: "bottom-12 right-12 sm:right-24", size: "w-14 h-14 sm:w-18 sm:h-18", duration: 20, rotateX: [-10, 10, -10], rotateZ: [8, -8, 8], y: [8, -8, 8] }
    ],
    2: [
        { src: "/images/items/Totem_of_Undying_JE2_BE2.png", pos: "top-10 left-8 sm:left-12", size: "w-16 h-16 sm:w-20 sm:h-20", duration: 16, rotateX: [12, -8, 12], rotateZ: [-6, 6, -6], y: [-8, 8, -8] },
        { src: "/images/items/Netherite_Chestplate_JE2_BE1.png", pos: "bottom-16 left-12 sm:left-20", size: "w-16 h-16 sm:w-20 sm:h-20", duration: 15, rotateX: [-8, 12, -8], rotateZ: [8, -8, 8], y: [6, -6, 6] },
        { src: "/images/items/enchanted_book.gif", pos: "top-1/4 right-8 sm:right-16", size: "w-16 h-16 sm:w-20 sm:h-20", duration: 17, rotateX: [10, -10, 10], rotateZ: [-6, 8, -6], y: [-6, 6, -6] },
        { src: "/images/items/Heavy_Core_JE1_BE1.png", pos: "bottom-10 right-10 sm:right-24", size: "w-14 h-14 sm:w-18 sm:h-18", duration: 19, rotateX: [-12, 8, -12], rotateZ: [6, -6, 6], y: [8, -8, 8] }
    ],
    3: [
        { src: "/images/items/Dragon_Head_(S)_JE1.png", pos: "top-10 left-6 sm:left-12", size: "w-16 h-16 sm:w-20 sm:h-20", duration: 15, rotateX: [14, -10, 14], rotateZ: [-8, 8, -8], y: [-8, 8, -8] },
        { src: "/images/items/Trident_(item).png", pos: "bottom-14 left-10 sm:left-20", size: "w-14 h-14 sm:w-18 sm:h-18", duration: 14, rotateX: [-10, 12, -10], rotateZ: [6, -6, 6], y: [6, -6, 6] },
        { src: "/images/items/Beacon_JE6_BE2.webp", pos: "top-1/3 right-10 sm:right-20", size: "w-14 h-14 sm:w-18 sm:h-18", duration: 18, rotateX: [10, -12, 10], rotateZ: [-6, 6, -6], y: [-6, 6, -6] },
        { src: "/images/items/xp_bottle.webp", pos: "bottom-12 right-12 sm:right-24", size: "w-14 h-14 sm:w-18 sm:h-18", duration: 16, rotateX: [-8, 10, -8], rotateZ: [8, -8, 8], y: [8, -8, 8] }
    ],
    4: [
        { src: "/images/items/Elytra_JE2_BE2.png", pos: "top-8 left-8 sm:left-14", size: "w-16 h-16 sm:w-20 sm:h-20", duration: 16, rotateX: [12, -12, 12], rotateZ: [-8, 8, -8], y: [-8, 8, -8] },
        { src: "/images/items/Saddle_JE2_BE2.png", pos: "bottom-16 left-12 sm:left-24", size: "w-14 h-14 sm:w-18 sm:h-18", duration: 19, rotateX: [-10, 10, -10], rotateZ: [6, -6, 6], y: [6, -6, 6] },
        { src: "/images/items/Sniffer_Egg_(item)_JE1_BE1.png", pos: "top-1/4 right-10 sm:right-16", size: "w-14 h-14 sm:w-18 sm:h-18", duration: 15, rotateX: [10, -10, 10], rotateZ: [-6, 8, -6], y: [-6, 6, -6] },
        { src: "/images/items/Silence_Armor_Trim_Smithing_Template_JE1_BE1.png", pos: "bottom-10 right-14 sm:right-24", size: "w-14 h-14 sm:w-18 sm:h-18", duration: 17, rotateX: [-14, 10, -14], rotateZ: [8, -8, 8], y: [8, -8, 8] }
    ]
};

/* ==========================================================================
   ISOLATED STAGE HELPER SUBCOMPONENTS
   ========================================================================== */
function FloatingItem({ item, idx }: Readonly<{ item: StageFloatingItem; idx: number }>) {
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
        iconContent = <img src={item.src} alt="Minecraft DVD Bouncing Relic" className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]" />;
    } else if (item.icon) {
        iconContent = <item.icon className="w-full h-full filter drop-shadow-[0_0_15px_currentColor]" style={{ color: item.color || '#00e5ff' }} />;
    }

    return (
        <div className={`absolute ${item.pos} opacity-30 pointer-events-none ${item.size} z-0`}>
            <motion.div 
                animate={{ x: bounceX, y: bounceY }}
                transition={{ duration: bounceDuration, repeat: Infinity, ease: "linear" }}
                className="w-full h-full flex items-center justify-center"
            >
                {iconContent}
            </motion.div>
        </div>
    );
}

function StageHeader({ 
    stage, 
    linkedCount, 
    resetLinks 
}: Readonly<{ 
    stage: Stage; 
    linkedCount?: number; 
    resetLinks?: () => void; 
}>) {
    let headerIcon = null;
    if (stage.imageSrc) {
        headerIcon = <img src={stage.imageSrc} alt={stage.title} className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(0,229,255,0.85)] shrink-0" />;
    } else if (stage.id === 1) {
        headerIcon = (
            <div className="w-10 h-10 rounded-xl bg-[#9146ff]/20 border border-[#9146ff]/50 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(145,70,255,0.5)]">
                <TwitchIcon className="w-6 h-6 text-[#9146ff] drop-shadow-[0_0_10px_rgba(145,70,255,0.9)] animate-pulse" />
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#00e5ff]/30 pb-5 gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
                {headerIcon}
                <div>
                    <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        {stage.title}
                    </h3>
                </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
                {linkedCount !== undefined && linkedCount > 0 && resetLinks && (
                    <button aria-label="Action" type="button"
                        onClick={resetLinks}
                        className="p-2 rounded-xl bg-black/70 border border-white/20 hover:border-white/40 text-gray-300 hover:text-white transition-colors cursor-pointer backdrop-blur-md flex items-center justify-center"
                        title="Reiniciar Altar"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                )}
                <div className="flex items-center gap-3 bg-black/60 border border-white/10 p-1.5 pl-3.5 pr-2 rounded-xl backdrop-blur-md">
                    <span className="flex items-center gap-2 text-xs font-mono font-bold text-gray-200 tracking-wider uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shrink-0" />
                        ESTACIÓN_{stage.id.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10.5px] font-mono font-medium text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/5">
                        {stage.year}
                    </span>
                </div>
            </div>
        </div>
    );
}

function getFeatureBgIcon(f: FeatureItem) {
    const titleLower = f.title.toLowerCase();
    if (titleLower.includes('forgotten')) {
        return (
            <div className="w-20 h-20">
                <Minecraft3DSkullCanvas size={80} />
            </div>
        );
    }
    if (titleLower.includes('ubuntu') || titleLower.includes('dedicated')) {
        return <Server className="w-16 h-16 text-white" />;
    }
    if (f.imageSrc) {
        return <img src={f.imageSrc} alt={f.title} className="w-16 h-16 object-contain" />;
    }
    if (f.icon) {
        return <f.icon className="w-16 h-16 text-white" />;
    }
    return <Sparkles className="w-16 h-16 text-white" />;
}

function getFeatureBadgeIcon(f: FeatureItem, brandColor: string) {
    const titleLower = f.title.toLowerCase();
    if (titleLower.includes('forgotten')) {
        return <Minecraft3DSkullCanvas size={44} className="w-full h-full" />;
    }
    if (titleLower.includes('ubuntu') || titleLower.includes('dedicated')) {
        return <Minecraft3DServerRackMiniCanvas />;
    }
    if (f.imageSrc) {
        return <img src={f.imageSrc} alt={f.title} className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]" />;
    }
    if (f.icon) {
        return <f.icon className="w-5 h-5" style={{ color: brandColor }} />;
    }
    return <Sparkles className="w-5 h-5" style={{ color: brandColor }} />;
}

function StageFeatures({ features }: Readonly<{ features: FeatureItem[] }>) {
    return (
        <div className="flex flex-wrap justify-center gap-5 pt-4 border-t border-white/10 relative z-10">
            {features.map((f, fIdx) => {
                const brandColor = f.brandColor || "#00e5ff";

                return (
                    <div 
                        key={`feature-${f.title}-${fIdx}`} 
                        className="p-5 rounded-2xl bg-[#0d0f14] border border-white/10 flex flex-col justify-between gap-4 transition-colors duration-300 relative overflow-hidden group shadow-xl hover:scale-[1.02] flex-1 min-w-60 max-w-85"
                        style={{
                            '--brand-color': brandColor,
                        } as React.CSSProperties}
                    >
                        <div className="absolute -right-3 -bottom-3 pointer-events-none transform scale-110 opacity-15 group-hover:opacity-35 transition-opacity">
                            {getFeatureBgIcon(f)}
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center p-1.5 shadow-md">
                                {getFeatureBadgeIcon(f, brandColor)}
                            </div>
                            <span 
                                className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border"
                                style={{ color: brandColor, backgroundColor: `${brandColor}20`, borderColor: `${brandColor}50` }}
                            >
                                {f.badgeText}
                            </span>
                        </div>
                        <div className="text-left relative z-10 space-y-1.5">
                            <h5 className="text-sm font-black text-white uppercase tracking-wide transition-colors group-hover:opacity-90">
                                {f.title}
                            </h5>
                            <p className="text-xs text-gray-400 leading-snug">{f.desc}</p>
                        </div>
                        <div 
                            className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-[0.001] group-hover:scale-x-100 transition-transform duration-300 origin-left"
                            style={{ backgroundColor: brandColor, boxShadow: `0 0 10px ${brandColor}` }}
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
function Stage1Card({ stage, floatingItems }: Readonly<{ stage: Stage; floatingItems: StageFloatingItem[] }>) {
    return (
        <div className="p-8 md:p-10 rounded-3xl bg-linear-to-b from-[#101726]/90 via-[#090d16]/95 to-[#05070c] border border-white/10 shadow-[0_0_50px_rgba(137,217,209,0.15)] relative overflow-hidden space-y-8">
            <div className="flex items-center justify-center pt-2 pb-4 relative z-10 pointer-events-none">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-black/60 border border-[#9146ff]/40 backdrop-blur-xl flex items-center justify-center p-5 shadow-[0_0_40px_rgba(145,70,255,0.3)] relative group overflow-hidden">
                    <div className="absolute inset-0 opacity-25 transition-opacity" style={{ background: `radial-gradient(circle, #9146ff 0%, transparent 70%)` }} />
                    <TwitchIcon className="w-14 h-14 text-[#9146ff] relative z-10 drop-shadow-[0_0_15px_rgba(145,70,255,0.8)] animate-pulse" />
                </div>
            </div>
            {floatingItems.map((item, idx) => (
                <FloatingItem key={item.pos} item={item} idx={idx} />
            ))}
            <StageHeader stage={stage} />
            <p className="text-gray-200 text-sm md:text-base leading-relaxed font-medium relative z-10 backdrop-blur-md p-5 sm:p-6 rounded-2xl bg-black/60 border border-white/10 shadow-2xl max-w-4xl mx-auto">
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
    { name: "KillubysmaliVT", xEnd: "12.5%", color: "#00637c", role: "Directora & Comunidad" },
    { name: "Neroferno ultranix", xEnd: "37.5%", color: "#ff00b7", role: "Dev Lead & Infra" },
    { name: "Xurlito", xEnd: "62.5%", color: "#00aeef", role: "Diseño & Arte Lead" },
    { name: "JAPA325", xEnd: "87.5%", color: "#000080", role: "QA & BetaTester" }
];

function Stage2Card({ stage, floatingItems }: Readonly<{ stage: Stage; floatingItems: StageFloatingItem[] }>) {
    const { t } = useTranslation();
    const [hoveredMember, setHoveredMember] = useState<string | null>(null);
    const [linkedMembers, setLinkedMembers] = useState<Set<string>>(new Set());
    const [dragActiveMember, setDragActiveMember] = useState<string | null>(null);
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

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
                        setLinkedMembers(prev => {
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

        window.addEventListener('pointermove', handleWindowPointerMove);
        window.addEventListener('pointerup', handleWindowPointerUp);

        return () => {
            window.removeEventListener('pointermove', handleWindowPointerMove);
            window.removeEventListener('pointerup', handleWindowPointerUp);
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
        setLinkedMembers(prev => {
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
        activeStaffColor = memberConfig.find(m => m.name === dragActiveMember)?.color || null;
    } else if (hoveredMember) {
        activeStaffColor = memberConfig.find(m => m.name === hoveredMember)?.color || null;
    }

    return (
        <div ref={cardRef} className="p-8 md:p-10 rounded-3xl bg-linear-to-b from-[#101726]/90 via-[#090d16]/95 to-[#05070c] border border-white/10 shadow-[0_0_50px_rgba(137,217,209,0.15)] relative overflow-hidden space-y-8 select-none">
            {/* 3D CANVAS BACKGROUND INTEGRATION FOR STAGE 02 */}
            <div className="absolute inset-0 opacity-100 pointer-events-none w-full h-full z-0 flex items-center justify-center">
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
            <div className="absolute inset-0 pointer-events-none z-20 block">
                <svg className="w-full h-full" overflow="visible">
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
                        {memberConfig.map(m => (
                            <linearGradient key={m.name} id={`plasma_grad_${m.name}`} x1="0%" y1="100%" x2="0%" y2="0%">
                                <stop offset="0%" stopColor={m.color} stopOpacity="0.9" />
                                <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                                <stop offset="100%" stopColor={m.color} stopOpacity="0.9" />
                            </linearGradient>
                        ))}

                        {/* 2-Color Drag Gradients */}
                        <linearGradient id="drag_grad_Neroferno ultranix" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#0b0b14" stopOpacity="1" />
                            <stop offset="100%" stopColor="#ff00b7" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id="drag_grad_KillubysmaliVT" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#00637c" stopOpacity="1" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id="drag_grad_Xurlito" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#00aeef" stopOpacity="1" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id="drag_grad_JAPA325" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                        </linearGradient>
                    </defs>

                    {/* Static Locked Energy Beams (3-Layer Plasma Streams + Traveling Particles) */}
                    {memberConfig.map(m => {
                        const isLinked = linkedMembers.has(m.name);
                        const isHovered = hoveredMember === m.name || dragActiveMember === m.name;

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
                                        filter: `drop-shadow(0 0 12px ${m.color})`
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
                                <circle r="4.5" fill="#ffffff" style={{ filter: `drop-shadow(0 0 12px ${m.color})` }}>
                                    <animateMotion path={pathD} dur="1.8s" repeatCount="indefinite" />
                                </circle>
                                <circle r="6.5" fill={m.color} opacity="0.75">
                                    <animateMotion path={pathD} dur="1.8s" begin="-0.6s" repeatCount="indefinite" />
                                </circle>
                                <circle r="3.5" fill="#ffffff">
                                    <animateMotion path={pathD} dur="1.8s" begin="-1.2s" repeatCount="indefinite" />
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
                        className="p-3 sm:p-4 rounded-2xl bg-black/90 border border-[#00e5ff]/50 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,229,255,0.3)] absolute top-20 left-1/2 z-30 max-w-md sm:max-w-lg w-[88%] text-center space-y-1.5 pointer-events-auto"
                    >
                        <div className="flex items-center justify-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#00e5ff] animate-pulse" />
                            <span className="text-[10px] font-mono font-black text-[#00e5ff] uppercase tracking-wider">
                                ✦ {t('history_section.stage2.banner_badge', 'EL ORIGEN DE NUESTRA MARCA & SERVIDOR')} ✦
                            </span>
                            <Sparkles className="w-3.5 h-3.5 text-[#00e5ff] animate-pulse" />
                        </div>
                        <p className="text-[11px] sm:text-xs text-gray-200 leading-snug font-medium">
                            {t('history_section.stage2.banner_text', 'Lo que comenzó como una gran amistad dio origen a algo maravilloso. CrystalTidesSMP no es solo un servidor o marca; es el reflejo de nuestro compromiso por construir un hogar digital transparente, creado con empatía y escuchando a nuestra comunidad.')}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* HERO 3D SHOWCASE SPACE, FLOATING STAFF BIO CARDS & INVISIBLE INTERACTIVE DROP ZONE */}
            <div className="min-h-95 sm:min-h-110 relative z-10 flex items-center justify-between pointer-events-auto px-2 sm:px-4 my-2">
                {/* LEFT COLUMN FLOATING BIO CARDS (Killu - Top, Nero - Bottom) */}
                <div className="hidden md:flex flex-col gap-4 z-10 w-60 sm:w-68">
                    {/* 1. KillubysmaliVT Floating Bio Card */}
                    <AnimatePresence>
                        {linkedMembers.has("KillubysmaliVT") && (
                            <motion.div
                                initial={{ opacity: 0, x: -30, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -30, scale: 0.9 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="p-3.5 rounded-2xl bg-black/85 border border-[#00637c]/60 backdrop-blur-xl shadow-[0_0_25px_rgba(0,99,124,0.3)] space-y-2 text-left"
                            >
                                <div className="flex items-center gap-2.5 border-b border-[#00637c]/30 pb-2">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-[#00637c] shrink-0 bg-slate-900">
                                        <MinecraftAvatar src="/skins/killu.png" alt="KillubysmaliVT" size={32} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <span className="text-[9px] font-mono font-black text-[#5eead4] uppercase tracking-wider block truncate">
                                            ✦ {t('history_section.members.killu.role', 'Directora & Comunidad')}
                                        </span>
                                        <h6 className="text-xs font-black text-white truncate">KillubysmaliVT</h6>
                                    </div>
                                </div>
                                <p className="text-[10.5px] text-gray-200 leading-snug font-medium">
                                    {t('history_section.members.killu.desc', 'Apasionada, alegre y el alma protectora de la Pecerita. Crea un ambiente acogedor, organiza eventos y guía con calidez humana.')}
                                </p>
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                    <span className="text-[8.5px] font-semibold px-2 py-0.5 rounded-md bg-[#00637c]/30 text-[#5eead4] border border-[#00637c]/40">{t('history_section.members.killu.tag1', 'Carismática')}</span>
                                    <span className="text-[8.5px] font-semibold px-2 py-0.5 rounded-md bg-[#00637c]/30 text-[#5eead4] border border-[#00637c]/40">{t('history_section.members.killu.tag2', 'Eventos')}</span>
                                    <span className="text-[8.5px] font-semibold px-2 py-0.5 rounded-md bg-[#00637c]/30 text-[#5eead4] border border-[#00637c]/40">{t('history_section.members.killu.tag3', 'Voz Principal')}</span>
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
                                className="p-3.5 rounded-2xl bg-black/85 border border-[#ff00b7]/60 backdrop-blur-xl shadow-[0_0_25px_rgba(255,0,183,0.3)] space-y-2 text-left"
                            >
                                <div className="flex items-center gap-2.5 border-b border-[#ff00b7]/30 pb-2">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-[#ff00b7] shrink-0 bg-slate-900">
                                        <MinecraftAvatar src="https://minotar.net/skin/344af588-8a7e-4053-9f03-92d68d96b86c" alt="Neroferno" size={32} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <span className="text-[9px] font-mono font-black text-[#e879f9] uppercase tracking-wider block truncate">
                                            ✦ {t('history_section.members.nero.role', 'Dev Lead & Infra')}
                                        </span>
                                        <h6 className="text-xs font-black text-white truncate">Neroferno ultranix</h6>
                                    </div>
                                </div>
                                <p className="text-[10.5px] text-gray-200 leading-snug font-medium">
                                    {t('history_section.members.nero.desc', 'Mente lógica e inyectado de euforia técnica. Obsesionado con el rendimiento del servidor, parches custom y código limpio sin fallos.')}
                                </p>
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                    <span className="text-[8.5px] font-semibold px-2 py-0.5 rounded-md bg-[#ff00b7]/30 text-[#e879f9] border border-[#ff00b7]/40">{t('history_section.members.nero.tag1', 'Euforia Técnica')}</span>
                                    <span className="text-[8.5px] font-semibold px-2 py-0.5 rounded-md bg-[#ff00b7]/30 text-[#e879f9] border border-[#ff00b7]/40">{t('history_section.members.nero.tag2', 'Infra Fullstack')}</span>
                                    <span className="text-[8.5px] font-semibold px-2 py-0.5 rounded-md bg-[#ff00b7]/30 text-[#e879f9] border border-[#ff00b7]/40">{t('history_section.members.nero.tag3', 'Cero Bugs')}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* CENTER SPACE & INVISIBLE DROP ZONE TARGET */}
                <div className="flex-1 flex items-center justify-center pointer-events-none">
                    <div 
                        ref={dropZoneRef}
                        className="w-48 h-48 rounded-full pointer-events-auto flex items-center justify-center"
                    />
                </div>

                {/* RIGHT COLUMN FLOATING BIO CARDS (Churly - Top, Japa - Bottom) */}
                <div className="hidden md:flex flex-col gap-4 z-10 w-60 sm:w-68">
                    {/* 3. Xurlito Floating Bio Card */}
                    <AnimatePresence>
                        {linkedMembers.has("Xurlito") && (
                            <motion.div
                                initial={{ opacity: 0, x: 30, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 30, scale: 0.9 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="p-3.5 rounded-2xl bg-black/85 border border-[#00aeef]/60 backdrop-blur-xl shadow-[0_0_25px_rgba(0,174,239,0.3)] space-y-2 text-left"
                            >
                                <div className="flex items-center gap-2.5 border-b border-[#00aeef]/30 pb-2">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-[#00aeef] shrink-0 bg-slate-900">
                                        <MinecraftAvatar src="/skins/churly.png" alt="Xurlito" size={32} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <span className="text-[9px] font-mono font-black text-[#38bdf8] uppercase tracking-wider block truncate">
                                            ✦ {t('history_section.members.churly.role', 'Diseño & Arte Lead')}
                                        </span>
                                        <h6 className="text-xs font-black text-white truncate">Xurlito</h6>
                                    </div>
                                </div>
                                <p className="text-[10.5px] text-gray-200 leading-snug font-medium">
                                    {t('history_section.members.churly.desc', 'Perfeccionista visual, creativo y visionario de la estética. Diseña interfaces, conceptos de arte e identidades visuales únicas.')}
                                </p>
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                    <span className="text-[8.5px] font-semibold px-2 py-0.5 rounded-md bg-[#00aeef]/30 text-[#38bdf8] border border-[#00aeef]/40">{t('history_section.members.churly.tag1', 'Visión Artística')}</span>
                                    <span className="text-[8.5px] font-semibold px-2 py-0.5 rounded-md bg-[#00aeef]/30 text-[#38bdf8] border border-[#00aeef]/40">{t('history_section.members.churly.tag2', 'UI/UX Lead')}</span>
                                    <span className="text-[8.5px] font-semibold px-2 py-0.5 rounded-md bg-[#00aeef]/30 text-[#38bdf8] border border-[#00aeef]/40">{t('history_section.members.churly.tag3', 'Estética Pulida')}</span>
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
                                className="p-3.5 rounded-2xl bg-black/85 border border-[#1d4ed8]/60 backdrop-blur-xl shadow-[0_0_25px_rgba(29,78,216,0.3)] space-y-2 text-left"
                            >
                                <div className="flex items-center gap-2.5 border-b border-[#1d4ed8]/30 pb-2">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-[#1d4ed8] shrink-0 bg-slate-900">
                                        <MinecraftAvatar src="JAPA325" alt="JAPA325" size={32} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <span className="text-[9px] font-mono font-black text-[#60a5fa] uppercase tracking-wider block truncate">
                                            ✦ {t('history_section.members.japa.role', 'QA & BETA TESTER')}
                                        </span>
                                        <h6 className="text-xs font-black text-white truncate">JAPA325</h6>
                                    </div>
                                </div>
                                <p className="text-[10.5px] text-gray-200 leading-snug font-medium">
                                    {t('history_section.members.japa.desc', 'Curioso, persistente e implacable buscando romper mecánicas para mejorarlas. El agente del caos a prueba de fallos personal de killu.')}
                                </p>
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                    <span className="text-[8.5px] font-semibold px-2 py-0.5 rounded-md bg-[#1d4ed8]/30 text-[#60a5fa] border border-[#1d4ed8]/40">{t('history_section.members.japa.tag1', 'Agente Caos')}</span>
                                    <span className="text-[8.5px] font-semibold px-2 py-0.5 rounded-md bg-[#1d4ed8]/30 text-[#60a5fa] border border-[#1d4ed8]/40">{t('history_section.members.japa.tag2', 'QA Tester')}</span>
                                    <span className="text-[8.5px] font-semibold px-2 py-0.5 rounded-md bg-[#1d4ed8]/30 text-[#60a5fa] border border-[#1d4ed8]/40">{t('history_section.members.japa.tag3', 'Gameplay Solid')}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* STAFF MEMBERS CARDS WITH DRAGGABLE ENERGY NODES */}
            {stage.members && (
                <div className="relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stage.members.map((m, mIdx) => {
                            const isHovered = hoveredMember === m.name || dragActiveMember === m.name;
                            const isLinked = linkedMembers.has(m.name);
                            const accentColor = m.color || stage.accentColor || "#89d9d1";

                            let cardStateClass = "opacity-45 grayscale contrast-75 bg-zinc-950/60";
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
                                    key={`staff-${m.name}-${mIdx}`}
                                    onHoverStart={() => setHoveredMember(m.name)}
                                    onHoverEnd={() => setHoveredMember(null)}
                                    className={`p-4 pt-6 rounded-2xl border backdrop-blur-md flex flex-col justify-between gap-3 transition-colors duration-300 relative group shadow-2xl ${cardStateClass}`}
                                    style={{
                                        borderColor: cardBorderColor,
                                        boxShadow: isLinked ? `0 0 30px ${accentColor}40` : "0 10px 30px rgba(0,0,0,0.8)"
                                    }}
                                >
                                    {/* CIRCULAR RPG/SCI-FI GAME ASSET GEM SOCKET (CIRCULO CON GEMA SALIDA DE RAYO) */}
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
                                        <button type="button"
                                            onPointerDown={(e) => handleNodePointerDown(m.name, e)}
                                            onClick={() => toggleMemberLink(m.name)}
                                            className={`w-11 h-11 rounded-full border-2 bg-linear-to-b from-[#1e293b] via-[#0f172a] to-[#020617] flex items-center justify-center transition-colors shadow-[0_6px_20px_rgba(0,0,0,0.9)] touch-none group/gem relative overflow-hidden ${
                                                isLinked ? "cursor-default select-none pointer-events-none" : "cursor-grab active:cursor-grabbing"
                                            }`}
                                            style={{
                                                borderColor: isLinked ? accentColor : "rgba(255, 255, 255, 0.3)",
                                                boxShadow: isLinked 
                                                    ? `0 0 20px ${accentColor}80, inset 0 0 10px ${accentColor}50` 
                                                    : "0 6px 15px rgba(0,0,0,0.8)"
                                            }}
                                            title={`Gema de Energía de ${m.name} (Arrastrar hacia el Faro)`}
                                        >
                                            {/* 4 Cardinal Accent Nodes on the Metallic Ring Frame */}
                                            <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60" />
                                            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60" />
                                            <span className="absolute left-0.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white/60" />
                                            <span className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white/60" />

                                            {/* CENTRAL FACETED ENERGY GEM CRYSTAL */}
                                            <div 
                                                className="w-5 h-5 rotate-45 rounded-xs border flex items-center justify-center relative overflow-hidden transition-colors duration-300"
                                                style={{
                                                    backgroundColor: isLinked ? accentColor : "rgba(30, 41, 59, 0.8)",
                                                    borderColor: isLinked ? "#ffffff" : "rgba(148, 163, 184, 0.4)",
                                                    boxShadow: isLinked ? `0 0 12px ${accentColor}` : "none"
                                                }}
                                            >
                                                {/* White Hot Pulsing Inner Light Core */}
                                                <span 
                                                    className={`w-2.5 h-2.5 rounded-full -rotate-45 ${isLinked ? "animate-ping bg-white" : "bg-slate-500/50"}`}
                                                    style={{ backgroundColor: isLinked ? "#ffffff" : "rgba(148, 163, 184, 0.5)" }}
                                                />
                                            </div>
                                        </button>
                                    </div>



                                    {/* MEMBER AVATAR & DETAILS */}
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-12 h-12 rounded-full overflow-hidden border-2 shrink-0 shadow-lg group-hover:scale-105 transition-colors duration-300 bg-slate-900 relative"
                                            style={{ borderColor: accentColor }}
                                        >
                                            <MinecraftAvatar 
                                                src={m.image || m.mc_nickname || m.avatar || m.name} 
                                                alt={m.name}
                                                size={48}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="overflow-hidden text-left flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                                <span 
                                                    className="text-sm font-black transition-colors leading-tight truncate"
                                                    style={{ color: isHovered ? accentColor : "#ffffff" }}
                                                >
                                                    {m.name}
                                                </span>
                                                {m.rankBadge && <img src={m.rankBadge} alt={m.role} className="h-3.5 object-contain shrink-0" />}
                                            </div>
                                            <span className="text-[10.5px] text-gray-300 font-bold block truncate">{m.role}</span>
                                            <span className="text-[9.5px] text-gray-400 italic block mt-0.5 leading-tight">{m.desc}</span>
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
    selectedPhotoModal
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
        <div className="p-8 md:p-10 rounded-3xl bg-linear-to-b from-[#101726]/90 via-[#090d16]/95 to-[#05070c] border border-white/10 shadow-[0_0_50px_rgba(137,217,209,0.15)] relative overflow-hidden space-y-8">
            <div className="absolute inset-0 opacity-100 pointer-events-none w-full h-full z-0 flex items-center justify-center">
                <Minecraft3DAltarCanvas stageId={3} accentColor={stage.accentColor} />
            </div>
            {floatingItems.map((item, idx) => (
                <FloatingItem key={item.pos} item={item} idx={idx} />
            ))}
            <StageHeader stage={stage} />
            <div className="flex justify-center my-2.5 relative z-20 pointer-events-auto">
                <motion.button 
                    type="button"
                    onClick={() => setShowWitherVideo(true)}
                    animate={{ y: [-2, 3, -2] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#ef4444]/25 border border-[#ef4444]/60 backdrop-blur-xl shadow-[0_0_25px_rgba(239,68,68,0.4)] group hover:scale-105 hover:bg-[#ef4444]/40 transition-colors cursor-pointer"
                >
                    <div className="w-8 h-8 rounded-xl border border-[#ef4444] bg-[#ef4444]/40 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                    <div className="overflow-hidden text-left">
                        <span className="text-[9.5px] font-mono font-black text-[#ef4444] uppercase tracking-wider block truncate">
                            {t('history_section.stage3.live_combat', '🔴 VER REGISTRO DE COMBATE EN VIVO')}
                        </span>
                        <h6 className="text-xs font-black text-white truncate">{t('history_section.stage3.wither_boss', 'Wither Terror Boss Fight')}</h6>
                    </div>
                </motion.button>
            </div>
            <div className="min-h-60 sm:min-h-70 relative z-10 flex items-center justify-between pointer-events-auto px-2 sm:px-4 my-2">
                <div className="hidden md:flex flex-col gap-3.5 z-10 w-52 sm:w-60">
                    <motion.div whileHover={{ scale: 1.05 }} onClick={() => setSelectedPhotoModal("/images/memories/memory_1.jfif")} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedPhotoModal("/images/memories/memory_1.jfif"); } }} className="flex items-center gap-3 p-2.5 rounded-2xl bg-black/80 border border-[#00e5ff]/40 backdrop-blur-xl shadow-[0_0_20px_rgba(0,229,255,0.2)] group hover:border-[#00e5ff] transition-colors cursor-pointer">
                        <div className="w-14 h-11 rounded-xl border border-[#00e5ff]/50 overflow-hidden shrink-0 shadow-md relative bg-slate-900"><img src="/images/memories/memory_1.jfif" alt="Ciudadela Nether" className="w-full h-full object-cover group-hover:scale-110 transition-transform" /></div>
                        <div className="overflow-hidden text-left min-w-0"><span className="text-[9px] font-mono font-black text-[#00e5ff] uppercase tracking-wider block truncate">{t('history_section.stage3.nether_raid', 'NETHER RAID')}</span><h6 className="text-xs font-black text-white truncate">{t('history_section.stage3.nether_citadel', 'Ciudadela Nether')}</h6></div>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} onClick={() => setSelectedPhotoModal("/images/memories/memory_4.png")} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedPhotoModal("/images/memories/memory_4.png"); } }} className="flex items-center gap-3 p-2.5 rounded-2xl bg-black/80 border border-[#a855f7]/40 backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.2)] group hover:border-[#a855f7] transition-colors cursor-pointer">
                        <div className="w-14 h-11 rounded-xl border border-[#a855f7]/50 overflow-hidden shrink-0 shadow-md relative bg-slate-900"><img src="/images/memories/memory_4.png" alt="Bosque Sakura" className="w-full h-full object-cover group-hover:scale-110 transition-transform" /></div>
                        <div className="overflow-hidden text-left min-w-0"><span className="text-[9px] font-mono font-black text-[#a855f7] uppercase tracking-wider block truncate">{t('history_section.stage3.community', 'COMUNIDAD')}</span><h6 className="text-xs font-black text-white truncate">{t('history_section.stage3.sakura_forest', 'Bosque Sakura')}</h6></div>
                    </motion.div>
                </div>
                <div className="flex-1 pointer-events-none" />
                <div className="hidden md:flex flex-col gap-3.5 z-10 w-52 sm:w-60">
                    <motion.div whileHover={{ scale: 1.05 }} onClick={() => setSelectedPhotoModal("/images/memories/memory_2.jfif")} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedPhotoModal("/images/memories/memory_2.jfif"); } }} className="flex items-center gap-3 p-2.5 rounded-2xl bg-black/80 border border-[#ef4444]/40 backdrop-blur-xl shadow-[0_0_20px_rgba(239,68,68,0.2)] group hover:border-[#ef4444] transition-colors cursor-pointer">
                        <div className="w-14 h-11 rounded-xl border border-[#ef4444]/50 overflow-hidden shrink-0 shadow-md relative bg-slate-900"><img src="/images/memories/memory_2.jfif" alt="Batalla Nether" className="w-full h-full object-cover group-hover:scale-110 transition-transform" /></div>
                        <div className="overflow-hidden text-left min-w-0"><span className="text-[9px] font-mono font-black text-[#ef4444] uppercase tracking-wider block truncate">{t('history_section.stage3.showdown', 'ENFRENTAMIENTO')}</span><h6 className="text-xs font-black text-white truncate">{t('history_section.stage3.nether_battle', 'Batalla Nether')}</h6></div>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} onClick={() => setSelectedPhotoModal("/images/memories/memory_3.png")} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedPhotoModal("/images/memories/memory_3.png"); } }} className="flex items-center gap-3 p-2.5 rounded-2xl bg-black/80 border border-[#10b981]/40 backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] group hover:border-[#10b981] transition-colors cursor-pointer">
                        <div className="w-14 h-11 rounded-xl border border-[#10b981]/50 overflow-hidden shrink-0 shadow-md relative bg-slate-900"><img src="/images/memories/memory_3.png" alt="Gran Bóveda" className="w-full h-full object-cover group-hover:scale-110 transition-transform" /></div>
                        <div className="overflow-hidden text-left min-w-0"><span className="text-[9px] font-mono font-black text-[#10b981] uppercase tracking-wider block truncate">{t('history_section.stage3.economy', 'ECONOMÍA')}</span><h6 className="text-xs font-black text-white truncate">{t('history_section.stage3.grand_vault', 'Gran Bóveda')}</h6></div>
                    </motion.div>
                </div>
            </div>
            <p className="text-gray-200 text-sm md:text-base leading-relaxed font-medium relative z-10 backdrop-blur-md p-5 sm:p-6 rounded-2xl bg-black/60 border border-white/10 shadow-2xl max-w-4xl mx-auto">
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
                        className="absolute inset-0 z-40 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 pointer-events-auto rounded-3xl"
                        onClick={() => setShowWitherVideo(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-4xl rounded-3xl bg-[#090b10] border border-[#ef4444]/50 shadow-[0_0_60px_rgba(239,68,68,0.35)] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#ef4444]/20 bg-black/60">
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-[#ef4444] animate-ping" />
                                    <div className="text-left">
                                        <span className="text-[10px] font-mono font-black text-[#ef4444] uppercase tracking-wider block">🔴 REGISTRO DE COMBATE EN VIVO</span>
                                        <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">Forgotten Terror Wither Boss Fight</h4>
                                    </div>
                                </div>
                                <button aria-label="Action"
                                    type="button"
                                    onClick={() => setShowWitherVideo(false)}
                                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#ef4444] text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
                                >
                                    <X className="w-5 h-5" />
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
                                    className="w-full h-full object-cover"
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
                        className="absolute inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 pointer-events-auto rounded-3xl"
                        onClick={() => setSelectedPhotoModal(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative max-w-3xl w-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button aria-label="Action"
                                type="button"
                                onClick={() => setSelectedPhotoModal(null)}
                                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-white/20 transition-colors border border-white/20 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <img src={selectedPhotoModal} alt="Memoria Minecraft" className="w-full h-auto max-h-[70vh] object-contain mx-auto" />
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
function Stage4Card({ stage, floatingItems }: Readonly<{ stage: Stage; floatingItems: StageFloatingItem[] }>) {
    const { t } = useTranslation();
    return (
        <div className="p-8 md:p-10 rounded-3xl bg-linear-to-b from-[#101726]/90 via-[#090d16]/95 to-[#05070c] border border-white/10 shadow-[0_0_50px_rgba(233,84,32,0.15)] relative overflow-hidden space-y-8">
            <div className="absolute inset-0 opacity-100 pointer-events-none w-full h-full z-0 flex items-center justify-center">
                <Minecraft3DServerRackCanvas accentColor={stage.accentColor} />
            </div>
            {floatingItems.map((item, idx) => (
                <FloatingItem key={item.pos} item={item} idx={idx} />
            ))}
            <StageHeader stage={stage} />
            <div className="min-h-60 sm:min-h-70 relative z-10 flex items-center justify-between pointer-events-auto px-2 sm:px-4 my-2">
                <div className="hidden md:flex flex-col gap-3.5 z-10 w-fit max-w-85 shrink-0">
                    <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 p-2.5 rounded-2xl bg-black/80 border border-[#e95420]/40 backdrop-blur-xl shadow-[0_0_20px_rgba(233,84,32,0.2)] group hover:border-[#e95420] transition-colors cursor-default">
                        <div className="w-11 h-11 rounded-xl border border-[#e95420]/50 overflow-hidden shrink-0 shadow-md relative bg-slate-900/80 flex items-center justify-center p-1"><img src="/images/items/Impulse_Command_Block_JE1.png" alt="Nuevo Hosting" className="w-full h-full object-contain" /></div>
                        <div className="text-left whitespace-nowrap min-w-0 pr-1"><span className="text-[9px] font-mono font-black text-[#e95420] uppercase tracking-wider block">{t('history_section.stage4.new_hosting', 'NUEVO HOSTING')}</span><h6 className="text-xs font-black text-white">{t('history_section.stage4.ubuntu_tps', 'Ubuntu 20 TPS Sostenidos')}</h6></div>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 p-2.5 rounded-2xl bg-black/80 border border-[#10b981]/40 backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] group hover:border-[#10b981] transition-colors cursor-default">
                        <div className="w-11 h-11 rounded-xl border border-[#10b981]/50 overflow-hidden shrink-0 shadow-md relative bg-slate-900/80 flex items-center justify-center p-1"><img src="/images/items/xp_bottle.webp" alt="Recompensas Diarias" className="w-full h-full object-contain" /></div>
                        <div className="text-left whitespace-nowrap min-w-0 pr-1"><span className="text-[9px] font-mono font-black text-[#10b981] uppercase tracking-wider block">{t('history_section.stage4.daily_rewards', 'RECOMPENSAS DIARIAS')}</span><h6 className="text-xs font-black text-white">{t('history_section.stage4.daily_loot', 'Premios & Loot por Entrar')}</h6></div>
                    </motion.div>
                </div>
                <div className="flex-1 pointer-events-none" />
                <div className="hidden md:flex flex-col gap-3.5 z-10 w-fit max-w-85 shrink-0">
                    <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 p-2.5 rounded-2xl bg-black/80 border border-[#00e5ff]/40 backdrop-blur-xl shadow-[0_0_20px_rgba(0,229,255,0.2)] group hover:border-[#00e5ff] transition-colors cursor-default">
                        <div className="w-11 h-11 rounded-xl border border-[#00e5ff]/50 overflow-hidden shrink-0 shadow-md relative bg-slate-900/80 flex items-center justify-center p-1"><img src="/images/items/enchanted_book.gif" alt="Nuevas Estadisticas" className="w-full h-full object-contain" /></div>
                        <div className="text-left whitespace-nowrap min-w-0 pr-1"><span className="text-[9px] font-mono font-black text-[#00e5ff] uppercase tracking-wider block">{t('history_section.stage4.new_stats', 'NUEVAS ESTADÍSTICAS')}</span><h6 className="text-xs font-black text-white">{t('history_section.stage4.live_metrics', 'Métricas & Kills en Vivo')}</h6></div>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 p-2.5 rounded-2xl bg-black/80 border border-[#a855f7]/40 backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.2)] group hover:border-[#a855f7] transition-colors cursor-default">
                        <div className="w-11 h-11 rounded-xl border border-[#a855f7]/50 overflow-hidden shrink-0 shadow-md relative bg-slate-900/80 flex items-center justify-center p-1"><img src="/images/killucoin.png" alt="Economia Mejorada" className="w-full h-full object-contain" /></div>
                        <div className="text-left whitespace-nowrap min-w-0 pr-1"><span className="text-[9px] font-mono font-black text-[#a855f7] uppercase tracking-wider block">{t('history_section.stage4.improved_economy', 'ECONOMÍA MEJORADA')}</span><h6 className="text-xs font-black text-white">{t('history_section.stage4.economy_system', 'Sistema de economía mejorado')}</h6></div>
                    </motion.div>
                </div>
            </div>
            <p className="text-gray-200 text-sm md:text-base leading-relaxed font-medium relative z-10 backdrop-blur-md p-5 sm:p-6 rounded-2xl bg-black/60 border border-white/10 shadow-2xl max-w-4xl mx-auto">
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
    <div className="text-center space-y-3 relative z-10">
        <div className="flex justify-center"><SkeletonBone className="h-6 w-36 rounded-full border border-white/5" /></div>
        <div className="flex justify-center"><SkeletonBone className="h-9 w-72 rounded-xl" /></div>
        <div className="flex justify-center"><SkeletonBone className="h-5 w-56 rounded-lg" /></div>
    </div>
);

const SkeletonNarrativeBlock = () => (
    <div className="relative z-10 backdrop-blur-md p-5 sm:p-6 rounded-2xl bg-black/40 border border-white/8 shadow-2xl max-w-4xl mx-auto space-y-2.5">
        <SkeletonBone className="h-3.5 w-full rounded" />
        <SkeletonBone className="h-3.5 w-11/12 rounded" />
        <SkeletonBone className="h-3.5 w-4/5 rounded" />
    </div>
);

const SkeletonFeaturesBlock = ({ count = 2 }: { count?: number }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 max-w-4xl mx-auto">
        {Array.from({ length: count }, (_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-black/50 border border-white/8 backdrop-blur-xl flex items-start gap-4">
                <SkeletonBone className="w-12 h-12 rounded-xl border border-white/5 shrink-0" />
                <div className="space-y-2 flex-1">
                    <SkeletonBone className="h-2 w-16 rounded" />
                    <SkeletonBone className="h-4 w-32 rounded" />
                    <SkeletonBone className="h-3 w-full rounded" />
                </div>
            </div>
        ))}
    </div>
);

const SkeletonFloatingCard = ({ thumbW = "w-14", thumbH = "h-11" }: { thumbW?: string; thumbH?: string }) => (
    <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-black/60 border border-white/8 backdrop-blur-xl">
        <SkeletonBone className={`${thumbW} ${thumbH} rounded-xl border border-white/5 shrink-0`} />
        <div className="space-y-1.5 flex-1">
            <SkeletonBone className="h-2.5 w-20 rounded" />
            <SkeletonBone className="h-3.5 w-28 rounded" />
        </div>
    </div>
);

/* ── Stage 1 Skeleton: Centered Twitch icon → Header → Narrative → 2 Features ── */
const Stage1Skeleton = () => (
    <div className="p-8 md:p-10 rounded-3xl bg-linear-to-b from-[#101726]/90 via-[#090d16]/95 to-[#05070c] border border-white/10 shadow-[0_0_50px_rgba(137,217,209,0.1)] relative overflow-hidden space-y-8 animate-pulse">
        {/* Centered icon box (Twitch) */}
        <div className="flex items-center justify-center pt-2 pb-4 relative z-10">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-black/60 border border-[#9146ff]/20 backdrop-blur-xl flex items-center justify-center">
                <SkeletonBone className="w-14 h-14 rounded-xl" />
            </div>
        </div>
        <SkeletonHeaderBlock />
        <SkeletonNarrativeBlock />
        <SkeletonFeaturesBlock count={2} />
    </div>
);

/* ── Stage 2 Skeleton: Header → Bio cards left | Beacon center | Bio cards right → 4-member grid ── */
const Stage2Skeleton = () => (
    <div className="p-8 md:p-10 rounded-3xl bg-linear-to-b from-[#101726]/90 via-[#090d16]/95 to-[#05070c] border border-white/10 shadow-[0_0_50px_rgba(137,217,209,0.1)] relative overflow-hidden space-y-8 animate-pulse">
        <SkeletonHeaderBlock />
        {/* 3-column: bio cards | beacon | bio cards */}
        <div className="min-h-60 sm:min-h-70 relative z-10 flex items-center justify-between px-2 sm:px-4 my-2">
            {/* Left bio cards */}
            <div className="hidden md:flex flex-col gap-4 z-10 w-60 sm:w-68">
                {[1, 2].map(i => (
                    <div key={i} className="p-3.5 rounded-2xl bg-black/60 border border-white/8 backdrop-blur-xl space-y-2">
                        <div className="flex items-center gap-2.5 border-b border-white/5 pb-2">
                            <SkeletonBone className="w-8 h-8 rounded-full shrink-0" />
                            <div className="space-y-1 flex-1">
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
            <div className="flex-1 flex items-center justify-center pointer-events-none">
                <SkeletonBone className="w-48 h-48 rounded-full border border-white/5" />
            </div>
            {/* Right bio cards */}
            <div className="hidden md:flex flex-col gap-4 z-10 w-60 sm:w-68">
                {[1, 2].map(i => (
                    <div key={i} className="p-3.5 rounded-2xl bg-black/60 border border-white/8 backdrop-blur-xl space-y-2">
                        <div className="flex items-center gap-2.5 border-b border-white/5 pb-2">
                            <SkeletonBone className="w-8 h-8 rounded-full shrink-0" />
                            <div className="space-y-1 flex-1">
                                <SkeletonBone className="h-2 w-20 rounded" />
                                <SkeletonBone className="h-3 w-16 rounded" />
                            </div>
                        </div>
                        <SkeletonBone className="h-3 w-full rounded" />
                        <SkeletonBone className="h-3 w-3/4 rounded" />
                        <div className="flex gap-1 pt-0.5">
                            <SkeletonBone className="h-4 w-16 rounded-md" />
                            <SkeletonBone className="h-4 w-14 rounded-md" />
                            <SkeletonBone className="h-4 w-18 rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
        {/* 4 member cards grid */}
        <div className="relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-4 pt-6 rounded-2xl bg-zinc-950/60 border border-white/8 backdrop-blur-md flex flex-col gap-3 relative">
                        {/* Gem socket */}
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30">
                            <SkeletonBone className="w-11 h-11 rounded-full border-2 border-white/10" />
                        </div>
                        {/* Avatar + details */}
                        <div className="flex items-center gap-3">
                            <SkeletonBone className="w-12 h-12 rounded-full shrink-0 border-2 border-white/10" />
                            <div className="space-y-1.5 flex-1">
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
    <div className="p-8 md:p-10 rounded-3xl bg-linear-to-b from-[#101726]/90 via-[#090d16]/95 to-[#05070c] border border-white/10 shadow-[0_0_50px_rgba(137,217,209,0.1)] relative overflow-hidden space-y-8 animate-pulse">
        {/* 3D bg glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full bg-[#89d9d1]/5 blur-3xl" />
        </div>
        <SkeletonHeaderBlock />
        {/* Video button placeholder */}
        <div className="flex justify-center my-2.5 relative z-20">
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-black/60 border border-white/8 backdrop-blur-xl">
                <SkeletonBone className="w-8 h-8 rounded-xl shrink-0" />
                <div className="space-y-1">
                    <SkeletonBone className="h-2.5 w-36 rounded" />
                    <SkeletonBone className="h-3.5 w-28 rounded" />
                </div>
            </div>
        </div>
        {/* 3-column: photo cards | 3D | photo cards */}
        <div className="min-h-60 sm:min-h-70 relative z-10 flex items-center justify-between px-2 sm:px-4 my-2">
            <div className="hidden md:flex flex-col gap-3.5 z-10 w-52 sm:w-60">
                <SkeletonFloatingCard />
                <SkeletonFloatingCard />
            </div>
            <div className="flex-1 pointer-events-none" />
            <div className="hidden md:flex flex-col gap-3.5 z-10 w-52 sm:w-60">
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
    <div className="p-8 md:p-10 rounded-3xl bg-linear-to-b from-[#101726]/90 via-[#090d16]/95 to-[#05070c] border border-white/10 shadow-[0_0_50px_rgba(233,84,32,0.1)] relative overflow-hidden space-y-8 animate-pulse">
        {/* 3D bg glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full bg-[#e95420]/5 blur-3xl" />
        </div>
        <SkeletonHeaderBlock />
        {/* 3-column: feature pills | 3D | feature pills */}
        <div className="min-h-60 sm:min-h-70 relative z-10 flex items-center justify-between px-2 sm:px-4 my-2">
            <div className="hidden md:flex flex-col gap-3.5 z-10 w-fit max-w-85 shrink-0">
                <SkeletonFloatingCard thumbW="w-11" thumbH="h-11" />
                <SkeletonFloatingCard thumbW="w-11" thumbH="h-11" />
            </div>
            <div className="flex-1 pointer-events-none" />
            <div className="hidden md:flex flex-col gap-3.5 z-10 w-fit max-w-85 shrink-0">
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
    const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);

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
            stageName: t('history_section.stage1.stageName', 'ESTACIÓN 01'),
            title: t('history_section.stage1.title', 'La Pecerita de los Killufishies'),
            subtitle: t('history_section.stage1.subtitle', 'El Origen de la Comunidad en Twitch'),
            badge: t('history_section.stage1.badge', '✦ EL ORIGEN'),
            accentColor: "#89d9d1",
            icon: TwitchIcon,
            narrativeSummary: t('history_section.stage1.summary', 'El nacimiento de nuestra historia en los streams de Twitch de Killu: un espacio dedicado al arte, la ilustración y las primeras noches de juego casual.'),
            features: [
                { icon: TwitchIcon, title: t('history_section.stage1.f1_title', 'Streams de Ilustración'), desc: t('history_section.stage1.f1_desc', 'Comunidad activa de dibujo & fanart'), badgeText: "TWITCH", brandColor: "#9146ff" },
                { icon: DiscordIcon, title: t('history_section.stage1.f2_title', 'Noches de Minijuegos'), desc: t('history_section.stage1.f2_desc', 'Primeros momentos de chill & gaming'), badgeText: "COMMUNITY", brandColor: "#5865f2" }
            ]
        },
        {
            id: 2,
            year: "2023",
            stageName: t('history_section.stage2.stageName', 'ESTACIÓN 02'),
            title: t('history_section.stage2.title', 'Creación del staff'),
            subtitle: t('history_section.stage2.subtitle', 'Formación del Núcleo de Desarrollo, Arte y QA'),
            badge: t('history_section.stage2.badge', '✦ NÚCLEO STAFF'),
            accentColor: "#89d9d1",
            imageSrc: "/images/items/Beacon_JE6_BE2.webp",
            narrativeSummary: t('history_section.stage2.summary', 'Se forma el equipo oficial: Killu en la voz y comunidad, Nero en la arquitectura técnica e infraestructura, Churly en el diseño de interfaz y Japa en el testing de juego.'),
            members: [
                { 
                    name: "KillubysmaliVT", 
                    role: t('history_section.members.killu.role', 'Directora & Comunidad'), 
                    image: "/skins/killu.png",
                    mc_nickname: "KillubysmaliVT",
                    rankBadge: "/ranks/rank-killu.png",
                    color: "#00637c",
                    desc: t('history_section.members.killu.desc', 'Líder comunitaria y streamer. El corazón de la Pecerita.')
                },
                { 
                    name: "Neroferno ultranix", 
                    role: t('history_section.members.nero.role', 'Dev Lead & Infra'), 
                    image: "https://minotar.net/skin/344af588-8a7e-4053-9f03-92d68d96b86c",
                    mc_nickname: "Neroferno",
                    rankBadge: "/ranks/rank-neroferno.png",
                    color: "#ff00b7",
                    desc: t('history_section.members.nero.desc', 'Co-fundador. Arquitectura de código, MySQL/Redis y parches.')
                },
                { 
                    name: "Xurlito", 
                    role: t('history_section.members.churly.role', 'Diseño & Arte Lead'), 
                    image: "/skins/churly.png",
                    mc_nickname: "Xurlito",
                    rankBadge: "/ranks/developer.png",
                    color: "#00aeef",
                    desc: t('history_section.members.churly.desc', 'Artista principal. Dirección gráfica y estética pulida.')
                },
                { 
                    name: "JAPA325", 
                    role: t('history_section.members.japa.role', 'QA & BetaTester'), 
                    image: "JAPA325",
                    mc_nickname: "JAPA325",
                    rankBadge: "/ranks/staff.png",
                    color: "#000080",
                    desc: t('history_section.members.japa.desc', 'Consultor de juego. El agente del caos a prueba de fallos.')
                }
            ]
        },
        {
            id: 3,
            year: "Nov 2024",
            stageName: t('history_section.stage3.stageName', 'ESTACIÓN 03'),
            title: t('history_section.stage3.title', 'Evolución a CrystalTides SMP'),
            subtitle: t('history_section.stage3.subtitle', 'Sistema RPG, Economía VIVA & Bosses del Nether'),
            badge: t('history_section.stage3.badge', '✦ EVOLUCIÓN'),
            accentColor: "#89d9d1",
            imageSrc: "/logo.png",
            narrativeSummary: t('history_section.stage3.summary', 'La pecerita fue renombrada como CrystalTidesSMP, un servidor nuevo con mecánicas nuevas y bosses increíbles.'),
            features: [
                { imageSrc: "/images/items/Iron_Sword_JE2_BE2.png", title: t('history_section.stage3.f1_title', 'Habilidades mcMMO'), desc: t('history_section.stage3.f1_desc', 'Sistema RPG completo de maestrías & combate'), badgeText: "MCMMO CORE", brandColor: "#f59e0b" },
                { imageSrc: "/images/killucoin.png", title: t('history_section.stage3.f2_title', 'Economía Killupesos'), desc: t('history_section.stage3.f2_desc', 'Se originó el futuro sistema de economía con 7 monedas de cambio'), badgeText: "ECONOMY", brandColor: "#10b981" },
                { imageSrc: "/images/items/Wither_Skeleton_Skull_(S)_JE2.png", title: t('history_section.stage3.f3_title', 'Forgotten Terror Boss'), desc: t('history_section.stage3.f3_desc', 'Mazmorra semanal y combates en el Nether'), badgeText: "DUNGEON", brandColor: "#ef4444", videoUrl: "https://x.com/NeroSecretsAlt/status/1859128432702918841?s=20" },
                { imageSrc: "/images/items/Waystone_Structure.png", title: t('history_section.stage3.f4_title', 'Red de Waystones'), desc: t('history_section.stage3.f4_desc', 'Teletransporte e hitos del mapa survival'), badgeText: "MAP", brandColor: "#06b6d4" }
            ]
        },
        {
            id: 4,
            year: "2025 - 2026",
            stageName: t('history_section.stage4.stageName', 'ESTACIÓN 04'),
            title: t('history_section.stage4.title', 'Era Dedicada & Launcher'),
            subtitle: t('history_section.stage4.subtitle', 'Servidores Dedicados, Dominio Oficial y Futuro'),
            badge: t('history_section.stage4.badge', '✦ ERA DEDICADA'),
            accentColor: "#89d9d1",
            imageSrc: "/images/items/Impulse_Command_Block_JE1.png",
            narrativeSummary: t('history_section.stage4.summary', 'Migración a infraestructura profesional en servidores dedicados Ubuntu Server (MySQL, Redis, nodos distribuidos), dominio oficial y Launcher Beta.'),
            features: [
                { imageSrc: "/images/items/server_rack_icon.png", title: t('history_section.stage4.f1_title', 'Dedicated Ubuntu Node'), desc: t('history_section.stage4.f1_desc', '20 TPS constantes y nodos distribuidos'), badgeText: "INFRA", brandColor: "#e95420" },
                { imageSrc: "/images/server_icon.png", title: t('history_section.stage4.f2_title', 'Mc.CrystalTidesSMP.net'), desc: t('history_section.stage4.f2_desc', 'Dominio oficial de conexión directa'), badgeText: "DOMINIO", brandColor: "#00e5ff" },
                { imageSrc: "/images/items/Shield_JE2_BE1.webp", title: t('history_section.stage4.f3_title', 'Launcher Oficial Beta'), desc: t('history_section.stage4.f3_desc', 'Entrada optimizada al juego en 1-Click'), badgeText: "CLIENT", brandColor: "#a855f7" }
            ]
        }
    ];

    const activeStage = stages.find(s => s.id === activeStageId) || stages[0];
    const currentFloatingItems = STAGE_FLOATING_ITEMS[activeStage.id] || STAGE_FLOATING_ITEMS[1];

    return (
        <Section 
            title={
                <div className="flex items-center justify-center gap-3">
                    <History className="text-(--accent) text-3xl" /> 
                    <span className="uppercase tracking-widest text-white">{t('history_section.title', 'Historia de CrystalTides SMP')}</span>
                </div>
            }
        >
            <div className="max-w-6xl mx-auto px-4 space-y-10">
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-medium max-w-3xl mx-auto text-center opacity-90">
                    {t('history_section.desc', 'Bienvenid@ a la historia de CrystalTides SMP, aquí podrás ver las etapas del proyecto')}
                </p>

                <div className="relative py-6 px-4 bg-[#0b0c10]/90 border border-white/10 rounded-3xl backdrop-blur-2xl shadow-2xl overflow-hidden">
                    <div className="absolute top-1/2 left-10 right-10 -translate-y-1/2 h-0.5 bg-linear-to-r from-[#168c80]/40 via-[#89d9d1]/60 to-[#168c80]/40 opacity-40 rounded-full pointer-events-none" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                        {stages.map((stg) => {
                            const isSelected = activeStageId === stg.id;
                            const IconComponent = stg.icon;

                            let iconStyleClass = "bg-white/5 border-white/10 text-gray-400";
                            if (isSelected) {
                                if (stg.id === 1) {
                                    iconStyleClass = "bg-[#9146ff]/20 border-[#9146ff]/50 text-[#9146ff] shadow-[0_0_12px_rgba(145,70,255,0.4)]";
                                } else {
                                    iconStyleClass = "bg-[#89d9d1]/20 border-[#89d9d1]/40 text-[#89d9d1]";
                                }
                            }

                            let iconContent = null;
                            if (stg.imageSrc) {
                                iconContent = <img src={stg.imageSrc} alt={stg.title} className="w-5 h-5 object-contain" />;
                            } else if (IconComponent) {
                                const extraStyle = isSelected && stg.id === 1 ? 'text-[#9146ff] drop-shadow-[0_0_8px_rgba(145,70,255,0.8)]' : '';
                                iconContent = <IconComponent className={`w-5 h-5 ${extraStyle}`} />;
                            }

                            const dotClass = isSelected ? "bg-[#89d9d1] animate-pulse shadow-[0_0_8px_#89d9d1]" : "bg-gray-600 opacity-30";

                            return (
                                <button
                                    key={stg.id}
                                    type="button"
                                    onClick={() => handleStageSelect(stg.id)}
                                    className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group flex flex-col justify-between ${
                                        isSelected 
                                            ? "bg-black/90 border-[#89d9d1] shadow-[0_0_25px_rgba(137,217,209,0.25)] scale-[1.02]" 
                                            : "bg-[#0a0d14]/70 border-white/10 hover:border-white/20 hover:bg-black/50"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span 
                                            className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border"
                                            style={{
                                                color: stg.accentColor,
                                                backgroundColor: `${stg.accentColor}15`,
                                                borderColor: `${stg.accentColor}40`
                                            }}
                                        >
                                            {stg.stageName}
                                        </span>
                                        <span className="text-xs font-mono font-black text-gray-400">
                                            {stg.year}
                                        </span>
                                    </div>

                                    <div className="flex items-start gap-3 my-1">
                                        <div className={`p-2 rounded-xl border shrink-0 transition-transform group-hover:scale-110 flex items-center justify-center mt-0.5 ${iconStyleClass}`}>
                                            {iconContent}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-black text-white uppercase tracking-tight leading-snug group-hover:text-[#89d9d1] transition-colors wrap-break-word">
                                                {stg.title}
                                            </h4>
                                            <p className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5 wrap-break-word">
                                                {stg.subtitle}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end pt-1 border-t border-white/5">
                                        <div className={`w-2.5 h-2.5 rounded-full transition-colors ${dotClass}`} />
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
                            <motion.div key={1} initial={{ opacity: 0, scale: 0.98, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -15 }} transition={{ duration: 0.3 }} className="relative text-left transition-colors duration-500">
                                <Stage1Card stage={activeStage} floatingItems={currentFloatingItems} />
                            </motion.div>
                        )}
                        {activeStageId === 2 && (
                            <motion.div key={2} initial={{ opacity: 0, scale: 0.98, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -15 }} transition={{ duration: 0.3 }} className="relative text-left transition-colors duration-500">
                                <Stage2Card stage={activeStage} floatingItems={currentFloatingItems} />
                            </motion.div>
                        )}
                        {activeStageId === 3 && (
                            <motion.div key={3} initial={{ opacity: 0, scale: 0.98, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -15 }} transition={{ duration: 0.3 }} className="relative text-left transition-colors duration-500">
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
                            <motion.div key={4} initial={{ opacity: 0, scale: 0.98, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -15 }} transition={{ duration: 0.3 }} className="relative text-left transition-colors duration-500">
                                <Stage4Card stage={activeStage} floatingItems={currentFloatingItems} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Skeleton>
            </div>
        </Section>
    );
}

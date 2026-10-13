import { useState, useRef, useEffect } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Minecraft3DAltarCanvas } from '../Minecraft3DAltarCanvas';
import { Stage2HolographicBeams } from './Stage2HolographicBeams';
import { Stage2StaffBios } from './Stage2StaffBios';
import { Stage2StaffGrid } from './Stage2StaffGrid';
import { FloatingItem, StageHeader } from './StageSharedComponents';
import type { Stage, StageFloatingItem, MemberConfigItem } from './types';

const memberConfig: MemberConfigItem[] = [
  {
    name: 'KillubysmaliVT',
    xEnd: '12.5%',
    color: '#00637c',
    role: 'Directora & Comunidad',
  },
  {
    name: 'Neroferno ultranix',
    xEnd: '37.5%',
    color: '#ff00b7',
    role: 'Dev Lead & Infra',
  },
  {
    name: 'Xurlito',
    xEnd: '62.5%',
    color: '#00aeef',
    role: 'Diseño & Arte Lead',
  },
  { name: 'JAPA325', xEnd: '87.5%', color: '#000080', role: 'QA & BetaTester' },
];

export function Stage2Card({
  stage,
  floatingItems,
}: Readonly<{ stage: Stage; floatingItems: StageFloatingItem[] }>) {
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
    activeStaffColor = memberConfig.find((m) => m.name === dragActiveMember)?.color ?? null;
  } else if (hoveredMember) {
    activeStaffColor = memberConfig.find((m) => m.name === hoveredMember)?.color ?? null;
  }

  return (
    <div
      ref={cardRef}
      className="bg-linear-to-b relative select-none space-y-8 overflow-hidden rounded-3xl border border-white/10 from-[#101726]/90 via-[#090d16]/95 to-[#0b1320]/95 p-8 shadow-[0_0_50px_rgba(137,217,209,0.15)] md:p-10"
    >
      {/* 3D CANVAS BACKGROUND INTEGRATION FOR STAGE 02 */}
      <div className="pointer-events-none absolute inset-0 z-0 flex size-full items-center justify-center opacity-100">
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
      <Stage2HolographicBeams
        memberConfig={memberConfig}
        linkedMembers={linkedMembers}
        hoveredMember={hoveredMember}
        dragActiveMember={dragActiveMember}
      />

      {floatingItems.map((item, idx) => (
        <FloatingItem key={item.pos} item={item} idx={idx} />
      ))}

      <StageHeader stage={stage} linkedCount={linkedMembers.size} resetLinks={resetLinks} />

      {/* 4/4 SYNC FRIENDSHIP & BRAND CREATION STORY BANNER (COMPACT ABSOLUTE OVERLAY) */}
      <AnimatePresence>
        {allLinked && (
          <motion.div
            initial={{ opacity: 0, y: -10, x: '-50%', scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: -10, x: '-50%', scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="pointer-events-auto absolute left-1/2 top-20 z-30 w-[88%] max-w-md space-y-1.5 rounded-2xl border border-[#00e5ff]/50 bg-black/90 p-3 text-center shadow-[0_0_30px_rgba(0,229,255,0.3)] backdrop-blur-2xl sm:max-w-lg sm:p-4"
          >
            <div className="flex items-center justify-center gap-1.5">
              <Sparkles className="size-3.5 animate-pulse text-[#00e5ff]" />
              <span className="font-mono text-[10px] font-black uppercase tracking-wider text-[#00e5ff]">
                ✦{' '}
                {t('history_section.stage2.banner_badge', 'EL ORIGEN DE NUESTRA MARCA & SERVIDOR')}{' '}
                ✦
              </span>
              <Sparkles className="size-3.5 animate-pulse text-[#00e5ff]" />
            </div>
            <p className="text-[11px] font-medium leading-snug text-gray-200 sm:text-xs">
              {t(
                'history_section.stage2.banner_text',
                'Lo que comenzó como una gran amistad dio origen a algo maravilloso. CrystalTidesSMP no es solo un servidor o marca; es el reflejo de nuestro compromiso por construir un hogar digital transparente, creado con empatía y escuchando a nuestra comunidad.',
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO 3D SHOWCASE SPACE, FLOATING STAFF BIO CARDS & INVISIBLE INTERACTIVE DROP ZONE */}
      <Stage2StaffBios linkedMembers={linkedMembers} dropZoneRef={dropZoneRef} t={t} />

      {/* STAFF MEMBERS CARDS WITH DRAGGABLE ENERGY NODES */}
      <Stage2StaffGrid
        stage={stage}
        hoveredMember={hoveredMember}
        setHoveredMember={setHoveredMember}
        dragActiveMember={dragActiveMember}
        linkedMembers={linkedMembers}
        handleNodePointerDown={handleNodePointerDown}
        toggleMemberLink={toggleMemberLink}
      />
    </div>
  );
}

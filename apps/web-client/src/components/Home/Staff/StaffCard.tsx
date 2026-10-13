import React, { useState } from 'react';
import { m as motion } from 'framer-motion';
import MinecraftAvatar from '../../UI/MinecraftAvatar';
import type { StaffMember } from './staffData';
import { getBadge, getStatusColor } from './staffData';
import { StaffSocials } from './StaffSocials';

const BUBBLE_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpath d='M2 0h4v1H2zM1 1h1v1H1zM6 1h1v1H6zM0 2h1v4H0zM7 2h1v4H7zM1 6h1v1H1zM6 6h1v1H6zM2 7h4v1H2z'/%3E%3C/svg%3E";
const HIGHLIGHT_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpath d='M2 2h2v1H2zM2 3h1v1H2z'/%3E%3C/svg%3E";

const CardBubbles = ({ color }: Readonly<{ color: string }>) => {
  const [bubbles] = useState(() =>
    Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      size: ((i * 37) % 10) + 10,
      left: ((i * 53) % 80) + 10,
      delay: (i * 1.3) % 5,
      duration: ((i * 2.7) % 5) + 8,
    })),
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        borderRadius: '20px',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {bubbles.map((b) => (
        <div
          key={b.id}
          style={{
            position: 'absolute',
            left: `${b.left}%`,
            bottom: '-20%',
            width: `${b.size}px`,
            height: `${b.size}px`,
            animation: `card-float ${b.duration}s linear infinite`,
            animationDelay: `${b.delay}s`,
            opacity: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: color,
              maskImage: `url("${BUBBLE_SVG}")`,
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskImage: `url("${BUBBLE_SVG}")`,
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              opacity: 0.2,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'white',
              maskImage: `url("${HIGHLIGHT_SVG}")`,
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskImage: `url("${HIGHLIGHT_SVG}")`,
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              opacity: 0.4,
            }}
          />
        </div>
      ))}
    </div>
  );
};

interface StaffCardProps {
  member: StaffMember;
  status: { mc: string; discord: string };
  hoveredDiscord: string | null;
  setHoveredDiscord: (id: string | null) => void;
  lang: string;
  isMcOnlineForMember: boolean;
}

export const StaffCard: React.FC<Readonly<StaffCardProps>> = ({
  member,
  status,
  hoveredDiscord,
  setHoveredDiscord,
  lang,
  isMcOnlineForMember,
}) => {
  const discordColor = getStatusColor(status.discord);
  const badgeUrl = getBadge(member.role);

  return (
    <motion.div
      key={member.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="group relative flex flex-col items-center rounded-2xl border border-white/5 bg-white/5 p-8 text-center transition-colors hover:-translate-y-2 hover:bg-white/10 hover:shadow-2xl hover:shadow-black/50"
      style={{
        borderTop: `4px solid ${member.color}`,
      }}
    >
      <CardBubbles color={member.color} />

      <div className="relative z-10 mb-6">
        <div
          className="size-24 overflow-hidden rounded-full border-4 shadow-2xl transition-transform group-hover:scale-110"
          style={{
            borderColor: member.color,
            boxShadow: `0 0 20px ${member.color}40`,
          }}
        >
          <MinecraftAvatar
            src={member.image ?? member.mc_nickname ?? member.name}
            alt={member.name}
            size={120}
            className="size-full object-cover"
          />
        </div>

        <div className="absolute -bottom-1 -right-1 z-20 flex flex-col-reverse gap-1.5">
          {status.mc === 'online' && (
            <div
              title="Jugando en Minecraft"
              className="flex size-6 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-500 bg-[#18181b] shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            >
              <img
                src="/images/ui/minecraft_logo_icon_168974.png"
                alt="Jugando en Minecraft"
                className="size-3.5"
              />
            </div>
          )}

          <div
            title={`Discord: ${status.discord.toUpperCase()}`}
            className="flex size-6 items-center justify-center rounded-full border-2 bg-[#5865F2] shadow-lg"
            style={{
              borderColor: discordColor,
              boxShadow: `0 0 10px ${discordColor}80`,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              width="10"
              height="10"
              className="text-white"
              aria-label={`Discord: ${status.discord.toUpperCase()}`}
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.37.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </div>
        </div>
      </div>

      <h3 className="group-hover:text-(--accent) mb-2 text-xl font-black text-white transition-colors">
        {member.name}
      </h3>

      {badgeUrl ? (
        <img
          src={badgeUrl}
          alt={member.role}
          className="mb-4 size-auto max-h-8 max-w-36 object-contain"
        />
      ) : (
        <span
          className="mb-4 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest"
          style={{
            color: member.color,
            backgroundColor: `${member.color}10`,
            borderColor: `${member.color}30`,
          }}
        >
          {lang === 'en' && member.role_en ? member.role_en : member.role}
        </span>
      )}

      <p className="z-10 mb-6 grow text-xs/relaxed font-medium text-gray-300">
        {lang === 'en' && member.description_en ? member.description_en : member.description}
      </p>

      {/* Social Links */}
      <StaffSocials
        member={member}
        discordColor={discordColor}
        isDiscordOnline={status.discord !== 'offline'}
        hoveredDiscord={hoveredDiscord}
        setHoveredDiscord={setHoveredDiscord}
        isMcOnlineForMember={isMcOnlineForMember}
      />
    </motion.div>
  );
};

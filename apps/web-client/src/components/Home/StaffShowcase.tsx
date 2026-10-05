import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Section from '../Layout/Section';
import Loader from '../UI/Loader';
import type { StaffMember } from './Staff/staffData';
import { FALLBACK_STAFF } from './Staff/staffData';
import { StaffCard } from './Staff/StaffCard';
import { StaffDiscordBanner } from './Staff/StaffDiscordBanner';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface StaffShowcaseProps {
  mockStaff?: StaffMember[];
  mockOnlineStatus?: Record<string, { mc: string; discord: string }>;
  mockRecruitment?: { status: string; link: string };
}

function resolveStaffList(
  mockStaff?: StaffMember[],
  settingsData?: { staff_cards?: string | StaffMember[] },
): StaffMember[] {
  if (mockStaff) return mockStaff;
  if (!settingsData) return FALLBACK_STAFF;
  if (settingsData.staff_cards) {
    try {
      const parsed =
        typeof settingsData.staff_cards === 'string'
          ? JSON.parse(settingsData.staff_cards)
          : settingsData.staff_cards;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : FALLBACK_STAFF;
    } catch {
      return FALLBACK_STAFF;
    }
  }
  return FALLBACK_STAFF;
}

export default function StaffShowcase({
  mockStaff,
  mockOnlineStatus,
  mockRecruitment,
}: Readonly<StaffShowcaseProps>) {
  const { t, i18n } = useTranslation();
  const [activeChannelIdx, setActiveChannelIdx] = useState<number>(0);
  const [hoveredDiscord, setHoveredDiscord] = useState<string | null>(null);

  const { data: settingsData, isLoading: loading } = useQuery({
    queryKey: ['staffShowcaseSettings'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/settings?t=${Date.now()}`);
      if (!res.ok) throw new Error(`Fetch settings failed with status: ${res.status}`);
      return res.json();
    },
    enabled: !mockStaff,
    staleTime: 60_000,
  });

  const staff = resolveStaffList(mockStaff, settingsData);
  const recruitment = mockRecruitment ?? {
    status: settingsData?.recruitment_status || 'false',
    link: settingsData?.recruitment_link || '',
  };

  const { data: onlineStaff = {} } = useQuery<Record<string, { mc: string; discord: string }>>({
    queryKey: ['staffOnlineStatus'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/server/staff`);
      if (!res.ok) return {};
      const data = await res.json();
      if (!Array.isArray(data)) return {};
      const statusMap: Record<string, { mc: string; discord: string }> = {};
      data.forEach((u: { username: string; mc_status?: string; discord_status?: string }) => {
        statusMap[u.username.toLowerCase()] = {
          mc: u.mc_status || 'offline',
          discord: u.discord_status || 'offline',
        };
      });
      return statusMap;
    },
    enabled: !mockStaff,
    refetchInterval: 30000,
    initialData: mockOnlineStatus,
  });

  if (loading) {
    return (
      <Section>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Loader />
        </div>
      </Section>
    );
  }

  return (
    <Section
      title={
        <div className="flex items-center justify-center gap-3">
          <Users className="text-(--accent) text-3xl" />
          <span className="uppercase tracking-widest">{t('staff.title', 'Nuestro Equipo')}</span>
        </div>
      }
    >
      <p className="mx-auto mb-10 max-w-3xl text-center text-sm/relaxed font-medium text-gray-300 opacity-90 sm:text-base">
        {t(
          'staff.subtitle',
          'Un equipo de 4 personas unidas por la pasión, el código, el arte y el caos controlado: la voz y comunidad de Killu, la infraestructura eufórica de Nero, la estética limpia de Churly y el testing implacable de Japa.',
        )}
      </p>

      {/* Recruitment Banner */}
      <AnimatePresence>
        {recruitment.status === 'true' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <a
              href={recruitment.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-8 py-3 font-bold text-emerald-400 no-underline transition-colors hover:scale-105 hover:bg-emerald-500/20"
            >
              <Briefcase size={18} /> {t('staff.hiring_title', '¿Quieres unirte?')} -{' '}
              {t('staff.hiring_action', '¡Estamos buscando staff!')}
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staff Cards Grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {staff.map((member) => {
          const status = onlineStaff[(member.mc_nickname || member.name).toLowerCase()] || {
            mc: 'offline',
            discord: 'offline',
          };
          const isMcOnlineForMember = onlineStaff[member.name.toLowerCase()]?.mc === 'online';

          return (
            <StaffCard
              key={member.id}
              member={member}
              status={status}
              hoveredDiscord={hoveredDiscord}
              setHoveredDiscord={setHoveredDiscord}
              lang={i18n.language}
              isMcOnlineForMember={isMcOnlineForMember}
            />
          );
        })}
      </div>

      {/* Live Discord Community Showcase Banner */}
      <StaffDiscordBanner
        activeChannelIdx={activeChannelIdx}
        setActiveChannelIdx={setActiveChannelIdx}
      />

      <style>{`
        @keyframes card-float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 1; }
          50% { transform: translateY(-150px) translateX(10px); }
          100% { transform: translateY(-300px) translateX(-10px); opacity: 0; }
        }
      `}</style>
    </Section>
  );
}

import { useMemo, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { m as motion } from 'framer-motion';
import Section from '../components/Layout/Section';
import EmblaCarousel from '../components/UI/EmblaCarousel';
import { KoFiButton } from '../components/Widgets/KoFi';
import DonationFeed from '../components/Widgets/DonationFeed';
import { useSEO } from '../hooks/useSEO';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const CAROUSEL_OPTIONS = { loop: true };

const SEO_CONFIG = {
  title: 'Donadores y Rangos Exclusivos',
  description:
    'Conoce la lista de donadores de CrystalTides SMP y apoya el mantenimiento del servidor para obtener rangos y beneficios únicos.',
  keywords:
    'rangos minecraft, donadores smp, tienda minecraft, apoyo servidor minecraft, kofi minecraft',
  canonical: 'https://crystaltidessmp.net/donors',
} as const;

const RANK_BADGE_CONTAINER_STYLE: CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  justifyContent: 'center',
  alignItems: 'center',
};

const RANK_IMAGES: Record<string, string> = {
  donador: '/ranks/rank-donador.png',
  fundador: '/ranks/rank-fundador.png',
  killu: '/ranks/rank-killu.png',
  neroferno: '/ranks/rank-neroferno.png',
  developer: '/ranks/developer.png',
  admin: '/ranks/admin.png',
  mod: '/ranks/moderator.png',
  helper: '/ranks/helper.png',
  staff: '/ranks/staff.png',
};

type TranslateFn = ReturnType<typeof useTranslation>['t'];

export interface DonorProfile {
  name: string;
  rank: React.ReactNode;
  image: string;
  description: string;
}

interface RawDonorDefinition {
  name: string;
  ranks: readonly string[];
  image: string;
  descKey: string;
}

interface DynamicDonorEntry {
  name: string;
  skinUrl?: string;
  description?: string;
  description_en?: string;
  ranks?: string[];
}

interface SettingsResponse {
  donors_list?: string | DynamicDonorEntry[];
}

const HARDCODED_DONOR_DEFINITIONS: readonly RawDonorDefinition[] = [
  {
    name: 'Killu Bysmali',
    ranks: ['killu'],
    image: '/skins/killu.png?v=fixed',
    descKey: 'donors.profiles.killu',
  },
  {
    name: 'Neroferno Ultranix',
    ranks: ['neroferno'],
    image: 'https://minotar.net/skin/344af588-8a7e-4053-9f03-92d68d96b86c',
    descKey: 'donors.profiles.neroferno',
  },
  {
    name: 'Lawchihuahua',
    ranks: ['fundador'],
    image: '/skins/law.png',
    descKey: 'donors.profiles.law',
  },
  {
    name: 'pixiesixer',
    ranks: ['fundador'],
    image: 'https://minotar.net/skin/b47ee72ad3474abe9a081ab32f47153a',
    descKey: 'donors.profiles.pixie',
  },
  {
    name: 'Zeta',
    ranks: ['fundador'],
    image: '/skins/zeta.png',
    descKey: 'donors.profiles.zeta',
  },
  {
    name: 'SendPles',
    ranks: ['fundador'],
    image: 'https://minotar.net/skin/5bec40ab-e459-474b-b96c-21ee1eae7d29',
    descKey: 'donors.profiles.sendples',
  },
  {
    name: 'ZenXeone',
    ranks: ['donador'],
    image: 'https://minotar.net/skin/eacfb70c-c83a-4e0b-8465-ee4b0b86e041',
    descKey: 'donors.profiles.zen',
  },
  {
    name: 'Churly',
    ranks: ['donador', 'developer'],
    image: '/skins/churly.png',
    descKey: 'donors.profiles.churly',
  },
  {
    name: 'Nana Fubuki',
    ranks: ['donador'],
    image: '/skins/nana-fubuki.png',
    descKey: 'donors.profiles.nana',
  },
] as const;

function RankBadgeGroup({ ranks, t }: Readonly<{ ranks: readonly string[]; t: TranslateFn }>) {
  const validRanks = ranks.filter((rank) => Boolean(RANK_IMAGES[rank]));

  return (
    <div style={RANK_BADGE_CONTAINER_STYLE}>
      {validRanks.map((rank) => {
        const badgeLabel = t(`donors.ranks.${rank}`);
        return (
          <img
            key={rank}
            src={RANK_IMAGES[rank]}
            alt={badgeLabel}
            title={badgeLabel}
            width={87}
            height={14}
            loading="lazy"
            decoding="async"
          />
        );
      })}
    </div>
  );
}

function parseDynamicDonors(raw: unknown): DynamicDonorEntry[] | null {
  if (!raw) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as DynamicDonorEntry[]) : null;
  } catch (error) {
    console.error('Error parsing dynamic donors', error);
    return null;
  }
}

function resolveDonorDescription(
  donor: DynamicDonorEntry,
  hardcodedDescriptions: Record<string, string>,
  language: string,
): string {
  const hardcodedDesc = hardcodedDescriptions[donor.name.toLowerCase()];
  if (hardcodedDesc) {
    return hardcodedDesc;
  }
  if (language === 'en' && donor.description_en) {
    return donor.description_en;
  }
  return donor.description ?? '';
}

async function fetchSettings(): Promise<SettingsResponse> {
  const res = await fetch(`${API_URL}/settings`);
  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`);
  }
  return res.json();
}

function DonorsSectionTitle({ title }: Readonly<{ title: string }>) {
  return (
    <div className="flex items-center justify-center gap-3">
      <img
        src="/skins/kiru.png"
        alt="icon"
        width={24}
        height={24}
        loading="lazy"
        decoding="async"
        className="h-[1.5em] w-auto animate-pulse"
      />
      <span className="uppercase tracking-widest">{title}</span>
    </div>
  );
}

interface RecentPerkLedgerProps {
  title: string;
}

function RecentPerkLedger({ title }: Readonly<RecentPerkLedgerProps>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      className="mb-24"
    >
      <div className="mb-8 flex items-center justify-center gap-4">
        <div className="bg-linear-to-r to-(--accent) h-px w-16 from-transparent" />
        <h3 className="text-2xl font-black uppercase tracking-widest text-white">{title}</h3>
        <div className="bg-linear-to-l to-(--accent) h-px w-16 from-transparent" />
      </div>
      <DonationFeed />
    </motion.div>
  );
}

interface DonorTierShowcaseProps {
  donors: DonorProfile[];
  buttonText: string;
}

function DonorTierShowcase({ donors, buttonText }: Readonly<DonorTierShowcaseProps>) {
  return (
    <div className="relative mb-24">
      <div className="mb-12 flex w-full justify-center">
        <div className="transform transition-transform hover:scale-105 active:scale-95">
          <KoFiButton text={buttonText} />
        </div>
      </div>
      <div className="max-w-350 mx-auto w-full">
        <EmblaCarousel slides={donors} options={CAROUSEL_OPTIONS} />
      </div>
    </div>
  );
}

export default function Donors() {
  const { t, i18n } = useTranslation();

  useSEO(SEO_CONFIG);

  const hardcodedDonors: DonorProfile[] = useMemo(() => {
    return HARDCODED_DONOR_DEFINITIONS.map((def) => ({
      name: def.name,
      rank: <RankBadgeGroup ranks={def.ranks} t={t} />,
      image: def.image,
      description: t(def.descKey),
    }));
  }, [t]);

  const hardcodedDescriptions = useMemo(() => {
    return hardcodedDonors.reduce<Record<string, string>>((acc, curr) => {
      acc[curr.name.toLowerCase()] = curr.description;
      return acc;
    }, {});
  }, [hardcodedDonors]);

  const { data: settingsData } = useQuery({
    queryKey: ['settingsDonorsList'],
    queryFn: fetchSettings,
    staleTime: 60_000,
  });

  const finalDonors: DonorProfile[] = useMemo(() => {
    const dynamicList = parseDynamicDonors(settingsData?.donors_list);
    if (!dynamicList) {
      return hardcodedDonors;
    }

    return dynamicList.map((donor) => ({
      name: donor.name,
      image: donor.skinUrl || `https://mc-heads.net/avatar/${donor.name}/128`,
      description: resolveDonorDescription(donor, hardcodedDescriptions, i18n.language),
      rank: <RankBadgeGroup ranks={donor.ranks ?? []} t={t} />,
    }));
  }, [settingsData, hardcodedDonors, hardcodedDescriptions, i18n.language, t]);

  return (
    <div className="min-h-screen pt-24">
      <Section title={<DonorsSectionTitle title={t('donors.title')} />}>
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="text-lg/relaxed text-gray-400">{t('donors.intro')}</p>
        </div>

        <RecentPerkLedger title={t('donors.latest_title')} />

        <DonorTierShowcase donors={finalDonors} buttonText={t('hero.kofi_text')} />
      </Section>
    </div>
  );
}

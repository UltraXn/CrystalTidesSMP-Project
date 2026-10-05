import { lazy, useEffect } from 'react';
import { m as motion, Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Hero from '../components/Hero';
import SectionDivider from '../components/Layout/SectionDivider';
import LazyWrapper from '../components/Utils/LazyWrapper';
import { useSEO } from '../hooks/useSEO';

// Skeleton Fallbacks
import ServerHistorySkeleton from '../components/Home/skeletons/ServerHistorySkeleton';
import AboutRolesSkeleton from '../components/Home/skeletons/AboutRolesSkeleton';
import StaffShowcaseSkeleton from '../components/Home/skeletons/StaffShowcaseSkeleton';
import RulesSkeleton from '../components/Home/skeletons/RulesSkeleton';
import DonorsSkeleton from '../components/Home/skeletons/DonorsSkeleton';
import ContestsSkeleton from '../components/Home/skeletons/ContestsSkeleton';
import BlogSkeleton from '../components/Home/skeletons/BlogSkeleton';
import StoriesSkeleton from '../components/Home/skeletons/StoriesSkeleton';
import SuggestionsSkeleton from '../components/Home/skeletons/SuggestionsSkeleton';

// Lazy load below-the-fold sections only when scrolled into view
const ServerHistory = lazy(() => import('../components/Home/ServerHistory'));
const AboutRoles = lazy(() => import('../components/Home/AboutRoles'));
const StaffShowcase = lazy(() => import('../components/Home/StaffShowcase'));
const Rules = lazy(() => import('./Rules'));
const Donors = lazy(() => import('./Donors'));
const Contests = lazy(() => import('./Contests'));
const Blog = lazy(() => import('./Blog'));
const Stories = lazy(() => import('./Stories'));
const Suggestions = lazy(() => import('./Suggestions'));

// Animation variant for reusing
const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' as const },
  },
};

const SectionWithScroll = ({
  children,
  id,
  className,
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) => (
  <motion.div
    id={id}
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '0px' }}
    variants={fadeUpVariant}
  >
    {children}
  </motion.div>
);

const SECTION_CONFIG = [
  {
    id: 'hero',
    titleKey: 'seo.title',
    defaultTitle: 'CrystalTides SMP | Servidor de Minecraft Survival 1.21+',
  },
  { id: 'history', titleKey: 'history_section.title', defaultTitle: 'Historia | CrystalTides SMP' },
  {
    id: 'mechanics',
    titleKey: 'about_roles.title',
    defaultTitle: 'Mecánicas y Clases | CrystalTides SMP',
  },
  {
    id: 'rules',
    titleKey: 'rules.title',
    defaultTitle: 'Normativas del Servidor | CrystalTides SMP',
  },
  {
    id: 'donors',
    titleKey: 'donors.meta_title',
    defaultTitle: 'Donadores y Rangos Exclusivos | CrystalTides SMP',
  },
  { id: 'staff', titleKey: 'staff.meta_title', defaultTitle: 'Equipo y Staff | CrystalTides SMP' },
  {
    id: 'contests',
    titleKey: 'contests.meta_title',
    defaultTitle: 'Concursos y Eventos | CrystalTides SMP',
  },
  {
    id: 'news',
    titleKey: 'news.meta_title',
    defaultTitle: 'Noticias y Notas de Parche | CrystalTides SMP',
  },
  {
    id: 'stories',
    titleKey: 'stories.meta_title',
    defaultTitle: 'Historias y Crónicas | CrystalTides SMP',
  },
  {
    id: 'suggestions',
    titleKey: 'suggestions.meta_title',
    defaultTitle: 'Buzón de Sugerencias | CrystalTides SMP',
  },
  {
    id: 'faq',
    titleKey: 'home.faq.section_title',
    defaultTitle: 'Preguntas Frecuentes (FAQ) | CrystalTides SMP',
  },
] as const;

export default function Home() {
  const { t } = useTranslation();

  useSEO({
    title: t('seo.title', 'CrystalTides SMP | Best English Minecraft Survival moded Server 1.21.1'),
    description: t(
      'seo.description',
      'CrystalTides SMP: Best English Minecraft Survival moded Server 1.21.1 featuring custom mechanics, active international community, and unique survival experience.',
    ),
    keywords: t(
      'seo.keywords',
      'Best English Minecraft Survival moded Server 1.21.1, English Minecraft Server, Modded Survival SMP, Minecraft 1.21.1, CrystalTides',
    ),
    canonical: 'https://crystaltidessmp.net/',
  });

  // Dynamic browser tab title scrollspy based on active section
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 200) {
        document.title = t('seo.title', 'CrystalTides SMP | Servidor de Minecraft Survival 1.21+');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (intersecting.length > 0) {
          const activeId = intersecting[0].target.id;
          const config = SECTION_CONFIG.find((s) => s.id === activeId);
          if (config) {
            const rawTitle = t(config.titleKey, config.defaultTitle);
            document.title = rawTitle.includes('CrystalTides')
              ? rawTitle
              : `${rawTitle} | CrystalTides SMP`;
          }
        }
      },
      {
        rootMargin: '-15% 0px -50% 0px',
        threshold: [0.1, 0.3, 0.6],
      },
    );

    SECTION_CONFIG.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [t]);

  return (
    <div className="pb-16">
      <div id="hero">
        <Hero />
      </div>

      {/* 1. Sección de Historia de CrystalTides SMP */}
      <SectionWithScroll id="history" className="max-w-440 mx-auto w-full">
        <LazyWrapper render={() => <ServerHistory />} fallback={<ServerHistorySkeleton />} />
      </SectionWithScroll>

      <SectionDivider />

      {/* 2. Sección de Mecánicas y Roles */}
      <SectionWithScroll id="mechanics" className="max-w-440 mx-auto w-full">
        <LazyWrapper render={() => <AboutRoles />} fallback={<AboutRolesSkeleton />} />
      </SectionWithScroll>

      <SectionDivider />

      <SectionWithScroll id="rules" className="max-w-360 mx-auto w-full">
        <LazyWrapper render={() => <Rules />} fallback={<RulesSkeleton />} />
      </SectionWithScroll>

      <SectionDivider />

      <SectionWithScroll id="donors" className="max-w-360 mx-auto w-full">
        <LazyWrapper render={() => <Donors />} fallback={<DonorsSkeleton />} />
      </SectionWithScroll>

      <SectionDivider />

      <SectionWithScroll id="staff" className="max-w-360 mx-auto w-full">
        <LazyWrapper render={() => <StaffShowcase />} fallback={<StaffShowcaseSkeleton />} />
      </SectionWithScroll>

      <SectionDivider />

      <SectionWithScroll id="contests" className="max-w-360 mx-auto w-full">
        <LazyWrapper render={() => <Contests />} fallback={<ContestsSkeleton />} />
      </SectionWithScroll>

      <SectionDivider />

      <SectionWithScroll id="news" className="max-w-360 mx-auto w-full">
        <LazyWrapper render={() => <Blog />} fallback={<BlogSkeleton />} />
      </SectionWithScroll>

      <SectionDivider />

      <SectionWithScroll id="stories" className="max-w-360 mx-auto w-full">
        <LazyWrapper render={() => <Stories />} fallback={<StoriesSkeleton />} />
      </SectionWithScroll>

      <SectionDivider />

      <SectionWithScroll id="suggestions" className="max-w-360 mx-auto w-full">
        <LazyWrapper render={() => <Suggestions />} fallback={<SuggestionsSkeleton />} />
      </SectionWithScroll>
    </div>
  );
}

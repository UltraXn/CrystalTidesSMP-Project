import { lazy } from 'react'
import { m as motion, Variants } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Hero from "../components/Hero"
import SectionDivider from "../components/Layout/SectionDivider"
import LazyWrapper from "../components/Utils/LazyWrapper"
import { useSEO } from "../hooks/useSEO"

// Skeleton Fallbacks
import ServerHistorySkeleton from "../components/Home/skeletons/ServerHistorySkeleton"
import AboutRolesSkeleton from "../components/Home/skeletons/AboutRolesSkeleton"
import StaffShowcaseSkeleton from "../components/Home/skeletons/StaffShowcaseSkeleton"
import RulesSkeleton from "../components/Home/skeletons/RulesSkeleton"
import DonorsSkeleton from "../components/Home/skeletons/DonorsSkeleton"
import ContestsSkeleton from "../components/Home/skeletons/ContestsSkeleton"
import BlogSkeleton from "../components/Home/skeletons/BlogSkeleton"
import StoriesSkeleton from "../components/Home/skeletons/StoriesSkeleton"
import SuggestionsSkeleton from "../components/Home/skeletons/SuggestionsSkeleton"

// Lazy load below-the-fold sections only when scrolled into view
const ServerHistory = lazy(() => import("../components/Home/ServerHistory"))
const AboutRoles = lazy(() => import("../components/Home/AboutRoles"))
const StaffShowcase = lazy(() => import("../components/Home/StaffShowcase"))
const Rules = lazy(() => import("./Rules"))
const Donors = lazy(() => import("./Donors"))
const Contests = lazy(() => import("./Contests"))
const Blog = lazy(() => import("./Blog"))
const Stories = lazy(() => import("./Stories"))
const Suggestions = lazy(() => import("./Suggestions"))

// Animation variant for reusing
const fadeUpVariant: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.8, ease: "easeOut" as const } 
    }
}

const SectionWithScroll = ({ children, id, className }: { children: React.ReactNode, id?: string, className?: string }) => (
    <motion.div 
        id={id}
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px" }}
        variants={fadeUpVariant}
    >
        {children}
    </motion.div>
)

export default function Home() {
    const { t } = useTranslation()

    useSEO({
        title: t('seo.title', 'CrystalTides SMP | Best English Minecraft Survival moded Server 1.21.1'),
        description: t('seo.description', 'CrystalTides SMP: Best English Minecraft Survival moded Server 1.21.1 featuring custom mechanics, active international community, and unique survival experience.'),
        keywords: t('seo.keywords', 'Best English Minecraft Survival moded Server 1.21.1, English Minecraft Server, Modded Survival SMP, Minecraft 1.21.1, CrystalTides'),
        canonical: 'https://crystaltidessmp.net/'
    });

    return (
        <div className="pb-16">
            <Hero />
            
            {/* 1. Sección de Historia de CrystalTides SMP */}
            <SectionWithScroll id="history" className="w-full max-w-440 mx-auto">
                <LazyWrapper render={() => <ServerHistory />} fallback={<ServerHistorySkeleton />} />
            </SectionWithScroll>

            <SectionDivider />

            {/* 2. Sección de Mecánicas y Roles */}
            <SectionWithScroll id="mechanics" className="w-full max-w-440 mx-auto">
                <LazyWrapper render={() => <AboutRoles />} fallback={<AboutRolesSkeleton />} />
            </SectionWithScroll>

            <SectionDivider />

            <SectionWithScroll id="rules" className="w-full max-w-360 mx-auto">
                <LazyWrapper render={() => <Rules />} fallback={<RulesSkeleton />} />
            </SectionWithScroll>

            <SectionDivider />

            <SectionWithScroll id="donors" className="w-full max-w-360 mx-auto">
                <LazyWrapper render={() => <Donors />} fallback={<DonorsSkeleton />} />
            </SectionWithScroll>

            <SectionDivider />

            <SectionWithScroll id="staff" className="w-full max-w-360 mx-auto">
                <LazyWrapper render={() => <StaffShowcase />} fallback={<StaffShowcaseSkeleton />} />
            </SectionWithScroll>

            <SectionDivider />

            <SectionWithScroll id="contests" className="w-full max-w-360 mx-auto">
                <LazyWrapper render={() => <Contests />} fallback={<ContestsSkeleton />} />
            </SectionWithScroll>

            <SectionDivider />

            <SectionWithScroll id="news" className="w-full max-w-360 mx-auto">
                <LazyWrapper render={() => <Blog />} fallback={<BlogSkeleton />} />
            </SectionWithScroll>

            <SectionDivider />

            <SectionWithScroll id="stories" className="w-full max-w-360 mx-auto">
                <LazyWrapper render={() => <Stories />} fallback={<StoriesSkeleton />} />
            </SectionWithScroll>

            <SectionDivider />

            <SectionWithScroll id="suggestions" className="w-full max-w-360 mx-auto">
                <LazyWrapper render={() => <Suggestions />} fallback={<SuggestionsSkeleton />} />
            </SectionWithScroll>
        </div>
    )
}


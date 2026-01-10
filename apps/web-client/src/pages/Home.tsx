import { lazy } from 'react'
import { motion, Variants } from 'framer-motion'
import Hero from "../components/Hero"
import Section from "../components/Layout/Section"
import SectionDivider from "../components/Layout/SectionDivider"
import ServerFeatures from "../components/Home/ServerFeatures"
import LazyWrapper from "../components/Utils/LazyWrapper"

// Lazy load below-the-fold sections to reduce initial bundle size
const Rules = lazy(() => import("./Rules"))
const Donors = lazy(() => import("./Donors"))
const Contests = lazy(() => import("./Contests"))
const Blog = lazy(() => import("./Blog"))
const Stories = lazy(() => import("./Stories"))
const Suggestions = lazy(() => import("./Suggestions"))
import StaffShowcase from "../components/Home/StaffShowcase"

import { useTranslation } from 'react-i18next'

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
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUpVariant}
    >
        {children}
    </motion.div>
)

export default function Home() {
    const { t } = useTranslation()

    return (
        <div>
            <Hero />
            
            <Section title={t('home.title')}>
                <SectionWithScroll>
                    <div className="relative p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl max-w-3xl mx-auto mb-16">
                        <p className="text-lg text-gray-300 leading-relaxed">{t('home.description')}</p>
                    </div>

                    <ServerFeatures />
                </SectionWithScroll>
            </Section>

            <SectionDivider />

            <Section title={t('footer.community')} id="community">
                <SectionWithScroll>
                    <div className="relative p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl max-w-[800px] mx-auto">
                        <p className="mb-6 text-xl text-gray-300">{t('home.join_us_twitch')}</p>
                        <p className="text-xl text-gray-300">{t('home.join_us_discord')}</p>
                    </div>
                </SectionWithScroll>
            </Section>

            <SectionDivider />

            <SectionWithScroll id="rules" className="w-full max-w-[1200px] mx-auto">
                <LazyWrapper>
                    <Rules />
                </LazyWrapper>
            </SectionWithScroll>

            <SectionDivider />

            <SectionWithScroll id="donors" className="w-full max-w-[1200px] mx-auto">
                <LazyWrapper>
                    <Donors />
                </LazyWrapper>
            </SectionWithScroll>

            <SectionDivider />

            <SectionWithScroll id="staff" className="w-full max-w-[1200px] mx-auto">
                <StaffShowcase />
            </SectionWithScroll>

            <SectionDivider />

            <SectionWithScroll id="contests" className="w-full max-w-[1200px] mx-auto">
                <LazyWrapper>
                    <Contests />
                </LazyWrapper>
            </SectionWithScroll>

            <SectionDivider />

            <SectionWithScroll id="news" className="w-full max-w-[1200px] mx-auto">
                <LazyWrapper>
                    <Blog />
                </LazyWrapper>
            </SectionWithScroll>

            <SectionDivider />

            <SectionWithScroll id="stories" className="w-full max-w-[1200px] mx-auto">
                <LazyWrapper>
                    <Stories />
                </LazyWrapper>
            </SectionWithScroll>

            <SectionDivider />

            <SectionWithScroll id="suggestions" className="w-full max-w-[1200px] mx-auto">
                <LazyWrapper>
                    <Suggestions />
                </LazyWrapper>
            </SectionWithScroll>
        </div>
    )
}


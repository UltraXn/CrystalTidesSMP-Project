import Hero from "@/components/Hero"
import Section from "@/components/Layout/Section"
import SectionDivider from "@/components/Layout/SectionDivider"
import ServerFeatures from "@/components/Home/ServerFeatures"
import LazyWrapper from "@/components/Utils/LazyWrapper"

import Rules from "@/pages/Rules"
import Donors from "@/pages/Donors"
import Contests from "@/pages/Contests"
import Blog from "@/pages/Blog"
import Stories from "@/pages/Stories"
import Suggestions from "@/pages/Suggestions"

import { useTranslation } from 'react-i18next'
import DiscordButton from "@/components/UI/DiscordButton"
import TwitchButton from "@/components/UI/TwitchButton"
import TwitterButton from "@/components/UI/TwitterButton"

export default function Home() {
    const { t } = useTranslation()

    return (
        <>
            <Hero />
            
            <Section title={t('home.title')}>
                <Section>
                    <div className="crystal-card">
                        <p>{t('home.description')}</p>
                    </div>

                    <ServerFeatures />
                </Section>
            </Section>

            <SectionDivider />

            <Section title={t('footer.community')} id="community">
                <div className="crystal-card" style={{ maxWidth: '800px' }}>
                    <p style={{ marginBottom: "1.5rem" }}>{t('home.join_us_twitch')}</p>
                    <p>{t('home.join_us_discord')}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-8 px-4 items-center">
                    <DiscordButton />
                    <TwitchButton />
                    <TwitterButton />
                </div>
            </Section>

            <SectionDivider />

            <div id="rules">
                <LazyWrapper>
                    <Rules />
                </LazyWrapper>
            </div>

            <SectionDivider />

            <div id="donors">
                <LazyWrapper>
                    <Donors />
                </LazyWrapper>
            </div>

            <SectionDivider />

            <div id="contests">
                <LazyWrapper>
                    <Contests />
                </LazyWrapper>
            </div>

            <SectionDivider />

            <div id="news">
                <LazyWrapper>
                    <Blog />
                </LazyWrapper>
            </div>

            <SectionDivider />

            <div id="stories">
                <LazyWrapper>
                    <Stories />
                </LazyWrapper>
            </div>

            <SectionDivider />

            <div id="suggestions">
                <LazyWrapper>
                    <Suggestions />
                </LazyWrapper>
            </div>
        </>
    )
}


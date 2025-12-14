import Hero from "@/components/Hero"
import Section from "@/components/Layout/Section"
import ServerFeatures from "@/components/Home/ServerFeatures"


import { useTranslation } from 'react-i18next'

export default function Home() {
    const { t } = useTranslation()

    return (
        <>
            <Hero />
            <Section title={t('home.title')}>
                <Section>
                    <p>{t('home.description')}</p>
                    <p>{t('home.join_us')}</p>
                    <ServerFeatures />
                </Section>
            </Section>
        </>
    )
}


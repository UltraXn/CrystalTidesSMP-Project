import { useEffect } from "react"
import Section from "@/components/Layout/Section"
import { FaHammer, FaDiceD20, FaMapMarkedAlt, FaRunning } from "react-icons/fa"
import anime from "animejs"
import { useTranslation } from 'react-i18next'

const CONTEST_CONFIG = [
    { id: 1, icon: <FaHammer />, status: "active" },
    { id: 2, icon: <FaDiceD20 />, status: "soon" },
    { id: 3, icon: <FaMapMarkedAlt />, status: "finished" },
    { id: 4, icon: <FaRunning />, status: "finished" }
]

const ContestCard = ({ config }) => {
    const { t } = useTranslation()
    const { id, icon, status } = config

    const title = t(`contests.items.${id}.title`)
    const desc = t(`contests.items.${id}.desc`)
    const statusText = t(`contests.status.${status}`)

    const statusClass = `status-${status}`

    return (
        <div className="contest-card" style={{ opacity: 0, transform: 'translateY(20px)' }}>
            <div className={`contest-status ${statusClass}`}>
                {statusText}
            </div>
            <div className="contest-icon-wrapper">
                {icon}
            </div>
            <h3 className="contest-title">{title}</h3>
            <p className="contest-desc">{desc}</p>
        </div>
    )
}

export default function Contests() {
    const { t } = useTranslation()

    useEffect(() => {
        anime({
            targets: '.contest-card',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(150, { start: 300 }),
            easing: 'spring(1, 80, 10, 0)',
            duration: 800
        })
    }, [])

    return (
        <Section title={t('contests.title')}>
            <Section>
                <p style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 3rem", color: "var(--muted)" }}>
                    {t('contests.intro')}
                </p>
            </Section>

            <div className="contests-grid">
                {CONTEST_CONFIG.map(config => (
                    <ContestCard key={config.id} config={config} />
                ))}
            </div>
        </Section>
    )
}

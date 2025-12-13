import { useEffect, useRef } from "react"
import Section from "@/components/Layout/Section"
import { FaHandshake, FaUserShield, FaCity, FaIndustry, FaHammer, FaLeaf, FaPaintBrush, FaVideo, FaShieldAlt } from "react-icons/fa"
import anime from "animejs"
import { useTranslation } from 'react-i18next'

const RULE_ICONS = {
    1: <FaHandshake />,
    2: <FaUserShield />,
    3: <FaCity />,
    4: <FaIndustry />,
    5: <FaHammer />,
    6: <FaLeaf />,
    7: <FaPaintBrush />,
    8: <FaVideo />,
    9: <FaShieldAlt />
}

const RuleCard = ({ id, icon }) => {
    const { t } = useTranslation()
    const title = t(`rules.items.${id}.title`)
    const desc = t(`rules.items.${id}.desc`)

    return (
        <div className="rule-card" style={{ opacity: 0, transform: 'translateY(20px)' }}>
            <div className="rule-header">
                <div className="rule-icon">
                    {icon}
                </div>
                <h3 className="rule-title">{id}. {title}</h3>
            </div>
            <p className="rule-desc" dangerouslySetInnerHTML={{ __html: desc }}></p>
        </div>
    )
}

export default function Rules() {
    const listRef = useRef(null)
    const { t } = useTranslation()

    useEffect(() => {
        // Animate cards on mount
        anime({
            targets: '.rule-card',
            opacity: [0, 1],
            translateX: [-20, 0],
            translateY: [20, 0],
            delay: anime.stagger(100, { start: 200 }), // Cascade effect
            easing: 'easeOutExpo',
            duration: 800
        });
    }, [])

    return (
        <Section title={t('rules.title')}>
            <p style={{ marginBottom: "3rem", textAlign: "center", maxWidth: "600px", marginInline: "auto", color: "var(--muted)" }}>
                {t('rules.intro')}
            </p>

            <div className="rules-container" ref={listRef}>
                {Object.entries(RULE_ICONS).map(([id, icon]) => (
                    <RuleCard key={id} id={id} icon={icon} />
                ))}
            </div>
        </Section>
    )
}

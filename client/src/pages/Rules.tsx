import React, { useEffect, useRef, useState } from "react"
import Section from "../components/Layout/Section"
import { FaHandshake, FaUserShield, FaCity, FaHammer, FaLeaf, FaPaintBrush, FaVideo, FaShieldAlt } from "react-icons/fa"
import anime from "animejs"
import { useTranslation } from 'react-i18next'

interface Rule {
    id: string | number;
    title?: string;
    description?: string;
    isDefault?: boolean;
}

const RULE_ICONS: Record<string | number, React.ReactNode> = {
    1: <FaHandshake />,
    2: <FaUserShield />,
    3: <FaCity />,
    4: <FaHammer />,
    5: <FaLeaf />,
    6: <FaPaintBrush />,
    7: <FaVideo />,
    8: <FaShieldAlt />
}

export default function Rules() {
    const listRef = useRef<HTMLDivElement | null>(null)
    const { t } = useTranslation()
    const [rules, setRules] = useState<Rule[]>([])
    const API_URL = import.meta.env.VITE_API_URL

    const loadDefaultRules = () => {
        // Generate array [1..8] to use translation keys
        const defaults = Object.keys(RULE_ICONS).map(id => ({ id, isDefault: true }));
        setRules(defaults);
    }

    useEffect(() => {
        // Fetch rules from settings
        fetch(`${API_URL}/settings`)
            .then(res => res.json())
            .then(data => {
                if(data.server_rules) {
                    try {
                        const parsed = typeof data.server_rules === 'string' 
                            ? JSON.parse(data.server_rules) 
                            : data.server_rules;
                        
                        if(Array.isArray(parsed) && parsed.length > 0) {
                            setRules(parsed);
                        } else {
                            // Fallback to defaults (IDs 1-8)
                            loadDefaultRules();
                        }
                    } catch { loadDefaultRules(); }
                } else {
                    loadDefaultRules();
                }
            })
            .catch(() => loadDefaultRules());
    }, [API_URL]);

    useEffect(() => {
        if (rules.length === 0) return;
        
        // Animate cards on mount/update
        anime({
            targets: '.rule-card',
            opacity: [0, 1],
            translateX: [-20, 0],
            translateY: [20, 0],
            delay: anime.stagger(100, { start: 200 }),
            easing: 'easeOutExpo',
            duration: 800
        });
    }, [rules]);

    return (
        <Section title={t('rules.title')}>
            <p style={{ marginBottom: "3rem", textAlign: "center", maxWidth: "600px", marginInline: "auto", color: "var(--muted)" }}>
                {t('rules.intro')}
            </p>

            <div className="rules-container" ref={listRef}>
                {rules.map((rule) => {
                    // If isDefault, fetch text from translations. Else use rule.title/desc
                    const titleText = rule.isDefault ? t(`rules.items.${rule.id}.title`) : (rule.title || '');
                    const descText = rule.isDefault ? t(`rules.items.${rule.id}.desc`) : (rule.description || '');
                    
                    // Icon selection
                    let icon = RULE_ICONS[rule.id];
                    if (!icon) icon = <FaShieldAlt />; // Generic icon

                    return (
                        <div key={rule.id} className="rule-card" style={{ opacity: 0, transform: 'translateY(20px)' }}>
                            <div className="rule-header">
                                <div className="rule-icon">
                                    {icon}
                                </div>
                                <h3 className="rule-title">{titleText}</h3>
                            </div>
                            <p className="rule-desc" dangerouslySetInnerHTML={{ __html: descText }}></p>
                        </div>
                    )
                })}
            </div>
        </Section>
    )
}

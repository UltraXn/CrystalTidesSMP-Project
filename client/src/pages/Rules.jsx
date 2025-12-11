import { useEffect, useRef } from "react"
import Section from "@/components/Section"
import { FaHandshake, FaUserShield, FaCity, FaIndustry, FaHammer, FaLeaf, FaPaintBrush, FaVideo, FaShieldAlt } from "react-icons/fa"
import anime from "animejs/lib/anime.es.js"

const RULES = [
    {
        id: 1,
        title: "PVP Con Consentimiento",
        desc: "Estará permitido el PVP mientras sea acordado entre 2 o más jugadores. No abusen de un jugador que no quiera PVP.",
        icon: <FaHandshake />
    },
    {
        id: 2,
        title: "No Robar ni Griefing",
        desc: "Está prohibido robar. Pueden tradear o ayudar, pero no saquear. Destruir propiedades o matar mascotas será castigado con permaban. Usamos Core Protect.",
        icon: <FaUserShield />
    },
    {
        id: 3,
        title: "Bases en Aldeas",
        desc: "Si vives en una aldea, deja un letrero o muralla VISIBLE para que otros sepan que está ocupada y no la saqueen ni dañen a los aldeanos.",
        icon: <FaCity />
    },
    {
        id: 4,
        title: "Granjas Automatizadas",
        desc: "Prohibidas construcciones 100% automáticas y granjas de aldeanos/hierro. Excepción: Granjas semi-automáticas con activación manual.",
        icon: <FaIndustry />
    },
    {
        id: 5,
        title: "No Mega Construcciones",
        desc: "No se permiten castillos gigantes que abarquen demasiados CHUNKS. Construye aldeas grandes, pero evita estructuras masivas individuales.",
        icon: <FaHammer />
    },
    {
        id: 6,
        title: "Limpieza del Bioma",
        desc: "Deben deshacer construcciones temporales que aféen el paisaje (pilares de tierra, puentes cobble, etc).",
        icon: <FaLeaf />
    },
    {
        id: 7,
        title: "Estética",
        desc: "Las construcciones deben ser estéticamente atractivas. Evita hacer cosas 'a medias' o sin esfuerzo.",
        icon: <FaPaintBrush />
    },
    {
        id: 8,
        title: "Streaming y Comunidad",
        desc: "Libres de hacer stream dando crédito a Killu y Neroferno. Inviten amigos siempre que respeten las reglas y se unan al Discord.",
        icon: <FaVideo />
    },
    {
        id: 9,
        title: "Reportes y Seguridad",
        desc: "Usen /co inspect para revisar robos. Contactar a Killu para reclamos. No tomen la justicia por su propia mano.",
        icon: <FaShieldAlt />
    }
]

const RuleCard = ({ rule, index }) => (
    <div className="rule-card" style={{ opacity: 0, transform: 'translateY(20px)' }}>
        <div className="rule-header">
            <div className="rule-icon">
                {rule.icon}
            </div>
            <h3 className="rule-title">{rule.id}. {rule.title}</h3>
        </div>
        <p className="rule-desc" dangerouslySetInnerHTML={{ __html: rule.desc }}></p>
    </div>
)

export default function Rules() {
    const listRef = useRef(null)

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
        <Section title="reglas del servidor">
            <p style={{ marginBottom: "3rem", textAlign: "center", maxWidth: "600px", marginInline: "auto", color: "var(--muted)" }}>
                Para mantener una comunidad sana y divertida, es fundamental respetar estas normas de convivencia.
                El incumplimiento puede llevar a sanciones severas.
            </p>

            <div className="rules-container" ref={listRef}>
                {RULES.map((rule, index) => (
                    <RuleCard key={rule.id} rule={rule} index={index} />
                ))}
            </div>
        </Section>
    )
}

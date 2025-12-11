import { useEffect, useRef } from "react"
import Section from "@/components/Section"
import AnimatedSection from "@/components/AnimatedSection"
import { FaHammer, FaDiceD20, FaMapMarkedAlt, FaRunning } from "react-icons/fa"
import anime from "animejs/lib/anime.es.js"

const CONTESTS_DATA = [
    {
        id: 1,
        title: "Master Builder",
        desc: "Demuestra tu creatividad construyendo bajo una temática sorpresa. ¡Los mejores arquitectos serán inmortalizados en el Hall!",
        icon: <FaHammer />,
        status: "active",
        statusText: "En Curso"
    },
    {
        id: 2,
        title: "Torneo PvP",
        desc: "Equípate y prepárate para la gloria. Un torneo eliminatorio donde solo el más fuerte sobrevivirá en la arena.",
        icon: <FaDiceD20 />, // Alternative for swords/battle
        status: "soon",
        statusText: "Próximamente"
    },
    {
        id: 3,
        title: "Búsqueda del Tesoro",
        desc: "Pistas ocultas por todo el mapa. ¿Podrás descifrar los acertijos de Killu antes que los demás?",
        icon: <FaMapMarkedAlt />,
        status: "finished",
        statusText: "Finalizado"
    },
    {
        id: 4,
        title: "Parkour Challenge",
        desc: "Saltos imposibles y cronómetros al límite. Completa el circuito infernal creado por Neroferno.",
        icon: <FaRunning />,
        status: "finished",
        statusText: "Finalizado"
    }
]

const ContestCard = ({ data }) => {
    const statusClass = `status-${data.status}`
    return (
        <div className="contest-card" style={{ opacity: 0, transform: 'translateY(20px)' }}>
            <div className={`contest-status ${statusClass}`}>
                {data.statusText}
            </div>
            <div className="contest-icon-wrapper">
                {data.icon}
            </div>
            <h3 className="contest-title">{data.title}</h3>
            <p className="contest-desc">{data.desc}</p>
        </div>
    )
}

export default function Contests() {
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
        <Section title="concursos y eventos">
            <AnimatedSection>
                <p style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 3rem", color: "var(--muted)" }}>
                    Participa en nuestros eventos regulares para ganar premios exclusivos, rangos temporales y objetos únicos.
                    ¡La competición es parte de nuestra esencia!
                </p>
            </AnimatedSection>

            <div className="contests-grid">
                {CONTESTS_DATA.map(contest => (
                    <ContestCard key={contest.id} data={contest} />
                ))}
            </div>
        </Section>
    )
}

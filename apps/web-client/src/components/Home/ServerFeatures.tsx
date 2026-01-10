import { useRef, useState, MouseEvent } from "react"
import { Gem, Handshake, Calendar } from "lucide-react"
import { useTranslation } from 'react-i18next'

interface Feature {
    icon: React.ReactNode;
    title: string;
    desc: string;
}

const TiltCard = ({ feature }: { feature: Feature }) => {
    const cardRef = useRef<HTMLDivElement>(null)
    const [rotation, setRotation] = useState({ x: 0, y: 0 })
    const [opacity, setOpacity] = useState(0)

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return

        const div = cardRef.current
        const rect = div.getBoundingClientRect()

        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const centerX = rect.width / 2
        const centerY = rect.height / 2

        const rotateX = ((y - centerY) / centerY) * -10 // Max rotation deg
        const rotateY = ((x - centerX) / centerX) * 10

        setRotation({ x: rotateX, y: rotateY })
        setOpacity(1)
    }

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 })
        setOpacity(0)
    }

    return (
        <div 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative h-[400px] w-full rounded-2xl transition-all duration-200 ease-out"
            style={{
                perspective: "1000px",
            }}
        >
            <div 
                className="relative w-full h-full rounded-2xl border border-white/10 bg-[#151515] p-8 flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden group"
                style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.02, 1.02, 1.02)`,
                    transition: "transform 0.1s ease-out",
                    transformStyle: "preserve-3d",
                }}
            >
                {/* Holographic Glare */}
                <div 
                    className="absolute inset-0 w-full h-full bg-linear-to-br from-white/10 to-transparent pointer-events-none z-50 rounded-2xl mix-blend-overlay"
                    style={{
                        opacity: opacity,
                        background: `radial-gradient(circle at ${50 - rotation.y * 3}% ${50 - rotation.x * 3}%, rgba(255,255,255,0.15), transparent 60%)`
                    }}
                />

                {/* Border Glow */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-colors duration-300 group-hover:border-(--accent)/40" style={{ transform: "translateZ(0px)" }}></div>

                {/* Floating Content */}
                <div style={{ transform: "translateZ(50px)" }} className="mb-6 w-20 h-20 rounded-full bg-black/50 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_rgba(137,217,209,0.3)] group-hover:border-(--accent)/50 transition-all duration-300">
                    {feature.icon}
                </div>

                <h3 style={{ transform: "translateZ(40px)" }} className="text-2xl font-black text-white uppercase tracking-wider mb-4 group-hover:text-(--accent) transition-colors">
                    {feature.title}
                </h3>

                <p style={{ transform: "translateZ(30px)" }} className="text-gray-400 font-medium leading-relaxed group-hover:text-gray-200 transition-colors">
                    {feature.desc}
                </p>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/10 group-hover:bg-(--accent) transition-colors" style={{ transform: "translateZ(20px)" }}></div>
                <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-white/10 group-hover:bg-(--accent) transition-colors" style={{ transform: "translateZ(20px)" }}></div>
            </div>
        </div>
    )
}

export default function ServerFeatures() {
    const { t } = useTranslation()

    const features: Feature[] = [
        {
            icon: <Gem className="text-(--accent) text-4xl" />,
            title: t('features.economy_title'),
            desc: t('features.economy_desc'),
        },
        {
            icon: <Handshake className="text-(--accent) text-4xl" />,
            title: t('features.protection_title'),
            desc: t('features.protection_desc'),
        },
        {
            icon: <Calendar className="text-(--accent) text-4xl" />,
            title: t('features.events_title'),
            desc: t('features.events_desc'),
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 px-4 max-w-7xl mx-auto">
            {features.map((feature, index) => (
                <TiltCard key={index} feature={feature} />
            ))}
        </div>
    )
}

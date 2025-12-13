import Section from "@/components/Layout/Section"
import EmblaCarousel from "@/components/UI/EmblaCarousel"
import { KoFiButton } from "@/components/Widgets/KoFi"
import DonationFeed from "@/components/Widgets/DonationFeed"
import { useTranslation } from 'react-i18next'

const DONORS = [
    {
        name: "Killu Bysmali",
        rank: <img src="/ranks/rank-killu.png" alt="Rank Killu" />,
        image: "https://minotar.net/skin/177abfc4-a76a-41a1-a242-46a4d4e91b27",
        description: "Creadora y administradora principal."
    },
    {
        name: "Neroferno Ultranix",
        rank: <img src="/ranks/rank-neroferno.png" alt="Rank Neroferno" />,
        image: "https://minotar.net/skin/344af588-8a7e-4053-9f03-92d68d96b86c",
        description: "Co-fundador y desarrollador. (Realmente muy ultroso)"
    },
    {
        name: "Lawchihuahua",
        rank: <img src="/ranks/rank-fundador.png" alt="Rank fundador" />,
        image: "/skins/law.png",
        description: "Una creatura particular parte de esta maravillosa comunidad."
    },
    {
        name: "pixiesixer",
        rank: <img src="/ranks/rank-fundador.png" alt="Rank fundador" />,
        image: "https://minotar.net/skin/b47ee72ad3474abe9a081ab32f47153a",
        description: "Querido por sus opiniones variadas y su apoyo constante 💜."
    },
    {
        name: "Zeta",
        rank: <img src="/ranks/rank-fundador.png" alt="Rank fundador" />,
        image: "/skins/zeta.png",
        description: "¡Un usuario realmente perceverante ante las adversidades!."
    },
    {
        name: "SendPles",
        rank: <img src="/ranks/rank-fundador.png" alt="Rank fundador" />,
        image: "https://minotar.net/skin/5bec40ab-e459-474b-b96c-21ee1eae7d29",
        description: "The Paideidad. The Goat. The DONATOR"
    },
    {
        name: "ZenXeone",
        rank: <img src="/ranks/rank-donador.png" alt="Rank Donador" />,
        image: "https://minotar.net/skin/eacfb70c-c83a-4e0b-8465-ee4b0b86e041",
        description: "Un Tryhard. ¡DEJA LOS BOSSES! (gracias por apoyar a la comunidad✨)"
    },
    {
        name: "Churly",
        rank: <img src="/ranks/rank-donador.png" alt="Rank Donador" />,
        image: "/skins/churly.png",
        description: "Boop Bip Boop! 🤖"
    }
]
const OPTIONS = { loop: true }

export default function Donors() {
    const { t } = useTranslation()

    return (
        <Section title={<span><img src="/skins/kiru.png" alt="icon" style={{ height: '1.5em', verticalAlign: 'middle', marginRight: '0.5rem' }} /> {t('donors.title')} ✨</span>}>
            <Section>
                <p style={{ marginBottom: "2rem" }}>{t('donors.intro')}</p>
            </Section>

            <Section delay={200}>
                <div style={{ marginBottom: '3rem' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--accent)' }}>{t('donors.latest_title')}</h3>
                    <DonationFeed />
                </div>
            </Section>

            <Section delay={400}>
                <div style={{ marginBottom: "3rem", display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ transform: 'translateY(-2px)' }}><KoFiButton /></div>
                </div>
                <EmblaCarousel slides={DONORS} options={OPTIONS} />
            </Section>
        </Section>
    )
}

import Section from "@/components/Section"
import EmblaCarousel from "@/components/EmblaCarousel"
import { KoFiButton } from "@/components/KoFi"
import DonationFeed from "@/components/DonationFeed"
import AnimatedSection from "@/components/AnimatedSection"

const DONORS = [
    {
        name: "Killu Bysmali",
        rank: <img src="/rank-killu.png" alt="Rank Killu" />,
        image: "https://minotar.net/skin/177abfc4-a76a-41a1-a242-46a4d4e91b27",
        description: "Creadora y administradora principal."
    },
    {
        name: "Neroferno Ultranix",
        rank: <img src="/rank-neroferno.png" alt="Rank Neroferno" />,
        image: "https://minotar.net/skin/344af588-8a7e-4053-9f03-92d68d96b86c",
        description: "Co-fundador y desarrollador. (Realmente muy ultroso)"
    },
    {
        name: "Lawchihuahua",
        rank: <img src="/rank-fundador.png" alt="Rank fundador" />,
        image: "/skins/law.png",
        description: "Una creatura particular parte de esta maravillosa comunidad."
    },
    {
        name: "pixiesixer",
        rank: <img src="/rank-fundador.png" alt="Rank fundador" />,
        image: "https://minotar.net/skin/b47ee72ad3474abe9a081ab32f47153a",
        description: "Querido por sus opiniones variadas y su apoyo constante 💜."
    },
    {
        name: "Zeta",
        rank: <img src="/rank-fundador.png" alt="Rank fundador" />,
        image: "/skins/zeta.png",
        description: "¡Un usuario realmente perceverante ante las adversidades!."
    },
    {
        name: "SendPles",
        rank: <img src="/rank-fundador.png" alt="Rank fundador" />,
        image: "https://minotar.net/skin/5bec40ab-e459-474b-b96c-21ee1eae7d29",
        description: "The Paideidad. The Goat. The DONATOR"
    },
    {
        name: "ZenXeone",
        rank: <img src="/rank-donador.png" alt="Rank Donador" />,
        image: "https://minotar.net/skin/eacfb70c-c83a-4e0b-8465-ee4b0b86e041",
        description: "Un Tryhard. ¡DEJA LOS BOSSES! (gracias por apoyar a la comunidad✨)"
    },
    {
        name: "Churly",
        rank: <img src="/rank-donador.png" alt="Rank Donador" />,
        image: "/churly.png",
        description: "Boop Bip Boop! 🤖"
    }
    //   {
    //       name: "",
    //       rank: <img src="/rank-donador.png" alt="Rank Donador" />,
    //       image: "",
    //       description: "Donador default"
    //   },
    //  {
    //      name: "",
    //      rank: <img src="/rank-fundador.png" alt="Rank fundador" />,
    //      image: "",
    //      description: "Fundador default"
    //  }
]
const OPTIONS = { loop: true }

export default function Donors() {
    return (
        <Section title={<span><img src="/kiru.png" alt="icon" style={{ height: '1.5em', verticalAlign: 'middle', marginRight: '0.5rem' }} /> Hall de Donadores ✨</span>}>
            <AnimatedSection>
                <p style={{ marginBottom: "2rem" }}>Mantener un servidor de calidad requiere pasión, tiempo y recursos. Las personas listadas a continuación han decidido ir un paso más allá para asegurar la estabilidad y el futuro de CrystalTides. El 100% de estas contribuciones se destinan al mantenimiento del host, desarrollo de plugins y mejoras de infraestructura. ¡Gracias por creer en nosotros! 💜.</p>
            </AnimatedSection>

            <AnimatedSection delay={200}>
                <div style={{ marginBottom: '3rem' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--accent)' }}>Últimas Donaciones</h3>
                    <DonationFeed />
                </div>
            </AnimatedSection>

            <AnimatedSection delay={400}>
                <div style={{ marginBottom: "3rem", display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ transform: 'translateY(-2px)' }}><KoFiButton /></div>
                </div>
                <EmblaCarousel slides={DONORS} options={OPTIONS} />
            </AnimatedSection>
        </Section>
    )
}
